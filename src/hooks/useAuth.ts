import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  email: string;
  role: "editor" | "viewer";
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setSessionLoaded(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      setProfileLoaded(true);
      return;
    }
    setProfileLoaded(false);
    supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setProfile((data as Profile | null) ?? null);
        setProfileLoaded(true);
      });
  }, [session?.user?.id]);

  const user: User | null = session?.user ?? null;

  return {
    user,
    profile,
    isEditor: profile?.role === "editor",
    isLoading: !sessionLoaded || (!!user && !profileLoaded),
    signOut: () => supabase.auth.signOut(),
  };
}
