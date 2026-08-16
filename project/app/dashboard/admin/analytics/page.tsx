'use client';

import AdminProtection from '@/components/AdminProtection';
import { BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
    return (
        <AdminProtection>
            <div className="flex-1 flex flex-col">
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
                            <BarChart3 className="w-6 h-6" />
                            <h1 className="text-3xl font-bold">Analytik & Berichte</h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-[#ece9d8] p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="xp-raised bg-white p-6">
                                <h3 className="font-bold text-[#0a246a] mb-4">Benutzeraktivität</h3>
                                <div className="h-48 bg-[#e0e0e0] flex items-center justify-center text-gray-500">
                                    [Platzhalter: Chart wird hier angezeigt]
                                </div>
                            </div>
                            <div className="xp-raised bg-white p-6">
                                <h3 className="font-bold text-[#0a246a] mb-4">Systemauslastung</h3>
                                <div className="h-48 bg-[#e0e0e0] flex items-center justify-center text-gray-500">
                                    [Platzhalter: Chart wird hier angezeigt]
                                </div>
                            </div>
                        </div>

                        <div className="xp-raised bg-white p-6">
                            <h2 className="text-lg font-bold text-[#0a246a] mb-4">Verfügbare Berichte</h2>
                            <div className="space-y-2">
                                <div className="p-3 bg-[#e0e0e0] cursor-pointer hover:bg-[#d0d0d0]">
                                    📊 Benutzerstatistiken - Gesamtzahl, Rollen-Verteilung
                                </div>
                                <div className="p-3 bg-[#e0e0e0] cursor-pointer hover:bg-[#d0d0d0]">
                                    📈 Aktivitätstrends - Login-Muster, Spitzenwerte
                                </div>
                                <div className="p-3 bg-[#e0e0e0] cursor-pointer hover:bg-[#d0d0d0]">
                                    🔒 Sicherheitsberichte - Fehlgeschlagene Logins, verdächtige Aktivitäten
                                </div>
                                <div className="p-3 bg-[#e0e0e0] cursor-pointer hover:bg-[#d0d0d0]">
                                    💾 Datenbankstatistiken - Speichernutzung, Tabellengrößen
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminProtection>
    );
}
