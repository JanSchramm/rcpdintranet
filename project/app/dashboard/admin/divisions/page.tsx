'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminProtection from '@/components/AdminProtection';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import type { Division } from '@/lib/database.types';

export default function DivisionsManagementPage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Division>>({});
  const [newDivision, setNewDivision] = useState({ name: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  async function loadDivisions() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/divisions');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDivisions(data ?? []);
    } catch (e: any) {
      alert(`Fehler beim Laden: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDivisions();
  }, []);

  function startEdit(division: Division) {
    setEditingId(division.id);
    setEditForm({
      name: division.name,
      description: division.description,
      is_active: division.is_active,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id: string) {
    try {
      const res = await fetch(`/api/admin/divisions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadDivisions();
      setEditingId(null);
      setEditForm({});
    } catch (e: any) {
      alert(`Fehler beim Speichern: ${e.message}`);
    }
  }

  async function addDivision() {
    if (!newDivision.name.trim()) return;
    try {
      const res = await fetch('/api/admin/divisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDivision),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewDivision({ name: '', description: '' });
      setShowAddForm(false);
      await loadDivisions();
    } catch (e: any) {
      alert(`Fehler beim Erstellen: ${e.message}`);
    }
  }

  async function deleteDivision(id: string) {
    if (!confirm('Diese Division wirklich löschen?')) return;
    try {
      const res = await fetch(`/api/admin/divisions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadDivisions();
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
            <ArrowLeft className="w-4 h-4" />
            <span className="flex-1">Divisions verwalten</span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="xp-btn flex items-center gap-1 text-xs h-6 py-0"
            >
              <Plus className="w-3 h-3" />
              Neue Division
            </button>
          </div>

          <div className="p-4 bg-[#ece9d8] space-y-3">
            {showAddForm && (
              <div className="xp-sunken bg-white p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Divisions-Name (z.B. Patrol)"
                  value={newDivision.name}
                  onChange={e => setNewDivision({ ...newDivision, name: e.target.value })}
                  className="xp-input text-xs w-full"
                />
                <input
                  type="text"
                  placeholder="Beschreibung (optional)"
                  value={newDivision.description}
                  onChange={e => setNewDivision({ ...newDivision, description: e.target.value })}
                  className="xp-input text-xs w-full"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAddForm(false)} className="xp-btn px-3 text-xs">
                    Abbrechen
                  </button>
                  <button onClick={addDivision} className="xp-btn px-3 text-xs bg-green-200">
                    Speichern
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {loading ? (
                <p className="text-xs text-[#404040]">Lade...</p>
              ) : divisions.length === 0 ? (
                <p className="text-xs text-[#808080]">Keine Divisions definiert.</p>
              ) : (
                divisions.map(division => (
                  <div key={division.id} className="xp-panel p-3">
                    {editingId === division.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.name ?? ''}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="xp-input text-xs w-full"
                        />
                        <input
                          type="text"
                          value={editForm.description ?? ''}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          className="xp-input text-xs w-full"
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={cancelEdit} className="xp-btn px-3 text-xs">
                            <X className="w-3 h-3" /> Abbrechen
                          </button>
                          <button onClick={() => saveEdit(division.id)} className="xp-btn px-3 text-xs bg-green-200">
                            <Save className="w-3 h-3" /> Speichern
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#0a246a]">{division.name}</p>
                          <p className="text-[10px] text-[#404040] font-mono">
                            {division.description || 'Keine Beschreibung'} | {division.is_active ? 'Aktiv' : 'Inaktiv'}
                          </p>
                        </div>
                        <button
                          onClick={() => startEdit(division)}
                          className="xp-btn p-1 text-[9px]"
                          title="Bearbeiten"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteDivision(division.id)}
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
