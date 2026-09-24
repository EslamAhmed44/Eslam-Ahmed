'use client';

import React, { useEffect, useState } from 'react';
import { SkillGroup, SkillItem } from '@/lib/types';
import { Plus, Trash2, Edit3, CheckCircle2, Save, X, Layers, Tag } from 'lucide-react';

export default function AdminSkillsPage() {
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<Partial<SkillGroup> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newSkillName, setNewSkillName] = useState('');

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.data?.skillGroups) {
        setSkillGroups(data.data.skillGroups);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openNewGroup = () => {
    setEditingGroup({
      id: `group-${Date.now()}`,
      title: '',
      titleAr: '',
      sortOrder: skillGroups.length + 1,
      skills: [],
    });
    setIsModalOpen(true);
  };

  const openEdit = (group: SkillGroup) => {
    setEditingGroup({ ...group, skills: [...group.skills] });
    setIsModalOpen(true);
  };

  const addSkillToEditing = () => {
    if (!newSkillName.trim() || !editingGroup) return;
    const newSkill: SkillItem = {
      id: `s-${Date.now()}`,
      name: newSkillName.trim(),
      sortOrder: (editingGroup.skills?.length || 0) + 1,
    };
    setEditingGroup({
      ...editingGroup,
      skills: [...(editingGroup.skills || []), newSkill],
    });
    setNewSkillName('');
  };

  const removeSkillFromEditing = (skillId: string) => {
    if (!editingGroup) return;
    setEditingGroup({
      ...editingGroup,
      skills: editingGroup.skills?.filter((s) => s.id !== skillId) || [],
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/skill-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGroup),
      });
      if (res.ok) {
        setMessage('Skill group saved successfully!');
        setIsModalOpen(false);
        fetchSkills();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill group and all its skills?')) return;
    try {
      const res = await fetch(`/api/admin/skill-groups?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSkillGroups(skillGroups.filter((g) => g.id !== id));
      }
    } catch {
      alert('Delete failed');
    }
  };

  if (loading) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading Skills...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            Skills & Software Matrix CMS
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Organize competencies across specialized groups and software proficiencies.
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
            onClick={openNewGroup}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill Group</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillGroups.map((group) => (
          <div
            key={group.id}
            className="p-6 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 hover:border-[#F59E0B]/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#F0F3F6]">{group.title}</h3>
                  <p className="text-xs text-[#94A3B8]">{group.titleAr}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(group)}
                    className="p-2 rounded-xl bg-[#151A23] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D]"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 rounded-full bg-[#151A23] border border-[#F0F3F6]/08 text-xs font-medium text-[#F0F3F6]"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Group Modal */}
      {isModalOpen && editingGroup && (
        <div className="fixed inset-0 z-50 bg-[#07090D]/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8 bg-[#10141C] border border-[#F0F3F6]/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F3F6]/10 mb-6">
              <h2 className="text-xl font-bold text-[#F0F3F6]">
                {editingGroup.title ? 'Edit Skill Group' : 'New Skill Group'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-[#151A23] text-[#94A3B8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Group Title (English)
                </label>
                <input
                  type="text"
                  required
                  value={editingGroup.title || ''}
                  onChange={(e) => setEditingGroup({ ...editingGroup, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                  Group Title (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={editingGroup.titleAr || ''}
                  onChange={(e) => setEditingGroup({ ...editingGroup, titleAr: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
              </div>

              {/* Add & List Skills in this group */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                  Skills in Group
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter skill name (e.g. Cinema 4D)"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillToEditing();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                  <button
                    type="button"
                    onClick={addSkillToEditing}
                    className="px-4 py-2.5 rounded-xl bg-[#F59E0B] text-[#07090D] font-bold text-xs"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-[#151A23]/50">
                  {editingGroup.skills?.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    >
                      <span>{s.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSkillFromEditing(s.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
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
                  <span>{saving ? 'Saving...' : 'Save Group'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
