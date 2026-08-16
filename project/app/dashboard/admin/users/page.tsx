'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Officer } from '@/lib/database.types';
import AdminProtection from '@/components/AdminProtection';
import { Users, Search, ArrowLeft } from 'lucide-react';

export default function UserManagementPage() {
    const [users, setUsers] = useState<Officer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'officer'>('all');
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    async function loadUsers() {
        setLoading(true);
        const { data } = await supabase.from('user').select('*').order('lastname', { ascending: true });
        setUsers((data as Officer[]) ?? []);
        setLoading(false);
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function handleRoleChange(userId: string, newRole: 'officer' | 'admin' | 'supervisor') {
        setUpdatingId(userId);
        await supabase.from('user').update({ role: newRole } as any).eq('id', userId);
        await loadUsers();
        setUpdatingId(null);
    }

    const filteredUsers = users.filter(u => {
        const fullName = `${u.firstname ?? ''} ${u.lastname ?? ''}`.toLowerCase();
        const matchesSearch = fullName.includes(search.toLowerCase()) || (u.rank ?? '').toLowerCase().includes(search.toLowerCase());

        if (activeTab === 'admin') return matchesSearch && u.role === 'admin';
        if (activeTab === 'officer') return matchesSearch && (u.role === 'officer' || !u.role);
        return matchesSearch;
    });

    return (
        <AdminProtection>
            <div className="p-4 space-y-4 max-w-6xl">
                <Link href="/dashboard/admin" className="text-xs text-[#0a246a] hover:underline flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Zurück zur Administratorkonsole
                </Link>

                <div className="xp-window">
                    <div className="xp-titlebar">
                        <Users className="w-4 h-4" />
                        <span className="flex-1">Benutzerverwaltung</span>
                    </div>

                    <div className="p-3 bg-[#ece9d8] space-y-3">
                        {/* Tabs */}
                        <div className="flex border-b border-[#808080] gap-1">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-3 py-1 text-xs font-bold border-t border-x ${activeTab === 'all' ? 'bg-[#ece9d8] border-[#808080] -mb-px pb-1.5' : 'bg-[#d4d0c8] border-transparent text-[#404040]'}`}
                            >
                                Alle Benutzer ({users.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`px-3 py-1 text-xs font-bold border-t border-x ${activeTab === 'admin' ? 'bg-[#ece9d8] border-[#808080] -mb-px pb-1.5' : 'bg-[#d4d0c8] border-transparent text-[#404040]'}`}
                            >
                                Administratoren ({users.filter(u => u.role === 'admin').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('officer')}
                                className={`px-3 py-1 text-xs font-bold border-t border-x ${activeTab === 'officer' ? 'bg-[#ece9d8] border-[#808080] -mb-px pb-1.5' : 'bg-[#d4d0c8] border-transparent text-[#404040]'}`}
                            >
                                Officers ({users.filter(u => u.role !== 'admin').length})
                            </button>
                        </div>

                        {/* Suchleiste */}
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-[#404040]" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Benutzer durchsuchen..."
                                className="xp-input flex-1"
                            />
                        </div>

                        {/* Tabelle */}
                        <div className="xp-sunken bg-white overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#d4d0c8] text-[#000] font-bold border-b border-[#808080]">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Rang</th>
                                        <th className="p-2">Dienstnummer</th>
                                        <th className="p-2">Rolle</th>
                                        <th className="p-2">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-[#808080]">
                                                Lade Benutzer...
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-[#808080]">
                                                Keine Benutzer gefunden.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map(u => (
                                            <tr key={u.id} className="border-b border-[#ece9d8] hover:bg-[#f0f0f0]">
                                                <td className="p-2 font-bold text-[#0a246a]">
                                                    {u.firstname} {u.lastname}
                                                </td>
                                                <td className="p-2">{u.rank || 'N/A'}</td>
                                                <td className="p-2 font-mono">{u.badgenumber ? `#${u.badgenumber}` : 'N/A'}</td>
                                                <td className="p-2">
                                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-800'}`}>
                                                        {u.role ?? 'officer'}
                                                    </span>
                                                </td>
                                                <td className="p-2">
                                                    <select
                                                        value={u.role ?? 'officer'}
                                                        disabled={updatingId === u.id}
                                                        onChange={e => handleRoleChange(u.id, e.target.value as any)}
                                                        className="xp-input text-xs h-6 py-0"
                                                    >
                                                        <option value="officer">Officer</option>
                                                        <option value="supervisor">Supervisor</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminProtection>
    );
}