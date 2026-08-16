'use client';

import AdminProtection from '@/components/AdminProtection';
import { Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
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
                            <Shield className="w-6 h-6" />
                            <h1 className="text-3xl font-bold">Sicherheitseinstellungen</h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-[#ece9d8] p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Security Status */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="xp-raised bg-white p-4">
                                <p className="text-xs text-gray-600 mb-2">SSL/TLS Status</p>
                                <p className="text-lg font-bold text-green-600">✓ Sicher</p>
                            </div>
                            <div className="xp-raised bg-white p-4">
                                <p className="text-xs text-gray-600 mb-2">2FA Aktiviert</p>
                                <p className="text-lg font-bold text-orange-600">⚠ Optional</p>
                            </div>
                            <div className="xp-raised bg-white p-4">
                                <p className="text-xs text-gray-600 mb-2">Rolle-Based Access Control</p>
                                <p className="text-lg font-bold text-green-600">✓ Aktiviert</p>
                            </div>
                        </div>

                        {/* Sicherheitsrichtlinien */}
                        <div className="xp-raised bg-white p-6">
                            <h2 className="text-lg font-bold text-[#0a246a] mb-4">Sicherheitsrichtlinien</h2>
                            <div className="space-y-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 mt-1" defaultChecked />
                                    <span className="text-sm text-[#404040]">
                                        <strong>Sichere Passwörter erzwingen:</strong> Mindestens 12 Zeichen mit Sonderzeichen
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 mt-1" defaultChecked />
                                    <span className="text-sm text-[#404040]">
                                        <strong>Session-Timeout:</strong> Nach 30 Minuten Inaktivität abmelden
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 mt-1" />
                                    <span className="text-sm text-[#404040]">
                                        <strong>IP-Whitelisting:</strong> Nur bestimmte IP-Adressen erlauben
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 mt-1" />
                                    <span className="text-sm text-[#404040]">
                                        <strong>Zwei-Faktor-Authentifizierung (2FA):</strong> Für alle Admin-Konten erforderlich
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Verdächtige Aktivitäten */}
                        <div className="p-4 bg-red-100 border-l-4 border-red-600">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-800">
                                    <p className="font-bold mb-1">Verdächtige Aktivität erkannt</p>
                                    <p>3 fehlgeschlagene Login-Versuche von IP: 192.168.x.x</p>
                                </div>
                            </div>
                        </div>

                        <button className="xp-btn px-6 py-2 font-bold">Änderungen speichern</button>
                    </div>
                </div>
            </div>
        </AdminProtection>
    );
}
