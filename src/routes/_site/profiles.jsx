import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Upload, UserRound, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { exportBackup, importBackup, MAX_BACKUP_BYTES } from "@/lib/localStore";

export const Route = createFileRoute("/_site/profiles")({
  head: () => ({ meta: [{ title: "Profiles & backups — Pixel & Pigment" }] }),
  component: ProfilesPage,
});

function ProfilesPage() {
  const { user, profiles, switchProfile, addProfile, refreshProfiles } = useAuth();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef(null);
  const run = async (action) => {
    setBusy(true);
    try { await action(); } catch (error) { toast.error(error.message || "That change could not be saved."); }
    finally { setBusy(false); }
  };
  const download = async () => {
    const backup = await exportBackup();
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `pixelpalette-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    toast.success("Backup exported with all profiles, artwork and painting progress.");
  };
  const restore = async (file) => {
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) throw new Error("Choose a backup smaller than 25 MB.");
    let backup;
    try { backup = JSON.parse(await file.text()); } catch { throw new Error("This file is not a valid JSON backup."); }
    const result = await importBackup(backup);
    await refreshProfiles();
    toast.success(`Restored ${result.artworks} artwork${result.artworks === 1 ? "" : "s"} into ${result.profiles} new profile${result.profiles === 1 ? "" : "s"}. Choose a restored profile below.`);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-5 py-10 sm:py-16">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Your studio, on this device</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight">Profiles & backups</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Each profile keeps its own creations and painting progress. Profiles have no passwords; anyone using this browser can switch between them.</p>
      </header>
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-xl">Choose your profile</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {profiles.map((profile) => (
            <button key={profile.id} type="button" disabled={busy || user.id === profile.id} onClick={() => run(() => switchProfile(profile.id))}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${user.id === profile.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
              <UserRound className="h-5 w-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 break-words text-sm font-medium">{profile.full_name}</span>
              {user.id === profile.id && <><Check className="h-4 w-4 shrink-0 text-primary" /><span className="sr-only">Current profile</span></>}
            </button>
          ))}
        </div>
        <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => {
          event.preventDefault();
          run(async () => { await addProfile(name); setName(""); });
        }}>
          <label className="sr-only" htmlFor="profile-name">New profile name</label>
          <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required placeholder="New profile name"
            className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          <button disabled={busy || !name.trim()} className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50">Create profile</button>
        </form>
      </section>
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-xl">Keep a copy of your work</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Saves stay in this browser and do not sync to other devices. Clearing site data removes them. Export a backup to keep a copy or move your studio to another browser.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button disabled={busy} onClick={() => run(download)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"><Download className="h-4 w-4" />Export backup</button>
          <button disabled={busy} onClick={() => input.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium disabled:opacity-50"><Upload className="h-4 w-4" />Import backup</button>
          <input ref={input} type="file" accept=".json,application/json" aria-label="Import a PixelPalette backup" className="sr-only" onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            run(() => restore(file));
          }} />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Import adds restored profiles and keeps your existing saves. Backups include every local profile.</p>
      </section>
    </main>
  );
}
