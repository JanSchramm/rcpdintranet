'use client';

import { useAuth } from '@/contexts/AuthContext';
import AdminProtection from '@/components/AdminProtection';
import Link from 'next/link';
import {
    Users,
    Settings,
    FileText,
    BarChart3,
    Shield,
    Database,
    Clock,
    AlertCircle,
} from 'lucide-react';

const adminMenuItems = [
    {
        href: '/dashboard/admin/users',
        icon: Users,
        label: 'Benutzerverwaltung',
        description: 'Verwalte Benutzer, Rollen und Berechtigungen',
        color: 'bg-blue-100 text-blue-600',
    },
    {
        href: '/dashboard/admin/system',
        icon: Settings,
        label: 'Systemeinstellungen',
        description: 'Konfiguriere globale Einstellungen und Parameter',
        color: 'bg-purple-100 text-purple-600',
    },
    {
        href: '/dashboard/admin/logs',
        icon: FileText,
        label: 'Systemprotokolle',
        description: 'Überprüfe Aktivitätslogs und Audit-Trails',
        color: 'bg-green-100 text-green-600',
    },
    {
        href: '/dashboard/admin/analytics',
        icon: BarChart3,
        label: 'Analytik & Berichte',
        description: 'Zeige Statistiken und Nutzungsberichte an',
        color: 'bg-orange-100 text-orange-600',
    },
    {
        href: '/dashboard/admin/security',
        icon: Shield,
        label: 'Sicherheit',
        description: 'Verwalte Sicherheitseinstellungen und Richtlinien',
        color: 'bg-red-100 text-red-600',
    },
    {
        href: '/dashboard/admin/database',
        icon: Database,
        label: 'Datenbankverwaltung',
        description: 'Überwache und verwalte Datenbankoperationen',
        color: 'bg-indigo-100 text-indigo-600',
    },
];

export default function AdminDashboard() {
    const { officer } = useAuth();

    return (
        <AdminProtection>
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-[#0058a0] text-white p-6 border-b-2 border-[#003d6b]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-6 h-6" />
                            <h1 className="text-3xl font-bold">Administratorkonsole</h1>
                        </div>
                        <p className="text-blue-100 text-sm ml-9">
                            Willkommen, {officer?.rank} {officer?.firstname} {officer?.lastname}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-[#ece9d8] p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="xp-raised bg-white p-4 flex items-center gap-4">
                                <Users className="w-8 h-8 text-blue-600" />
                                <div>
                                    <p className="text-xs text-gray-600">Gesamt Benutzer</p>
                                    <p className="text-2xl font-bold text-[#0a246a]">--</p>
                                </div>
                            </div>
                            <div className="xp-raised bg-white p-4 flex items-center gap-4">
                                <Clock className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-xs text-gray-600">Online</p>
                                    <p className="text-2xl font-bold text-[#0a246a]">--</p>
                                </div>
                            </div>
                            <div className="xp-raised bg-white p-4 flex items-center gap-4">
                                <AlertCircle className="w-8 h-8 text-orange-600" />
                                <div>
                                    <p className="text-xs text-gray-600">Warnungen</p>
                                    <p className="text-2xl font-bold text-[#0a246a]">0</p>
                                </div>
                            </div>
                            <div className="xp-raised bg-white p-4 flex items-center gap-4">
                                <Database className="w-8 h-8 text-purple-600" />
                                <div>
                                    <p className="text-xs text-gray-600">DB Status</p>
                                    <p className="text-sm font-bold text-green-600">OK</p>
                                </div>
                            </div>
                        </div>

                        {/* Admin Menu Grid */}
                        <div>
                            <h2 className="text-lg font-bold text-[#0a246a] mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Verwaltungsfunktionen
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {adminMenuItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="xp-raised bg-white hover:bg-[#e8e4d8] transition-colors cursor-pointer group"
                                        >
                                            <div className="p-6">
                                                <div className={`w-12 h-12 rounded flex items-center justify-center mb-3 ${item.color} group-hover:shadow-md`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-bold text-[#0a246a] mb-1 group-hover:text-[#003d6b]">
                                                    {item.label}
                                                </h3>
                                                <p className="text-xs text-gray-600 leading-relaxed">
                                                    {item.description}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-3 group-hover:text-gray-500">
                                                    Klicke zum Öffnen →
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-600">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-bold mb-1">Hinweis für Administratoren</p>
                                    <p>
                                        Sie haben erweiterte Zugriffe und Berechtigungen. Alle Admin-Aktionen werden protokolliert.
                                        Verwenden Sie diese Berechtigungen verantwortungsvoll und nur für autorisierte Aktivitäten.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminProtection>
    );
}
