'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Testimonial, FeedbackType, Status } from '@/lib/types';
import {
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Save,
  X,
  Upload,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Mail,
  Star,
  MessageCircle,
  ImageIcon,
} from 'lucide-react';
import { WhatsAppIcon, MessengerIcon } from '@/components/ui/Icons';
import { detectMediaDimensionsClient } from '@/lib/media/dimensions';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.data?.testimonials) {
        const sorted = [...data.data.testimonials].sort(
          (a: Testimonial, b: Testimonial) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );
        setTestimonials(sorted);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openNew = () => {
    setEditingItem({
      id: `t-${Date.now()}`,
      screenshotUrl: '',
      imageUrl: '',
      photoUrl: '',
      clientName: '',
      projectName: '',
      feedbackType: 'WhatsApp',
      caption: '',
      captionAr: '',
      date: new Date().getFullYear().toString(),
      sortOrder: testimonials.length + 1,
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingItem({ ...t });
    setIsModalOpen(true);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit.');
      return;
    }

    setUploading(true);

    try {
      // Auto-detect dimensions client side
      const dims = await detectMediaDimensionsClient(file);

      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.media?.url) {
        const finalUrl = data.media.url;
        setEditingItem((prev) => ({
          ...prev,
          screenshotUrl: finalUrl,
          imageUrl: finalUrl,
          photoUrl: finalUrl,
          width: dims?.width || data.dimensions?.width,
          height: dims?.height || data.dimensions?.height,
          aspectRatio: dims?.aspectRatio || data.dimensions?.aspectRatio,
          orientation: dims?.orientation || data.dimensions?.orientation,
        }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error';
      alert(`Upload failed: ${errMsg}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const screenshot = editingItem.screenshotUrl || editingItem.imageUrl || editingItem.photoUrl;
    if (!screenshot) {
      alert('Please upload a feedback screenshot first.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const payload = {
        ...editingItem,
        screenshotUrl: screenshot,
        imageUrl: screenshot,
        photoUrl: screenshot,
      };

      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage('Client feedback saved successfully!');
        setIsModalOpen(false);
        fetchTestimonials();
        setTimeout(() => setMessage(''), 4000);
      } else {
        const err = await res.json();
        alert(err?.error || 'Save failed');
      }
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: Testimonial) => {
    const newStatus: Status = item.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus }),
      });
      if (res.ok) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, status: newStatus } : t))
        );
        setMessage(`Feedback set to ${newStatus}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client feedback?')) return;
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        setMessage('Feedback deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      alert('Delete failed');
    }
  };

  const handleMoveOrder = async (item: Testimonial, direction: 'up' | 'down') => {
    const idx = testimonials.findIndex((t) => t.id === item.id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= testimonials.length) return;

    const currentOrder = item.sortOrder || idx + 1;
    const targetItem = testimonials[targetIdx];
    const targetOrder = targetItem.sortOrder || targetIdx + 1;

    // Swap orders
    try {
      await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, sortOrder: targetOrder }),
      });
      await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...targetItem, sortOrder: currentOrder }),
      });
      fetchTestimonials();
    } catch {
      alert('Failed to reorder');
    }
  };

  const renderFeedbackBadge = (type?: string) => {
    const norm = (type || 'WhatsApp').toLowerCase();

    if (norm.includes('whatsapp')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
          <WhatsAppIcon className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </span>
      );
    }

    if (norm.includes('messenger')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25">
          <MessengerIcon className="w-3.5 h-3.5" />
          <span>Messenger</span>
        </span>
      );
    }

    if (norm.includes('email') || norm.includes('mail')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
          <Mail className="w-3.5 h-3.5" />
          <span>Email</span>
        </span>
      );
    }

    if (norm.includes('review')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/25">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Review</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#151A23] text-[#94A3B8] border border-[#F0F3F6]/10">
        <MessageCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
        <span>{type || 'Other'}</span>
      </span>
    );
  };

  if (loading) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading Client Feedback...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            Client Feedback / Testimonials
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Manage authentic client feedback screenshots, WhatsApp messages, reviews, and endorsements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{message}</span>
            </div>
          )}
          <button
            onClick={openNew}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Feedback Screenshot</span>
          </button>
        </div>
      </div>

      {/* Testimonials List Grid */}
      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => {
            const screenshot = item.screenshotUrl || item.imageUrl || item.photoUrl || '';
            const isPublished = item.status === 'published';

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-[#10141C] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/30 transition-all p-5 flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Top Bar: Channel & Status & Reorder */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {renderFeedbackBadge(item.feedbackType)}

                    <div className="flex items-center gap-1.5">
                      {/* Reorder Buttons */}
                      <button
                        onClick={() => handleMoveOrder(item, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded-lg bg-[#151A23] text-[#94A3B8] hover:text-[#F0F3F6] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(item, 'down')}
                        disabled={idx === testimonials.length - 1}
                        title="Move Down"
                        className="p-1 rounded-lg bg-[#151A23] text-[#94A3B8] hover:text-[#F0F3F6] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick Publish / Unpublish Toggle */}
                      <button
                        onClick={() => handleToggleStatus(item)}
                        title={isPublished ? 'Click to unpublish' : 'Click to publish'}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                          isPublished
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-[#151A23] text-[#94A3B8] border-[#F0F3F6]/10 hover:text-[#F0F3F6]'
                        }`}
                      >
                        {isPublished ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Screenshot Preview Card */}
                  <div
                    onClick={() => screenshot && setPreviewModalUrl(screenshot)}
                    className="relative rounded-2xl overflow-hidden bg-[#07090D] border border-[#F0F3F6]/08 cursor-pointer group/img mb-3 aspect-[4/3] flex items-center justify-center"
                  >
                    {screenshot ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={screenshot}
                        alt={item.clientName || 'Screenshot'}
                        className="max-h-full max-w-full object-contain p-1 transition-transform group-hover/img:scale-105"
                      />
                    ) : (
                      <div className="text-xs font-mono text-[#94A3B8]">No screenshot</div>
                    )}
                    <div className="absolute inset-0 bg-[#07090D]/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#F0F3F6] bg-[#151A23]/80 px-3 py-1.5 rounded-full border border-[#F0F3F6]/15">
                        Preview
                      </span>
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#F0F3F6]">
                        {item.clientName || 'Anonymous Client'}
                      </span>
                      {item.date && (
                        <span className="font-mono text-[11px] text-[#94A3B8]">{item.date}</span>
                      )}
                    </div>
                    {item.projectName && (
                      <div className="text-xs text-[#F59E0B] font-mono">{item.projectName}</div>
                    )}
                    {(item.caption || item.quote) && (
                      <p className="text-xs text-[#94A3B8] line-clamp-2 italic pt-1">
                        &ldquo;{item.caption || item.quote}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#F0F3F6]/08">
                  <span className="text-[11px] font-mono text-[#94A3B8]/60">
                    Order: #{item.sortOrder || idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-xl bg-[#151A23] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 rounded-3xl bg-[#10141C] border border-dashed border-[#F0F3F6]/15 text-center">
          <p className="text-sm font-mono text-[#94A3B8] mb-4">
            No client feedback screenshots added yet.
          </p>
          <button
            onClick={openNew}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Your First Feedback Screenshot</span>
          </button>
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-[#07090D]/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-[#10141C] border border-[#F0F3F6]/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F3F6]/10 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#F0F3F6]">
                  {editingItem.clientName ? 'Edit Client Feedback' : 'Add New Client Feedback'}
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Upload an authentic screenshot of a client chat, review, or email.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-[#151A23] text-[#94A3B8] hover:text-[#F0F3F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Screenshot Upload & Live Preview */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#F59E0B] mb-2 font-bold">
                  1. Client Feedback Screenshot (Required) *
                </label>

                {editingItem.screenshotUrl ? (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden bg-[#07090D] border border-[#F0F3F6]/15 p-3 flex flex-col items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editingItem.screenshotUrl}
                        alt="Screenshot Preview"
                        className="max-h-72 w-auto object-contain rounded-xl shadow-lg"
                      />
                      {editingItem.width && editingItem.height && (
                        <div className="mt-2 text-[11px] font-mono text-[#94A3B8]">
                          {editingItem.width} × {editingItem.height} px (
                          {editingItem.orientation || 'auto'})
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F59E0B] hover:border-[#F59E0B] transition-colors flex items-center gap-2">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploading ? 'Uploading...' : 'Replace Screenshot'}</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingItem({
                            ...editingItem,
                            screenshotUrl: '',
                            imageUrl: '',
                            photoUrl: '',
                          })
                        }
                        className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#F0F3F6]/20 hover:border-[#F59E0B]/50 rounded-2xl p-8 text-center bg-[#151A23]/50 transition-colors">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#151A23] flex items-center justify-center text-[#F59E0B]">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#F0F3F6]">
                          {uploading ? 'Processing & Uploading...' : 'Upload Feedback Screenshot'}
                        </p>
                        <p className="text-xs text-[#94A3B8] mt-1">
                          PNG, JPG, JPEG, or WEBP up to 15MB. WhatsApp, Messenger, or Email screenshots.
                        </p>
                      </div>
                      <label className="cursor-pointer mt-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 shadow-lg">
                        <Upload className="w-4 h-4" />
                        <span>{uploading ? 'Uploading...' : 'Browse Image'}</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Channel Type & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Feedback Source / Channel
                  </label>
                  <select
                    value={editingItem.feedbackType || 'WhatsApp'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        feedbackType: e.target.value as FeedbackType,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Messenger">Messenger</option>
                    <option value="Email">Email</option>
                    <option value="Review">Client Review</option>
                    <option value="Other">Other Channel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Visibility
                  </label>
                  <select
                    value={editingItem.status || 'published'}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, status: e.target.value as Status })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  >
                    <option value="published">Published (Visible on Website)</option>
                    <option value="draft">Draft (Hidden from Website)</option>
                  </select>
                </div>
              </div>

              {/* Client Name & Project Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Client Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Al-Mansoor"
                    value={editingItem.clientName || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, clientName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Project Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Brand Motion Reel"
                    value={editingItem.projectName || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, projectName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>
              </div>

              {/* Date & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Date (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024 or May 2024"
                    value={editingItem.date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingItem.sortOrder ?? 1}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        sortOrder: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>
              </div>

              {/* Short Caption */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Short Caption / Summary (English) (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Client celebration after seeing the final motion graphics delivery."
                  value={editingItem.caption || editingItem.quote || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      caption: e.target.value,
                      quote: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
              </div>

              {/* Short Caption Arabic */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Short Caption / Summary (Arabic) (Optional)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  placeholder="مثال: إشادة العميل بعد اعتماد ريل الموشن النهائي."
                  value={editingItem.captionAr || editingItem.quoteAr || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      captionAr: e.target.value,
                      quoteAr: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F3F6]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#151A23] text-xs font-semibold text-[#94A3B8] hover:text-[#F0F3F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Fullscreen Preview Modal */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-50 bg-[#07090D]/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewModalUrl}
              alt="Feedback Fullscreen"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-[#F0F3F6]/20"
            />
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute -top-3 -end-3 p-2 rounded-full bg-[#151A23] text-[#F0F3F6] border border-[#F0F3F6]/20 hover:bg-[#F59E0B] hover:text-[#07090D]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
