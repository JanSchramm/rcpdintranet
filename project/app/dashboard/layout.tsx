'use client';

import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { officer, loading, isApproved, user } = useAuth();

  // Ladescreen anzeigen statt null
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0058a0] flex items-center justify-center p-4">
        <div className="xp-window w-full max-w-md">
          <div className="xp-titlebar">
            <Clock className="w-4 h-4" />
            <span>Authentifizierung lädt...</span>
          </div>
          <div className="p-6 bg-[#ece9d8] text-center space-y-4">
            <Clock className="w-12 h-12 text-[#0a246a] mx-auto animate-spin" />
            <p className="text-sm text-[#404040] font-bold">Verbindung wird hergestellt...</p>
          </div>
        </div>
      </div>
    );
  }

  // Wenn kein User angemeldet ist
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0058a0] flex items-center justify-center p-4">
        <div className="xp-window w-full max-w-md">
          <div className="xp-titlebar">
            <AlertCircle className="w-4 h-4" />
            <span>Nicht angemeldet</span>
          </div>
          <div className="p-6 bg-[#ece9d8] text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-[#cc0000] mx-auto" />
            <h2 className="text-sm font-bold text-[#0a246a]">
              Anmeldung erforderlich
            </h2>
            <p className="text-xs text-[#404040]">
              Du musst dich anmelden, um auf das Dashboard zuzugreifen.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="xp-btn px-4 py-2 text-xs"
            >
              Zur Anmeldung
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wenn Officer-Daten nicht geladen wurden
  if (!officer) {
    return (
      <div className="min-h-screen bg-[#0058a0] flex items-center justify-center p-4">
        <div className="xp-window w-full max-w-md">
          <div className="xp-titlebar">
            <AlertCircle className="w-4 h-4" />
            <span>Fehler</span>
          </div>
          <div className="p-6 bg-[#ece9d8] text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-[#cc0000] mx-auto" />
            <h2 className="text-sm font-bold text-[#0a246a]">
              Officer-Profil nicht gefunden
            </h2>
            <p className="text-xs text-[#404040]">
              Dein Officer-Profil konnte nicht geladen werden. Kontaktiere einen Administrator.
            </p>
            <p className="text-[10px] font-mono text-[#808080]">
              User ID: {user.id}
            </p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="xp-btn px-4 py-2 text-xs"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wenn der Account noch nicht freigeschaltet ist:
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-[#008080] flex items-center justify-center p-4">
        <div className="xp-window w-full max-w-md">
          <div className="xp-titlebar">
            <Clock className="w-4 h-4" />
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
            <div className="text-[10px] text-[#808080] bg-[#f0f0f0] p-2 rounded">
              <p><strong>Status:</strong> {officer.status || 'unknown'}</p>
              <p><strong>Rolle:</strong> {officer.role || 'unknown'}</p>
              <p><strong>isApproved:</strong> {isApproved ? 'true' : 'false'}</p>
            </div>
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

  return (
    <div className="flex bg-[#ece9d8]">
      <Sidebar />
      {children}
    </div>
  );
}