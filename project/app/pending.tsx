'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Clock, LogOut } from 'lucide-react';

export default function PendingPage() {
  const { signOut, user } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#ece9d8] p-4">
      <div className="xp-window max-w-md w-full">
        <div className="xp-titlebar">
          <Clock className="w-4 h-4" />
          <span className="flex-1">Registrierung ausstehend</span>
        </div>

        <div className="p-6 bg-[#ece9d8] space-y-4 text-center">
          <Clock className="w-12 h-12 text-amber-600 mx-auto" />
          <h2 className="font-bold text-[#0a246a] text-lg">Warten auf Admin-Freigabe</h2>
          <p className="text-xs text-[#404040] leading-relaxed">
            Dein Discord-Konto (<strong>{user?.email}</strong>) wurde erfolgreich verknüpft.
            Ein Administrator muss deine Personalakten-Informationen noch ausfüllen und dein Konto freischalten.
          </p>

          <button
            onClick={signOut}
            className="xp-btn px-4 py-2 text-xs font-bold bg-[#d4d0c8] hover:bg-[#c0c0c0] flex items-center gap-2 mx-auto mt-4"
          >
            <LogOut className="w-4 h-4" /> Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}