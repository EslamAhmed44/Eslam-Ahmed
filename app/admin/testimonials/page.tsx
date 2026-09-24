'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Testimonial, Status } from '@/lib/types';
import { Plus, Trash2, Edit3, CheckCircle2, Save, X, Quote, Upload } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.data?.testimonials) {
        setTestimonials(data.data.testimonials);
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
      clientName: '',
      position: '',
      company: '',
      photoUrl: '',
      quote: '',
      quoteAr: '',
      sortOrder: testimonials.length + 1,
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingItem({ ...t });
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.media?.url) {
        setEditingItem({ ...editingItem, photoUrl: data.media.url });
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      if (res.ok) {
        setMessage('Testimonial saved successfully!');
        setIsModalOpen(false);
        fetchTestimonials();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTestimonials(testimonials.filter((t) => t.id !== id));
      }
    } catch {
      alert('Delete failed');
    }
  };

  if (loading) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading Testimonials...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            Testimonials CMS
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Manage client endorsements, director quotes, and avatars.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{message}</span>
            </div>
          )}
          <button
            onClick={openNew}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 hover:border-[#F59E0B]/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <Quote className="w-6 h-6 text-[#F59E0B]" />
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-xl bg-[#151A23] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D]"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-[#F0F3F6] italic mb-6">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[#F0F3F6]/08">
              {item.photoUrl ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#151A23]">
                  <Image src={item.photoUrl} alt={item.clientName} fill className="object-cover" sizes="40px" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#151A23] flex items-center justify-center font-bold text-[#F59E0B] text-xs">
                  {item.clientName.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-[#F0F3F6]">{item.clientName}</h4>
                <p className="text-xs text-[#94A3B8]">
                  {item.position} • {item.company}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-[#07090D]/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8 bg-[#10141C] border border-[#F0F3F6]/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F3F6]/10 mb-6">
              <h2 className="text-xl font-bold text-[#F0F3F6]">
                {editingItem.clientName ? 'Edit Testimonial' : 'New Testimonial'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-[#151A23] text-[#94A3B8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Client / Director Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.clientName || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, clientName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Position / Role
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.position || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, position: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Company / Agency
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.company || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, company: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Avatar Photo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingItem.photoUrl || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, photoUrl: e.target.value })
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-[#F59E0B] flex items-center gap-1 text-xs font-semibold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? '...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Quote (English)
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.quote || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, quote: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Quote (Arabic)
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={editingItem.quoteAr || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, quoteAr: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#151A23] text-xs font-semibold text-[#94A3B8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Testimonial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
