import { gridOf, encodeGrid, previewGrid } from "./gridCodec.js";

const DATABASE = "pixelpalette-local";
const DEFAULT_PROFILE = "local-default";
const MAX_CELLS = 256 * 256;
const BACKUP_FORMAT = "pixelpalette-backup";
export const MAX_BACKUP_BYTES = 25 * 1024 * 1024;
let databasePromise;
let activeProfile;
const progressCache = new Map();
const dirtyProgress = new Map();
let saveQueue = Promise.resolve();
const progressKey = (profileId, artworkId) => JSON.stringify([profileId, artworkId]);

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) {
        reject(new Error("Browser storage is unavailable. Open this app in a regular browser window."));
        return;
      }
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore("profiles", { keyPath: "id" });
        const artworks = db.createObjectStore("artworks", { keyPath: "id" });
        artworks.createIndex("profile_id", "profile_id");
        db.createObjectStore("progress", { keyPath: ["profile_id", "artwork_id"] });
        db.createObjectStore("settings", { keyPath: "key" });
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Close other PixelPalette tabs, then reload to update storage."));
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); databasePromise = undefined; };
        resolve(db);
      };
    }).catch((error) => { databasePromise = undefined; throw error; });
  }
  return databasePromise;
}

// Queue all requests synchronously; resolve only after the transaction commits.
async function transact(names, mode, run) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(names, mode);
    let requests;
    tx.oncomplete = () => resolve(requests.map((request) => request.result));
    tx.onabort = () => reject(tx.error || new Error("Local storage could not save your changes."));
    tx.onerror = () => {}; // The abort handler reports request and transaction failures.
    try {
      requests = run(Object.fromEntries(names.map((name) => [name, tx.objectStore(name)])));
    } catch (error) {
      tx.abort();
      reject(error);
    }
  });
}

function text(value, max, label) {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error(`Invalid ${label}.`);
  return value.trim();
}

function normalizeProgress(input, profileId, artworkId) {
  if (!Array.isArray(input.grid) || input.grid.length > MAX_CELLS ||
      input.grid.some((cell) => !Number.isInteger(cell) || cell < 0 || cell > 35)) {
    throw new Error("Invalid painting progress in backup.");
  }
  const percent = Number(input.percent);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new Error("Invalid painting percentage.");
  return { profile_id: profileId, artwork_id: text(artworkId, 200, "artwork ID"), grid: input.grid.slice(), percent, updated_at: Date.now() };
}

