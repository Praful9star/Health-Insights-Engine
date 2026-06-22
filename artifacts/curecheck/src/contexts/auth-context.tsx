import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  pullSupabaseToLocal,
  pushLocalToSupabase,
  clearLocalHealthData,
  guardAndClearIfUserChanged,
} from "@/lib/supabase-sync";

export interface UserProfile {
  name: string;
  age: string;
  gender: string;
  blood_group: string;
  city: string;
  allergies: string;
  isPremium: boolean;
  premiumExpiresAt: string | null;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

const EMPTY_PROFILE: UserProfile = { name: "", age: "", gender: "", blood_group: "", city: "", allergies: "", isPremium: false, premiumExpiresAt: null };

async function fetchProfileFromAPI(accessToken: string): Promise<UserProfile | null> {
  try {
    const res = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as UserProfile;
  } catch {
    return null;
  }
}

async function putProfileToAPI(accessToken: string, data: Partial<UserProfile>): Promise<string | null> {
  try {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return (body as { error?: string }).error ?? "Failed to save profile";
    }
    return null;
  } catch {
    return "Network error";
  }
}

function syncForUser(userId: string): void {
  guardAndClearIfUserChanged(userId);
  pullSupabaseToLocal(userId).then(() => pushLocalToSupabase(userId));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (accessToken: string) => {
    setProfileLoading(true);
    const p = await fetchProfileFromAPI(accessToken);
    setProfile(p ?? EMPTY_PROFILE);
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      const u = s?.user ?? null;
      setSession(s ?? null);
      setUser(u);
      if (s && u) {
        loadProfile(s.access_token);
        syncForUser(u.id);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      const u = s?.user ?? null;
      setSession(s ?? null);
      setUser(u);
      if (s && u) {
        loadProfile(s.access_token);
        syncForUser(u.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: "Auth not configured" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!supabase) return { error: "Auth not configured" };
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } },
    });
    return { error: error?.message ?? null };
  };

  const signInGoogle = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    clearLocalHealthData();
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!session) return { error: "Not signed in" };
    const err = await putProfileToAPI(session.access_token, data);
    if (!err) setProfile((prev) => ({ ...(prev ?? EMPTY_PROFILE), ...data }));
    return { error: err };
  };

  const refreshProfile = useCallback(async () => {
    if (session) await loadProfile(session.access_token);
  }, [session, loadProfile]);

  const isPremium        = profile?.isPremium       ?? false;
  const premiumExpiresAt = profile?.premiumExpiresAt ?? null;

  return (
    <AuthContext.Provider value={{
      user, session, loading, profile, profileLoading,
      isPremium, premiumExpiresAt,
      signIn, signUp, signInGoogle, signOut, updateProfile, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
};
