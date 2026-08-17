'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Clock, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { officer, loading, isApproved } = useAuth();

  if (loading) return null;

  // Wenn der Account noch nicht freigeschaltet ist:
  if (officer && !isApproved) {
    return (
      <div className="min-h-screen bg-[#008080] flex items-center justify-center p-4">
        <div className="xp-window w-full max-w-md">
          <div className="xp-titlebar">
            <span>Zugriff ausstehend</span>
          </div>
          <div className="p-6 bg-[#ece9d8] text-center space-y-4">
            <Clock className="w-12 h-12 text-[#0a246a] mx-auto animate-pulse" />
            <h2 className="text-sm font-bold text-[#0a246a]">
              Dein Account wartet auf Freischaltung
            </h2>
            <p className="text-xs text-[#404040]">
              Ein Administrator muss deinen Zugang erst bestätigen, bevor du das RCPD Intranet nutzen kannst.
            </p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="xp-btn px-4 py-1 text-xs"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}