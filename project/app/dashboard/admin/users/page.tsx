'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Officer } from '@/lib/database.types';
import AdminProtection from '@/components/AdminProtection';
import { Users, Search, ArrowLeft, Check, X, Edit, Save, XCircle } from 'lucide-react';
import { getDisplayRank } from '@/lib/utils';
import type { Division } from '@/lib/database.types';

export default function UserManagementPage() {
    const [users, setUsers] = useState<Officer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'admin'>('all');
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Officer>>({});
    const [ranks, setRanks] = useState<Array<{ id?: string; title?: string; order_index?: number }>>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);

    async function loadUsers() {
        setLoading(true);
        setError(null);
        try {
            const [usersRes, ranksRes, divisionsRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/ranks'),
                fetch('/api/admin/divisions'),
            ]);
            const [usersData, ranksData, divisionsData] = await Promise.all([
                usersRes.json(),
                ranksRes.json(),
                divisionsRes.json(),
            ]);

            if (!usersRes.ok) throw new Error(usersData.error || 'Fehler beim Laden');
            setUsers(usersData ?? []);
            if (ranksRes.ok) setRanks(ranksData ?? []);
            if (divisionsRes.ok) setDivisions(divisionsData ?? []);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'Unbekannter Fehler';
            setError(`Fehler beim Laden: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function updateUser(userId: string, updates: Partial<Officer>) {
        setUpdatingId(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, updates }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            await loadUsers();
        } catch (e: any) {
            alert(`Fehler beim Aktualisieren: ${e.message}`);
        } finally {
            setUpdatingId(null);
        }
    }

    function startEdit(user: Officer) {
        setEditingId(user.id);
        setEditForm({
            firstname: user.firstname,
            lastname: user.lastname,
            badgenumber: user.badgenumber || '',
            rank_id: user.rank_id || ranks.find(r => r.title && r.title.toLowerCase() === (user.rank || '').toLowerCase())?.id || null,
            division: user.division || [],
            role: user.role,
            status: user.status,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setEditForm({});
    }

    async function saveEdit(userId: string) {
        await updateUser(userId, editForm);
        setEditingId(null);
        setEditForm({});
    }

    const pendingCount = users.filter((u) => u.status === 'pending').length;

    const filteredUsers = users.filter((u) => {
        const fullName = `${u.firstname ?? ''} ${u.lastname ?? ''}`.toLowerCase();
        const matchesSearch = fullName.includes(search.toLowerCase()) || (u.badgenumber ?? '').toLowerCase().includes(search.toLowerCase());

        if (activeTab === 'pending') return matchesSearch && u.status === 'pending';
        if (activeTab === 'admin') return matchesSearch && u.role === 'admin';
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
                        <span className="flex-1">Benutzerverwaltung & Freigaben</span>
                    </div>

                    <div className="p-3 bg-[#ece9d8] space-y-3">
                        {error && (
                            <div className="p-3 bg-red-100 border-l-4 border-red-600 text-red-800 text-xs">
                                <p className="font-bold">Fehler beim Laden der Benutzer:</p>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex border-b border-[#808080] gap-1">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-3 py-1 text-xs font-bold border-t border-x ${activeTab === 'pending' ? 'bg-[#ece9d8] border-[#808080] -mb-px pb-1.5' : 'bg-[#d4d0c8] border-transparent text-[#404040]'}`}
                            >
                                Wartend auf Freigabe ({pendingCount})
                            </button>
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
                                Admins ({users.filter((u) => u.role === 'admin').length})
                            </button>
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-[#404040]" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Benutzer durchsuchen..."
                                className="xp-input flex-1"
                            />
                        </div>

                        {/* Table */}
                        <div className="xp-sunken bg-white overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#d4d0c8] text-[#000] font-bold border-b border-[#808080]">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Dienstnummer</th>
                                        <th className="p-2">Rang</th>
                                        <th className="p-2">Division</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Rolle</th>
                                        <th className="p-2">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="p-4 text-center text-[#808080]">Lade Benutzer...</td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-4 text-center text-[#808080]">Keine Benutzer gefunden.</td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <tr key={u.id} className="border-b border-[#ece9d8] hover:bg-[#f0f0f0]">
                                                {editingId === u.id ? (
                                                    <>
                                                        <td className="p-2">
                                                            <div className="space-y-1">
                                                                <input
                                                                    type="text"
                                                                    value={editForm.firstname ?? ''}
                                                                    onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })}
                                                                    placeholder="Vorname"
                                                                    className="xp-input text-xs w-full"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={editForm.lastname ?? ''}
                                                                    onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                                                                    placeholder="Nachname"
                                                                    className="xp-input text-xs w-full"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="text"
                                                                value={editForm.badgenumber ?? ''}
                                                                onChange={(e) => setEditForm({ ...editForm, badgenumber: e.target.value })}
                                                                placeholder="Dienstnummer"
                                                                className="xp-input text-xs w-full"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <select
                                                                value={editForm.rank_id ?? ''}
                                                                onChange={(e) => setEditForm({ ...editForm, rank_id: e.target.value || null })}
                                                                className="xp-input text-xs w-full"
                                                            >
                                                                <option value="">Kein Rang</option>
                                                                {ranks
                                                                    .filter(r => r.id)
                                                                    .map(r => (
                                                                        <option key={r.id} value={r.id}>
                                                                            {r.title || r.id}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </td>
                                                        <td className="p-2">
                                                            <div className="flex flex-wrap gap-2">
                                                                {divisions.map(d => (
                                                                    <label key={d.id} className="flex items-center gap-1 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(editForm.division || []).includes(d.name)}
                                                                            onChange={(e) => {
                                                                                const current = editForm.division || [];
                                                                                if (e.target.checked) {
                                                                                    setEditForm({ ...editForm, division: [...current, d.name] });
                                                                                } else {
                                                                                    setEditForm({ ...editForm, division: current.filter(x => x !== d.name) });
                                                                                }
                                                                            }}
                                                                            className="xp-checkbox"
                                                                        />
                                                                        <span className="text-xs">{d.name}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <select
                                                                value={editForm.status ?? 'pending'}
                                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                                                                className="xp-input text-xs w-full"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="approved">Approved</option>
                                                                <option value="rejected">Rejected</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-2">
                                                            <select
                                                                value={editForm.role ?? 'officer'}
                                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                                                                className="xp-input text-xs w-full"
                                                            >
                                                                <option value="officer">Officer</option>
                                                                <option value="supervisor">Supervisor</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-2 flex gap-1">
                                                            <button
                                                                onClick={() => saveEdit(u.id)}
                                                                disabled={updatingId === u.id}
                                                                className="xp-btn px-2 py-0.5 text-[10px] bg-green-200 flex items-center gap-1"
                                                            >
                                                                <Save className="w-3 h-3 text-green-700" /> Speichern
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                disabled={updatingId === u.id}
                                                                className="xp-btn px-2 py-0.5 text-[10px] bg-gray-200 flex items-center gap-1"
                                                            >
                                                                <XCircle className="w-3 h-3" /> Abbrechen
                                                            </button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="p-2 font-bold text-[#0a246a]">
                                                            {u.firstname} {u.lastname}
                                                        </td>
                                                        <td className="p-2">{u.badgenumber || 'N/A'}</td>
                                                        <td className="p-2">{getDisplayRank(u, ranks)}</td>
                                                        <td className="p-2">{(u.division || []).join(', ') || 'N/A'}</td>
                                                        <td className="p-2">
                                                            <span className={`px-1.5 py-0.5 text-[10px] font-bold ${u.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                    u.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {u.status || 'pending'}
                                                            </span>
                                                        </td>
                                                        <td className="p-2">
                                                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800">
                                                                {u.role || 'officer'}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 flex gap-1">
                                                            <button
                                                                onClick={() => startEdit(u)}
                                                                disabled={updatingId === u.id}
                                                                className="xp-btn px-2 py-0.5 text-[10px] bg-blue-200 flex items-center gap-1"
                                                            >
                                                                <Edit className="w-3 h-3 text-blue-700" /> Bearbeiten
                                                            </button>
                                                            {u.status !== 'approved' && (
                                                                <button
                                                                    onClick={() => updateUser(u.id, { status: 'approved' })}
                                                                    disabled={updatingId === u.id}
                                                                    className="xp-btn px-2 py-0.5 text-[10px] bg-green-200 flex items-center gap-1"
                                                                >
                                                                    <Check className="w-3 h-3 text-green-700" /> Akzeptieren
                                                                </button>
                                                            )}
                                                            {u.status !== 'rejected' && (
                                                                <button
                                                                    onClick={() => updateUser(u.id, { status: 'rejected' })}
                                                                    disabled={updatingId === u.id}
                                                                    className="xp-btn px-2 py-0.5 text-[10px] bg-red-200 flex items-center gap-1"
                                                                >
                                                                    <X className="w-3 h-3 text-red-700" /> Ablehnen
                                                                </button>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
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
