'use client';

import AdminProtection from '@/components/AdminProtection';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SystemLogsPage() {
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
                            <FileText className="w-6 h-6" />
                            <h1 className="text-3xl font-bold">Systemprotokolle</h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-[#ece9d8] p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6 flex gap-4">
                            <div className="flex-1 xp-sunken bg-white px-3 py-2">
                                <input
                                    type="text"
                                    placeholder="Logs durchsuchen..."
                                    className="w-full bg-transparent outline-none text-sm"
                                />
                            </div>
                            <button className="xp-btn px-6 py-2 font-bold text-sm">Filtern</button>
                            <button className="xp-btn px-6 py-2 font-bold text-sm">Exportieren</button>
                        </div>

                        <div className="xp-raised bg-white font-mono text-xs text-green-700 bg-black p-4 min-h-96 overflow-auto">
                            <p className="text-green-400">&gt; [2026-08-17 14:23:45] USER_LOGIN: admin@rcpd.local</p>
                            <p className="text-green-400">&gt; [2026-08-17 14:22:10] ADMIN_ACCESS: System Settings</p>
                            <p className="text-yellow-400">&gt; [2026-08-17 14:15:33] WARNING: Elevated Privileges Used</p>
                            <p className="text-green-400">&gt; [2026-08-17 14:10:00] USER_ACTION: Personnel File Created</p>
                            <p className="text-gray-500">&gt; ...</p>
                            <p className="text-green-400 mt-4">&gt; Log system ready.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminProtection>
    );
}
