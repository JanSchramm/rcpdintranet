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
    async function getUserData() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const { data, error: dataError } = await supabase
              .from('user')
              .select('id, firstname, lastname, badgenumber, rank, division, role, status')
              .eq('id', session.user.id)
              .maybeSingle();

            if (dataError) {
              console.error('Officer data error:', dataError);
              setOfficer(null);
            } else {
              setOfficer((data as unknown as Officer) || null);
            }
          } catch (e) {
            console.error('Exception loading officer:', e);
            setOfficer(null);
          }
        } else {
          setOfficer(null);
        }
      } catch (e) {
        console.error('getUserData exception:', e);
        setUser(null);
        setOfficer(null);
      } finally {
        setLoading(false);
      }
    }

    getUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const { data, error: dataError } = await supabase
            .from('user')
            .select('id, firstname, lastname, badgenumber, rank, division, role, status')
            .eq('id', session.user.id)
            .maybeSingle();

          if (dataError) {
            console.error('Officer data error in auth listener:', dataError);
            setOfficer(null);
          } else {
            setOfficer((data as unknown as Officer) || null);
          }
        } catch (e) {
          console.error('Exception in auth listener:', e);
          setOfficer(null);
        }
      } else {
        setOfficer(null);
      }
      setLoading(false);
    });

    return () => {
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