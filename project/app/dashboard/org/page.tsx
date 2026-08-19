'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Officer, RankDefinition, Division } from '@/lib/database.types';
import { Shield, Users, ChevronDown, ChevronRight } from 'lucide-react';

export default function OrgChartPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [ranks, setRanks] = useState<RankDefinition[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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
      } catch (e) {
        console.error('Failed to load org data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredOfficers = useMemo(() => {
    if (selectedDivision === 'all') return officers;
    return officers.filter(o =>
      Array.isArray(o.division) && o.division.length > 0 && o.division[0] === selectedDivision
    );
  }, [officers, selectedDivision]);

  const getRankForOfficer = (officer: Officer): RankDefinition | undefined => {
    return ranks.find(r => r.id === officer.rank_id) ||
      ranks.find(r => r.title?.toLowerCase() === String(officer.rank).toLowerCase());
  };

  const { deptCommand, divCommand, divOfficers } = useMemo(() => {
    const deptCmd: Officer[] = [];
    const divCmd: Record<string, Officer[]> = {};
    const divOffs: Record<string, Officer[]> = {};

    divisions.forEach(d => {
      divCmd[d.name] = [];
      divOffs[d.name] = [];
    });

    filteredOfficers.forEach(officer => {
      const rankDef = getRankForOfficer(officer);
      const level = rankDef ? rankDef.level : 3;

      const primaryDivision = Array.isArray(officer.division) && officer.division.length > 0
        ? officer.division[0]
        : null;

      if (level === 1) {
        deptCmd.push(officer);
      } else if (level === 2 && primaryDivision && divCmd[primaryDivision]) {
        divCmd[primaryDivision].push(officer);
      } else if (level >= 3 && primaryDivision && divOffs[primaryDivision]) {
        divOffs[primaryDivision].push(officer);
      }
    });

    const sortByRank = (a: Officer, b: Officer) => {
      const rA = getRankForOfficer(a)?.order_index ?? 999;
      const rB = getRankForOfficer(b)?.order_index ?? 999;
      return rA - rB;
    };

    deptCmd.sort(sortByRank);
    Object.keys(divCmd).forEach(k => divCmd[k].sort(sortByRank));
    Object.keys(divOffs).forEach(k => divOffs[k].sort(sortByRank));

    return { deptCommand: deptCmd, divCommand: divCmd, divOfficers: divOffs };
  }, [filteredOfficers, ranks, divisions]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));
  };

  const isExpanded = (key: string) => expandedSections[key] !== false;

  // Helfer-Komponente für Officer-Karte (nun mit rankTitle als Prop)
  const OfficerCard = ({ officer, rankTitle }: { officer: Officer, rankTitle: string }) => (
    <div className="xp-panel p-3 bg-[#ece9d8] hover:bg-[#d4d0c8] transition-colors h-full flex flex-col">
      <div className="flex items-start gap-2 mb-2">
        <div className="w-8 h-8 bg-[#0a246a] flex items-center justify-center xp-raised shrink-0 mt-0.5">
          <span className="text-xs font-bold text-white">
            {officer.firstname?.[0] ?? '?'}{officer.lastname?.[0] ?? ''}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          {/* Name und Badge-Nummer nebeneinander */}
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-xs font-bold text-[#0a246a] truncate leading-tight">
              {officer.firstname} {officer.lastname}
            </p>
            {officer.badgenumber && (
              <span className="text-[10px] text-[#808080] font-mono truncate">
                #{officer.badgenumber}
              </span>
            )}
          </div>

          {/* Rang weiterhin direkt darunter */}
          <p className="text-[11px] font-bold text-[#404040] truncate mt-0.5">
            {rankTitle}
          </p>
        </div>
      </div>
      {officer.division && officer.division.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {officer.division.slice(0, 2).map((div: string) => (
            <span key={div} className="text-[10px] font-mono px-1 py-0.5 bg-[#d4d0c8] xp-sunken text-[#404040]">
              {div}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-4 max-w-full">
      {/* Header Window - Fixiert auf maximale Breite der Ansicht */}
      <div className="xp-window sticky top-4 z-10 shadow-md w-full">
        <div className="xp-titlebar">
          <Shield className="w-4 h-4" />
          <span className="flex-1 font-bold">RCPD Organigramm — Department Structure</span>
        </div>
        <div className="xp-menubar">
          <span className="xp-menu-item">View</span>
          <span className="xp-menu-item">Edit</span>
          <span className="xp-menu-item">Tools</span>
          <span className="xp-menu-item">Help</span>
        </div>
        <div className="p-3 bg-[#ece9d8] flex flex-wrap items-center gap-4 border-b border-[#d4d0c8]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#404040]" />
            <span className="text-xs text-[#404040]">
              <span className="font-bold text-[#0a246a]">{officers.length}</span> officers |
              <span className="font-bold text-[#0a246a] ml-1">{ranks.length}</span> ranks
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

      {loading ? (
        <div className="xp-window max-w-md p-8 bg-[#ece9d8] text-center text-xs text-[#404040]">
          Loading Data...
        </div>
      ) : (
        /* Gemeinsamer Scroll-Container für Department und Divisions */
        <div className="overflow-x-auto pb-6 w-full">
          {/* w-max zwingt den Container, die exakte Breite der Grid-Inhalte anzunehmen */}
          <div className="w-max min-w-full flex flex-col gap-6">

            {/* LEVEL 1: Department Command (Nimmt nun exakt w-full des w-max Containers an) */}
            <div className="xp-window w-full">
              <div
                className="xp-titlebar cursor-pointer"
                onClick={() => toggleSection('dept-cmd')}
              >
                {isExpanded('dept-cmd') ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Shield className="w-3.5 h-3.5" />
                <span className="flex-1 font-bold">Department Command</span>
              </div>

              {isExpanded('dept-cmd') && (
                <div className="p-3 bg-[#ece9d8]">
                  {deptCommand.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {deptCommand.map(officer => (
                        <div key={officer.id} className="w-[240px]">
                          <OfficerCard
                            officer={officer}
                            rankTitle={getRankForOfficer(officer)?.title || String(officer.rank || 'Officer')}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#808080] italic">Keine Einheiten im Department Command.</p>
                  )}
                </div>
              )}

              <button
                onClick={() => toggleSection('dept-cmd')}
                className="w-full xp-statusbar justify-center hover:bg-[#d4d0c8]"
              >
                <span className="text-[11px] text-[#404040]">
                  {isExpanded('dept-cmd') ? '[-] Collapse' : '[+] Expand'}
                </span>
              </button>
            </div>

            {/* LEVEL 2 & 3: Divisions Grid */}
            <div className="flex gap-4 items-start">
              {divisions.map((div) => {
                const cmdOfficers = divCommand[div.name] || [];
                const regOfficers = divOfficers[div.name] || [];

                const cmdKey = `cmd-${div.id}`;
                const offKey = `off-${div.id}`;

                return (
                  <div key={div.id} className="flex flex-col gap-4 min-w-[240px] w-[240px]">

                    {/* Division CMD (Level 2) Window */}
                    <div className="xp-window flex-shrink-0">
                      <div
                        className="xp-titlebar cursor-pointer"
                        onClick={() => toggleSection(cmdKey)}
                      >
                        {isExpanded(cmdKey) ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <Shield className="w-3.5 h-3.5" />
                        <span className="flex-1 font-bold truncate">{div.name} Command</span>
                      </div>

                      {isExpanded(cmdKey) && (
                        <div className="p-3 bg-[#ece9d8] min-h-[80px] flex flex-col gap-3">
                          {cmdOfficers.length > 0 ? (
                            cmdOfficers.map(officer => (
                              <OfficerCard
                                key={officer.id}
                                officer={officer}
                                rankTitle={getRankForOfficer(officer)?.title || String(officer.rank || 'Officer')}
                              />
                            ))
                          ) : (
                            <p className="text-[10px] text-[#808080] text-center italic my-auto">Vakant</p>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => toggleSection(cmdKey)}
                        className="w-full xp-statusbar justify-center hover:bg-[#d4d0c8]"
                      >
                        <span className="text-[11px] text-[#404040]">
                          {isExpanded(cmdKey) ? '[-] Collapse' : '[+] Expand'}
                        </span>
                      </button>
                    </div>

                    {/* Division Officers (Level 3+) Window */}
                    <div className="xp-window flex-shrink-0 flex-1">
                      <div
                        className="xp-titlebar cursor-pointer"
                        onClick={() => toggleSection(offKey)}
                      >
                        {isExpanded(offKey) ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <Shield className="w-3.5 h-3.5" />
                        <span className="flex-1 font-bold truncate">{div.name} ({regOfficers.length})</span>
                      </div>

                      {isExpanded(offKey) && (
                        <div className="p-3 bg-[#ece9d8] min-h-[80px] flex flex-col gap-3 h-full">
                          {regOfficers.length > 0 ? (
                            regOfficers.map(officer => (
                              <OfficerCard
                                key={officer.id}
                                officer={officer}
                                rankTitle={getRankForOfficer(officer)?.title || String(officer.rank || 'Officer')}
                              />
                            ))
                          ) : (
                            <p className="text-[10px] text-[#808080] text-center italic my-auto">Vakant</p>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => toggleSection(offKey)}
                        className="w-full xp-statusbar mt-auto justify-center hover:bg-[#d4d0c8]"
                      >
                        <span className="text-[11px] text-[#404040]">
                          {isExpanded(offKey) ? '[-] Collapse' : '[+] Expand'}
                        </span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}