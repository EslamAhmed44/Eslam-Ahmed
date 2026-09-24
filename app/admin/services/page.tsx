'use client';

import React, { useEffect, useState } from 'react';
import { ServiceItem, Status } from '@/lib/types';
import { Plus, Trash2, Edit3, CheckCircle2, Save, X, Wand2 } from 'lucide-react';

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.data?.services) {
        setServices(data.data.services);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openNewService = () => {
    setEditingService({
      id: `srv-${Date.now()}`,
      title: '',
      titleAr: '',
      category: 'Motion Graphics & Video Editing',
      description: '',
      descriptionAr: '',
      sortOrder: services.length + 1,
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const openEdit = (srv: ServiceItem) => {
    setEditingService({ ...srv });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService),
      });
      if (res.ok) {
        setMessage('Service saved successfully!');
        setIsModalOpen(false);
        fetchServices();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServices(services.filter((s) => s.id !== id));
      }
    } catch {
      alert('Delete failed');
    }
  };

  if (loading) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading Services...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            Services CMS
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Manage your specialized motion and graphic design offerings.
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
            onClick={openNewService}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="p-6 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 hover:border-[#F59E0B]/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <span className="text-[11px] font-mono text-[#F59E0B] uppercase">
                    {srv.category}
                  </span>
                  <h3 className="text-lg font-bold text-[#F0F3F6]">{srv.title}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(srv)}
                    className="p-2 rounded-xl bg-[#151A23] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D]"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(srv.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed mt-2 line-clamp-3">
                {srv.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingService && (
        <div className="fixed inset-0 z-50 bg-[#07090D]/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8 bg-[#10141C] border border-[#F0F3F6]/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F3F6]/10 mb-6">
              <h2 className="text-xl font-bold text-[#F0F3F6]">
                {editingService.title ? 'Edit Service' : 'New Service'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-[#151A23] text-[#94A3B8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Service Category
                </label>
                <select
                  value={editingService.category || 'Motion Graphics & Video Editing'}
                  onChange={(e) =>
                    setEditingService({ ...editingService, category: e.target.value as any })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                >
                  <option value="Motion Graphics & Video Editing">
                    Motion Graphics & Video Editing
                  </option>
                  <option value="Graphic Design & Brand Identity">
                    Graphic Design & Brand Identity
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.title || ''}
                    onChange={(e) =>
                      setEditingService({ ...editingService, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Title (Arabic)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingService.titleAr || ''}
                    onChange={(e) =>
                      setEditingService({ ...editingService, titleAr: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Description (English)
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingService.description || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Description (Arabic)
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={editingService.descriptionAr || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, descriptionAr: e.target.value })
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
                  <span>{saving ? 'Saving...' : 'Save Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
