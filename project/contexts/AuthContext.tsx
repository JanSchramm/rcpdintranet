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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  officer: null,
  loading: true,
  isApproved: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from('user')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setOfficer((data as unknown as Officer) || null);
      } else {
        setOfficer(null);
      }
      setLoading(false);
    }

    getUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from('user')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setOfficer((data as unknown as Officer) || null);
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

  return (
    <AuthContext.Provider value={{ user, officer, loading, isApproved }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);