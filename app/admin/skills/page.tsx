'use client';

import React, { useEffect, useState } from 'react';
import { SkillGroup, SkillItem } from '@/lib/types';
import {
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Save,
  X,
  Layers,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react';
import { SoftwareIcon } from '@/components/ui/SoftwareIcon';

export default function AdminSkillsPage() {
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<Partial<SkillGroup> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // New Skill in modal state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillIconUrl, setNewSkillIconUrl] = useState('');
  const [uploadingSkillIcon, setUploadingSkillIcon] = useState<string | null>(null);

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
    setNewSkillName('');
    setNewSkillIconUrl('');
    setIsModalOpen(true);
  };

  const openEdit = (group: SkillGroup) => {
    setEditingGroup({
      ...group,
      skills: group.skills.map((s) => ({ ...s })),
    });
    setNewSkillName('');
    setNewSkillIconUrl('');
    setIsModalOpen(true);
  };

  const handleUploadIconForNewSkill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);

    try {
      setUploadingSkillIcon('new');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.media?.url) {
        setNewSkillIconUrl(data.media.url);
      }
    } catch {
      alert('Icon upload failed');
    } finally {
      setUploadingSkillIcon(null);
      e.target.value = '';
    }
  };

  const handleUploadIconForSkill = async (
    skillId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingGroup) return;

    const fd = new FormData();
    fd.append('file', file);

    try {
      setUploadingSkillIcon(skillId);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.media?.url) {
        const updatedSkills = (editingGroup.skills || []).map((s) =>
          s.id === skillId ? { ...s, iconUrl: data.media.url } : s
        );
        setEditingGroup({ ...editingGroup, skills: updatedSkills });
      }
    } catch {
      alert('Icon upload failed');
    } finally {
      setUploadingSkillIcon(null);
      e.target.value = '';
    }
  };

  const handleRemoveIconForSkill = (skillId: string) => {
    if (!editingGroup) return;
    const updatedSkills = (editingGroup.skills || []).map((s) =>
      s.id === skillId ? { ...s, iconUrl: undefined } : s
    );
    setEditingGroup({ ...editingGroup, skills: updatedSkills });
  };

  const addSkillToEditing = () => {
    if (!newSkillName.trim() || !editingGroup) return;
    const newSkill: SkillItem = {
      id: `s-${Date.now()}`,
      name: newSkillName.trim(),
      iconUrl: newSkillIconUrl.trim() || undefined,
      sortOrder: (editingGroup.skills?.length || 0) + 1,
      enabled: true,
      parentId: editingGroup.id,
      category: editingGroup.title,
    };
    setEditingGroup({
      ...editingGroup,
      skills: [...(editingGroup.skills || []), newSkill],
    });
    setNewSkillName('');
    setNewSkillIconUrl('');
  };

  const removeSkillFromEditing = (skillId: string) => {
    if (!editingGroup) return;
    setEditingGroup({
      ...editingGroup,
      skills: editingGroup.skills?.filter((s) => s.id !== skillId) || [],
    });
  };

  const updateSkillInEditing = (skillId: string, updates: Partial<SkillItem>) => {
    if (!editingGroup) return;
    const updatedSkills = (editingGroup.skills || []).map((s) =>
      s.id === skillId ? { ...s, ...updates } : s
    );
    setEditingGroup({ ...editingGroup, skills: updatedSkills });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    setSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/skill-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGroup),
      });
      if (res.ok) {
        setMessage('Skill group and tool competencies saved successfully!');
        setIsModalOpen(false);
        fetchSkills();
        setTimeout(() => setMessage(''), 4000);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Save failed');
      setTimeout(() => setErrorMessage(''), 5000);
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
        setMessage('Skill group deleted.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      alert('Delete failed');
    }
  };

  if (loading) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading Skills...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            Skills & Software Matrix CMS
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Hierarchical management: Parent Category &rarr; Child Skills / Tools with custom uploaded icons or branded vector SVGs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{message}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={openNewGroup}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill Group</span>
          </button>
        </div>
      </div>

      {/* Grid of Skill Groups / Parent Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillGroups.map((group) => (
          <div
            key={group.id}
            className="p-6 sm:p-7 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 hover:border-[#F59E0B]/30 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#F59E0B]" />
                    <h3 className="text-lg font-bold text-[#F0F3F6]">{group.title}</h3>
                  </div>
                  {group.titleAr && (
                    <p className="text-xs text-[#94A3B8] mt-0.5">{group.titleAr}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEdit(group)}
                    className="p-2 rounded-xl bg-[#151A23] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                    title="Edit group & skills"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Delete group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Skills Chips with Icons */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-[#F0F3F6]/08">
                {group.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-medium text-[#F0F3F6] hover:border-[#F59E0B]/40 transition-colors"
                  >
                    <SoftwareIcon
                      name={skill.name}
                      iconUrl={skill.iconUrl}
                      className="w-3.5 h-3.5"
                    />
                    <span>{skill.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Skill Group Modal */}
      {isModalOpen && editingGroup && (
        <div className="fixed inset-0 z-50 bg-[#07090D]/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8 bg-[#10141C] border border-[#F0F3F6]/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F3F6]/10">
              <div>
                <h2 className="text-xl font-bold text-[#F0F3F6]">
                  {editingGroup.title ? `Edit Group: ${editingGroup.title}` : 'New Skill Group'}
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Configure parent category and manage child skills & tool icons.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-[#151A23] text-[#94A3B8] hover:text-[#F0F3F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Group Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    Group Title (English) *
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
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingGroup.sortOrder ?? 1}
                    onChange={(e) =>
                      setEditingGroup({
                        ...editingGroup,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>
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

              {/* Skills Manager inside this Group */}
              <div className="p-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                    Child Skills & Tool Software ({editingGroup.skills?.length || 0})
                  </h4>
                  <span className="text-[11px] font-mono text-[#94A3B8]">
                    Upload custom icons or use auto-detected vector badges
                  </span>
                </div>

                {/* Add New Skill Bar */}
                <div className="p-3.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 space-y-3">
                  <div className="text-xs font-semibold text-[#F0F3F6] flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Add New Skill to Group</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <input
                      type="text"
                      placeholder="Skill / Tool name (e.g. Cinema 4D, Canva, Figma)..."
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkillToEditing();
                        }
                      }}
                      className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:border-[#F59E0B]"
                    />

                    {/* Icon preview or upload for new skill */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="w-9 h-9 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 flex items-center justify-center flex-shrink-0">
                        <SoftwareIcon
                          name={newSkillName || 'Tool'}
                          iconUrl={newSkillIconUrl || undefined}
                          className="w-4 h-4"
                        />
                      </div>

                      <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/50 text-xs text-[#94A3B8] hover:text-[#F0F3F6] flex items-center gap-1.5 transition-colors whitespace-nowrap">
                        <Upload className="w-3 h-3 text-[#F59E0B]" />
                        <span>{uploadingSkillIcon === 'new' ? '...' : 'Upload Icon'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadIconForNewSkill}
                          className="hidden"
                          disabled={uploadingSkillIcon === 'new'}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={addSkillToEditing}
                        className="px-5 py-2 rounded-xl bg-[#F59E0B] text-[#07090D] font-bold text-xs hover:bg-[#FF7A18] transition-colors whitespace-nowrap"
                      >
                        + Add Skill
                      </button>
                    </div>
                  </div>
                </div>

                {/* List of Skills inside this group */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {editingGroup.skills && editingGroup.skills.length > 0 ? (
                    editingGroup.skills.map((skill, sIdx) => (
                      <div
                        key={skill.id || sIdx}
                        className="p-3 rounded-xl bg-[#10141C] border border-[#F0F3F6]/08 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                          {/* Skill Icon */}
                          <div className="w-8 h-8 rounded-lg bg-[#151A23] border border-[#F0F3F6]/10 flex items-center justify-center flex-shrink-0">
                            <SoftwareIcon
                              name={skill.name}
                              iconUrl={skill.iconUrl}
                              className="w-4 h-4"
                            />
                          </div>

                          {/* Skill Name Input */}
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) =>
                              updateSkillInEditing(skill.id, { name: e.target.value })
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] w-full sm:w-44 focus:border-[#F59E0B]"
                          />
                        </div>

                        {/* Controls (Icon upload / delete icon / sort / remove skill) */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* Upload / replace icon */}
                          <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-[#151A23] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/50 text-[11px] text-[#94A3B8] hover:text-[#F0F3F6] flex items-center gap-1 transition-colors">
                            <Upload className="w-3 h-3 text-[#F59E0B]" />
                            <span>
                              {uploadingSkillIcon === skill.id
                                ? '...'
                                : skill.iconUrl
                                ? 'Change'
                                : 'Upload'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadIconForSkill(skill.id, e)}
                              className="hidden"
                              disabled={uploadingSkillIcon === skill.id}
                            />
                          </label>

                          {/* Remove custom icon if present */}
                          {skill.iconUrl && (
                            <button
                              type="button"
                              onClick={() => handleRemoveIconForSkill(skill.id)}
                              className="p-1 rounded text-[#94A3B8] hover:text-red-400 text-[10px]"
                              title="Reset to default icon"
                            >
                              Reset
                            </button>
                          )}

                          {/* Enabled checkbox */}
                          <label className="flex items-center gap-1 text-[11px] font-mono text-[#94A3B8] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={skill.enabled !== false}
                              onChange={(e) =>
                                updateSkillInEditing(skill.id, { enabled: e.target.checked })
                              }
                              className="w-3.5 h-3.5 rounded text-[#F59E0B] focus:ring-0"
                            />
                            <span>Active</span>
                          </label>

                          {/* Remove Skill from group */}
                          <button
                            type="button"
                            onClick={() => removeSkillFromEditing(skill.id)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                            title="Remove skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-[#10141C] text-center text-xs font-mono text-[#94A3B8]/60">
                      No skills added to this group yet. Use the input above to add skills.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#F0F3F6]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#151A23] text-xs font-semibold text-[#94A3B8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Skill Group'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
