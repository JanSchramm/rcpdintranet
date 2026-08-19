'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Officer, RosterEvent } from '@/lib/database.types';
import { Users, FileText, Calendar, MessageSquare, Clock, Shield, Folder } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { getDisplayRank } from '@/lib/utils';

export default function DashboardPage() {
  const { officer } = useAuth();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<RosterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [ranks, setRanks] = useState<Array<{ id?: string; title?: string; order_index?: number }>>([]);
  const [ranksLoading, setRanksLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: offs }, { count }, { data: evts }, { data: rankDefs }] = await Promise.all([
        supabase.from('user').select('*'),
        supabase.from('messages').select('*', { count: 'exact', head: true })
          .eq('receiver_id', officer?.id ?? '')
          .eq('read', false),
        supabase.from('events').select('*').gte('date', new Date().toISOString()).order('date').limit(5),
        supabase.from('rank_definitions').select('id, title, order_index'),
      ]);
      setOfficers(offs ?? []);
      setUnreadCount(count ?? 0);
      setUpcomingEvents(evts ?? []);
      if (rankDefs) setRanks(rankDefs);
      setRanksLoading(false);
      setLoading(false);
    }
    if (officer) load();
  }, [officer]);

  const stats = [
    { label: 'Officers', value: officers.length, icon: Users, href: '/dashboard/org' },
    { label: 'Events', value: upcomingEvents.length, icon: Calendar, href: '/dashboard/calendar' },
    { label: 'Messages', value: unreadCount, icon: MessageSquare, href: '/dashboard/messages' },
  ];

  const eventTypeColors: Record<string, string> = {
    Training: 'bg-[#008000] text-white',
    Patrol: 'bg-[#0000cc] text-white',
    Meeting: 'bg-[#cc6600] text-white',
    General: 'bg-[#404040] text-white',
    Operation: 'bg-[#cc0000] text-white',
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl">
      {/* Welcome banner */}
      <div className="xp-window">
        <div className="xp-titlebar">
          <Shield className="w-4 h-4" />
          <span>RCPD Terminal — Main Menu</span>
        </div>
        <div className="p-4 bg-[#ece9d8]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#0a246a] flex items-center justify-center xp-raised shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#0a246a]">
                Welcome back, {officer?.firstname || 'Officer'} {officer?.lastname || ''}
              </h1>
              <p className="text-xs text-[#404040] font-mono mt-0.5">
                {format(new Date(), "EEEE, MMMM d, yyyy")} — RCPD Terminal System v3.1.0
              </p>
              <p className="text-[11px] text-[#404040] mt-0.5">
                Rank: {getDisplayRank(officer, ranks)} {officer?.badgenumber ? `| Badge #${officer.badgenumber}` : ''}
                {officer?.division?.length ? ` | Division: ${officer.division.join(', ')}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <div className="xp-window hover:shadow-md transition-shadow cursor-pointer">
              <div className="xp-titlebar h-6">
                <Icon className="w-3 h-3" />
                <span className="text-[11px]">{label}</span>
              </div>
              <div className="p-3 bg-[#ece9d8] flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d4d0c8] flex items-center justify-center xp-sunken shrink-0">
                  <Icon className="w-5 h-5 text-[#0a246a]" />
                </div>
                {loading ? (
                  <div className="h-7 w-10 bg-[#d4d0c8] animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold text-[#0a246a] font-mono">{value}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Events Window */}
        <div className="xp-window">
          <div className="xp-titlebar">
            <Calendar className="w-4 h-4" />
            <span className="flex-1">Upcoming Events</span>
            <Link href="/dashboard/calendar" className="text-[11px] underline hover:text-blue-200">
              View All
            </Link>
          </div>
          <div className="bg-[#ece9d8]">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="px-3 py-2 border-b border-[#d4d0c8] animate-pulse">
                  <div className="h-3 w-32 bg-[#d4d0c8]" />
                </div>
              ))
            ) : upcomingEvents.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-[#808080] font-mono">
                No upcoming events scheduled.
              </div>
            ) : (
              upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center gap-3 px-3 py-2 border-b border-[#d4d0c8] hover:bg-[#d4d0c8]">
                  <div className="xp-sunken bg-white px-2 py-1 text-center shrink-0 w-12">
                    <p className="text-[10px] text-[#808080] font-mono">{format(new Date(event.date), 'MMM')}</p>
                    <p className="text-sm font-bold text-[#0a246a] font-mono leading-none">{format(new Date(event.date), 'd')}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#000000] truncate">{event.title}</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#808080]" />
                      <span className="text-[11px] text-[#404040] font-mono">{format(new Date(event.date), 'HH:mm')}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 ${eventTypeColors[event.event_type] ?? eventTypeColors.General}`}>
                    {event.event_type}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="xp-statusbar">
            <div className="xp-statusbar-item">{upcomingEvents.length} events</div>
          </div>
        </div>

        {/* Quick Access Window */}
        <div className="xp-window">
          <div className="xp-titlebar">
            <Folder className="w-4 h-4" />
            <span>Quick Access</span>
          </div>
          <div className="p-3 bg-[#ece9d8] grid grid-cols-2 gap-2">
            {[
              { href: '/dashboard/org', icon: Users, label: 'Department Structure', desc: 'Ranks & units' },
              { href: '/dashboard/personnel', icon: FileText, label: 'Personnel Files', desc: 'Officer records' },
              { href: '/dashboard/calendar', icon: Calendar, label: 'Event Calendar', desc: 'Schedule & training' },
              { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages', desc: 'Internal comms' },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href}>
                <div className="xp-panel p-3 hover:bg-[#d4d0c8] cursor-pointer flex flex-col gap-2 h-full">
                  <div className="w-8 h-8 bg-[#d4d0c8] flex items-center justify-center xp-sunken shrink-0">
                    <Icon className="w-4 h-4 text-[#0a246a]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0a246a]">{label}</p>
                    <p className="text-[10px] text-[#808080] font-mono">{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
