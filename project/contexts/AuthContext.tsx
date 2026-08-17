'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Officer } from '@/lib/database.types';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  officer: Officer | null;
  loading: boolean;
  isApproved: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  officer: null,
  loading: true,
  isApproved: false,
  signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncUserState = async (nextUser: User | null) => {
      if (!isMounted) return;

      setUser(nextUser);

      if (!nextUser) {
        setOfficer(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error: dataError } = await supabase
          .from('user')
          .select('id, firstname, lastname, badgenumber, rank, division, role, status')
          .eq('id', nextUser.id)
          .maybeSingle();

        if (!isMounted) return;

        if (dataError) {
          console.error('Officer data error:', dataError);
          setOfficer(null);
        } else {
          setOfficer((data as unknown as Officer) || null);
        }
      } catch (e) {
        console.error('Exception loading officer:', e);
        if (isMounted) setOfficer(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const loadInitialSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        if (isMounted) setLoading(false);
        return;
      }

      await syncUserState(session?.user ?? null);
    };

    loadInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log('Auth state changed:', event, session?.user?.id);

      // Wait a bit for the callback to finish provisioning
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await syncUserState(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isApproved = officer?.status === 'approved' || officer?.role === 'admin';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, officer, loading, isApproved, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);