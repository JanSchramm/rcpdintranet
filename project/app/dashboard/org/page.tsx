'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Officer } from '@/lib/database.types';
import { Users, ChevronDown, ChevronRight, Shield, Badge as BadgeIcon } from 'lucide-react';

const RANK_ORDER = [
  'Chief',
  'Deputy Chief',
  'Captain',
  'Lieutenant',
  'Sergeant',
  'Detective',
  'Officer',
  'Cadet',
];

function rankOrder(rank: string) {
  const idx = RANK_ORDER.indexOf(rank);
  return idx === -1 ? 99 : idx;
}

export default function OrgPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRanks, setExpandedRanks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.from('user').select('*').then(({ data }) => {
      const fetchedOfficers = (data as Officer[]) ?? [];
      setOfficers(fetchedOfficers);

      const initial: Record<string, boolean> = {};
      fetchedOfficers.forEach((o) => {
        if (o.rank) {
          initial[o.rank] = true;
        }
      });
      setExpandedRanks(initial);
      setLoading(false);
    });
  }, []);

  const grouped = officers.reduce<Record<string, Officer[]>>((acc, o) => {
    const key = o.rank || 'Officer';
    if (!acc[key]) acc[key] = [];
    acc[key].push(o);
    return acc;
  }, {});

  const sortedRanks = Object.keys(grouped).sort((a, b) => rankOrder(a) - rankOrder(b));

  return (
    <div className="p-4 space-y-4 max-w-6xl">
      {/* Header window */}
      <div className="xp-window">
        <div className="xp-titlebar">
          <Users className="w-4 h-4" />
          <span>RCPD Organigramm — Department Structure</span>
        </div>
        <div className="xp-menubar">
          <span className="xp-menu-item">View</span>
          <span className="xp-menu-item">Edit</span>
          <span className="xp-menu-item">Tools</span>
          <span className="xp-menu-item">Help</span>
        </div>
        <div className="p-3 bg-[#ece9d8] flex items-center gap-4">
          <p className="text-xs text-[#404040]">
            <span className="font-bold text-[#0a246a]">{officers.length}</span> officer{officers.length !== 1 ? 's' : ''} |
            <span className="font-bold text-[#0a246a] ml-1">{sortedRanks.length}</span> rank{sortedRanks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Rank sections */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="xp-window">
              <div className="xp-titlebar h-6">
                <div className="h-3 w-24 bg-white/20" />
              </div>
              <div className="p-4 bg-[#ece9d8] animate-pulse">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-20 bg-[#d4d0c8]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedRanks.length === 0 ? (
        <div className="xp-window">
          <div className="xp-titlebar">
            <Users className="w-4 h-4" />
            <span>No Data</span>
          </div>
          <div className="p-8 bg-[#ece9d8] text-center">
            <Users className="w-10 h-10 text-[#808080] mx-auto mb-2" />
            <p className="text-xs text-[#808080] font-mono">No officers found in database.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRanks.map((rank) => {
            const rankOfficers = grouped[rank];
            const expanded = expandedRanks[rank] ?? true;

            return (
              <div key={rank} className="xp-window">
                <div className="xp-titlebar h-7">
                  {expanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <Shield className="w-3.5 h-3.5" />
                  <span className="flex-1">{rank} ({rankOfficers.length})</span>
                </div>
                {expanded && (
                  <div className="p-3 bg-[#ece9d8]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {rankOfficers.map((officer) => (
                        <div key={officer.id} className="xp-panel p-3 hover:bg-[#d4d0c8]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-[#0a246a] flex items-center justify-center xp-raised shrink-0">
                              <span className="text-xs font-bold text-white">
                                {officer.firstname?.[0] ?? '?'}{officer.lastname?.[0] ?? ''}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#0a246a] truncate leading-tight">
                                {officer.firstname} {officer.lastname}
                              </p>
                              {officer.badgenumber && (
                                <p className="text-[10px] text-[#404040] font-mono">
                                  <BadgeIcon className="w-2.5 h-2.5 inline mr-0.5" />
                                  #{officer.badgenumber}
                                </p>
                              )}
                            </div>
                          </div>
                          {officer.division && officer.division.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {officer.division.map((div: string) => (
                                <span key={div} className="text-[10px] font-mono px-1 py-0.5 bg-[#d4d0c8] xp-sunken text-[#404040]">
                                  {div}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setExpandedRanks((prev) => ({ ...prev, [rank]: !prev[rank] }))}
                  className="w-full xp-statusbar justify-center hover:bg-[#d4d0c8]"
                >
                  <span className="text-[11px] text-[#404040]">
                    {expanded ? '[-] Collapse' : '[+] Expand'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}