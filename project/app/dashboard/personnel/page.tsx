'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Officer } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, ChevronRight, Shield, Badge as BadgeIcon } from 'lucide-react';

export default function PersonnelListPage() {
  const { officer, loading: authLoading } = useAuth();
  const router = useRouter();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .order('rank', { ascending: true });

      if (error) {
        console.error('Failed to load officers:', error);
      } else {
        setOfficers(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = officers.filter(o => {
    const q = search.toLowerCase();
    const name = `${o.firstname ?? ''} ${o.lastname ?? ''}`.toLowerCase();
    return name.includes(q) || (o.rank ?? '').toLowerCase().includes(q) || (o.badgenumber ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="p-4 space-y-4 max-w-5xl">
      {/* Header window */}
      <div className="xp-window">
        <div className="xp-titlebar">
          <Shield className="w-4 h-4" />
          <span className="flex-1">RCPD Personalakten — Personnel Files</span>
        </div>
        <div className="xp-menubar">
          <span className="xp-menu-item">File</span>
          <span className="xp-menu-item">Edit</span>
          <span className="xp-menu-item">View</span>
          <span className="xp-menu-item">Help</span>
        </div>
        <div className="p-3 bg-[#ece9d8]">
          {/* Search bar */}
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#404040]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, rank, or badge number..."
              className="xp-input flex-1"
            />
          </div>
          <p className="text-[11px] text-[#404040] font-mono">
            {filtered.length} officer{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Officer list */}
      {loading ? (
        <div className="xp-window">
          <div className="xp-titlebar h-6">
            <span>Loading...</span>
          </div>
          <div className="p-4 bg-[#ece9d8] space-y-2 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-[#d4d0c8]" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="xp-window">
          <div className="xp-titlebar">
            <Users className="w-4 h-4" />
            <span>No Results</span>
          </div>
          <div className="p-8 bg-[#ece9d8] text-center">
            <Users className="w-10 h-10 text-[#808080] mx-auto mb-2" />
            <p className="text-xs text-[#808080] font-mono">
              {search ? 'No officers match your search.' : 'No officers on record.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(o => (
            <button
              key={o.id}
              onClick={() => router.push(`/dashboard/personnel/${o.id}`)}
              className="xp-window w-full text-left hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-[#ece9d8]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0a246a] flex items-center justify-center xp-raised shrink-0">
                    <span className="text-sm font-bold text-white">
                      {o.firstname?.[0] ?? '?'}{o.lastname?.[0] ?? ''}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0a246a]">
                      {o.firstname} {o.lastname}
                    </p>
                    <p className="text-[10px] text-[#404040] font-mono">
                      {o.rank || 'N/A'}{o.badgenumber ? ` | Badge #${o.badgenumber}` : ''}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#808080] shrink-0" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
