'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { RosterEvent } from '@/lib/database.types';
import { Calendar, Plus, X, ChevronLeft, ChevronRight, Clock, AlignLeft, Edit, Trash2 } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';

const EVENT_TYPES = ['General', 'Training', 'Patrol', 'Meeting', 'Operation'];

const eventTypeColors: Record<string, string> = {
  Training: 'bg-[#008000] text-white',
  Patrol: 'bg-[#0000cc] text-white',
  Meeting: 'bg-[#cc6600] text-white',
  General: 'bg-[#404040] text-white',
  Operation: 'bg-[#cc0000] text-white',
};

const eventTypeDot: Record<string, string> = {
  Training: 'bg-[#008000]',
  Patrol: 'bg-[#0000cc]',
  Meeting: 'bg-[#cc6600]',
  General: 'bg-[#404040]',
  Operation: 'bg-[#cc0000]',
};

export default function CalendarPage() {
  const { officer, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<RosterEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RosterEvent | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('09:00');
  const [formType, setFormType] = useState('General');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadEvents() {
    const { data } = await supabase.from('events').select('*').order('date');
    setEvents(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // Only load events after auth is loaded
    if (!authLoading) {
      loadEvents();
    }
  }, [authLoading]);

  // Check if current user can edit/delete an event
  function canEditEvent(event: RosterEvent): boolean {
    // Wait for auth to load before checking permissions
    if (authLoading || !officer) return false;
    // Admins and supervisors can always edit
    if (officer.role === 'admin' || officer.role === 'supervisor') return true;
    // Regular officers can edit if they created it
    return event.created_by === officer.id;
  }

  const calStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const calEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const eventsOnDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.date), day));

  const selectedDayEvents = selectedDay ? eventsOnDay(selectedDay) : [];

  function openCreateModal() {
    setEditingEvent(null);
    setFormTitle('');
    setFormDesc('');
    setFormDate(selectedDay ? format(selectedDay, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    setFormTime('09:00');
    setFormType('General');
    setFormError('');
    setShowModal(true);
  }

  function openEditModal(event: RosterEvent) {
    if (!canEditEvent(event)) return;
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDesc(event.description || '');
    setFormDate(format(new Date(event.date), 'yyyy-MM-dd'));
    setFormTime(format(new Date(event.date), 'HH:mm'));
    setFormType(event.event_type);
    setFormError('');
    setShowModal(true);
  }

  async function handleCreate() {
    setFormError('');
    if (!formTitle.trim()) { setFormError('Title is required.'); return; }
    if (!formDate) { setFormError('Date is required.'); return; }
    setSubmitting(true);

    const isoDate = new Date(`${formDate}T${formTime}:00`).toISOString();

    try {
      if (editingEvent) {
        // Update existing event
        const { error } = await (supabase.from('events') as any)
          .update({
            title: formTitle.trim(),
            description: formDesc.trim() || null,
            date: isoDate,
            event_type: formType,
          })
          .eq('id', editingEvent.id);

        if (error) {
          console.error('Update error:', { event_id: editingEvent.id, error, user_id: officer?.id });
          setFormError(`Update failed: ${error.message}`);
          return;
        }
      } else {
        // Create new event
        const { error } = await (supabase.from('events') as any).insert({
          title: formTitle.trim(),
          description: formDesc.trim() || null,
          date: isoDate,
          event_type: formType,
          created_by: officer?.id,
        });

        if (error) {
          console.error('Insert error:', { error, user_id: officer?.id });
          setFormError(`Create failed: ${error.message}`);
          return;
        }
      }

      setSubmitting(false);
      setShowModal(false);
      loadEvents();
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setFormError(err.message || 'An error occurred');
      setSubmitting(false);
    }
  }

  async function handleDelete(event: RosterEvent) {
    if (!canEditEvent(event)) {
      alert('You do not have permission to delete this event.');
      return;
    }
    if (!confirm('Are you sure you want to delete this event?')) return;

    // Sichere den aktuellen Zustand für den Fall eines Fehlers
    const previousEvents = [...events];

    // Event sofort aus dem lokalen UI-State entfernen (optimistic update)
    setEvents(prev => prev.filter(e => e.id !== event.id));

    // Im Hintergrund in der Datenbank löschen
    const { error } = await supabase.from('events').delete().eq('id', event.id);

    // Bei einem Fehler den alten Zustand wiederherstellen
    if (error) {
      console.error('Delete error:', { event_id: event.id, error });
      setEvents(previousEvents);
      alert('Error deleting event: ' + error.message);
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-6xl">
      {/* Header window */}
      <div className="xp-window">
        <div className="xp-titlebar">
          <Calendar className="w-4 h-4" />
          <span className="flex-1">RCPD Kalender — Event Calendar</span>
          <button
            onClick={openCreateModal}
            className="xp-btn flex items-center gap-1.5 text-xs h-6 py-0"
          >
            <Plus className="w-3 h-3" />
            New Event
          </button>
        </div>
        <div className="xp-menubar">
          <span className="xp-menu-item">File</span>
          <span className="xp-menu-item">View</span>
          <span className="xp-menu-item">Go</span>
          <span className="xp-menu-item">Help</span>
        </div>
        <div className="p-2 bg-[#ece9d8] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="xp-btn px-2 py-0.5 text-xs">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="xp-btn px-3 py-0.5 text-xs">
              Today
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="xp-btn px-2 py-0.5 text-xs">
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <h2 className="text-sm font-bold text-[#0a246a]">{format(currentMonth, 'MMMM yyyy')}</h2>
          <span className="text-[11px] text-[#404040] font-mono">{events.length} event{events.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Calendar grid */}
        <div className="lg:col-span-2 xp-window">
          <div className="xp-titlebar h-6">
            <Calendar className="w-3 h-3" />
            <span className="text-[11px]">{format(currentMonth, 'MMMM yyyy')}</span>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-[#d4d0c8] border-b border-[#808080]">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="py-1.5 text-center text-[11px] font-bold text-[#404040] border-r border-[#808080] last:border-r-0">
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 bg-[#ece9d8]">
            {calDays.map(day => {
              const dayEvents = eventsOnDay(day);
              const inMonth = isSameMonth(day, currentMonth);
              const selected = selectedDay && isSameDay(day, selectedDay);
              const today = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[64px] p-1 border-r border-b border-[#d4d0c8] text-left last:border-r-0 hover:bg-[#d4d0c8] ${selected ? 'bg-[#316ac5]/20 ring-1 ring-[#316ac5] ring-inset' : ''
                    } ${!inMonth ? 'opacity-40 bg-[#e8e5d8]' : ''}`}
                >
                  <span className={`inline-flex w-5 h-5 items-center justify-center text-[11px] font-mono ${today ? 'bg-[#cc0000] text-white font-bold' : selected ? 'bg-[#316ac5] text-white' : 'text-[#404040]'
                    }`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className={`text-[9px] px-1 py-0.5 truncate font-mono ${eventTypeColors[e.event_type] ?? eventTypeColors.General}`}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-[#808080] font-mono px-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="xp-statusbar">
            <div className="xp-statusbar-item">{events.length} total events</div>
          </div>
        </div>

        {/* Day detail */}
        <div className="xp-window">
          <div className="xp-titlebar h-6">
            <Calendar className="w-3 h-3" />
            <span className="text-[11px]">
              {selectedDay ? format(selectedDay, 'EEEE, MMMM d') : 'Select a day'}
            </span>
          </div>
          <div className="p-3 bg-[#ece9d8] space-y-2 min-h-[300px]">
            {selectedDayEvents.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-8 h-8 text-[#808080] mx-auto mb-2" />
                <p className="text-xs text-[#808080] font-mono">No events on this day.</p>
              </div>
            ) : (
              selectedDayEvents.map(e => (
                <div key={e.id} className="xp-panel p-2.5">
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 w-2.5 h-2.5 shrink-0 ${eventTypeDot[e.event_type] ?? eventTypeDot.General}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#0a246a]">{e.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#808080]" />
                        <span className="text-[11px] text-[#404040] font-mono">{format(new Date(e.date), 'HH:mm')}</span>
                        <span className={`ml-1 text-[10px] font-mono px-1 py-0.5 text-white ${eventTypeColors[e.event_type] ?? eventTypeColors.General}`} style={{ backgroundColor: e.event_type === 'Training' ? '#008000' : e.event_type === 'Patrol' ? '#0000cc' : e.event_type === 'Meeting' ? '#cc6600' : e.event_type === 'Operation' ? '#cc0000' : '#404040' }}>
                          {e.event_type}
                        </span>
                      </div>
                      {e.description && (
                        <div className="flex items-start gap-1 mt-1.5">
                          <AlignLeft className="w-3 h-3 text-[#808080] mt-0.5 shrink-0" />
                          <p className="text-[11px] text-[#404040] font-mono leading-relaxed">{e.description}</p>
                        </div>
                      )}
                    </div>
                    {canEditEvent(e) && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(e)}
                          className="xp-btn p-1 text-[9px]"
                          title="Edit event"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(e)}
                          className="xp-btn p-1 text-[9px] hover:bg-[#cc0000] hover:text-white"
                          title="Delete event"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="xp-window w-full max-w-md">
            <div className="xp-titlebar">
              <Calendar className="w-4 h-4" />
              <span className="flex-1">{editingEvent ? 'Edit Event' : 'New Event'}</span>
              <button onClick={() => setShowModal(false)} className="w-5 h-5 flex items-center justify-center border border-white/30 bg-white/10 text-xs">
                x
              </button>
            </div>
            <div className="p-4 bg-[#ece9d8] space-y-3">
              <div>
                <label className="text-xs font-bold text-[#0a246a] mb-1 block">Title: *</label>
                <input
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Event title..."
                  className="xp-input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0a246a] mb-1 block">Date: *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="xp-input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0a246a] mb-1 block">Time:</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="xp-input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#0a246a] mb-1 block">Type:</label>
                <div className="flex flex-wrap gap-1.5">
                  {EVENT_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`xp-btn text-[11px] px-2 py-1 ${formType === t ? 'bg-[#316ac5] text-white' : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#0a246a] mb-1 block">Description:</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  rows={3}
                  placeholder="Optional description..."
                  className="xp-textarea w-full"
                />
              </div>
              {formError && (
                <div className="xp-sunken bg-[#fff0f0] p-2 text-xs text-[#cc0000] font-mono">
                  {formError}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowModal(false)} className="xp-btn px-4">Cancel</button>
                <button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="xp-btn px-4 disabled:opacity-50"
                >
                  {submitting ? (editingEvent ? 'Saving...' : 'Creating...') : (editingEvent ? 'Save Event' : 'Create Event')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
