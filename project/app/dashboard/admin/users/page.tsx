'use client';

import AdminProtection from '@/components/AdminProtection';
import { Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersManagementPage() {
    const { officer } = useAuth();

    return (
        <AdminProtection>
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-[#0058a0] text-white p-6 border-b-2 border-[#003d6b]">
                    <div className="max-w-7xl mx-auto">
                        <Link
                            href="/dashboard/admin"
                            className="inline-flex items-center gap-2 mb-4 text-blue-100 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Zurück zur Administratorkonsole
                        </Link>
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6" />
                            <h1 className="text-3xl font-bold">Benutzerverwaltung</h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-[#ece9d8] p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Tabs */}
                        <div className="mb-6 flex gap-2 border-b border-[#808080]">
                            <button className="px-4 py-2 border-b-2 border-[#0a246a] text-[#0a246a] font-bold text-sm">
                                Alle Benutzer
                            </button>
                            <button className="px-4 py-2 text-gray-600 hover:text-[#0a246a] font-bold text-sm">
                                Administratoren
                            </button>
                            <button className="px-4 py-2 text-gray-600 hover:text-[#0a246a] font-bold text-sm">
                                Inaktiv
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="mb-6 flex gap-4">
                            <div className="flex-1 xp-sunken bg-white px-3 py-2 flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Benutzer durchsuchen..."
                                    className="flex-1 bg-transparent outline-none text-sm"
                                />
                            </div>
                            <button className="xp-btn px-6 py-2 font-bold text-sm">
                                Benutzer hinzufügen
                            </button>
                        </div>

                        {/* User Table */}
                        <div className="xp-raised bg-white">
                            <div className="border-b border-[#808080] p-4 font-bold text-[#0a246a] grid grid-cols-5 gap-4 text-sm bg-[#e0e0e0]">
                                <div>Name</div>
                                <div>Rang</div>
                                <div>Rolle</div>
                                <div>Abteilung</div>
                                <div>Aktionen</div>
                            </div>
                            <div className="p-4 text-center text-gray-500 text-sm">
                                <p>Platzhalter: Benutzerliste wird hier angezeigt</p>
                                <p className="text-xs mt-2">Admin-Funktionen: Rolle ändern, Berechtigungen verwalten, Benutzer deaktivieren</p>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-blue-100 border-l-4 border-blue-600">
                            <p className="text-sm text-blue-800">
                                <strong>Info:</strong> Hier können Sie alle Benutzer verwalten, ihre Rollen ändern und Berechtigungen anpassen.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminProtection>
    );
}
