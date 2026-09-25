'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  Search,
  Filter,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { SoftwareIcon } from '@/components/ui/SoftwareIcon';
import { getDefaultSoftwareIconUrl } from '@/lib/media/softwareIcons';
import { useAdminLanguage } from '@/context/AdminLanguageContext';

export default function AdminSkillsPage() {
  const { t, language, direction } = useAdminLanguage();
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<Partial<SkillGroup> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // New Skill in modal state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillNameAr, setNewSkillNameAr] = useState('');
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
    setNewSkillNameAr('');
    setNewSkillIconUrl('');
    setIsModalOpen(true);
  };

  const openEdit = (group: SkillGroup) => {
    setEditingGroup({
      ...group,
      skills: group.skills.map((s) => ({ ...s })),
    });
    setNewSkillName('');
    setNewSkillNameAr('');
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
    const trimmed = newSkillName.trim();
    if (!trimmed || !editingGroup) return;

    // Duplicate check
    const isDuplicate = (editingGroup.skills || []).some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      alert(t('skills.duplicateWarning'));
      return;
    }

    const resolvedDefaultIcon = getDefaultSoftwareIconUrl(trimmed);
    const newSkill: SkillItem = {
      id: `s-${Date.now()}`,
      name: trimmed,
      nameAr: newSkillNameAr.trim() || undefined,
      iconUrl: newSkillIconUrl.trim() || resolvedDefaultIcon || undefined,
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
    setNewSkillNameAr('');
    setNewSkillIconUrl('');
  };

  const removeSkillFromEditing = (skillId: string) => {
    if (!editingGroup) return;
    setEditingGroup({
      ...editingGroup,
      skills: editingGroup.skills?.filter((s) => s.id !== skillId) || [],
    });
  };

  const toggleSkillEnabled = (skillId: string) => {
    if (!editingGroup) return;
    const updatedSkills = (editingGroup.skills || []).map((s) =>
      s.id === skillId ? { ...s, enabled: s.enabled === false ? true : false } : s
    );
    setEditingGroup({ ...editingGroup, skills: updatedSkills });
  };

  const moveSkillOrder = (index: number, direction: 'up' | 'down') => {
    if (!editingGroup || !editingGroup.skills) return;
    const current = [...editingGroup.skills];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;

    // reassign sortOrder
    current.forEach((s, idx) => {
      s.sortOrder = idx + 1;
    });

    setEditingGroup({ ...editingGroup, skills: current });
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
        setMessage(t('common.success'));
        setIsModalOpen(false);
        fetchSkills();
        setTimeout(() => setMessage(''), 4000);
      } else {
        const err = await res.json();
        throw new Error(err.error || t('common.failed'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || t('common.failed'));
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return;
    try {
      const res = await fetch(`/api/admin/skill-groups?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSkillGroups(skillGroups.filter((g) => g.id !== id));
        setMessage(t('common.success'));
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      alert(t('common.failed'));
    }
  };

  // Filtered skills display
  const filteredGroups = useMemo(() => {
    let result = [...skillGroups];
    if (categoryFilter !== 'ALL') {
      result = result.filter((g) => g.id === categoryFilter || g.title === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result
        .map((g) => {
          const matchTitle =
            g.title.toLowerCase().includes(q) || (g.titleAr && g.titleAr.includes(q));
          const matchingSkills = g.skills.filter(
            (s) => s.name.toLowerCase().includes(q) || (s.nameAr && s.nameAr.includes(q))
          );
          if (matchTitle || matchingSkills.length > 0) {
            return {
              ...g,
              skills: matchTitle ? g.skills : matchingSkills,
            };
          }
          return null;
        })
        .filter(Boolean) as SkillGroup[];
    }
    return result;
  }, [skillGroups, categoryFilter, searchQuery]);

  if (loading) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading Skills...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F0F3F6] tracking-tight">
            {t('skills.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            {t('skills.subtitle')}
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
            <span>{t('skills.addGroup')}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/08 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('skills.searchPlaceholder')}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="ALL">{t('common.all')} ({skillGroups.length})</option>
            {skillGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {language === 'ar' && g.titleAr ? g.titleAr : g.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Skill Groups / Parent Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="p-6 sm:p-7 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 hover:border-[#F59E0B]/30 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#F59E0B]" />
                    <h3 className="text-base sm:text-lg font-bold text-[#F0F3F6]">
                      {language === 'ar' && group.titleAr ? group.titleAr : group.title}
                    </h3>
                  </div>
                  {group.titleAr && language !== 'ar' && (
                    <p className="text-xs text-[#94A3B8] mt-0.5">{group.titleAr}</p>
                  )}
                  {group.title && language === 'ar' && (
                    <p className="text-xs text-[#94A3B8] mt-0.5">{group.title}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEdit(group)}
                    className="p-2 rounded-xl bg-[#151A23] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                    title={t('common.edit')}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title={t('common.delete')}
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
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                      skill.enabled === false
                        ? 'bg-[#151A23]/50 border-dashed border-[#F0F3F6]/10 text-[#94A3B8]/60 line-through'
                        : 'bg-[#151A23] border-[#F0F3F6]/10 text-[#F0F3F6] hover:border-[#F59E0B]/40'
                    }`}
                  >
                    <SoftwareIcon
                      name={skill.name}
                      iconUrl={skill.iconUrl}
                      className="w-4 h-4"
                    />
                    <span>{language === 'ar' && skill.nameAr ? skill.nameAr : skill.name}</span>
                    {skill.enabled === false && (
                      <span className="text-[9px] font-mono text-red-400">({t('skills.hiddenState')})</span>
                    )}
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
                  {editingGroup.title ? `${t('common.edit')}: ${editingGroup.title}` : t('skills.addGroup')}
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {t('skills.subtitle')}
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
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    {t('skills.groupTitleEn')}
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
                    {t('skills.groupTitleAr')}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingGroup.titleAr || ''}
                    onChange={(e) => setEditingGroup({ ...editingGroup, titleAr: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                    {t('common.order')}
                  </label>
                  <input
                    type="number"
                    value={editingGroup.sortOrder ?? 1}
                    onChange={(e) =>
                      setEditingGroup({ ...editingGroup, sortOrder: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>
              </div>

              {/* Skills List in this Group */}
              <div className="space-y-3 pt-3 border-t border-[#F0F3F6]/08">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                    {t('skills.categoryAssignment')} ({editingGroup.skills?.length || 0})
                  </h4>
                </div>

                {/* Individual Skill Items */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pe-1">
                  {(editingGroup.skills || []).map((skill, index) => (
                    <div
                      key={skill.id}
                      className="p-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {/* Live Icon preview */}
                        <div className="w-10 h-10 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 flex items-center justify-center p-1.5 flex-shrink-0">
                          <SoftwareIcon
                            name={skill.name}
                            iconUrl={skill.iconUrl}
                            className="w-6 h-6"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#F0F3F6]">{skill.name}</span>
                            {skill.nameAr && (
                              <span className="text-xs text-[#94A3B8]">({skill.nameAr})</span>
                            )}
                          </div>
                          {skill.iconUrl && (
                            <span className="text-[10px] font-mono text-emerald-400 block truncate max-w-xs">
                              {skill.iconUrl}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls: Reorder, Visibility, Icon Upload, Delete */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Move Up/Down */}
                        <div className="flex items-center bg-[#10141C] rounded-lg p-1 border border-[#F0F3F6]/05">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveSkillOrder(index, 'up')}
                            className="p-1 text-[#94A3B8] hover:text-white disabled:opacity-20"
                            title={t('projects.moveUp')}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === (editingGroup.skills?.length || 0) - 1}
                            onClick={() => moveSkillOrder(index, 'down')}
                            className="p-1 text-[#94A3B8] hover:text-white disabled:opacity-20"
                            title={t('projects.moveDown')}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleSkillEnabled(skill.id)}
                          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                            skill.enabled === false
                              ? 'bg-red-500/10 border-red-500/30 text-red-400'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          }`}
                          title={skill.enabled === false ? t('skills.hiddenState') : t('skills.visible')}
                        >
                          {skill.enabled === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        {/* Upload icon button */}
                        <label className="p-1.5 rounded-lg bg-[#10141C] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F59E0B] cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadIconForSkill(skill.id, e)}
                          />
                        </label>

                        {skill.iconUrl && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIconForSkill(skill.id)}
                            className="p-1.5 rounded-lg bg-[#10141C] text-amber-400 hover:bg-amber-400/10"
                            title="Reset icon to default vector"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeSkillFromEditing(skill.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new skill inline card */}
                <div className="p-4 rounded-2xl bg-[#10141C] border border-dashed border-[#F0F3F6]/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#F59E0B] font-bold">
                      {t('skills.addSkill')}
                    </span>
                    {(newSkillIconUrl || (newSkillName && getDefaultSoftwareIconUrl(newSkillName))) && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-400">
                          {t('skills.iconPreview')}:
                        </span>
                        <SoftwareIcon
                          name={newSkillName || 'Preview'}
                          iconUrl={newSkillIconUrl || getDefaultSoftwareIconUrl(newSkillName)}
                          className="w-5 h-5"
                        />
                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          {newSkillIconUrl ? 'Custom' : 'Auto-detected'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={t('skills.skillName')}
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="اسم البرنامج بالعربي (اختياري)"
                      value={newSkillNameAr}
                      onChange={(e) => setNewSkillNameAr(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#94A3B8]">Quick add:</span>
                    {['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects', 'InDesign', 'Blender', 'Cinema 4D', 'Figma'].map((tool) => (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => {
                          setNewSkillName(tool);
                          setNewSkillIconUrl(getDefaultSoftwareIconUrl(tool) || '');
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F59E0B] hover:border-[#F59E0B]/30 transition-colors"
                      >
                        + {tool}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 w-full flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Icon URL or upload file →"
                        value={newSkillIconUrl}
                        onChange={(e) => setNewSkillIconUrl(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                      <label className="px-3 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>{uploadingSkillIcon === 'new' ? t('common.uploading') : t('common.upload')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadIconForNewSkill}
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={addSkillToEditing}
                      disabled={!newSkillName.trim()}
                      className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#F59E0B] text-[#07090D] font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('common.add')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F3F6]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#151A23] text-xs font-semibold text-[#94A3B8] hover:text-white"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? t('common.saving') : t('common.save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
