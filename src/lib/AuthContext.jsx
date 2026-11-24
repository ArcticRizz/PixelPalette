import { createContext, useContext, useEffect, useState } from "react";
import { initializeLocalStore, createProfile, selectProfile, listProfiles } from "./localStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let alive = true;
    initializeLocalStore().then((data) => { if (alive) setState(data); }).catch((error) => { if (alive) setError(error.message); });
    return () => { alive = false; };
  }, []);

  if (error) return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-2xl">Your studio could not open</h1>
      <p role="alert" className="mt-4 text-muted-foreground">{error}</p>
      <button className="mt-6 rounded-full bg-primary px-5 py-3 text-primary-foreground" onClick={() => window.location.reload()}>Try again</button>
    </main>
  );
  if (!state) return <p role="status" className="px-6 py-24 text-center text-muted-foreground">Opening your local studio…</p>;

  const value = {
    ...state,
    isAuthenticated: true,
    isLoadingAuth: false,
    switchProfile: async (id) => setState(await selectProfile(id)),
    addProfile: async (name) => {
      const profile = await createProfile(name);
      setState(await selectProfile(profile.id));
    },
    refreshProfiles: async () => {
      const profiles = await listProfiles();
      setState((current) => ({ ...current, profiles }));
    },
  };
  return <AuthContext.Provider value={value}><div key={state.user.id}>{children}</div></AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("Local profiles have not loaded.");
  return value;
}
