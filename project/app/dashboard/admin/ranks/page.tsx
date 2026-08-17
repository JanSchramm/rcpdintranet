'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminProtection from '@/components/AdminProtection';
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, Save, X } from 'lucide-react';
import type { RankDefinition } from '@/lib/database.types';

export default function RanksManagementPage() {
  const [ranks, setRanks] = useState<RankDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RankDefinition>>({});
  const [newRank, setNewRank] = useState({ title: '', order_index: 0, level: 0 });
  const [showAddForm, setShowAddForm] = useState(false);

  async function loadRanks() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ranks');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRanks(data ?? []);
    } catch (e: any) {
      alert(`Fehler beim Laden: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRanks();
  }, []);

  function startEdit(rank: RankDefinition) {
    setEditingId(rank.id);
    setEditForm({
      title: rank.title,
      order_index: rank.order_index,
      level: rank.level,
      is_active: rank.is_active,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id: string) {
    try {
      const res = await fetch(`/api/admin/ranks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadRanks();
      setEditingId(null);
      setEditForm({});
    } catch (e: any) {
      alert(`Fehler beim Speichern: ${e.message}`);
    }
  }

  async function addRank() {
    if (!newRank.title.trim()) return;
    try {
      const res = await fetch('/api/admin/ranks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRank),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewRank({ title: '', order_index: 0, level: 0 });
      setShowAddForm(false);
      await loadRanks();
    } catch (e: any) {
      alert(`Fehler beim Erstellen: ${e.message}`);
    }
  }

  async function deleteRank(id: string) {
    if (!confirm('Diesen Rang wirklich löschen?')) return;
    try {
      const res = await fetch(`/api/admin/ranks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadRanks();
    } catch (e: any) {
      alert(`Fehler beim Löschen: ${e.message}`);
    }
  }

  return (
    <AdminProtection>
      <div className="p-4 space-y-4 max-w-6xl">
        <Link href="/dashboard/admin" className="text-xs text-[#0a246a] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Zurück zur Administratorkonsole
        </Link>

        <div className="xp-window">
          <div className="xp-titlebar">
            <GripVertical className="w-4 h-4" />
            <span className="flex-1">Ränge verwalten</span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="xp-btn flex items-center gap-1 text-xs h-6 py-0"
            >
              <Plus className="w-3 h-3" />
              Neuer Rang
            </button>
          </div>

          <div className="p-4 bg-[#ece9d8] space-y-3">
            {showAddForm && (
              <div className="xp-sunken bg-white p-3 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Rang-Titel (z.B. Sergeant)"
                    value={newRank.title}
                    onChange={e => setNewRank({ ...newRank, title: e.target.value })}
                    className="xp-input text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Order"
                    value={newRank.order_index}
                    onChange={e => setNewRank({ ...newRank, order_index: parseInt(e.target.value) || 0 })}
                    className="xp-input text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Level (für Gleichstand)"
                    value={newRank.level}
                    onChange={e => setNewRank({ ...newRank, level: parseInt(e.target.value) || 0 })}
                    className="xp-input text-xs"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAddForm(false)} className="xp-btn px-3 text-xs">
                    Abbrechen
                  </button>
                  <button onClick={addRank} className="xp-btn px-3 text-xs bg-green-200">
                    Speichern
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {loading ? (
                <p className="text-xs text-[#404040]">Lade...</p>
              ) : ranks.length === 0 ? (
                <p className="text-xs text-[#808080]">Keine Ränge definiert.</p>
              ) : (
                ranks.map(rank => (
                  <div key={rank.id} className="xp-panel p-3">
                    {editingId === rank.id ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={editForm.title ?? ''}
                            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                            className="xp-input text-xs"
                          />
                          <input
                            type="number"
                            value={editForm.order_index ?? 0}
                            onChange={e => setEditForm({ ...editForm, order_index: parseInt(e.target.value) || 0 })}
                            className="xp-input text-xs"
                          />
                          <input
                            type="number"
                            value={editForm.level ?? 0}
                            onChange={e => setEditForm({ ...editForm, level: parseInt(e.target.value) || 0 })}
                            className="xp-input text-xs"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={cancelEdit} className="xp-btn px-3 text-xs">
                            <X className="w-3 h-3" /> Abbrechen
                          </button>
                          <button onClick={() => saveEdit(rank.id)} className="xp-btn px-3 text-xs bg-green-200">
                            <Save className="w-3 h-3" /> Speichern
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-[#808080]" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#0a246a]">{rank.title}</p>
                          <p className="text-[10px] text-[#404040] font-mono">
                            Order: {rank.order_index} | Level: {rank.level} | {rank.is_active ? 'Aktiv' : 'Inaktiv'}
                          </p>
                        </div>
                        <button
                          onClick={() => startEdit(rank)}
                          className="xp-btn p-1 text-[9px]"
                          title="Bearbeiten"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteRank(rank.id)}
                          className="xp-btn p-1 text-[9px] hover:bg-[#cc0000] hover:text-white"
                          title="Löschen"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminProtection>
  );
}
