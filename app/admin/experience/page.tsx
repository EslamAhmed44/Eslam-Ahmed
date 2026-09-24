'use client';

import React, { useEffect, useState } from 'react';
import { Experience, Status } from '@/lib/types';
import { Plus, Trash2, Edit3, CheckCircle2, Save, X, Briefcase } from 'lucide-react';

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExp, setEditingExp] = useState<Partial<Experience> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.data?.experiences) {
        setExperiences(data.data.experiences);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const openNewExperience = () => {
    setEditingExp({
      id: `exp-${Date.now()}`,
      title: '',
      titleAr: '',
      company: '',
      companyAr: '',
      startDate: '2024-01-01',
      endDate: '',
      isPresent: true,
      description: '',
      descriptionAr: '',
      status: 'published',
      sortOrder: experiences.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEdit = (exp: Experience) => {
    setEditingExp({ ...exp });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingExp),
      });
      if (res.ok) {
        setMessage('Timeline role updated successfully!');
        setIsModalOpen(false);
        fetchExperiences();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch {
      alert('Failed to save experience');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this timeline role?')) return;
    try {
      const res = await fetch(`/api/admin/experience?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExperiences(experiences.filter((e) => e.id !== id));
      }
    } catch {
      alert('Delete failed');
    }
  };

  if (loading) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading Experience Timeline...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            Experience Timeline CMS
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Manage your career history, agencies, and Present date states.
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
            onClick={openNewExperience}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="p-6 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#F59E0B]/30 transition-all"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-[#F0F3F6]">{exp.title}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#151A23] font-mono text-[#F59E0B]">
                  {exp.isPresent ? 'Present' : exp.endDate?.split('-')[0] || 'Concluded'}
                </span>
              </div>
              <p className="text-sm text-[#94A3B8] font-medium">{exp.company}</p>
              <p className="text-xs text-[#94A3B8]/70 mt-2 line-clamp-2 max-w-2xl">{exp.description}</p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => openEdit(exp)}
                className="p-2.5 rounded-xl bg-[#151A23] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(exp.id)}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && editingExp && (
        <div className="fixed inset-0 z-50 bg-[#07090D]/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-[#10141C] border border-[#F0F3F6]/15 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F3F6]/10 mb-6">
              <h2 className="text-xl font-bold text-[#F0F3F6]">
                {editingExp.title ? 'Edit Experience' : 'Add Experience'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-[#151A23] text-[#94A3B8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Job Title (EN)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingExp.title || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Job Title (AR)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingExp.titleAr || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, titleAr: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Company (EN)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingExp.company || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Company (AR)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingExp.companyAr || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, companyAr: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>
              </div>

              {/* Dates & Present Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingExp.startDate || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    disabled={editingExp.isPresent}
                    value={editingExp.endDate || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] disabled:opacity-30"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#F0F3F6] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingExp.isPresent)}
                      onChange={(e) => setEditingExp({ ...editingExp, isPresent: e.target.checked })}
                      className="w-4 h-4 rounded text-[#F59E0B]"
                    />
                    <span>Present (Current Role)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Description (EN)
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingExp.description || ''}
                  onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Description (AR)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={editingExp.descriptionAr || ''}
                  onChange={(e) => setEditingExp({ ...editingExp, descriptionAr: e.target.value })}
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
                  <span>{saving ? 'Saving...' : 'Save Timeline Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
