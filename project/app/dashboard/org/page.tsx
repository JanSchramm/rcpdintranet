'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Officer, RankDefinition, Division } from '@/lib/database.types';
import { Shield, Users, ChevronDown, ChevronRight } from 'lucide-react';

interface GroupedOfficers {
  [key: string]: Officer[];
}

export default function OrgChartPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [ranks, setRanks] = useState<RankDefinition[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [expandedRanks, setExpandedRanks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [{ data: offs }, { data: rankDefs }, { data: divs }] = await Promise.all([
          supabase.from('user').select('*').order('created_at', { ascending: false }),
          supabase.from('rank_definitions').select('*').order('order_index', { ascending: true }).order('level', { ascending: true }),
          supabase.from('divisions').select('*').order('name', { ascending: true }),
        ]);

        if (offs) setOfficers(offs as Officer[]);
        if (rankDefs) setRanks(rankDefs as RankDefinition[]);
        if (divs) setDivisions(divs as Division[]);

        if (rankDefs) {
          const initial: Record<string, boolean> = {};
          (rankDefs as RankDefinition[]).forEach((r: RankDefinition) => { initial[r.id] = true; });
          setExpandedRanks(initial);
        }
      } catch (e) {
        console.error('Failed to load org data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredOfficers = selectedDivision === 'all'
    ? officers
    : officers.filter(o => o.division?.includes(selectedDivision));

  // Group officers by rank_id
  const groupedByRank: GroupedOfficers = {};
  filteredOfficers.forEach(officer => {
    const rankKey = officer.rank_id || (typeof officer.rank === 'string' ? officer.rank : null) || 'Unassigned';
    if (!groupedByRank[rankKey]) {
      groupedByRank[rankKey] = [];
    }
    groupedByRank[rankKey].push(officer);
  });

  // Sort ranks by order_index
  const sortedRankKeys = Object.keys(groupedByRank).sort((a, b) => {
    const rankA = ranks.find(r => r.id === a) || { order_index: 999, level: 0 };
    const rankB = ranks.find(r => r.id === b) || { order_index: 999, level: 0 };
    if (rankA.order_index !== rankB.order_index) {
      return rankA.order_index - rankB.order_index;
    }
    return rankA.level - rankB.level;
  });

  function getRankTitle(rankId: string): string {
    const rankDef = ranks.find(r => r.id === rankId);
    if (rankDef) return rankDef.title;
    return rankId;
  }

  function toggleRank(rankId: string) {
    setExpandedRanks(prev => ({ ...prev, [rankId]: !prev[rankId] }));
  }

  return (
    <div className="p-4 space-y-4 max-w-7xl">
      {/* Header */}
      <div className="xp-window">
        <div className="xp-titlebar">
          <Shield className="w-4 h-4" />
          <span className="flex-1">RCPD Organigramm — Department Structure</span>
        </div>
        <div className="xp-menubar">
          <span className="xp-menu-item">View</span>
          <span className="xp-menu-item">Edit</span>
          <span className="xp-menu-item">Tools</span>
          <span className="xp-menu-item">Help</span>
        </div>
        <div className="p-3 bg-[#ece9d8] flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#404040]" />
            <span className="text-xs text-[#404040]">
              <span className="font-bold text-[#0a246a]">{officers.length}</span> officer{officers.length !== 1 ? 's' : ''} |
              <span className="font-bold text-[#0a246a] ml-1">{sortedRankKeys.length}</span> rank{sortedRankKeys.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#404040]">Division:</label>
            <select
              value={selectedDivision}
              onChange={e => setSelectedDivision(e.target.value)}
              className="xp-input text-xs py-1"
            >
              <option value="all">Alle Divisions</option>
              {divisions.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Org Chart */}
      {loading ? (
        <div className="xp-window">
          <div className="xp-titlebar h-6">
            <span>Loading...</span>
          </div>
          <div className="p-4 bg-[#ece9d8] space-y-2 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-[#d4d0c8]" />
            ))}
          </div>
        </div>
      ) : sortedRankKeys.length === 0 ? (
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
        <div className="space-y-4">
          {sortedRankKeys.map((rankId, rankIndex) => {
            const rankOfficers = groupedByRank[rankId] || [];
            const rankTitle = getRankTitle(rankId);
            const expanded = expandedRanks[rankId] ?? true;
            const isLast = rankIndex === sortedRankKeys.length - 1;

            return (
              <div key={rankId} className="xp-window">
                {/* Rank Header */}
                <div
                  className="xp-titlebar h-7 cursor-pointer"
                  onClick={() => toggleRank(rankId)}
                >
                  {expanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <Shield className="w-3.5 h-3.5" />
                  <span className="flex-1">{rankTitle} ({rankOfficers.length})</span>
                </div>

                {/* Officers Grid */}
                {expanded && (
                  <div className="p-3 bg-[#ece9d8]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
                              <p className="text-[10px] text-[#404040] font-mono truncate">
                                {officer.badgenumber ? `#${officer.badgenumber}` : rankTitle}
                              </p>
                            </div>
                          </div>
                          {officer.division && officer.division.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {officer.division.slice(0, 2).map((div: string) => (
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

                {/* Collapse Button */}
                <button
                  onClick={() => toggleRank(rankId)}
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
