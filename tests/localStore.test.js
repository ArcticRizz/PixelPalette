import "fake-indexeddb/auto";
import test from "node:test";
import assert from "node:assert/strict";
import { IDBObjectStore } from "fake-indexeddb";
import {
  initializeLocalStore, artworkStore, createProfile, selectProfile, listProfiles,
  writeProgress, readProgress, readProgressIndex, flushProgress, exportBackup, importBackup,
} from "../src/lib/localStore.js";
import { loadFullGrid, storeGrid } from "../src/lib/mapStore.js";

const legacy = JSON.stringify({ classic: { s: [0, 1, 3, 2], n: 4, p: 50 } });
globalThis.localStorage = { getItem: (key) => key === "pixel-pigment.v1.progress" ? legacy : null };
const initial = await initializeLocalStore();
const firstId = initial.user.id;
let largeArtwork;
let secondId;

const input = async (size = 16) => ({
  title: "Local test canvas", palette: ["#c4633b", "#7c8f7b"], grid_size: size,
  source: "custom_drawn", ...await storeGrid(Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => (x + y) % 3))),
});

test("first launch creates a profile and preserves legacy sparse painting progress once", async () => {
  assert.equal(initial.profiles.length, 1);
  assert.deepEqual(readProgress("classic"), [1, 0, 0, 2]);
  await writeProgress("classic", [1, 1, 1, 2], 100);
  await initializeLocalStore();
  assert.deepEqual(readProgress("classic"), [1, 1, 1, 2]);
  assert.equal(readProgressIndex().classic, 100);
});

test("a complete 256-square artwork and its progress survive database reinitialization", async () => {
  largeArtwork = await artworkStore.create(await input(256));
  const grid = await loadFullGrid(largeArtwork);
  assert.equal(grid.length, 256);
  assert.equal(grid[255][254], 2);
  const progress = new Array(256 * 256).fill(0);
  progress[65535] = 2;
  await writeProgress(largeArtwork.id, progress, 1);
  await initializeLocalStore();
  assert.deepEqual(await loadFullGrid(await artworkStore.get(largeArtwork.id)), grid);
  assert.equal(readProgress(largeArtwork.id)[65535], 2);
});

test("profiles isolate creations and progress, including late saves from an unmounting profile", async () => {
  secondId = (await createProfile("Second artist")).id;
  await selectProfile(secondId);
  assert.deepEqual(await artworkStore.list(), []);
  assert.equal(readProgress("classic"), null);
  await assert.rejects(artworkStore.get(largeArtwork.id), /current profile/);
  await writeProgress("classic", [2, 0, 0, 0], 25);
  await writeProgress("classic", [1, 1, 1, 2], 100, firstId);
  assert.deepEqual(readProgress("classic"), [2, 0, 0, 0]);
  await selectProfile(firstId);
  assert.equal((await artworkStore.list()).length, 1);
  assert.equal(readProgressIndex().classic, 100);
});

test("backup round trip restores separate profiles, large grids and matching progress without overwriting", async () => {
  const backup = JSON.parse(JSON.stringify(await exportBackup()));
  const result = await importBackup(backup);
  assert.deepEqual(result, { profiles: 2, artworks: 1 });
  const profiles = await listProfiles();
  assert.equal(profiles.length, 4);
  const restored = profiles.find((profile) => profile.full_name === "My studio (restored)");
  await selectProfile(restored.id);
  const [art] = await artworkStore.list();
  assert.notEqual(art.id, largeArtwork.id);
  assert.equal((await loadFullGrid(art)).length, 256);
  assert.equal(readProgress(art.id)[65535], 2);
  await selectProfile(firstId);
  assert.equal((await artworkStore.list())[0].id, largeArtwork.id);
});

test("invalid imports and missing full grids leave all existing data unchanged", async () => {
  const before = await exportBackup();
  const broken = structuredClone(before);
  broken.artworks[0].target_compact = "1";
  await assert.rejects(importBackup(broken), /compact artwork/);
  const after = await exportBackup();
  assert.deepEqual(after.profiles, before.profiles);
  assert.deepEqual(after.artworks, before.artworks);
  assert.deepEqual(after.progress, before.progress);
  await assert.rejects(artworkStore.create({ ...await input(), map_file: "missing-external-file" }), /full local grid/);
  await assert.rejects(importBackup({ format: "unknown", version: 1 }), /valid PixelPalette backup/);
});

test("an aborted import is atomic and never leaves half-restored profiles", async () => {
  const backup = await exportBackup();
  const count = (await listProfiles()).length;
  const original = IDBObjectStore.prototype.add;
  IDBObjectStore.prototype.add = function (...args) {
    if (this.name === "artworks") throw new DOMException("Storage full", "QuotaExceededError");
    return original.apply(this, args);
  };
  try { await assert.rejects(importBackup(backup), /Storage full/); }
  finally { IDBObjectStore.prototype.add = original; }
  assert.equal((await listProfiles()).length, count);
});

test("a failed save reports failure and can be retried without losing the pending strokes", async () => {
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (...args) {
    if (this.name === "progress") throw new DOMException("Storage full", "QuotaExceededError");
    return original.apply(this, args);
  };
  try { await assert.rejects(writeProgress("retry-test", [1, 0, 0, 0], 25), /Storage full/); }
  finally { IDBObjectStore.prototype.put = original; }
  await flushProgress();
  await initializeLocalStore();
  assert.deepEqual(readProgress("retry-test"), [1, 0, 0, 0]);
});
