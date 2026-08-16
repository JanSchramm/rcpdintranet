'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Message, Officer } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Send, Inbox, ChevronDown, ArrowLeft, Shield } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface MessageWithOfficers extends Message {
  sender?: Officer;
  receiver?: Officer;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
  const [messages, setMessages] = useState<MessageWithOfficers[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selected, setSelected] = useState<MessageWithOfficers | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);

  const [toId, setToId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toDropOpen, setToDropOpen] = useState(false);

  async function loadMessages() {
    if (!user) return;
    const [{ data: msgs }, { data: offs }] = await Promise.all([
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
      supabase.from('user').select('*'),
    ]);
    const fetchedMsgs = (msgs as Message[]) ?? [];
    const fetchedOffs = (offs as Officer[]) ?? [];

    const officerMap = Object.fromEntries(fetchedOffs.map((o) => [o.id, o]));
    setMessages(
      fetchedMsgs.map((m) => ({
        ...m,
        sender: officerMap[m.sender_id],
        receiver: officerMap[m.receiver_id],
      }))
    );
    setOfficers(fetchedOffs.filter((o) => o.id !== user.id));
    setLoading(false);
  }

  useEffect(() => {
    loadMessages();
  }, [user]);

  const inbox = messages.filter((m) => m.receiver_id === user?.id);
  const sent = messages.filter((m) => m.sender_id === user?.id);
  const displayed = tab === 'inbox' ? inbox : sent;

  async function handleSend() {
    setFormError('');
    if (!toId) {
      setFormError('Please select a recipient.');
      return;
    }
    if (!subject.trim()) {
      setFormError('Subject is required.');
      return;
    }
    if (!body.trim()) {
      setFormError('Message body is required.');
      return;
    }
    setSubmitting(true);

    const newMsg = {
      sender_id: user!.id,
      receiver_id: toId,
      subject: subject.trim(),
      body: body.trim(),
    };

    const { error } = await supabase.from('messages').insert(newMsg as any);
    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setShowCompose(false);
    setToId('');
    setSubject('');
    setBody('');
    loadMessages();
  }

  const toOfficer = officers.find((o) => o.id === toId);

  return (
    <div className="p-4 space-y-4 max-w-6xl">
      {/* Header window */}
      <div className="xp-window">
        <div className="xp-titlebar">
          <MessageSquare className="w-4 h-4" />
          <span className="flex-1">RCPD Nachrichten — Mail System</span>
          <button
            onClick={() => {
              setSelected(null);
              setFormError('');
              setShowCompose(true);
            }}
            className="xp-btn flex items-center gap-1.5 text-xs h-6 py-0"
          >
            <Send className="w-3 h-3" />
            Compose
          </button>
        </div>
        <div className="xp-menubar">
          <span className="xp-menu-item">File</span>
          <span className="xp-menu-item">Edit</span>
          <span className="xp-menu-item">View</span>
          <span className="xp-menu-item">Tools</span>
          <span className="xp-menu-item">Help</span>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 px-2 py-1 bg-[#ece9d8] border-b border-[#808080]">
          {(['inbox', 'sent'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setSelected(null);
              }}
              className={`xp-btn flex items-center gap-1.5 text-xs px-3 py-1 capitalize ${tab === t ? 'bg-[#316ac5] text-white' : ''
                }`}
            >
              {t === 'inbox' ? <Inbox className="w-3 h-3" /> : <Send className="w-3 h-3" />}
              {t}
              <span className="text-[10px] font-mono">
                ({t === 'inbox' ? inbox.length : sent.length})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Message list */}
        <div className={`lg:col-span-2 space-y-1 ${selected ? 'hidden lg:block' : ''}`}>
          {loading ? (
            <div className="xp-window">
              <div className="xp-titlebar h-6">
                <span>Loading...</span>
              </div>
              <div className="p-3 bg-[#ece9d8] space-y-2 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-[#d4d0c8]" />
                ))}
              </div>
            </div>
          ) : displayed.length === 0 ? (
            <div className="xp-window">
              <div className="xp-titlebar">
                <MessageSquare className="w-4 h-4" />
                <span>Inbox — Empty</span>
              </div>
              <div className="p-8 bg-[#ece9d8] text-center">
                <MessageSquare className="w-10 h-10 text-[#808080] mx-auto mb-2" />
                <p className="text-xs text-[#808080] font-mono">No messages here.</p>
              </div>
            </div>
          ) : (
            <div className="xp-window">
              <div className="xp-titlebar h-6">
                <span className="text-[11px]">
                  {tab === 'inbox' ? 'Inbox' : 'Sent'} ({displayed.length})
                </span>
              </div>
              <div className="bg-[#ece9d8]">
                {displayed.map((msg) => {
                  const contact = tab === 'inbox' ? msg.sender : msg.receiver;
                  const isSelected = selected?.id === msg.id;
                  return (
                    <button
                      key={msg.id}
                      onClick={() => setSelected(msg)}
                      className={`xp-list-item w-full text-left border-b border-[#d4d0c8] last:border-b-0 ${isSelected ? 'xp-list-item-selected' : ''
                        }`}
                    >
                      <div className="w-7 h-7 bg-[#0a246a] flex items-center justify-center xp-raised shrink-0">
                        <span className="text-[10px] font-bold text-white">
                          {contact?.firstname?.[0] ?? '?'}{contact?.lastname?.[0] ?? ''}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold truncate">
                            {contact ? `${contact.firstname} ${contact.lastname}` : 'Unknown'}
                          </p>
                          <span className="text-[10px] text-[#808080] font-mono shrink-0">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium truncate">{msg.subject}</p>
                        <p className="text-[10px] text-[#808080] font-mono truncate">{msg.body}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Message detail */}
        <div className={`lg:col-span-3 ${!selected ? 'hidden lg:flex' : 'flex'} flex-col`}>
          <div className="xp-window flex-1 flex flex-col">
            {selected ? (
              <>
                <div className="xp-titlebar">
                  <button
                    onClick={() => setSelected(null)}
                    className="lg:hidden w-5 h-5 flex items-center justify-center border border-white/30 bg-white/10 text-xs"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <Shield className="w-3.5 h-3.5" />
                  <span className="flex-1 text-xs truncate">{selected.subject}</span>
                </div>
                <div className="p-4 bg-[#ece9d8] space-y-3 flex-1 overflow-y-auto">
                  {/* Message header */}
                  <div className="xp-sunken bg-white p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#0a246a] flex items-center justify-center xp-raised shrink-0">
                        <span className="text-xs font-bold text-white">
                          {selected.sender?.firstname?.[0] ?? '?'}{selected.sender?.lastname?.[0] ?? ''}
                        </span>
                      </div>
                      <div className="text-xs font-mono">
                        <p>
                          <span className="text-[#808080]">From:</span>{' '}
                          <span className="font-bold text-[#0a246a]">
                            {selected.sender
                              ? `${selected.sender.firstname} ${selected.sender.lastname}`
                              : 'Unknown'}
                          </span>
                        </p>
                        <p>
                          <span className="text-[#808080]">To:</span>{' '}
                          <span className="font-bold text-[#0a246a]">
                            {selected.receiver
                              ? `${selected.receiver.firstname} ${selected.receiver.lastname}`
                              : 'Unknown'}
                          </span>
                        </p>
                        <p>
                          <span className="text-[#808080]">Date:</span>{' '}
                          {format(new Date(selected.created_at), 'MMM d, yyyy HH:mm')}
                        </p>
                        <p>
                          <span className="text-[#808080]">Subject:</span>{' '}
                          <span className="font-bold">{selected.subject}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Message body */}
                  <div className="xp-sunken bg-white p-3 flex-1">
                    <p className="text-xs font-mono text-[#000000] whitespace-pre-wrap leading-relaxed">
                      {selected.body}
                    </p>
                  </div>
                </div>
                <div className="xp-statusbar">
                  <div className="xp-statusbar-item">
                    Message ID: {String(selected.id).slice(0, 8).toUpperCase()}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#ece9d8] p-8">
                <MessageSquare className="w-12 h-12 text-[#808080] mb-3" />
                <p className="text-xs text-[#808080] font-mono">Select a message to read.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="xp-window w-full max-w-lg">
            <div className="xp-titlebar">
              <Send className="w-4 h-4" />
              <span className="flex-1">Compose New Message</span>
              <button
                onClick={() => setShowCompose(false)}
                className="w-5 h-5 flex items-center justify-center border border-white/30 bg-white/10 text-xs"
              >
                x
              </button>
            </div>
            <div className="p-4 bg-[#ece9d8] space-y-3">
              <div>
                <label className="text-xs font-bold text-[#0a246a] mb-1 block">To:</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setToDropOpen((p) => !p)}
                    className="xp-btn w-full flex items-center justify-between text-xs h-7"
                  >
                    <span className={!toOfficer ? 'text-[#808080]' : ''}>
                      {toOfficer
                        ? `${toOfficer.firstname} ${toOfficer.lastname} (${toOfficer.rank})`
                        : 'Select recipient...'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {toDropOpen && (
                    <div className="absolute top-full mt-1 left-0 right-0 xp-window z-10 max-h-48 overflow-y-auto">
                      {officers.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => {
                            setToId(o.id);
                            setToDropOpen(false);
                          }}
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
                <label className="text-xs font-bold text-[#0a246a] mb-1 block">Subject:</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Message subject..."
                  className="xp-input w-full"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0a246a] mb-1 block">Message:</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  placeholder="Write your message..."
                  className="xp-textarea w-full"
                />
              </div>

              {formError && (
                <div className="xp-sunken bg-[#fff0f0] p-2 text-xs text-[#cc0000] font-mono">
                  {formError}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCompose(false)} className="xp-btn px-4">
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={submitting}
                  className="xp-btn px-4 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}