'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  LogOut,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navSections = [
  {
    label: 'RCPD System',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/org', icon: Users, label: 'Organigramm' },
      { href: '/dashboard/personnel', icon: FileText, label: 'Personalakten' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/dashboard/calendar', icon: Calendar, label: 'Kalender' },
      { href: '/dashboard/messages', icon: MessageSquare, label: 'Nachrichten' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { officer, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'RCPD System': true,
    'Operations': true,
    'Administration': false,
  });

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Add admin section to nav if user is admin
  const displayedSections = [
    ...navSections,
    ...(isAdmin ? [{
      label: 'Administration',
      items: [
        { href: '/dashboard/admin', icon: Lock, label: 'Administratorkonsole' },
      ],
    }] : []),
  ];

  return (
    <aside className="w-56 h-screen sticky top-0 bg-[#ece9d8] flex flex-col border-r-2 border-[#404040]">
      {/* Explorer bar header */}
      <div className="xp-titlebar h-7">
        <Folder className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-xs font-bold">RCPD Folders</span>
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#808080] bg-[#ece9d8]">
        <span className="text-[11px] text-[#404040]">Address:</span>
        <div className="flex-1 xp-sunken bg-white px-1.5 py-0.5 text-[11px] font-mono text-[#404040] truncate">
          RCPD://Intranet{pathname.replace('/dashboard', '') || '/'}
        </div>
      </div>

      {/* Tree navigation */}
      <nav className="flex-1 overflow-y-auto py-1 bg-[#ece9d8]">
        {displayedSections.map(section => {
          const expanded = expandedSections[section.label] ?? true;
          return (
            <div key={section.label} className="mb-1">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center gap-1 px-2 py-1 text-xs font-bold text-[#0a246a] hover:bg-[#d4d0c8]"
              >
                {expanded ? (
                  <ChevronDown className="w-3 h-3 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 shrink-0" />
                )}
                <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{section.label}</span>
              </button>

              {/* Items */}
              {expanded && (
                <div className="ml-2">
                  {section.items.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          'xp-tree-item',
                          active && 'xp-tree-item-active'
                        )}
                      >
                        <Icon className={cn('w-3.5 h-3.5 shrink-0', active && 'text-white')} />
                        <span className="truncate">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Officer info panel */}
      <div className="border-t border-[#808080] p-2 bg-[#d4d0c8]">
        {officer && (
          <div className="xp-sunken bg-[#ece9d8] p-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#0a246a] flex items-center justify-center xp-raised shrink-0">
                <span className="text-xs font-bold text-white">
                  {officer.firstname?.[0] ?? '?'}{officer.lastname?.[0] ?? ''}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0a246a] truncate leading-tight">
                  {officer.firstname} {officer.lastname}
                </p>
                <p className="text-[10px] text-[#404040] font-mono truncate">
                  {officer.rank}{officer.badgenumber ? ` · #${officer.badgenumber}` : ''}
                </p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className="xp-btn w-full flex items-center justify-center gap-2 text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
