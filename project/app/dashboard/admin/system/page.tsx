'use client';

import AdminProtection from '@/components/AdminProtection';
import { Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SystemSettingsPage() {
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
                            <Settings className="w-6 h-6" />
                            <h1 className="text-3xl font-bold">Systemeinstellungen</h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-[#ece9d8] p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="xp-raised bg-white p-6">
                            <h2 className="text-lg font-bold text-[#0a246a] mb-4">Allgemeine Einstellungen</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#404040] mb-2">
                                        Systemname
                                    </label>
                                    <div className="xp-sunken bg-white px-3 py-2">
                                        <input
                                            type="text"
                                            defaultValue="River City Police Department Terminal v3.1.0"
                                            className="w-full bg-transparent outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#404040] mb-2">
                                        Wartungsmodus
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Wartungsmodus aktivieren</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="xp-raised bg-white p-6">
                            <h2 className="text-lg font-bold text-[#0a246a] mb-4">Sicherheitseinstellungen</h2>
                            <p className="text-sm text-gray-600 mb-4">Platzhalter für weitere Sicherheitsoptionen</p>
                        </div>

                        <button className="xp-btn px-6 py-2 font-bold">Änderungen speichern</button>
                    </div>
                </div>
            </div>
        </AdminProtection>
    );
}
