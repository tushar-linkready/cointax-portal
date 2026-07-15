'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextValue {
  /** Supabase Auth user (null while loading or if signed out) */
  authUser: User | null;
  /** Profile row from public.profiles (null while loading or if signed out) */
  profile: Profile | null;
  /** True until the initial session check completes */
  loading: boolean;
  /** Sign in with email + password. Returns error string on failure. */
  signIn: (email: string, password: string) => Promise<string | null>;
  /** Create account + profile + (optionally) firm. Returns error string on failure. */
  signUp: (data: SignUpData) => Promise<string | null>;
  /** Sign out and redirect to /login */
  signOut: () => Promise<void>;
  /** Shortcut: profile?.firm_id */
  firmId: string | null;
  /** Shortcut: profile?.role */
  role: UserRole | null;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'firm_admin' | 'team_member';
  /** Required when role === 'firm_admin' */
  firmName?: string;
  firmEmail?: string;
  /** Required when role === 'team_member' — the firm they are joining */
  firmId?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile row for a given auth user id
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return data as Profile;
  }, []);

  // Initialise — check existing session
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setAuthUser(session.user);
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();

    // Listen for auth state changes (sign in/out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setAuthUser(session.user);
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        } else if (event === 'SIGNED_OUT') {
          setAuthUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setAuthUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Sign in
  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    if (!data.user) return 'Sign-in failed. Please try again.';
    setAuthUser(data.user);
    const p = await fetchProfile(data.user.id);
    if (!p) return 'Account exists but profile not found. Contact support.';
    setProfile(p);
    return null;
  }, [fetchProfile]);

  // Sign up — creates auth user, profile row, and optionally a firm
  const signUp = useCallback(async (input: SignUpData): Promise<string | null> => {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { full_name: input.fullName }, // stored in auth.users.raw_user_meta_data
      },
    });
    if (authError) return authError.message;
    if (!authData.user) return 'Sign-up failed. Please try again.';

    let firmId = input.firmId || null;

    // 2. If firm_admin, create the firm first
    if (input.role === 'firm_admin' && input.firmName) {
      const slug = input.firmName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { data: firmData, error: firmError } = await supabase
        .from('firms')
        .insert({
          name: input.firmName,
          slug: slug + '-' + Date.now().toString(36),
          email: input.firmEmail || input.email,
        })
        .select('id')
        .single();

      if (firmError) return `Firm creation failed: ${firmError.message}`;
      firmId = firmData.id;
    }

    // 3. Create profile row
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      firm_id: firmId,
      full_name: input.fullName,
      email: input.email,
      role: input.role,
      phone: input.phone || null,
    });
    if (profileError) return `Profile creation failed: ${profileError.message}`;

    // 4. Fetch the profile we just created
    const p = await fetchProfile(authData.user.id);
    if (p) {
      setAuthUser(authData.user);
      setProfile(p);
    }

    return null;
  }, [fetchProfile]);

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        firmId: profile?.firm_id ?? null,
        role: profile?.role ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

/** Returns the dashboard path for a given role */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '/dashboard/super-admin';
    case 'firm_admin':
    case 'team_member':
      return '/dashboard/firm';
    case 'client':
      return '/dashboard/client';
    default:
      return '/login';
  }
}
