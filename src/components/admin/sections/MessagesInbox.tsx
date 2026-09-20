import React, { useState, useEffect } from 'react';
import {
  Mail,
  Trash2,
  CheckCircle,
  ExternalLink,
  Clock,
  Briefcase,
  DollarSign,
  User,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { api } from '../../../services/api.ts';
import { ContactMessage } from '../../../types.ts';

export const MessagesInbox: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getMessages();
      setMessages(data);
      if (selectedMessage) {
        const updated = data.find((m) => m.id === selectedMessage.id);
        if (updated) setSelectedMessage(updated);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelectMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      try {
        await api.markMessageRead(msg.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteMessage = async (id: string) => {
    if (deletingId !== id) {
      setDeletingId(id);
      setTimeout(() => setDeletingId((curr) => (curr === id ? null : curr)), 4000);
      return;
    }
    try {
      await api.deleteMessage(id);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting message');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMessages = messages.filter((m) =>
    filter === 'unread' ? !m.read : true
  );

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F1EA]/10 pb-6">
        <div>
          <h2 className="font-display font-medium text-2xl text-[#F5F1EA]">
            Project Inquiries & Messages Inbox
          </h2>
          <p className="text-xs font-sans text-[#F5F1EA]/50 mt-1 uppercase tracking-wider">
            Prospective client project briefs transmitted through the public contact form
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-full border border-[#F5F1EA]/15 p-0.5 bg-[#141414] text-xs font-sans">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full transition-colors ${
                filter === 'all'
                  ? 'bg-[#F5F1EA] text-[#141414] font-semibold'
                  : 'text-[#F5F1EA]/60 hover:text-[#F5F1EA]'
              }`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full transition-colors ${
                filter === 'unread'
                  ? 'bg-[#8B1E1E] text-[#F5F1EA] font-semibold'
                  : 'text-[#F5F1EA]/60 hover:text-[#F5F1EA]'
              }`}
            >
              Unread ({messages.filter((m) => !m.read).length})
            </button>
          </div>

          <button
            onClick={fetchMessages}
            disabled={loading}
            className="p-2 rounded-full border border-[#F5F1EA]/15 text-[#F5F1EA]/70 hover:text-[#F5F1EA] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Messages List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredMessages.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#F5F1EA]/15 rounded-sm p-8 text-xs font-sans text-[#F5F1EA]/50">
              No messages found.
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 rounded-sm border cursor-pointer transition-all text-left relative ${
                    isSelected
                      ? 'bg-[#1C1C1C] border-[#E8746A]'
                      : 'bg-[#181818] border-[#F5F1EA]/10 hover:border-[#8B1E1E]'
                  }`}
                >
                  {!msg.read && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#E8746A] animate-pulse" />
                  )}

                  <div className="flex items-center justify-between mb-1 pr-4">
                    <span className="font-display font-medium text-sm text-[#F5F1EA] truncate">
                      {msg.name}
                    </span>
                    <span className="text-[10px] font-sans text-[#F5F1EA]/40">
                      {new Date(msg.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="text-xs font-sans text-[#E8746A] mb-2 truncate">
                    {msg.projectType} • {msg.budget}
                  </div>

                  <p className="text-xs text-[#F5F1EA]/65 line-clamp-2 font-normal">
                    {msg.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Message Detail */}
        <div className="lg:col-span-7 bg-[#181818] rounded-sm border border-[#F5F1EA]/10 p-6 sm:p-8">
          {selectedMessage ? (
            <div className="space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F1EA]/10 pb-5">
                <div>
                  <h3 className="font-display font-medium text-xl text-[#F5F1EA]">
                    {selectedMessage.name}
                  </h3>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-xs font-sans text-[#E8746A] hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <span>{selectedMessage.email}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Regarding%20your%20project%20inquiry%20with%20ORez%20STUdio`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8B1E1E] text-[#F5F1EA] text-xs font-sans uppercase tracking-wider hover:bg-[#E8746A] hover:text-[#141414] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>

                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className={`p-2 rounded-full border transition-colors ${
                      deletingId === selectedMessage.id
                        ? 'bg-red-600 text-white border-red-500 animate-pulse'
                        : 'border-[#F5F1EA]/15 text-[#F5F1EA]/40 hover:text-[#E8746A] hover:border-[#8B1E1E]'
                    }`}
                    title={
                      deletingId === selectedMessage.id
                        ? 'Click again to permanently delete'
                        : 'Delete inquiry'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Badges Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/5">
                  <div className="text-[10px] font-sans text-[#F5F1EA]/40 uppercase mb-0.5">
                    Discipline
                  </div>
                  <div className="text-xs font-medium text-[#F5F1EA]">
                    {selectedMessage.projectType}
                  </div>
                </div>

                <div className="p-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/5">
                  <div className="text-[10px] font-sans text-[#F5F1EA]/40 uppercase mb-0.5">
                    Budget Bracket
                  </div>
                  <div className="text-xs font-medium text-[#E8746A] font-sans">
                    {selectedMessage.budget}
                  </div>
                </div>

                <div className="p-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/5">
                  <div className="text-[10px] font-sans text-[#F5F1EA]/40 uppercase mb-0.5">
                    Received
                  </div>
                  <div className="text-xs font-sans text-[#F5F1EA]/70">
                    {new Date(selectedMessage.timestamp).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-[11px] font-sans uppercase tracking-widest text-[#F5F1EA]/50 mb-3">
                  Project Brief & Objectives
                </label>
                <div className="p-4 rounded-sm bg-[#141414] border border-[#F5F1EA]/10 text-sm text-[#F5F1EA]/90 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Linked Session Details */}
              {selectedMessage.visitorId && (
                <div className="pt-4 border-t border-[#F5F1EA]/10 text-xs font-sans text-[#F5F1EA]/40 flex items-center justify-between">
                  <span>Linked Visitor Profile: {selectedMessage.visitorId.slice(0, 16)}...</span>
                  <span className="text-[#E8746A]">Status: Verified Lead</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center text-xs font-sans text-[#F5F1EA]/40">
              Select a message from the list to review brief details and initiate correspondence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
