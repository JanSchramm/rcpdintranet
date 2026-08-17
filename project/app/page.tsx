'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Lock, Power, User } from 'lucide-react';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleDiscordLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-2 text-sm">
          <p className="xp-blink">&gt; RCPD TERMINAL SYSTEM v3.1.0</p>
          <p>&gt; Copyright (c) 1998-2026 River City PD</p>
          <p>&gt; Initializing secure connection<span className="xp-blink">_</span></p>
          <p>&gt; Loading authentication module...</p>
          <p>&gt; Checking credentials...</p>
          <p className="text-green-600">&gt; System ready.</p>
          <p className="xp-blink text-green-400">&gt; Press any key to continue_</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0058a0] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Desktop pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)`,
        }}
      />

      {/* Login window */}
      <div className="relative xp-window w-full max-w-md">
        {/* Title bar */}
        <div className="xp-titlebar">
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 truncate">RCPD Terminal Access — Log On to RCPD</span>
          <div className="flex gap-0.5">
            <div className="w-5 h-5 flex items-center justify-center text-xs border border-white/30 bg-white/10">
              _
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-xs border border-white/30 bg-white/10">
              x
            </div>
          </div>
        </div>

        {/* Menu bar */}
        <div className="xp-menubar">
          <span className="xp-menu-item">File</span>
          <span className="xp-menu-item">Options</span>
          <span className="xp-menu-item">Help</span>
        </div>

        {/* Body */}
        <div className="p-6 bg-[#ece9d8] space-y-5">
          {/* Banner */}
          <div className="flex items-center gap-4 pb-4 border-b border-[#808080]">
            <div className="w-16 h-16 bg-[#0a246a] flex items-center justify-center xp-raised shrink-0">
              <Shield className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0a246a] leading-tight">
                River City Police Department
              </h1>
              <p className="text-xs text-[#404040] mt-0.5 font-mono">
                RCPD Terminal Access System
              </p>
              <p className="text-[11px] text-[#cc0000] font-bold mt-1">
                Authorized Personnel Only
              </p>
            </div>
          </div>

          {/* Warning box */}
          <div className="xp-sunken bg-[#fffbe6] p-3 text-xs text-[#404040] leading-relaxed">
            <p className="font-bold mb-1 text-[#cc0000]">WARNING:</p>
            <p>
              This is a restricted government computer system. Unauthorized access
              is a violation of federal law and will be prosecuted. All activities
              are monitored and logged.
            </p>
          </div>

          {/* Login form */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#404040]" />
              <label className="text-xs font-bold text-[#404040]">Authentication Method:</label>
            </div>
            <p className="text-xs text-[#404040] leading-relaxed">
              Click the button below to authenticate via Discord OAuth. Your Discord
              account must be linked to an active RCPD officer profile.
            </p>

            <button
              onClick={handleDiscordLogin}
              disabled={loading}
              className="xp-btn w-full flex items-center justify-center gap-3 py-2.5 text-sm font-bold disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#404040] border-t-transparent rounded-full animate-spin" />
                  Connecting to Discord...
                </>
              ) : (
                <>
                  <DiscordIcon className="w-5 h-5" />
                  Mit Discord Anmelden
                </>
              )}
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#808080]">
            <Lock className="w-3 h-3 text-[#008000]" />
            <span className="text-[11px] text-[#404040] font-mono">
              SECURE CONNECTION ESTABLISHED — SSL/TLS 128-BIT
            </span>
          </div>
        </div>

        {/* Status bar */}
        <div className="xp-statusbar">
          <div className="xp-statusbar-item flex items-center gap-1">
            <Power className="w-3 h-3" />
            <span>Ready</span>
          </div>
          <div className="xp-statusbar-item ml-auto">
            <span className="xp-blink">|</span>
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-white/60 font-mono">
          RCPD Terminal System v3.1.0 — © 1998-2026 River City Police Department
        </p>
      </div>
    </div>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.918 19.918 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}