function normalizeArtwork(input, profileId, id) {
  const size = input.grid_size;
  if (!Number.isInteger(size) || size < 1 || size > 256) throw new Error("Artwork must be between 1 and 256 squares wide.");
  if (!Array.isArray(input.palette) || !input.palette.length || input.palette.length > 35 ||
      input.palette.some((color) => typeof color !== "string" || !/^#[0-9a-f]{6}$/i.test(color))) {
    throw new Error("Invalid artwork palette.");
  }
  if (input.map_file) throw new Error("This artwork is missing its full local grid.");
  if (input.target_compact && (typeof input.target_compact !== "string" ||
      input.target_compact.length !== size * size || !/^[0-9a-z]+$/.test(input.target_compact))) {
    throw new Error("Invalid compact artwork grid.");
  }
  const grid = gridOf(input);
  if (!Array.isArray(grid) || grid.length !== size || grid.some((row) => !Array.isArray(row) || row.length !== size ||
      row.some((cell) => !Number.isInteger(cell) || cell < 0 || cell > input.palette.length))) {
    throw new Error("Artwork does not contain a complete valid grid.");
  }
  return {
    id, profile_id: profileId, title: text(input.title, 120, "artwork title"),
    artist: typeof input.artist === "string" ? input.artist.slice(0, 120) : "Local artist",
    author_name: typeof input.author_name === "string" ? input.author_name.slice(0, 120) : "Local artist",
    source: input.source === "custom_image" ? "custom_image" : "custom_drawn",
    difficulty: ["easy", "medium", "hard"].includes(input.difficulty) ? input.difficulty : "medium",
    grid_size: size, palette: input.palette.slice(),
    target_grid: previewGrid(grid), target_compact: encodeGrid(grid),
    created_date: typeof input.created_date === "string" && Number.isFinite(Date.parse(input.created_date)) ? input.created_date : new Date().toISOString(),
  };
}

export async function initializeLocalStore() {
  const [savedProfiles, selection, migration, allProgress] = await transact(
    ["profiles", "settings", "progress"], "readonly",
    ({ profiles, settings, progress }) => [profiles.getAll(), settings.get("active-profile"), settings.get("legacy-progress-imported"), progress.getAll()],
  );
  let profiles = savedProfiles;
  if (!profiles.length) {
    const profile = { id: DEFAULT_PROFILE, full_name: "My studio", created_at: Date.now() };
    await transact(["profiles"], "readwrite", ({ profiles }) => [profiles.put(profile)]);
    profiles = [profile];
  }
  activeProfile = profiles.find((profile) => profile.id === selection?.value) || profiles[0];
  progressCache.clear();
  allProgress.forEach((entry) => progressCache.set(progressKey(entry.profile_id, entry.artwork_id), entry));
  if (!migration) {
    // Preserve old painting progress on this origin; never delete the old copy.
    let legacy = {};
    try { legacy = JSON.parse(globalThis.localStorage?.getItem("pixel-pigment.v1.progress") || "{}"); } catch { /* retain unreadable legacy data */ }
    const imported = [];
    for (const [id, entry] of Object.entries(legacy || {})) {
      try {
        let grid = entry.g;
        if (!grid && Array.isArray(entry.s) && Number.isInteger(entry.n) && entry.n > 0 && entry.n <= MAX_CELLS) {
          grid = new Array(entry.n).fill(0);
          for (let i = 0; i < entry.s.length; i += 2) {
            if (Number.isInteger(entry.s[i]) && entry.s[i] >= 0 && entry.s[i] < entry.n) grid[entry.s[i]] = entry.s[i + 1];
          }
        }
        const record = normalizeProgress({ grid, percent: Number(entry.p) || 0 }, activeProfile.id, id);
        if (!progressCache.has(progressKey(activeProfile.id, id))) imported.push(record);
      } catch { /* malformed legacy entries stay in their original storage */ }
    }
    await transact(["progress", "settings"], "readwrite", ({ progress, settings }) => [
      ...imported.map((entry) => progress.put(entry)), settings.put({ key: "legacy-progress-imported", value: true }),
    ]);
    imported.forEach((entry) => progressCache.set(progressKey(entry.profile_id, entry.artwork_id), entry));
  }
  return { user: activeProfile, profiles };
}

export async function listProfiles() {
  const [profiles] = await transact(["profiles"], "readonly", ({ profiles }) => [profiles.getAll()]);
  return profiles.sort((a, b) => a.created_at - b.created_at);
}

export async function createProfile(name) {
  const profile = { id: crypto.randomUUID(), full_name: text(name, 60, "profile name"), created_at: Date.now() };
  await transact(["profiles"], "readwrite", ({ profiles }) => [profiles.add(profile)]);
  return profile;
}

export async function selectProfile(id) {
  await flushProgress();
  const profiles = await listProfiles();
  const selected = profiles.find((profile) => profile.id === id);
  if (!selected) throw new Error("That profile is no longer available.");
  await transact(["settings"], "readwrite", ({ settings }) => [settings.put({ key: "active-profile", value: id })]);
  activeProfile = selected;
  return { user: selected, profiles };
}

function currentProfileId() {
  if (!activeProfile) throw new Error("Local storage is still loading.");
  return activeProfile.id;
}

export const artworkStore = {
  async create(input) {
    const record = normalizeArtwork(input, currentProfileId(), `local-${crypto.randomUUID()}`);
    await transact(["artworks"], "readwrite", ({ artworks }) => [artworks.add(record)]);
    return record;
  },
  async list() {
    const profileId = currentProfileId();
    const [items] = await transact(["artworks"], "readonly", ({ artworks }) => [artworks.index("profile_id").getAll(profileId)]);
    return items.sort((a, b) => b.created_date.localeCompare(a.created_date));
  },
  async get(id) {
    const profileId = currentProfileId();
    const [record] = await transact(["artworks"], "readonly", ({ artworks }) => [artworks.get(id)]);
    if (!record || record.profile_id !== profileId) throw new Error("This artwork is not saved in the current profile.");
    return record;
  },
};

export function readProgress(id, profileId = currentProfileId()) {
  return progressCache.get(progressKey(profileId, id))?.grid?.slice() || null;
}

export function readProgressIndex(profileId = currentProfileId()) {
  return Object.fromEntries([...progressCache.values()].filter((entry) => entry.profile_id === profileId).map((entry) => [entry.artwork_id, entry.percent]));
}

export function writeProgress(id, grid, percent, profileId = currentProfileId()) {
  const entry = normalizeProgress({ grid, percent }, profileId, id);
  const key = progressKey(profileId, id);
  progressCache.set(key, entry);
  dirtyProgress.set(key, entry);
  return flushProgress();
}

export function flushProgress() {
  saveQueue = saveQueue.catch(() => {}).then(async () => {
    const pending = [...dirtyProgress.entries()];
    if (!pending.length) return;
    await transact(["progress"], "readwrite", ({ progress }) => pending.map(([, entry]) => progress.put(entry)));
    pending.forEach(([key, entry]) => { if (dirtyProgress.get(key) === entry) dirtyProgress.delete(key); });
  });
  return saveQueue;
}

export async function exportBackup() {
  await flushProgress();
  const [profiles, artworks, progress] = await transact(["profiles", "artworks", "progress"], "readonly",
    ({ profiles, artworks, progress }) => [profiles.getAll(), artworks.getAll(), progress.getAll()]);
  return { format: BACKUP_FORMAT, version: 1, exported_at: new Date().toISOString(), profiles, artworks, progress };
}

export async function importBackup(data) {
  if (!data || data.format !== BACKUP_FORMAT || data.version !== 1 ||
      !Array.isArray(data.profiles) || !data.profiles.length || data.profiles.length > 100 ||
      !Array.isArray(data.artworks) || data.artworks.length > 5000 ||
      !Array.isArray(data.progress) || data.progress.length > 10000) throw new Error("Choose a valid PixelPalette backup file.");
  const profileIds = new Map();
  const profiles = data.profiles.map((profile) => {
    const oldId = text(profile.id, 200, "profile ID");
    if (profileIds.has(oldId)) throw new Error("Duplicate profile in backup.");
    const id = crypto.randomUUID();
    profileIds.set(oldId, id);
    return { id, full_name: `${text(profile.full_name, 60, "profile name").slice(0, 49)} (restored)`, created_at: Date.now() };
  });
  const artworkIds = new Map();
  const artworks = data.artworks.map((artwork) => {
    if (!profileIds.has(artwork.profile_id)) throw new Error("Artwork refers to a missing profile.");
    const oldId = text(artwork.id, 200, "artwork ID");
    if (artworkIds.has(oldId)) throw new Error("Duplicate artwork in backup.");
    const id = `local-${crypto.randomUUID()}`;
    artworkIds.set(oldId, { id, profile: artwork.profile_id });
    return normalizeArtwork(artwork, profileIds.get(artwork.profile_id), id);
  });
  const keys = new Set();
  const progress = data.progress.map((entry) => {
    if (!profileIds.has(entry.profile_id)) throw new Error("Progress refers to a missing profile.");
    const mapped = artworkIds.get(entry.artwork_id);
    if (mapped && mapped.profile !== entry.profile_id) throw new Error("Progress belongs to a different profile.");
    const record = normalizeProgress(entry, profileIds.get(entry.profile_id), mapped?.id || entry.artwork_id);
    const key = progressKey(record.profile_id, record.artwork_id);
    if (keys.has(key)) throw new Error("Duplicate progress in backup.");
    keys.add(key);
    return record;
  });
  await flushProgress();
  // Validate everything before this transaction. Import never replaces existing saves.
  await transact(["profiles", "artworks", "progress"], "readwrite", (stores) => [
    ...profiles.map((entry) => stores.profiles.add(entry)),
    ...artworks.map((entry) => stores.artworks.add(entry)),
    ...progress.map((entry) => stores.progress.add(entry)),
  ]);
  progress.forEach((entry) => progressCache.set(progressKey(entry.profile_id, entry.artwork_id), entry));
  return { profiles: profiles.length, artworks: artworks.length };
}
