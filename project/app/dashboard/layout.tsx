'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Shield, Clock } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [time, setTime] = useState('');

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/');
    }
  }, [loading, session, router]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0058a0] flex items-center justify-center">
        <div className="xp-window max-w-sm">
          <div className="xp-titlebar">
            <Shield className="w-4 h-4" />
            <span>RCPD Terminal — Loading</span>
          </div>
          <div className="p-6 bg-[#ece9d8] text-center">
            <div className="flex flex-col items-center gap-3">
              <span className="w-8 h-8 border-2 border-[#404040] border-t-[#0997ff] rounded-full animate-spin" />
              <p className="text-xs font-mono text-[#404040]">
                Loading RCPD Terminal System...<span className="xp-blink">_</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-[#0058a0]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* XP Taskbar */}
        <div className="h-8 bg-[#245edf] flex items-center px-1 gap-1 border-t-2 border-[#404040] shadow-[0_-2px_4px_rgba(0,0,0,0.3)]">
          {/* Start button */}
          <div className="flex items-center gap-1.5 px-2 h-7 bg-gradient-to-b from-[#3f8cf3] to-[#1e55c8] border border-[#ffffff] rounded-r-lg shadow-sm">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white italic">start</span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-[#808080]/50" />

          {/* Taskbar items placeholder */}
          <div className="flex-1 flex items-center gap-1 px-2">
            <div className="flex items-center gap-1.5 px-3 h-7 bg-gradient-to-b from-[#3f8cf3] to-[#1e55c8] border border-[#ffffff] rounded shadow-sm">
              <span className="text-xs text-white font-medium">RCPD Terminal</span>
            </div>
          </div>

          {/* System tray */}
          <div className="flex items-center gap-2 px-2 h-7 text-white text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
