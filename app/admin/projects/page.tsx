'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Project, ProjectMediaItem, ProjectVideo, Status } from '@/lib/types';
import {
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Upload,
  ExternalLink,
  Star,
  Play,
  ArrowUp,
  ArrowDown,
  X,
  Save,
  Maximize2,
  FolderDown,
  Film,
  Image as ImageIcon,
  Layers,
  Wrench,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Eye,
  RefreshCw,
  FolderGit2,
  FileVideo,
  Sparkles,
} from 'lucide-react';
import {
  detectMediaDimensionsClient,
  calculateMediaDimensions,
  getRatioLabel,
} from '@/lib/media/dimensions';
import { SoftwareIcon } from '@/components/ui/SoftwareIcon';
import { getDefaultSoftwareIconUrl } from '@/lib/media/softwareIcons';
import { useAdminLanguage } from '@/context/AdminLanguageContext';

type TabKey = 'basic' | 'media' | 'details' | 'links' | 'publishing';

export default function AdminProjectsPage() {
  const { t, language, direction } = useAdminLanguage();

  const [projects, setProjects] = useState<Project[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [centralSkills, setCentralSkills] = useState<Array<{ id: string; name: string; nameAr?: string; iconUrl?: string }>>([]);
  const [rawSkillGroups, setRawSkillGroups] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [analyzingMedia, setAnalyzingMedia] = useState(false);

  // Search & Filter for Projects list
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Input states inside modal
  const [newCatInput, setNewCatInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newSkillIconUrl, setNewSkillIconUrl] = useState('');
  const [uploadingToolIcon, setUploadingToolIcon] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaTypeInput, setMediaTypeInput] = useState<'image' | 'video'>('image');
  const [mediaTitleInput, setMediaTitleInput] = useState('');

  const fetchProjectsAndData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.data?.projects) {
        setProjects(data.data.projects);
      }

      if (data.data?.skillGroups) {
        setRawSkillGroups(data.data.skillGroups);
      }

      // Extract skills dynamically from central skill groups
      const centralList: Array<{ id: string; name: string; nameAr?: string; iconUrl?: string }> = [];
      (data.data?.skillGroups || []).forEach((g: any) => {
        (g.skills || []).forEach((s: any) => {
          if (s.name) {
            centralList.push({
              id: s.id,
              name: s.name.trim(),
              nameAr: s.nameAr || s.name_ar,
              iconUrl: s.iconUrl || s.icon_url || getDefaultSoftwareIconUrl(s.name) || '',
            });
          }
        });
      });
      setCentralSkills(centralList);

      const projectTools: string[] = [];
      (data.data?.projects || []).forEach((p: any) => {
        (p.tools || []).forEach((t: string) => {
          if (t && typeof t === 'string') projectTools.push(t.trim());
        });
      });

      const extractedSkills = Array.from(new Set<string>([...centralList.map((s) => s.name), ...projectTools]));
      setAllSkills(extractedSkills);

      const defaultCategories = [
        'Motion Graphics',
        'Graphic Design',
        'Branding',
        'Social Media',
        'Poster Design',
        'Campaign Design',
      ];
      const categoriesFromApi: string[] = data.data?.categories || [];
      setAllCategories(Array.from(new Set([...defaultCategories, ...categoriesFromApi])));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndData();
  }, []);

  const openNewProject = () => {
    const defaultCover = '/images/projects/project-lumina-motion.jpg';
    setEditingProject({
      id: `proj-${Date.now()}`,
      slug: `project-${Date.now()}`,
      title: '',
      titleAr: '',
      category: 'Motion Graphics',
      categories: ['Motion Graphics'],
      description: '',
      descriptionAr: '',
      client: '',
      clientName: '',
      projectDate: new Date().getFullYear().toString(),
      coverImage: defaultCover,
      gallery: [],
      images: [],
      videoUrl: '',
      videos: [],
      mediaItems: [
        {
          id: `med-${Date.now()}-1`,
          type: 'image',
          url: defaultCover,
          title: 'Cover Visual',
          sortOrder: 1,
        },
      ],
      googleDriveMaterialsUrl: '',
      googleDriveUrl: '',
      behanceUrl: '',
      youtubeUrl: '',
      vimeoUrl: '',
      tools: ['Photoshop', 'Illustrator'],
      softwareUsed: ['Photoshop', 'Illustrator'],
      skillIds: ['s-21', 's-22'],
      projectUrl: '',
      featured: true,
      tags: ['Design', 'Campaign'],
      status: 'published',
      sortOrder: projects.length + 1,
    });
    setActiveTab('basic');
    setNewCatInput('');
    setNewSkillInput('');
    setNewSkillIconUrl('');
    setNewTagInput('');
    setMediaUrlInput('');
    setIsModalOpen(true);
  };

  const openEditProject = (p: Project) => {
    // Ensure mediaItems is populated
    let mediaItems = p.mediaItems && p.mediaItems.length > 0 ? [...p.mediaItems] : [];
    if (mediaItems.length === 0) {
      let order = 1;
      if (p.coverImage) {
        mediaItems.push({
          id: `med-${order}`,
          type: 'image',
          url: p.coverImage,
          title: 'Cover Visual',
          sortOrder: order++,
          aspectRatio: p.aspectRatio,
          width: p.width,
          height: p.height,
        });
      }
      (p.gallery || []).forEach((url) => {
        if (url && url !== p.coverImage && !mediaItems.some((m) => m.url === url)) {
          mediaItems.push({
            id: `med-${order}`,
            type: 'image',
            url,
            title: `Still ${order}`,
            sortOrder: order++,
          });
        }
      });
      (p.videos || []).forEach((vid) => {
        if (vid.url && !mediaItems.some((m) => m.url === vid.url)) {
          mediaItems.push({
            id: vid.id || `med-${order}`,
            type: 'video',
            url: vid.url,
            title: vid.title || `Reel ${order}`,
            sortOrder: order++,
          });
        }
      });
    }

    const projectTools = p.tools || p.softwareUsed || [];
    const initialSkillIds = new Set<string>(p.skillIds || []);
    projectTools.forEach((toolName) => {
      const clean = toolName.toLowerCase().trim();
      const stripped = clean.replace(/^adobe\s+/, '').trim();
      const matched = centralSkills.find(
        (s) => s.name.toLowerCase().trim() === clean || s.name.toLowerCase().trim() === stripped
      );
      if (matched) initialSkillIds.add(matched.id);
    });

    setEditingProject({
      ...p,
      categories: p.categories && p.categories.length > 0 ? p.categories : [p.category || 'Motion Graphics'],
      mediaItems,
      gallery: p.gallery || [],
      videos: p.videos || [],
      tools: projectTools,
      softwareUsed: projectTools,
      skillIds: Array.from(initialSkillIds),
      tags: p.tags || [],
    });
    setActiveTab('basic');
    setNewCatInput('');
    setNewSkillInput('');
    setNewSkillIconUrl('');
    setNewTagInput('');
    setMediaUrlInput('');
    setIsModalOpen(true);
  };

  // Re-detect cover dimensions
  const autoDetectCoverDimensions = async (url: string) => {
    if (!url || !editingProject) return;
    try {
      setAnalyzingMedia(true);
      const dim = await detectMediaDimensionsClient(url);
      if (dim && dim.width > 0 && dim.height > 0) {
        setEditingProject((prev) => (prev ? { ...prev, ...dim } : prev));
      }
    } catch {
      // ignore
    } finally {
      setAnalyzingMedia(false);
    }
  };

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    setUploadingCover(true);
    setAnalyzingMedia(true);

    try {
      const clientDim = await detectMediaDimensionsClient(file);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.media?.url) {
        const width = clientDim?.width || data.dimensions?.width;
        const height = clientDim?.height || data.dimensions?.height;
        const aspectRatio = clientDim?.aspectRatio || data.dimensions?.aspectRatio;
        const orientation = clientDim?.orientation || data.dimensions?.orientation;

        setEditingProject((prev) => {
          if (!prev) return prev;
          const next = { ...prev, coverImage: data.media.url };
          if (width && height) {
            next.width = width;
            next.height = height;
            next.aspectRatio = aspectRatio;
            next.orientation = orientation;
          }
          // Also prepend/replace in mediaItems as first cover item
          const currentMedia = prev.mediaItems ? [...prev.mediaItems] : [];
          if (currentMedia.length > 0 && currentMedia[0].type === 'image') {
            currentMedia[0] = {
              ...currentMedia[0],
              url: data.media.url,
              aspectRatio,
              width,
              height,
            };
          } else {
            currentMedia.unshift({
              id: `med-${Date.now()}`,
              type: 'image',
              url: data.media.url,
              title: 'Cover Visual',
              sortOrder: 1,
              aspectRatio,
              width,
              height,
            });
          }
          next.mediaItems = currentMedia;
          return next;
        });
      }
    } catch {
      alert('Cover upload failed');
    } finally {
      setUploadingCover(false);
      setAnalyzingMedia(false);
      e.target.value = '';
    }
  };

  // ---------------------------------------------------------------------------
  // MULTI-MEDIA SHOWCASE MANAGEMENT
  // ---------------------------------------------------------------------------
  const handleAddMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'video'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProject) return;

    setUploadingMedia(true);
    try {
      const newItems: ProjectMediaItem[] = [];
      const currentMedia = editingProject.mediaItems ? [...editingProject.mediaItems] : [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();

        if (data.media?.url) {
          const order = currentMedia.length + newItems.length + 1;
          newItems.push({
            id: `med-${Date.now()}-${i}`,
            type,
            url: data.media.url,
            title: file.name.replace(/\.[^/.]+$/, ''),
            sortOrder: order,
            aspectRatio: data.dimensions?.aspectRatio,
            width: data.dimensions?.width,
            height: data.dimensions?.height,
          });
        }
      }

      if (newItems.length > 0) {
        setEditingProject((prev) => {
          if (!prev) return prev;
          const merged = [...(prev.mediaItems || []), ...newItems];
          return {
            ...prev,
            mediaItems: merged,
            coverImage: prev.coverImage || merged[0]?.url,
          };
        });
      }
    } catch {
      alert('Failed to upload media files');
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  const handleAddMediaByUrl = () => {
    const trimmed = mediaUrlInput.trim();
    if (!trimmed || !editingProject) return;

    const currentMedia = editingProject.mediaItems ? [...editingProject.mediaItems] : [];
    const newMedia: ProjectMediaItem = {
      id: `med-${Date.now()}`,
      type: mediaTypeInput,
      url: trimmed,
      title: mediaTitleInput.trim() || (mediaTypeInput === 'video' ? 'Video Item' : 'Artwork Image'),
      sortOrder: currentMedia.length + 1,
    };

    setEditingProject({
      ...editingProject,
      mediaItems: [...currentMedia, newMedia],
      coverImage: editingProject.coverImage || (mediaTypeInput === 'image' ? trimmed : editingProject.coverImage),
    });

    setMediaUrlInput('');
    setMediaTitleInput('');
  };

  const handleRemoveMediaItem = (index: number) => {
    if (!editingProject || !editingProject.mediaItems) return;
    const current = [...editingProject.mediaItems];
    current.splice(index, 1);
    // re-index
    current.forEach((m, idx) => {
      m.sortOrder = idx + 1;
    });

    const firstImage = current.find((m) => m.type === 'image');
    setEditingProject({
      ...editingProject,
      mediaItems: current,
      coverImage: firstImage ? firstImage.url : (current[0]?.url || editingProject.coverImage),
    });
  };

  const handleMoveMediaItem = (index: number, direction: 'up' | 'down') => {
    if (!editingProject || !editingProject.mediaItems) return;
    const current = [...editingProject.mediaItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;

    current.forEach((m, idx) => {
      m.sortOrder = idx + 1;
    });

    setEditingProject({
      ...editingProject,
      mediaItems: current,
    });
  };

  const handleSetAsCover = (media: ProjectMediaItem) => {
    if (!editingProject || !editingProject.mediaItems) return;
    // Set as coverImage
    setEditingProject({
      ...editingProject,
      coverImage: media.url,
      width: media.width || editingProject.width,
      height: media.height || editingProject.height,
      aspectRatio: media.aspectRatio || editingProject.aspectRatio,
    });
    if (media.type === 'image') {
      autoDetectCoverDimensions(media.url);
    }
  };

  const handleReplaceMediaItem = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject || !editingProject.mediaItems) return;

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.media?.url) {
        const current = [...editingProject.mediaItems];
        const isVid = file.type.startsWith('video/');
        current[index] = {
          ...current[index],
          url: data.media.url,
          type: isVid ? 'video' : 'image',
          aspectRatio: data.dimensions?.aspectRatio,
          width: data.dimensions?.width,
          height: data.dimensions?.height,
        };

        const firstImage = current.find((m) => m.type === 'image');
        setEditingProject({
          ...editingProject,
          mediaItems: current,
          coverImage: index === 0 ? data.media.url : (firstImage ? firstImage.url : editingProject.coverImage),
        });
      }
    } catch {
      alert('Media replacement failed');
    } finally {
      e.target.value = '';
    }
  };

  // ---------------------------------------------------------------------------
  // CATEGORIES, SKILLS & TAGS
  // ---------------------------------------------------------------------------
  const toggleCategory = (cat: string) => {
    if (!editingProject) return;
    const current = editingProject.categories || [];
    const exists = current.some((c) => c.toLowerCase() === cat.toLowerCase());
    let next: string[];
    if (exists) {
      next = current.filter((c) => c.toLowerCase() !== cat.toLowerCase());
    } else {
      next = [...current, cat];
    }
    setEditingProject({
      ...editingProject,
      categories: next,
      category: next[0] || 'Motion Graphics',
    });
  };

  const handleAddNewCategory = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed || !editingProject) return;

    if (!allCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setAllCategories([...allCategories, trimmed]);
      fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: trimmed }),
      }).catch(console.error);
    }

    const current = editingProject.categories || [];
    if (!current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      const next = [...current, trimmed];
      setEditingProject({
        ...editingProject,
        categories: next,
        category: next[0] || trimmed,
      });
    }
    setNewCatInput('');
  };

  const handleUploadToolIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      setUploadingToolIcon(true);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.media?.url) {
        setNewSkillIconUrl(data.media.url);
      }
    } catch {
      alert('Icon upload failed');
    } finally {
      setUploadingToolIcon(false);
      e.target.value = '';
    }
  };

  const toggleSkill = (skill: string | { id: string; name: string }) => {
    if (!editingProject) return;
    const skillName = typeof skill === 'string' ? skill : skill.name;
    const skillId = typeof skill === 'object' && skill.id ? skill.id : undefined;

    const currentTools = editingProject.tools || [];
    const currentSkillIds = editingProject.skillIds || [];

    // Find in centralSkills
    const matched = centralSkills.find(
      (s) =>
        (skillId && s.id === skillId) ||
        s.name.toLowerCase().trim() === skillName.toLowerCase().trim() ||
        s.name.toLowerCase().trim() === skillName.toLowerCase().replace(/^adobe\s+/, '').trim()
    );

    const targetId = matched ? matched.id : skillId;
    const targetName = matched ? matched.name : skillName;

    const nameExists = currentTools.some(
      (s) =>
        s.toLowerCase().trim() === targetName.toLowerCase().trim() ||
        s.toLowerCase().trim() === targetName.toLowerCase().replace(/^adobe\s+/, '').trim()
    );
    const idExists = targetId ? currentSkillIds.includes(targetId) : false;

    let nextTools: string[];
    let nextIds: string[];

    if (nameExists || idExists) {
      nextTools = currentTools.filter(
        (s) =>
          s.toLowerCase().trim() !== targetName.toLowerCase().trim() &&
          s.toLowerCase().trim() !== targetName.toLowerCase().replace(/^adobe\s+/, '').trim()
      );
      nextIds = targetId ? currentSkillIds.filter((id) => id !== targetId) : currentSkillIds;
    } else {
      nextTools = [...currentTools, targetName];
      nextIds = targetId && !currentSkillIds.includes(targetId) ? [...currentSkillIds, targetId] : currentSkillIds;
    }

    setEditingProject({
      ...editingProject,
      tools: nextTools,
      softwareUsed: nextTools,
      skillIds: nextIds,
    });
  };

  const handleAddNewSkill = async () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed || !editingProject) return;

    // Check if skill already exists in centralSkills
    const existing = centralSkills.find(
      (s) =>
        s.name.toLowerCase().trim() === trimmed.toLowerCase() ||
        s.name.toLowerCase().trim() === trimmed.toLowerCase().replace(/^adobe\s+/, '').trim()
    );

    let targetSkillId = existing?.id;
    let targetName = existing?.name || trimmed;
    let iconUrl = newSkillIconUrl || existing?.iconUrl || getDefaultSoftwareIconUrl(trimmed) || '';

    if (!existing) {
      // Find the software group (group-5 or title matching Software, or the last group)
      const swGroup =
        rawSkillGroups.find((g) => g.id === 'group-5' || /software/i.test(g.title)) ||
        rawSkillGroups[rawSkillGroups.length - 1];

      targetSkillId = `s-${Date.now()}`;
      const newSkill = {
        id: targetSkillId,
        name: trimmed,
        nameAr: trimmed,
        iconUrl,
        enabled: true,
        sortOrder: swGroup ? (swGroup.skills?.length || 0) + 1 : 1,
      };

      if (swGroup) {
        const updatedGroup = {
          ...swGroup,
          skills: [...(swGroup.skills || []), newSkill],
        };
        try {
          await fetch('/api/admin/skill-groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedGroup),
          });
          setRawSkillGroups(
            rawSkillGroups.map((g) => (g.id === swGroup.id ? updatedGroup : g))
          );
        } catch (err) {
          console.error('Failed to persist custom tool:', err);
        }
      }

      const updatedCentral = [...centralSkills, { id: targetSkillId, name: trimmed, iconUrl }];
      setCentralSkills(updatedCentral);
      if (!allSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        setAllSkills([...allSkills, trimmed]);
      }
    }

    // Toggle/Add to editingProject
    const currentTools = editingProject.tools || [];
    const currentSkillIds = editingProject.skillIds || [];

    const nextTools = currentTools.some(
      (s) =>
        s.toLowerCase().trim() === targetName.toLowerCase().trim() ||
        s.toLowerCase().trim() === targetName.toLowerCase().replace(/^adobe\s+/, '').trim()
    )
      ? currentTools
      : [...currentTools, targetName];

    const nextSkillIds =
      targetSkillId && !currentSkillIds.includes(targetSkillId)
        ? [...currentSkillIds, targetSkillId]
        : currentSkillIds;

    setEditingProject({
      ...editingProject,
      tools: nextTools,
      softwareUsed: nextTools,
      skillIds: nextSkillIds,
    });

    setNewSkillInput('');
    setNewSkillIconUrl('');
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed || !editingProject) return;
    const current = editingProject.tags || [];
    if (!current.includes(trimmed)) {
      setEditingProject({
        ...editingProject,
        tags: [...current, trimmed],
      });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!editingProject) return;
    const current = editingProject.tags || [];
    setEditingProject({
      ...editingProject,
      tags: current.filter((t) => t !== tag),
    });
  };

  // ---------------------------------------------------------------------------
  // SAVE & DELETE
  // ---------------------------------------------------------------------------
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setSaving(true);
    setMessage('');

    try {
      const categories =
        editingProject.categories && editingProject.categories.length > 0
          ? editingProject.categories
          : [editingProject.category || 'Motion Graphics'];

      const mediaItems = editingProject.mediaItems || [];
      const imageItems = mediaItems.filter((m) => m.type === 'image');
      const videoItems = mediaItems.filter((m) => m.type === 'video');

      const coverImage = editingProject.coverImage || imageItems[0]?.url || mediaItems[0]?.url || '/images/projects/project-lumina-motion.jpg';
      const gallery = imageItems.map((m) => m.url);
      const videos: ProjectVideo[] = videoItems.map((m, idx) => ({
        id: m.id || `vid-${idx + 1}`,
        url: m.url,
        title: m.title || `Video Reel ${idx + 1}`,
        titleAr: m.titleAr,
        type: 'direct',
      }));

      const driveUrl =
        editingProject.googleDriveMaterialsUrl || editingProject.googleDriveUrl || '';

      const payload: Partial<Project> = {
        ...editingProject,
        category: categories[0],
        categories,
        coverImage,
        mediaItems,
        gallery,
        images: gallery,
        videos,
        videoUrl: videos[0]?.url || '',
        googleDriveMaterialsUrl: driveUrl,
        googleDriveUrl: driveUrl,
        client: editingProject.client || '',
        clientName: editingProject.client || '',
        tools: editingProject.tools || [],
        softwareUsed: editingProject.tools || [],
        skillIds: editingProject.skillIds || [],
      };

      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage(t('common.success'));
        setIsModalOpen(false);
        fetchProjectsAndData();
        setTimeout(() => setMessage(''), 4000);
      } else {
        alert(t('common.failed'));
      }
    } catch {
      alert('Network error while saving project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return;
    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      }
    } catch {
      alert(t('common.failed'));
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const updated = [...projects];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setProjects(updated);
    const ids = updated.map((p) => p.id);

    await fetch('/api/admin/projects/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (categoryFilter !== 'ALL') {
      list = list.filter((p) =>
        (p.categories || [p.category]).some((c) => c.toLowerCase() === categoryFilter.toLowerCase())
      );
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.titleAr && p.titleAr.includes(q)) ||
          p.client.toLowerCase().includes(q) ||
          (p.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [projects, categoryFilter, statusFilter, searchQuery]);

  if (loading) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading Projects...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F0F3F6] tracking-tight">
            {t('projects.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            {t('projects.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{message}</span>
            </div>
          )}
          <button
            onClick={openNewProject}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('projects.addNew')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/08 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search')}
            className="w-full ps-10 pe-4 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="ALL">{t('common.all')} {t('projects.category')}</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="ALL">{t('common.all')} {t('common.status')}</option>
            <option value="published">{t('common.published')}</option>
            <option value="draft">{t('common.draft')}</option>
            <option value="hidden">{t('common.hidden')}</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.map((project, idx) => (
          <div
            key={project.id}
            className="p-4 sm:p-5 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#F59E0B]/40 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Media Thumbnail */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#151A23] border border-[#F0F3F6]/10 flex-shrink-0">
                <img
                  src={project.coverImage || '/images/projects/project-lumina-motion.jpg'}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Information */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {(project.categories && project.categories.length > 0
                    ? project.categories
                    : [project.category]
                  ).map((cat, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-[#151A23] border border-[#F59E0B]/20 text-[10px] font-mono text-[#F59E0B] font-semibold"
                    >
                      {cat}
                    </span>
                  ))}
                  {project.featured && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Featured</span>
                    </span>
                  )}
                  {/* Multi-Media Badge */}
                  {project.mediaItems && project.mediaItems.length > 1 && (
                    <span className="px-2 py-0.5 rounded-md bg-[#151A23] border border-[#F0F3F6]/10 text-[10px] font-mono text-cyan-400">
                      {project.mediaItems.length} Media Slides
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#F0F3F6] truncate">
                  {language === 'ar' && project.titleAr ? project.titleAr : project.title}
                </h3>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94A3B8] font-mono mt-1">
                  {project.client && <span>{project.client}</span>}
                  {project.projectDate && <span>• {project.projectDate}</span>}
                  {project.tools && project.tools.length > 0 && (
                    <span>• {project.tools.slice(0, 3).join(', ')}</span>
                  )}
                  {(project.googleDriveMaterialsUrl || project.googleDriveUrl) && (
                    <span className="text-emerald-400 font-semibold">• Drive Materials</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end md:self-center">
              {/* Order buttons */}
              <div className="flex items-center bg-[#151A23] rounded-xl p-1 border border-[#F0F3F6]/05">
                <button
                  disabled={idx === 0}
                  onClick={() => moveOrder(idx, 'up')}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white disabled:opacity-30"
                  title={t('projects.moveUp')}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={idx === projects.length - 1}
                  onClick={() => moveOrder(idx, 'down')}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white disabled:opacity-30"
                  title={t('projects.moveDown')}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status Pill */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase ${
                  project.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : project.status === 'draft'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {project.status}
              </span>

              {/* View Live */}
              <a
                href={`/projects/${project.slug}`}
                target="_blank"
                className="p-2.5 rounded-xl bg-[#151A23] text-[#94A3B8] hover:text-[#F0F3F6]"
                title="View on Live Site"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Edit */}
              <button
                onClick={() => openEditProject(project)}
                className="p-2.5 rounded-xl bg-[#151A23] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                title={t('common.edit')}
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(project.id)}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title={t('common.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Project Modal with Organized Tab Architecture */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-[#07090D]/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl my-8 bg-[#10141C] border border-[#F0F3F6]/15 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F3F6]/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#F0F3F6]">
                  {editingProject.title
                    ? `${t('common.edit')}: ${editingProject.title}`
                    : t('projects.addNew')}
                </h2>
                <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                  ID: {editingProject.id} • Slug: {editingProject.slug}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 rounded-2xl bg-[#151A23] text-[#94A3B8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB NAVIGATION BAR */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'basic'
                    ? 'bg-[#F59E0B] text-[#07090D] font-bold shadow'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {t('projects.tabBasic')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'media'
                    ? 'bg-[#F59E0B] text-[#07090D] font-bold shadow'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span>{t('projects.tabMedia')}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px] font-mono font-bold">
                  {editingProject.mediaItems?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'details'
                    ? 'bg-[#F59E0B] text-[#07090D] font-bold shadow'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {t('projects.tabDetails')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('links')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'links'
                    ? 'bg-[#F59E0B] text-[#07090D] font-bold shadow'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {t('projects.tabLinks')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('publishing')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'publishing'
                    ? 'bg-[#F59E0B] text-[#07090D] font-bold shadow'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {t('projects.tabPublish')}
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-6">
              {/* TAB 1: BASIC INFORMATION */}
              {activeTab === 'basic' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('projects.nameEn')}
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProject.title || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, title: e.target.value })
                        }
                        placeholder="Brand Identity & Social Campaign"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('projects.nameAr')}
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={editingProject.titleAr || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, titleAr: e.target.value })
                        }
                        placeholder="تطوير الهوية البصرية وحملة التواصل"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('projects.client')}
                      </label>
                      <input
                        type="text"
                        value={editingProject.client || ''}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            client: e.target.value,
                            clientName: e.target.value,
                          })
                        }
                        placeholder="Client or Studio Name"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('projects.date')}
                      </label>
                      <input
                        type="text"
                        value={editingProject.projectDate || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, projectDate: e.target.value })
                        }
                        placeholder="2024 or May 2024"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>
                  </div>

                  {/* Categories Multi-Select */}
                  <div className="p-4 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08 space-y-3">
                    <label className="block text-xs font-mono uppercase text-[#F59E0B] font-bold">
                      {t('projects.category')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allCategories.map((cat) => {
                        const isSelected = (editingProject.categories || []).some(
                          (c) => c.toLowerCase() === cat.toLowerCase()
                        );
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#F59E0B] text-[#07090D] border-[#F59E0B] font-bold shadow'
                                : 'bg-[#10141C] text-[#94A3B8] border-[#F0F3F6]/10 hover:border-[#F0F3F6]/30'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            <span>{cat}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Custom Category Inline */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add custom category..."
                        value={newCatInput}
                        onChange={(e) => setNewCatInput(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-3 py-1.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50"
                      >
                        + Add Category
                      </button>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('projects.descEn')}
                      </label>
                      <textarea
                        rows={5}
                        value={editingProject.description || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, description: e.target.value })
                        }
                        placeholder="Full creative story, project scope, execution details..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B] leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('projects.descAr')}
                      </label>
                      <textarea
                        rows={5}
                        dir="rtl"
                        value={editingProject.descriptionAr || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, descriptionAr: e.target.value })
                        }
                        placeholder="نطاق العمل، فكرة التصميم، والمخرجات النهائية..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B] leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MULTI-MEDIA SHOWCASE (IMAGES & VIDEOS) */}
              {activeTab === 'media' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Top Cover Visual Setting */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#10141C] border border-[#F0F3F6]/15 flex-shrink-0">
                        <img
                          src={editingProject.coverImage || '/images/projects/project-lumina-motion.jpg'}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-mono uppercase text-[#F59E0B] font-bold block">
                          {t('projects.coverVisual')}
                        </span>
                        <span className="text-[11px] font-mono text-[#94A3B8] block truncate max-w-sm mt-0.5">
                          {editingProject.coverImage}
                        </span>
                        {editingProject.aspectRatio && (
                          <span className="text-[10px] font-mono text-emerald-400 mt-1 inline-block">
                            Ratio: {editingProject.aspectRatio.toFixed(2)} ({editingProject.orientation || 'adaptive'})
                          </span>
                        )}
                      </div>
                    </div>

                    <label className="px-4 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 flex items-center gap-2 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{uploadingCover ? t('common.uploading') : 'Change Cover File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverUpload}
                      />
                    </label>
                  </div>

                  {/* Add New Media Action Box */}
                  <div className="p-4 rounded-2xl bg-[#10141C] border border-dashed border-[#F0F3F6]/15 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono uppercase text-[#F59E0B] font-bold block">
                          Add Media to Project Sequence
                        </span>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">
                          {t('projects.mediaHelp')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Bulk Upload Images */}
                        <label className="px-3.5 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 flex items-center gap-1.5 cursor-pointer">
                          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{uploadingMedia ? t('common.uploading') : t('projects.addImage')}</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleAddMediaUpload(e, 'image')}
                          />
                        </label>

                        {/* Upload Video File */}
                        <label className="px-3.5 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 flex items-center gap-1.5 cursor-pointer">
                          <Film className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t('projects.uploadVideo')}</span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => handleAddMediaUpload(e, 'video')}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Or URL input for external media / video reels */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-[#F0F3F6]/05">
                      <select
                        value={mediaTypeInput}
                        onChange={(e) => setMediaTypeInput(e.target.value as any)}
                        className="px-3 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] w-full sm:w-auto"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video (MP4 / Web)</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Media title (optional)..."
                        value={mediaTitleInput}
                        onChange={(e) => setMediaTitleInput(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] w-full sm:w-48"
                      />

                      <input
                        type="text"
                        placeholder="Direct URL (https://... or /uploads/...)"
                        value={mediaUrlInput}
                        onChange={(e) => setMediaUrlInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] w-full"
                      />

                      <button
                        type="button"
                        onClick={handleAddMediaByUrl}
                        disabled={!mediaUrlInput.trim()}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#F59E0B] text-[#07090D] font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Unified Media Queue / Reorderable Sequence List */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-mono uppercase text-[#F59E0B] font-bold block">
                      {t('projects.mediaQueue')} ({editingProject.mediaItems?.length || 0})
                    </span>

                    {(!editingProject.mediaItems || editingProject.mediaItems.length === 0) && (
                      <div className="p-6 text-center text-xs font-mono text-[#94A3B8] rounded-2xl bg-[#151A23] border border-[#F0F3F6]/05">
                        No media items added yet. Click above to add images or videos.
                      </div>
                    )}

                    <div className="space-y-2 max-h-96 overflow-y-auto pe-1">
                      {(editingProject.mediaItems || []).map((item, index) => {
                        const isVideo = item.type === 'video';
                        const isCover = item.url === editingProject.coverImage;

                        return (
                          <div
                            key={item.id || index}
                            className={`p-3 rounded-2xl bg-[#151A23] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                              isCover ? 'border-[#F59E0B]/50 bg-[#151A23]/90' : 'border-[#F0F3F6]/08'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Order Badge */}
                              <span className="w-6 h-6 rounded-lg bg-[#10141C] border border-[#F0F3F6]/10 text-[11px] font-mono font-bold text-[#94A3B8] flex items-center justify-center flex-shrink-0">
                                #{index + 1}
                              </span>

                              {/* Thumbnail preview */}
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#10141C] border border-[#F0F3F6]/15 flex items-center justify-center flex-shrink-0">
                                {isVideo ? (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 text-amber-400">
                                    <Play className="w-5 h-5 fill-current" />
                                  </div>
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.title || 'media'}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>

                              {/* Info */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                      isVideo
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    }`}
                                  >
                                    {isVideo ? 'VIDEO' : 'IMAGE'}
                                  </span>

                                  {isCover && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F59E0B] text-[#07090D]">
                                      COVER
                                    </span>
                                  )}

                                  <span className="text-xs font-semibold text-[#F0F3F6] truncate">
                                    {item.title || `Media Item ${index + 1}`}
                                  </span>
                                </div>

                                <span className="text-[10px] font-mono text-[#94A3B8] block truncate max-w-sm mt-0.5">
                                  {item.url}
                                </span>
                              </div>
                            </div>

                            {/* Actions: Move Up / Down, Set as Cover, Replace, Remove */}
                            <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                              <div className="flex items-center bg-[#10141C] rounded-lg p-1 border border-[#F0F3F6]/05">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveMediaItem(index, 'up')}
                                  className="p-1 text-[#94A3B8] hover:text-white disabled:opacity-20"
                                  title={t('projects.moveUp')}
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === (editingProject.mediaItems?.length || 0) - 1}
                                  onClick={() => handleMoveMediaItem(index, 'down')}
                                  className="p-1 text-[#94A3B8] hover:text-white disabled:opacity-20"
                                  title={t('projects.moveDown')}
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>

                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={() => handleSetAsCover(item)}
                                  className="px-2.5 py-1 rounded-lg bg-[#10141C] border border-[#F0F3F6]/10 text-[10px] font-mono text-[#94A3B8] hover:text-[#F59E0B] hover:border-[#F59E0B]/30"
                                >
                                  {t('projects.setCover')}
                                </button>
                              )}

                              {/* Replace file input */}
                              <label
                                className="p-1.5 rounded-lg bg-[#10141C] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F59E0B] cursor-pointer"
                                title={t('projects.replace')}
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <input
                                  type="file"
                                  accept={isVideo ? 'video/*' : 'image/*'}
                                  className="hidden"
                                  onChange={(e) => handleReplaceMediaItem(index, e)}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemoveMediaItem(index)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                title={t('projects.removeMedia')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DETAILS & SOFTWARE SKILLS */}
              {activeTab === 'details' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Software Used Matrix */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08 space-y-4">
                    <label className="block text-xs font-mono uppercase text-[#F59E0B] font-bold">
                      {t('projects.toolsUsed')} ({editingProject.tools?.length || 0})
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {centralSkills.map((skill) => {
                        const isSelected =
                          (editingProject.skillIds || []).includes(skill.id) ||
                          (editingProject.tools || []).some(
                            (s) =>
                              s.toLowerCase().trim() === skill.name.toLowerCase().trim() ||
                              s.toLowerCase().trim() === skill.name.toLowerCase().replace(/^adobe\s+/, '').trim()
                          );
                        return (
                          <button
                            type="button"
                            key={skill.id}
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#F59E0B] text-[#07090D] border-[#F59E0B] font-bold shadow'
                                : 'bg-[#10141C] text-[#94A3B8] border-[#F0F3F6]/10 hover:border-[#F0F3F6]/30'
                            }`}
                          >
                            <SoftwareIcon name={skill.name} iconUrl={skill.iconUrl} className="w-4 h-4" />
                            <span>{skill.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        );
                      })}

                      {(editingProject.tools || [])
                        .filter(
                          (tool) =>
                            !centralSkills.some(
                              (s) =>
                                s.name.toLowerCase().trim() === tool.toLowerCase().trim() ||
                                s.name.toLowerCase().trim() === tool.toLowerCase().replace(/^adobe\s+/, '').trim()
                            )
                        )
                        .map((tool) => (
                          <button
                            type="button"
                            key={tool}
                            onClick={() => toggleSkill(tool)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer bg-[#F59E0B] text-[#07090D] border-[#F59E0B] shadow"
                          >
                            <SoftwareIcon name={tool} className="w-4 h-4" />
                            <span>{tool}</span>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0F3F6]/05">
                      <input
                        type="text"
                        placeholder="Add custom software/tool..."
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />

                      <label className="px-2.5 py-1.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F0F3F6]/30 cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingToolIcon ? 'Uploading...' : newSkillIconUrl ? 'Icon Ready' : 'Upload Icon'}</span>
                        <input
                          type="file"
                          accept="image/*,.svg"
                          onChange={handleUploadToolIcon}
                          className="hidden"
                          disabled={uploadingToolIcon}
                        />
                      </label>

                      {newSkillIconUrl && (
                        <div className="w-7 h-7 p-1 rounded-lg bg-[#10141C] border border-[#F59E0B]/30 flex items-center justify-center">
                          <img src={newSkillIconUrl} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAddNewSkill}
                        className="px-3.5 py-1.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 hover:text-[#F59E0B] transition-colors"
                      >
                        + Add Tool
                      </button>
                    </div>
                  </div>

                  {/* Project Tags */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08 space-y-4">
                    <label className="block text-xs font-mono uppercase text-[#F59E0B] font-bold">
                      {t('projects.tags')}
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {(editingProject.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-lg bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] flex items-center gap-1.5"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-[#94A3B8] hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#F0F3F6]/05">
                      <input
                        type="text"
                        placeholder="Add tag (e.g. 3D, Social, Luxury)..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-1.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: EXTERNAL LINKS & DRIVE */}
              {activeTab === 'links' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Google Drive Materials (Prominent) */}
                  <div className="p-4 rounded-2xl bg-[#151A23] border border-emerald-500/20 space-y-2">
                    <label className="block text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-2">
                      <FolderDown className="w-4 h-4" />
                      <span>{t('projects.driveUrl')}</span>
                    </label>
                    <input
                      type="url"
                      value={editingProject.googleDriveMaterialsUrl || editingProject.googleDriveUrl || ''}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          googleDriveMaterialsUrl: e.target.value,
                          googleDriveUrl: e.target.value,
                        })
                      }
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('projects.projectUrl')}
                      </label>
                      <input
                        type="url"
                        value={editingProject.projectUrl || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, projectUrl: e.target.value })
                        }
                        placeholder="https://mywebsite.com/preview"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('projects.behanceUrl')}
                      </label>
                      <input
                        type="url"
                        value={editingProject.behanceUrl || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, behanceUrl: e.target.value })
                        }
                        placeholder="https://behance.net/gallery/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('projects.youtubeUrl')}
                      </label>
                      <input
                        type="url"
                        value={editingProject.youtubeUrl || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, youtubeUrl: e.target.value })
                        }
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('projects.vimeoUrl')}
                      </label>
                      <input
                        type="url"
                        value={editingProject.vimeoUrl || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, vimeoUrl: e.target.value })
                        }
                        placeholder="https://vimeo.com/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PUBLISHING & DISPLAY */}
              {activeTab === 'publishing' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('common.status')}
                      </label>
                      <select
                        value={editingProject.status || 'published'}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            status: e.target.value as Status,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      >
                        <option value="published">{t('common.published')}</option>
                        <option value="draft">{t('common.draft')}</option>
                        <option value="hidden">{t('common.hidden')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1.5">
                        {t('projects.sortOrder')}
                      </label>
                      <input
                        type="number"
                        value={editingProject.sortOrder ?? 1}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            sortOrder: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-3 p-3 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingProject.featured)}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, featured: e.target.checked })
                          }
                          className="w-4 h-4 accent-[#F59E0B]"
                        />
                        <span className="text-xs font-semibold text-[#F0F3F6]">
                          {t('projects.featured')}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Dimension Diagnostics */}
                  <div className="p-4 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/08 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono uppercase text-[#F59E0B] font-bold block">
                        Media Frame Dimensions
                      </span>
                      <span className="text-xs font-mono text-[#94A3B8] mt-0.5 block">
                        {editingProject.width && editingProject.height
                          ? `${editingProject.width} × ${editingProject.height} px • ${editingProject.aspectRatio?.toFixed(3)}:1 (${editingProject.orientation || 'adaptive'})`
                          : 'Dimensions will automatically calculate from uploaded artwork'}
                      </span>
                    </div>

                    {editingProject.coverImage && (
                      <button
                        type="button"
                        onClick={() => autoDetectCoverDimensions(editingProject.coverImage!)}
                        disabled={analyzingMedia}
                        className="px-3.5 py-1.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/15 text-xs font-mono text-[#F0F3F6] hover:border-[#F59E0B]/50 flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${analyzingMedia ? 'animate-spin' : ''}`} />
                        <span>Re-calculate</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Form Bottom Actions */}
              <div className="flex items-center justify-between pt-5 border-t border-[#F0F3F6]/10">
                <div className="text-xs font-mono text-[#94A3B8]">
                  Tab {activeTab.toUpperCase()}
                </div>

                <div className="flex items-center gap-3">
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
