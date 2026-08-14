// Store singleton a nivel de módulo (vía useSyncExternalStore) en vez de un
// useState/useEffect normal por componente. Con estado por-componente,
// AppSidebar y /admin cada uno pedía su propia sesión+profile por separado:
// /admin podía montarse y ver por un instante "todavía no sé si sos editor"
// (profile aún no llegó) y redirigirte afuera antes de tiempo — el bug del
// ícono del engranaje que "no llevaba a nada". Un solo estado compartido
// evita esa carrera. No volver al patrón por-componente sin resolver esto.
import { useSyncExternalStore } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  email: string;
  role: "editor" | "viewer";
};

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  sessionLoaded: boolean;
  profileLoaded: boolean;
};

let state: AuthState = {
  session: null,
  profile: null,
  sessionLoaded: false,
  profileLoaded: false,
};
const listeners = new Set<() => void>();

function setState(patch: Partial<AuthState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): AuthState {
  return state;
}

function getServerSnapshot(): AuthState {
  return { session: null, profile: null, sessionLoaded: false, profileLoaded: false };
}

async function loadProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", userId)
    .maybeSingle();

  // Si el usuario cambió mientras esperábamos la respuesta, ignorarla.
  if (state.session?.user?.id !== userId) return;
  setState({ profile: (data as Profile | null) ?? null, profileLoaded: true });
}

let initialized = false;
function ensureInitialized() {
  if (initialized) return;
  initialized = true;

  supabase.auth.getSession().then(({ data }) => {
    setState({ session: data.session, sessionLoaded: true });
    const userId = data.session?.user?.id;
    if (userId) {
      setState({ profileLoaded: false });
      loadProfile(userId);
    } else {
      setState({ profile: null, profileLoaded: true });
    }
  });

  supabase.auth.onAuthStateChange((_event, newSession) => {
    const previousUserId = state.session?.user?.id;
    setState({ session: newSession, sessionLoaded: true });

    const userId = newSession?.user?.id;
    if (userId === previousUserId) return;

    if (userId) {
      setState({ profile: null, profileLoaded: false });
      loadProfile(userId);
    } else {
      setState({ profile: null, profileLoaded: true });
    }
  });
}

export function useAuth() {
  if (typeof window !== "undefined") ensureInitialized();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const user: User | null = snapshot.session?.user ?? null;

  return {
    user,
    profile: snapshot.profile,
    isEditor: snapshot.profile?.role === "editor",
    isLoading: !snapshot.sessionLoaded || (!!user && !snapshot.profileLoaded),
    signOut: () => supabase.auth.signOut(),
  };
}
