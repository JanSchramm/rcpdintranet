'use client';

import AdminProtection from '@/components/AdminProtection';
import { Database, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DatabasePage() {
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
                            <Database className="w-6 h-6" />
                            <h1 className="text-3xl font-bold">Datenbankverwaltung</h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-[#ece9d8] p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Datenbankstatus */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="xp-raised bg-white p-4">
                                <p className="text-xs text-gray-600 mb-2">Status</p>
                                <p className="text-lg font-bold text-green-600">✓ Aktiv</p>
                            </div>
                            <div className="xp-raised bg-white p-4">
                                <p className="text-xs text-gray-600 mb-2">Speichernutzung</p>
                                <p className="text-lg font-bold text-[#0a246a]">156 MB / 1 GB</p>
                            </div>
                            <div className="xp-raised bg-white p-4">
                                <p className="text-xs text-gray-600 mb-2">Verbindungen</p>
                                <p className="text-lg font-bold text-[#0a246a]">5 / 100</p>
                            </div>
                            <div className="xp-raised bg-white p-4">
                                <p className="text-xs text-gray-600 mb-2">Letzte Sicherung</p>
                                <p className="text-xs font-bold text-[#0a246a]">2026-08-17 12:00</p>
                            </div>
                        </div>

                        {/* Tabellenüberblick */}
                        <div className="xp-raised bg-white">
                            <div className="border-b border-[#808080] p-4 font-bold text-[#0a246a] grid grid-cols-4 gap-4 text-sm bg-[#e0e0e0]">
                                <div>Tabelle</div>
                                <div>Zeilen</div>
                                <div>Größe</div>
                                <div>Aktionen</div>
                            </div>

                            <div className="divide-y divide-[#808080]">
                                {[
                                    { name: 'user', rows: 12, size: '45 KB' },
                                    { name: 'messages', rows: 234, size: '156 KB' },
                                    { name: 'personnel_files', rows: 45, size: '320 KB' },
                                    { name: 'events', rows: 78, size: '89 KB' },
                                ].map((table) => (
                                    <div key={table.name} className="p-4 grid grid-cols-4 gap-4 text-sm hover:bg-[#f5f5f5]">
                                        <div className="font-mono text-[#0a246a]">{table.name}</div>
                                        <div className="text-[#404040]">{table.rows}</div>
                                        <div className="text-[#404040]">{table.size}</div>
                                        <div className="flex gap-2">
                                            <button className="xp-btn text-xs px-2 py-1">Ansicht</button>
                                            <button className="xp-btn text-xs px-2 py-1">Sichern</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Wartungstools */}
                        <div className="xp-raised bg-white p-6">
                            <h2 className="text-lg font-bold text-[#0a246a] mb-4">Wartungstools</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="xp-btn py-3 font-bold text-sm hover:bg-[#e0e0e0]">
                                    🔧 Fragmentierung optimieren
                                </button>
                                <button className="xp-btn py-3 font-bold text-sm hover:bg-[#e0e0e0]">
                                    💾 Sicherung erstellen
                                </button>
                                <button className="xp-btn py-3 font-bold text-sm hover:bg-[#e0e0e0]">
                                    ↩️ Letzte Sicherung wiederherstellen
                                </button>
                                <button className="xp-btn py-3 font-bold text-sm hover:bg-[#e0e0e0]">
                                    🧹 Alte Logs bereinigen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminProtection>
    );
}
