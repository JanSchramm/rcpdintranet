'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import AdminProtection from '@/components/AdminProtection';
import { Users, Settings, ShieldAlert, BarChart3, Database, FileText, AlertTriangle, Users2, FolderTree } from 'lucide-react';
import { getDisplayRank } from '@/lib/utils';

export default function AdminDashboardPage() {
    const { officer } = useAuth();
    const [totalUsers, setTotalUsers] = useState<number | null>(null);
    const [adminCount, setAdminCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            const { count: usersCount } = await supabase
                .from('user')
                .select('*', { count: 'exact', head: true });

            const { count: adminsCount } = await supabase
                .from('user')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'admin');

            setTotalUsers(usersCount ?? 0);
            setAdminCount(adminsCount ?? 0);
            setLoading(false);
        }
        loadStats();
    }, []);

    return (
        <AdminProtection>
            <div className="p-4 space-y-4 max-w-6xl">
                {/* Header */}
                <div className="xp-window">
                    <div className="xp-titlebar">
                        <span className="flex-1">Administratorkonsole</span>
                    </div>
                    <div className="p-4 bg-[#0a246a] text-white">
                        <h1 className="text-xl font-bold">Administratorkonsole</h1>
                        <p className="text-xs text-[#d4d0c8]">
                            Willkommen, {officer ? `${getDisplayRank(officer)} ${officer.firstname} ${officer.lastname}` : 'Administrator'}
                        </p>
                    </div>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="xp-window p-3 bg-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-[#0a246a]" />
                        <div>
                            <p className="text-[11px] text-[#404040]">Gesamt Benutzer</p>
                            <p className="text-lg font-bold">{loading ? '--' : totalUsers}</p>
                        </div>
                    </div>
                    <div className="xp-window p-3 bg-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-[11px] text-[#404040]">Administratoren</p>
                            <p className="text-lg font-bold">{loading ? '--' : adminCount}</p>
                        </div>
                    </div>
                    <div className="xp-window p-3 bg-white flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-amber-600" />
                        <div>
                            <p className="text-[11px] text-[#404040]">Warnungen</p>
                            <p className="text-lg font-bold">0</p>
                        </div>
                    </div>
                    <div className="xp-window p-3 bg-white flex items-center gap-3">
                        <Database className="w-8 h-8 text-purple-600" />
                        <div>
                            <p className="text-[11px] text-[#404040]">DB Status</p>
                            <p className="text-lg font-bold text-green-600">OK</p>
                        </div>
                    </div>
                </div>

                {/* Verwaltungsfunktionen */}
                <div className="xp-window">
                    <div className="xp-titlebar h-6">
                        <span className="text-xs">Verwaltungsfunktionen</span>
                    </div>
                    <div className="p-4 bg-[#ece9d8] grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Link href="/dashboard/admin/users" className="xp-window p-3 bg-white hover:bg-[#f0f0f0] block transition">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-5 h-5 text-[#0a246a]" />
                                <span className="font-bold text-xs">Benutzerverwaltung</span>
                            </div>
                            <p className="text-[11px] text-[#404040]">Verwalte Benutzer, Rollen und Berechtigungen</p>
                        </Link>

                        <Link href="/dashboard/admin/ranks" className="xp-window p-3 bg-white hover:bg-[#f0f0f0] block transition">
                            <div className="flex items-center gap-2 mb-1">
                                <Users2 className="w-5 h-5 text-[#0a246a]" />
                                <span className="font-bold text-xs">Ränge verwalten</span>
                            </div>
                            <p className="text-[11px] text-[#404040]">Definiere Ränge und Hierarchie</p>
                        </Link>

                        <Link href="/dashboard/admin/divisions" className="xp-window p-3 bg-white hover:bg-[#f0f0f0] block transition">
                            <div className="flex items-center gap-2 mb-1">
                                <FolderTree className="w-5 h-5 text-[#0a246a]" />
                                <span className="font-bold text-xs">Divisions verwalten</span>
                            </div>
                            <p className="text-[11px] text-[#404040]">Verwalte Abteilungen und Bureaus</p>
                        </Link>

                        <Link href="/dashboard/admin/system" className="xp-window p-3 bg-white hover:bg-[#f0f0f0] block transition">
                            <div className="flex items-center gap-2 mb-1">
                                <Settings className="w-5 h-5 text-purple-600" />
                                <span className="font-bold text-xs">Systemeinstellungen</span>
                            </div>
                            <p className="text-[11px] text-[#404040]">Konfiguriere globale Einstellungen und Parameter</p>
                        </Link>

                        <Link href="/dashboard/admin/logs" className="xp-window p-3 bg-white hover:bg-[#f0f0f0] block transition">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-xs">Systemprotokolle</span>
                            </div>
                            <p className="text-[11px] text-[#404040]">Überprüfe Aktivitätslogs und Audit-Trails</p>
                        </Link>

                        <div className="xp-window p-3 bg-white opacity-60">
                            <div className="flex items-center gap-2 mb-1">
                                <BarChart3 className="w-5 h-5 text-amber-600" />
                                <span className="font-bold text-xs">Analytik & Berichte</span>
                            </div>
                            <p className="text-[11px] text-[#404040]">Demnächst verfügbar</p>
                        </div>

                        <div className="xp-window p-3 bg-white opacity-60">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                                <span className="font-bold text-xs">Sicherheit</span>
                            </div>
                            <p className="text-[11px] text-[#404040]">Demnächst verfügbar</p>
                        </div>

                        <div className="xp-window p-3 bg-white opacity-60">
                            <div className="flex items-center gap-2 mb-1">
                                <Database className="w-5 h-5 text-indigo-600" />
                                <span className="font-bold text-xs">Datenbankverwaltung</span>
                            </div>
                            <p className="text-[11px] text-[#404040]">Demnächst verfügbar</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminProtection>
    );
}