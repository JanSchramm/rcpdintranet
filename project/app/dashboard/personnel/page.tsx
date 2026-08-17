'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { PersonnelFile, Officer } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Search, Plus, ChevronDown, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface FileWithOfficer extends PersonnelFile {
  officer?: Officer;
  author?: Officer;
}

export default function PersonnelPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileWithOfficer[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formOfficerId, setFormOfficerId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [officerDropOpen, setOfficerDropOpen] = useState(false);

  async function loadData() {
    try {
      const { data: pf, error: pfError } = await supabase
        .from('personnel_files')
        .select('id, created_at, created_by, officer_id, notes')
        .order('created_at', { ascending: false });

      const { data: offs, error: offsError } = await supabase
        .from('user')
        .select('*');

      console.log('Personnel files data:', pf);
      console.log('Personnel files error:', pfError);
      console.log('Officers data:', offs);
      console.log('Officers error:', offsError);

      if (pfError) {
        console.error('Personnel files query error:', pfError);
        setFiles([]);
        setLoading(false);
        return;
      }

      if (offsError) {
        console.error('Officers query error:', offsError);
      }

      // Safely handle the data
      const fetchedOffs = Array.isArray(offs) ? (offs as Officer[]) : [];
      console.log('Before officerMap creation, fetchedOffs:', fetchedOffs);

      // Verify each officer has an id
      const validOfficers = fetchedOffs.filter(o => o && typeof o === 'object' && 'id' in o && o.id);
      console.log('Valid officers:', validOfficers);

      const officerMap = new Map(validOfficers.map(o => [o.id, o]).filter(([id]) => id));
      console.log('Officer map size:', officerMap.size);

      // Safely handle personnel files
      const personnelFilesArray = Array.isArray(pf) ? pf : [];
      const validPersonnelFiles = personnelFilesArray
        .filter((f): f is PersonnelFile => {
          return f !== null && f !== undefined && typeof f === 'object' && 'id' in f && f.id !== undefined;
        });

      console.log('Valid personnel files:', validPersonnelFiles);

      setFiles(
        validPersonnelFiles.map(f => ({
          ...f,
          officer: officerMap.get(f.officer_id),
          author: officerMap.get(f.created_by),
          setOfficers(fetchedOffs);
      setLoading(false);
        } catch (err) {
          console.error('loadData error:', err);
          setLoading(false);
        }
    }

  useEffect(() => { loadData(); }, []);

    const filtered = files.filter(f => {
      const q = search.toLowerCase();
      const name = `${f.officer?.firstname ?? ''} ${f.officer?.lastname ?? ''}`.toLowerCase();
      return name.includes(q) || f.notes.toLowerCase().includes(q);
    });

    async function handleCreate() {
      setFormError('');
      if (!formOfficerId) { setFormError('Please select an officer.'); return; }
      if (!formNotes.trim()) { setFormError('Notes cannot be empty.'); return; }
      setSubmitting(true);
      try {
        const { error } = await supabase.from('personnel_files').insert({
          officer_id: formOfficerId,
          notes: formNotes.trim(),
        } as any);
        setSubmitting(false);
        if (error) {
          console.error('Personnel file insert error:', error);
          setFormError(`Failed to create entry: ${error.message}`);
          return;
        }
        setShowModal(false);
        setFormOfficerId('');
        setFormNotes('');
        loadData();
      } catch (err: any) {
        console.error('Personnel file exception:', err);
        setFormError(`Error: ${err.message || 'Unknown error'}`);
        setSubmitting(false);
      }
    }

    const selectedOfficer = officers.find(o => o.id === formOfficerId);

    return (
      <div className="p-4 space-y-4 max-w-5xl">
        {/* Header window */}
        <div className="xp-window">
          <div className="xp-titlebar">
            <FileText className="w-4 h-4" />
            <span className="flex-1">RCPD Personalakten — Personnel Files</span>
            <button
              onClick={() => setShowModal(true)}
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
            {/* Search bar */}
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-[#404040]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by officer name or notes..."
                className="xp-input flex-1"
              />
            </div>
            <p className="text-[11px] text-[#404040] font-mono">
              {filtered.length} file{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* File list */}
        {loading ? (
          <div className="xp-window">
            <div className="xp-titlebar h-6">
              <span>Loading...</span>
            </div>
            <div className="p-4 bg-[#ece9d8] space-y-2 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-[#d4d0c8]" />
              ))}
            </div>
          </div>
        ) : files.length === 0 && !search ? (
          <div className="xp-window">
            <div className="xp-titlebar">
              <FileText className="w-4 h-4" />
              <span>No Results</span>
            </div>
            <div className="p-8 bg-[#ece9d8] text-center">
              <FileText className="w-10 h-10 text-[#808080] mx-auto mb-2" />
              <p className="text-xs text-[#808080] font-mono">
                {search ? 'No results match your search.' : 'No personnel files on record.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(file => (
              <div key={file.id} className="xp-window">
                <div className="xp-titlebar h-6">
                  <Shield className="w-3 h-3" />
                  <span className="flex-1 text-[11px]">
                    File #{typeof file.id === 'string' ? file.id.slice(0, 8).toUpperCase() : 'UNKNOWN'} — {file.officer ? `${file.officer.firstname} ${file.officer.lastname}` : 'Unknown'}
                  </span>
                  <span className="text-[10px] font-mono">{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="p-3 bg-[#ece9d8]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#0a246a] flex items-center justify-center xp-raised shrink-0">
                      <span className="text-sm font-bold text-white">
                        {file.officer?.firstname?.[0] ?? '?'}{file.officer?.lastname?.[0] ?? ''}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0a246a]">
                        {file.officer ? `${file.officer.firstname} ${file.officer.lastname}` : 'Unknown Officer'}
                      </p>
                      <p className="text-[10px] text-[#404040] font-mono mb-1.5">
                        {file.officer?.rank || 'N/A'}{file.officer?.badgenumber ? ` | Badge #${file.officer.badgenumber}` : ''}
                        {file.author ? ` | Filed by: ${file.author.firstname} ${file.author.lastname}` : ''}
                      </p>
                      <div className="xp-sunken bg-white p-2">
                        <p className="text-xs text-[#000000] font-mono whitespace-pre-wrap leading-relaxed">
                          {file.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
                  <label className="text-xs font-bold text-[#0a246a] mb-1 block">Officer:</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOfficerDropOpen(prev => !prev)}
                      className="xp-btn w-full flex items-center justify-between text-xs h-7"
                    >
                      <span className={!selectedOfficer ? 'text-[#808080]' : ''}>
                        {selectedOfficer ? `${selectedOfficer.firstname} ${selectedOfficer.lastname} (${selectedOfficer.rank})` : 'Select an officer...'}
                      </span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {officerDropOpen && (
                      <div className="absolute top-full mt-1 left-0 right-0 xp-window z-10 max-h-48 overflow-y-auto">
                        {officers.map(o => (
                          <button
                            key={o.id}
                            onClick={() => { setFormOfficerId(o.id); setOfficerDropOpen(false); }}
                            className="xp-list-item w-full text-left"
                          >
                            {o.firstname} {o.lastname}
                            <span className="ml-2 text-[10px] text-[#808080] font-mono">{o.rank}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0a246a] mb-1 block">Notes:</label>
                  <textarea
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    rows={5}
                    placeholder="Enter notes about this officer..."
                    className="xp-textarea w-full"
                  />
                </div>

                {formError && (
                  <div className="xp-sunken bg-[#fff0f0] p-2 text-xs text-[#cc0000] font-mono">
                    {formError}
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowModal(false); setFormError(''); }}
                    className="xp-btn px-4"
                  >
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
      </div>
    );
  }