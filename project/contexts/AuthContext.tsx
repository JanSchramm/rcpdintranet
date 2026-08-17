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

    async function loadOfficerData(userId: string) {
      try {
        const { data, error: dataError } = await supabase
          .from('user')
          .select('id, firstname, lastname, badgenumber, rank, division, role, status')
          .eq('id', userId)
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
    }

    // Get initial session
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      setUser(session?.user ?? null);

      if (session?.user) {
        await loadOfficerData(session.user.id);
      } else {
        setOfficer(null);
        setLoading(false);
      }
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