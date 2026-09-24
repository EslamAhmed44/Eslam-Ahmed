'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Mail,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  ExternalLink,
  Search,
  RefreshCw,
  LogOut,
  AlertCircle,
  FileText,
  FolderOpen,
  X,
  Eye,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/Icons';
import { ProjectInquiry, InquiryStatus } from '@/lib/types';

interface MessagePortalClientProps {
  initialInquiries?: ProjectInquiry[];
}

export function MessagePortalClient({ initialInquiries = [] }: MessagePortalClientProps) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<ProjectInquiry[]>(initialInquiries);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<ProjectInquiry | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/inquiries');
      if (res.status === 401) {
        router.push('/admin/login?redirect=/admin/messages');
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load inquiries');
      }
      setInquiries(data.inquiries || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      window.location.href = '/admin/login?redirect=/admin/messages';
    }
  };

  const handleUpdateStatus = async (id: string, status: InquiryStatus) => {
    setActionLoadingId(id);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this inquiry?')) {
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/inquiries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete inquiry');

      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting inquiry');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = inquiries.length;
    const unread = inquiries.filter((i) => i.status === 'unread').length;
    const read = inquiries.filter((i) => i.status === 'read').length;
    const archived = inquiries.filter((i) => i.status === 'archived').length;
    return { total, unread, read, archived };
  }, [inquiries]);

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // Tab filter
      if (activeTab === 'unread' && inq.status !== 'unread') return false;
      if (activeTab === 'read' && inq.status !== 'read') return false;
      if (activeTab === 'archived' && inq.status !== 'archived') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = inq.name.toLowerCase().includes(q);
        const matchEmail = (inq.email || '').toLowerCase().includes(q);
        const matchWhatsapp = (inq.whatsapp || '').toLowerCase().includes(q);
        const matchDesc = inq.description.toLowerCase().includes(q);
        const matchServices = inq.services.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchEmail && !matchWhatsapp && !matchDesc && !matchServices) {
          return false;
        }
      }

      return true;
    });
  }, [inquiries, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#07090D] text-[#F0F3F6] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#10141C]/90 backdrop-blur-xl border-b border-[#F0F3F6]/08 px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/15 text-sm font-bold text-[#F59E0B] shadow-lg">
              IA.
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#F0F3F6] tracking-tight">
                  Message Admin Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] text-[10px] font-mono uppercase tracking-wider font-semibold border border-[#F59E0B]/30">
                  Inquiries Only
                </span>
              </div>
              <div className="text-xs text-[#94A3B8] font-mono">
                Logged in as: <span className="text-[#F0F3F6] font-semibold">EslamAhmed44</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3 h-3 text-[#F59E0B]" />
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-8 space-y-8">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Inquiries */}
          <div className="p-5 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/08 flex flex-col justify-between">
            <span className="text-xs font-mono uppercase text-[#94A3B8]">Total Inquiries</span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-[#F0F3F6]">{metrics.total}</span>
              <MessageSquare className="w-5 h-5 text-[#94A3B8]/40" />
            </div>
          </div>

          {/* Unread */}
          <div className="p-5 rounded-2xl bg-[#10141C] border border-[#F59E0B]/30 shadow-[0_0_20px_rgba(245,158,11,0.06)] flex flex-col justify-between">
            <span className="text-xs font-mono uppercase text-[#F59E0B] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              Unread Inquiries
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-[#F59E0B]">{metrics.unread}</span>
              <Mail className="w-5 h-5 text-[#F59E0B]/60" />
            </div>
          </div>

          {/* Read */}
          <div className="p-5 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/08 flex flex-col justify-between">
            <span className="text-xs font-mono uppercase text-[#94A3B8]">Reviewed</span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-[#F0F3F6]">{metrics.read}</span>
              <CheckCircle2 className="w-5 h-5 text-[#94A3B8]/40" />
            </div>
          </div>

          {/* Archived */}
          <div className="p-5 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/08 flex flex-col justify-between">
            <span className="text-xs font-mono uppercase text-[#94A3B8]">Archived</span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-[#94A3B8]">{metrics.archived}</span>
              <Archive className="w-5 h-5 text-[#94A3B8]/40" />
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/08">
          {/* Tab Filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#07090D] border border-[#F0F3F6]/05 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#151A23] text-[#F0F3F6] border border-[#F0F3F6]/10'
                  : 'text-[#94A3B8] hover:text-[#F0F3F6]'
              }`}
            >
              All ({metrics.total})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'unread'
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                  : 'text-[#94A3B8] hover:text-[#F59E0B]'
              }`}
            >
              <span>Unread</span>
              {metrics.unread > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#F59E0B] text-[#07090D] text-[10px] font-bold">
                  {metrics.unread}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('read')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'read'
                  ? 'bg-[#151A23] text-[#F0F3F6] border border-[#F0F3F6]/10'
                  : 'text-[#94A3B8] hover:text-[#F0F3F6]'
              }`}
            >
              Read ({metrics.read})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'archived'
                  ? 'bg-[#151A23] text-[#F0F3F6] border border-[#F0F3F6]/10'
                  : 'text-[#94A3B8] hover:text-[#F0F3F6]'
              }`}
            >
              Archived ({metrics.archived})
            </button>
          </div>

          {/* Search Input & Refresh */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client, email, service..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#07090D] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#F59E0B] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F0F3F6]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={fetchInquiries}
              disabled={loading}
              title="Refresh Inquiries"
              className="p-2 rounded-xl bg-[#07090D] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F59E0B] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Inquiries Feed */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-[#F59E0B] animate-spin mb-4" />
            <div className="text-sm font-semibold text-[#F0F3F6]">Loading project inquiries...</div>
            <div className="text-xs text-[#94A3B8] mt-1 font-mono">Fetching centralized database records</div>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-20 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 flex items-center justify-center text-[#94A3B8] mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#F0F3F6]">No project inquiries found</h3>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-sm">
              {searchQuery
                ? 'No inquiries match your current search terms.'
                : activeTab === 'unread'
                ? 'All caught up! There are no unread inquiries right now.'
                : 'Project inquiries submitted through the portfolio contact form will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredInquiries.map((inq) => {
              const isUnread = inq.status === 'unread';
              const dateStr = inq.createdAt
                ? new Date(inq.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recently';

              return (
                <div
                  key={inq.id}
                  className={`p-6 rounded-2xl transition-all duration-200 border ${
                    isUnread
                      ? 'bg-[#10141C] border-[#F59E0B]/30 hover:border-[#F59E0B]/60 shadow-[0_4px_20px_rgba(245,158,11,0.05)]'
                      : 'bg-[#10141C]/60 border-[#F0F3F6]/08 hover:border-[#F0F3F6]/20'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Client & Status Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                            inq.status === 'unread'
                              ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40'
                              : inq.status === 'read'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                          }`}
                        >
                          {inq.status === 'unread' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                          )}
                          <span>{inq.status}</span>
                        </span>

                        {/* Preferred Contact Method Badge */}
                        <span className="px-2.5 py-0.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-[11px] font-mono text-[#94A3B8] flex items-center gap-1">
                          {inq.contactMethod === 'WhatsApp' ? (
                            <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
                          ) : inq.contactMethod === 'Email' ? (
                            <Mail className="w-3 h-3 text-[#F59E0B]" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                          )}
                          <span>Prefers: {inq.contactMethod}</span>
                        </span>

                        {/* Budget Tag */}
                        {inq.budget && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#07090D] border border-[#F0F3F6]/10 text-[11px] font-mono text-[#F0F3F6]">
                            Budget: {inq.budget}
                          </span>
                        )}

                        <span className="text-xs text-[#94A3B8]/60 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </div>

                      {/* Client Name & Quick Contacts */}
                      <div className="flex flex-wrap items-baseline gap-3 pt-1">
                        <h3 className="text-lg font-bold text-[#F0F3F6] tracking-tight">
                          {inq.name}
                        </h3>

                        {inq.email && (
                          <a
                            href={`mailto:${inq.email}`}
                            className="text-xs font-mono text-[#94A3B8] hover:text-[#F59E0B] transition-colors flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3 text-[#F59E0B]" />
                            {inq.email}
                          </a>
                        )}

                        {inq.whatsapp && (
                          <a
                            href={`https://wa.me/${inq.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-[#94A3B8] hover:text-[#25D366] transition-colors flex items-center gap-1"
                          >
                            <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
                            {inq.whatsapp}
                          </a>
                        )}
                      </div>

                      {/* Services pills */}
                      {inq.services && inq.services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {inq.services.map((srv, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#151A23] text-[11px] font-medium text-[#94A3B8] border border-[#F0F3F6]/05"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Description Excerpt */}
                      <p className="text-xs sm:text-sm text-[#94A3B8] line-clamp-2 pt-1 font-light leading-relaxed">
                        {inq.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F0F3F6]/08">
                      {/* Mark Read/Unread */}
                      {inq.status === 'unread' ? (
                        <button
                          onClick={() => handleUpdateStatus(inq.id, 'read')}
                          disabled={actionLoadingId === inq.id}
                          className="px-3 py-1.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-medium text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Mark as Read"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Mark Read</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(inq.id, 'unread')}
                          disabled={actionLoadingId === inq.id}
                          className="px-3 py-1.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-medium text-[#94A3B8] hover:text-[#F0F3F6] transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Mark as Unread"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Mark Unread</span>
                        </button>
                      )}

                      {/* View Details Modal */}
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(inq.id)}
                        disabled={actionLoadingId === inq.id}
                        className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Slide-over / Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-[#07090D]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#10141C] border border-[#F0F3F6]/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#F0F3F6]/10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase border ${
                      selectedInquiry.status === 'unread'
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40'
                        : selectedInquiry.status === 'read'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                    }`}
                  >
                    {selectedInquiry.status}
                  </span>
                  <span className="text-xs text-[#94A3B8] font-mono">
                    {selectedInquiry.createdAt
                      ? new Date(selectedInquiry.createdAt).toLocaleString()
                      : 'Recent'}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-[#F0F3F6]">
                  {selectedInquiry.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F0F3F6] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-6 space-y-6">
              {/* Contact Channels Card */}
              <div className="p-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08 space-y-3">
                <div className="text-xs font-mono uppercase text-[#F59E0B] font-semibold">
                  Preferred Contact: {selectedInquiry.contactMethod}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {selectedInquiry.email && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#10141C] border border-[#F0F3F6]/08">
                      <div className="truncate pr-2">
                        <div className="text-[10px] font-mono text-[#94A3B8]">Email Address</div>
                        <div className="text-xs font-semibold text-[#F0F3F6] truncate">
                          {selectedInquiry.email}
                        </div>
                      </div>
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="px-2.5 py-1 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] text-xs font-semibold hover:bg-[#F59E0B] hover:text-[#07090D] transition-all flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </a>
                    </div>
                  )}

                  {selectedInquiry.whatsapp && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#10141C] border border-[#F0F3F6]/08">
                      <div className="truncate pr-2">
                        <div className="text-[10px] font-mono text-[#94A3B8]">WhatsApp</div>
                        <div className="text-xs font-semibold text-[#F0F3F6] truncate">
                          {selectedInquiry.whatsapp}
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/${selectedInquiry.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#25D366]/15 text-[#25D366] text-xs font-semibold hover:bg-[#25D366] hover:text-[#07090D] transition-all flex items-center gap-1"
                      >
                        <WhatsAppIcon className="w-3 h-3" />
                        <span>Chat</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Services & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08">
                  <div className="text-xs font-mono uppercase text-[#94A3B8] mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Requested Services</span>
                  </div>
                  {selectedInquiry.services && selectedInquiry.services.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInquiry.services.map((srv, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#10141C] border border-[#F0F3F6]/10 text-xs font-medium text-[#F0F3F6]"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#94A3B8]/60">None specified</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08">
                  <div className="text-xs font-mono uppercase text-[#94A3B8] mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Estimated Budget</span>
                  </div>
                  <div className="text-sm font-bold text-[#F59E0B]">
                    {selectedInquiry.budget || 'Not specified / Not sure yet'}
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div className="p-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08">
                <div className="text-xs font-mono uppercase text-[#94A3B8] mb-2">
                  Project Description
                </div>
                <p className="text-sm text-[#F0F3F6] whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.description}
                </p>
              </div>

              {/* Project References */}
              {((selectedInquiry.referenceLinks && selectedInquiry.referenceLinks.length > 0) ||
                (selectedInquiry.referenceFiles && selectedInquiry.referenceFiles.length > 0) ||
                selectedInquiry.googleDriveUrl) && (
                <div className="p-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08 space-y-4">
                  <div className="text-xs font-mono uppercase text-[#F59E0B] font-semibold">
                    Client References & Materials
                  </div>

                  {/* Google Drive Link */}
                  {selectedInquiry.googleDriveUrl && (
                    <div className="p-3 rounded-xl bg-[#10141C] border border-[#F0F3F6]/08 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FolderOpen className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                        <span className="text-xs font-mono text-[#F0F3F6] truncate">
                          {selectedInquiry.googleDriveUrl}
                        </span>
                      </div>
                      <a
                        href={selectedInquiry.googleDriveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-[#F59E0B] text-[#07090D] font-bold text-xs flex items-center gap-1 hover:opacity-90 transition-opacity flex-shrink-0"
                      >
                        <span>Open Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Reference Links */}
                  {selectedInquiry.referenceLinks && selectedInquiry.referenceLinks.length > 0 && (
                    <div>
                      <div className="text-[11px] font-mono text-[#94A3B8] mb-1.5">
                        Reference URLs:
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {selectedInquiry.referenceLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 px-3 rounded-xl bg-[#10141C] border border-[#F0F3F6]/08 text-xs font-mono text-[#94A3B8] hover:text-[#F59E0B] flex items-center justify-between transition-colors"
                          >
                            <span className="truncate pr-2">{link}</span>
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded Reference Files */}
                  {selectedInquiry.referenceFiles && selectedInquiry.referenceFiles.length > 0 && (
                    <div>
                      <div className="text-[11px] font-mono text-[#94A3B8] mb-1.5">
                        Uploaded Files:
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {selectedInquiry.referenceFiles.map((fileUrl, idx) => (
                          <a
                            key={idx}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 px-3 rounded-xl bg-[#10141C] border border-[#F0F3F6]/08 text-xs font-mono text-[#F0F3F6] hover:text-[#F59E0B] flex items-center justify-between transition-colors"
                          >
                            <span className="truncate pr-2 flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-[#F59E0B]" />
                              <span>Reference Document {idx + 1}</span>
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-[#F0F3F6]/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#94A3B8] font-mono">Set Status:</span>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'unread')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                    selectedInquiry.status === 'unread'
                      ? 'bg-[#F59E0B] text-[#07090D] border-[#F59E0B]'
                      : 'bg-[#151A23] text-[#94A3B8] border-[#F0F3F6]/10 hover:text-[#F0F3F6]'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'read')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                    selectedInquiry.status === 'read'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-[#151A23] text-[#94A3B8] border-[#F0F3F6]/10 hover:text-[#F0F3F6]'
                  }`}
                >
                  Read
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'archived')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                    selectedInquiry.status === 'archived'
                      ? 'bg-zinc-600 text-white border-zinc-600'
                      : 'bg-[#151A23] text-[#94A3B8] border-[#F0F3F6]/10 hover:text-[#F0F3F6]'
                  }`}
                >
                  Archive
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
