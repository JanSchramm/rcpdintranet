'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Officer, PersonnelFile } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Shield, FileText, Plus, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function OfficerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, officer: currentOfficer } = useAuth();
  const officerId = params.officerId as string;

  const [officer, setOfficer] = useState<Officer | null>(null);
  const [files, setFiles] = useState<PersonnelFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFile, setEditingFile] = useState<PersonnelFile | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [dips, setDips] = useState(0);
  const [dipsSubmitting, setDipsSubmitting] = useState(false);

  const canEdit = currentOfficer?.role === 'admin' || currentOfficer?.role === 'supervisor';

  async function loadData() {
    setLoading(true);
    try {
      const [{ data: offData }, { data: filesData }] = await Promise.all([
        supabase.from('user').select('*').eq('id', officerId).maybeSingle(),
        supabase.from('personnel_files').select('*').eq('officer_id', officerId).order('created_at', { ascending: false }),
      ]);

      if (offData) setOfficer(offData as Officer);
      setFiles(filesData ?? []);
      setDips((offData as Officer | null)?.discipline_points ?? 0);
    } catch (err) {
      console.error('loadData error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (officerId) loadData();
  }, [officerId]);

  async function handleCreate() {
    setFormError('');
    if (!formTitle.trim()) { setFormError('Title is required.'); return; }
    if (!formNotes.trim()) { setFormError('Notes cannot be empty.'); return; }
    setSubmitting(true);
    try {
      const { error } = await (supabase.from('personnel_files') as any).insert({
        officer_id: officerId,
        title: formTitle.trim(),
        notes: formNotes.trim(),
        created_by: user?.id,
      });
      setSubmitting(false);
      if (error) {
        console.error('Personnel file insert error:', error);
        setFormError(`Failed to create entry: ${error.message}`);
        return;
      }
      setShowModal(false);
      setFormTitle('');
      setFormNotes('');
      loadData();
    } catch (err: any) {
      console.error('Personnel file exception:', err);
      setFormError(`Error: ${err.message || 'Unknown error'}`);
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!editingFile) return;
    setEditError('');
    if (!editNotes.trim()) { setEditError('Notes cannot be empty.'); return; }
    setEditSubmitting(true);
    try {
      const { error } = await (supabase.from('personnel_files') as any).update({
        title: editingFile.title,
        notes: editNotes.trim(),
      }).eq('id', editingFile.id);
      setEditSubmitting(false);
      if (error) {
        console.error('Personnel file update error:', error);
        setEditError(`Failed to update: ${error.message}`);
        return;
      }
      setEditingFile(null);
      loadData();
    } catch (err: any) {
      console.error('Personnel file update exception:', err);
      setEditError(`Error: ${err.message || 'Unknown error'}`);
      setEditSubmitting(false);
    }
  }

  async function handleDelete(file: PersonnelFile) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const { error } = await supabase.from('personnel_files').delete().eq('id', file.id);
      if (error) {
        console.error('Personnel file delete error:', error);
        alert(`Delete failed: ${error.message}`);
        return;
      }
      loadData();
    } catch (err: any) {
      console.error('Personnel file delete exception:', err);
      alert(`Error: ${err.message || 'Unknown error'}`);
    }
  }

  function openEdit(file: PersonnelFile) {
    setEditingFile(file);
    setEditNotes(file.notes);
    setEditError('');
  }

  async function updateDisciplinePoints(delta: number) {
    if (!canEdit) return;
    setDipsSubmitting(true);
    const newVal = Math.max(0, Math.min(10, dips + delta));
    try {
      const { error } = await (supabase.from('user') as any).update({ discipline_points: newVal }).eq('id', officerId);
      if (error) {
        console.error('Failed to update discipline points:', error);
        setDipsSubmitting(false);
        return;
      }
      setDips(newVal);
      setDipsSubmitting(false);
    } catch (err: any) {
      console.error('Discipline points update exception:', err);
      setDipsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4 max-w-5xl">
        <div className="xp-window">
          <div className="xp-titlebar h-6">
            <span>Loading...</span>
          </div>
          <div className="p-4 bg-[#ece9d8] space-y-2 animate-pulse">
            <div className="h-6 w-48 bg-[#d4d0c8]" />
            <div className="h-4 w-32 bg-[#d4d0c8]" />
          </div>
        </div>
      </div>
    );
  }

  if (!officer) {
    return (
      <div className="p-4 space-y-4 max-w-5xl">
        <div className="xp-window">
          <div className="xp-titlebar">
            <Shield className="w-4 h-4" />
            <span>Officer not found</span>
          </div>
          <div className="p-6 bg-[#ece9d8] text-center">
            <p className="text-xs text-[#404040]">The requested officer profile could not be found.</p>
            <button onClick={() => router.back()} className="xp-btn px-4 mt-3 text-xs">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-5xl">
      {/* Header */}
      <div className="xp-window">
        <div className="xp-titlebar">
          <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={() => router.back()} />
          <Shield className="w-4 h-4" />
          <span className="flex-1">Officer Profile — {officer.firstname} {officer.lastname}</span>
        </div>
        <div className="p-4 bg-[#ece9d8]">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-[#0a246a] flex items-center justify-center xp-raised shrink-0">
              <span className="text-xl font-bold text-white">
                {officer.firstname?.[0] ?? '?'}{officer.lastname?.[0] ?? ''}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-[#0a246a]">
                {officer.firstname} {officer.lastname}
              </h1>
              <p className="text-xs text-[#404040] font-mono mt-0.5">
                {officer.rank || 'N/A'} {officer.badgenumber ? `| Badge #${officer.badgenumber}` : ''}
              </p>
              {officer.division && officer.division.length > 0 && (
                <p className="text-[10px] text-[#404040] font-mono mt-0.5">
                  Division: {officer.division.join(', ')}
                </p>
              )}
              <p className="text-[10px] text-[#404040] font-mono mt-0.5">
                Status: {officer.status || 'unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disziplinarspunkte */}
      <div className="xp-window">
        <div className="xp-titlebar h-6">
          <span className="text-[11px]">Discipline Points</span>
        </div>
        <div className="p-3 bg-[#ece9d8] flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-[#404040]">
              Current discipline points:
            </p>
            <p className="text-2xl font-bold text-[#0a246a] font-mono">{dips} / 10</p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={() => updateDisciplinePoints(-1)}
                disabled={dipsSubmitting || dips <= 0}
                className="xp-btn px-3 py-1 text-xs disabled:opacity-50"
              >
                -1
              </button>
              <button
                onClick={() => updateDisciplinePoints(1)}
                disabled={dipsSubmitting || dips >= 10}
                className="xp-btn px-3 py-1 text-xs disabled:opacity-50"
              >
                +1
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Einträge */}
      <div className="xp-window">
        <div className="xp-titlebar">
          <FileText className="w-4 h-4" />
          <span className="flex-1">Personnel File Entries</span>
          <button
            onClick={() => { setShowModal(true); setFormError(''); }}
            className="xp-btn flex items-center gap-1.5 text-xs h-6 py-0"
          >
            <Plus className="w-3 h-3" />
            New Entry
          </button>
        </div>
        <div className="xp-menubar">
          <span className="xp-menu-item">File</span>
          <span className="xp-menu-item">Edit</span>
          <span className="xp-menu-item">View</span>
          <span className="xp-menu-item">Help</span>
        </div>
        <div className="p-3 bg-[#ece9d8]">
          {files.length === 0 ? (
            <div className="py-6 text-center">
              <FileText className="w-8 h-8 text-[#808080] mx-auto mb-2" />
              <p className="text-xs text-[#808080] font-mono">No entries on record.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map(file => (
                <div key={file.id} className="xp-panel p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0a246a]">{file.title || 'Untitled Entry'}</p>
                      <p className="text-[10px] text-[#404040] font-mono">
                        {format(new Date(file.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    {canEdit && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(file)}
                          className="xp-btn p-1 text-[9px]"
                          title="Edit entry"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          className="xp-btn p-1 text-[9px] hover:bg-[#cc0000] hover:text-white"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 xp-sunken bg-white p-2">
                    <p className="text-xs text-[#000000] font-mono whitespace-pre-wrap leading-relaxed">
                      {file.notes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="xp-window w-full max-w-md">
            <div className="xp-titlebar">
              <FileText className="w-4 h-4" />
              <span className="flex-1">New Personnel File Entry</span>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="w-5 h-5 flex items-center justify-center border border-white/30 bg-white/10 text-xs">
                x
              </button>
            </div>
            <div className="p-4 bg-[#ece9d8] space-y-3">
              <div>
                <label className="text-xs font-bold text-[#0a246a] mb-1 block">Title:</label>
                <input
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Entry title..."
                  className="xp-input w-full"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#0a246a] mb-1 block">Notes:</label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  rows={5}
                  placeholder="Enter notes..."
                  className="xp-textarea w-full"
                />
              </div>
              {formError && (
                <div className="xp-sunken bg-[#fff0f0] p-2 text-xs text-[#cc0000] font-mono">
                  {formError}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowModal(false); setFormError(''); }} className="xp-btn px-4">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="xp-btn px-4 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Create Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="xp-window w-full max-w-md">
            <div className="xp-titlebar">
              <FileText className="w-4 h-4" />
              <span className="flex-1">Edit Personnel File Entry</span>
              <button onClick={() => { setEditingFile(null); setEditError(''); }} className="w-5 h-5 flex items-center justify-center border border-white/30 bg-white/10 text-xs">
                x
              </button>
            </div>
            <div className="p-4 bg-[#ece9d8] space-y-3">
              <div>
                <label className="text-xs font-bold text-[#0a246a] mb-1 block">Title:</label>
                <input
                  value={editingFile.title}
                  onChange={e => setEditingFile({ ...editingFile, title: e.target.value })}
                  className="xp-input w-full"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#0a246a] mb-1 block">Notes:</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={5}
                  placeholder="Enter notes..."
                  className="xp-textarea w-full"
                />
              </div>
              {editError && (
                <div className="xp-sunken bg-[#fff0f0] p-2 text-xs text-[#cc0000] font-mono">
                  {editError}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setEditingFile(null); setEditError(''); }} className="xp-btn px-4">
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={editSubmitting}
                  className="xp-btn px-4 disabled:opacity-50"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
