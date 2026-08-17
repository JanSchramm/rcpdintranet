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
          setLoading(false);
        } else if (data) {
          // Officer found
          setOfficer((data as unknown as Officer) || null);
          setLoading(false);
        } else {
          // Officer not found - this might be a new user
          console.log('Officer not found for user:', nextUser.id, '- attempting client-side provisioning...');
          setOfficer(null);
          
          // Try client-side provisioning
          try {
            const res = await fetch('/api/auth/provision');
            const provisionData = await res.json();
            console.log('Provisioning result:', provisionData);
            
            if (provisionData.success && provisionData.user) {
              // Retry loading the officer
              await new Promise(resolve => setTimeout(resolve, 500));
              const { data: retryData } = await supabase
                .from('user')
                .select('id, firstname, lastname, badgenumber, rank, division, role, status')
                .eq('id', nextUser.id)
                .maybeSingle();
              
              if (retryData && isMounted) {
                setOfficer((retryData as unknown as Officer) || null);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            console.error('Client-side provisioning failed:', e);
          }
          
          setLoading(false);
        }
      } catch (e) {
        console.error('Exception loading officer:', e);
        if (isMounted) {
          setOfficer(null);
          setLoading(false);
        }
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