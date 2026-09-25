'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Project, ProjectVideo, Status } from '@/lib/types';
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
  MoveLeft,
  MoveRight,
  Info,
} from 'lucide-react';
import {
  detectMediaDimensionsClient,
  calculateMediaDimensions,
  getRatioLabel,
} from '@/lib/media/dimensions';
import { SoftwareIcon } from '@/components/ui/SoftwareIcon';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [centralSkills, setCentralSkills] = useState<Array<{ id: string; name: string; iconUrl?: string }>>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [analyzingMedia, setAnalyzingMedia] = useState(false);

  // New gallery image URL input state
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // New category / custom skill inputs
  const [newCatInput, setNewCatInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  const fetchProjectsAndData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.data?.projects) {
        setProjects(data.data.projects);
      }

      // Extract skills dynamically from central skill groups (~25+ skills)
      const centralList: Array<{ id: string; name: string; iconUrl?: string }> = [];
      (data.data?.skillGroups || []).forEach((g: any) => {
        (g.skills || []).forEach((s: any) => {
          if (s.name) {
            centralList.push({ id: s.id, name: s.name.trim(), iconUrl: s.iconUrl });
          }
        });
      });
      setCentralSkills(centralList);

      const extractedSkills = Array.from(new Set<string>(centralList.map((s) => s.name)));

      const defaultTools = [
        'Adobe Photoshop',
        'Adobe Illustrator',
        'Adobe After Effects',
        'Adobe Premiere Pro',
        'Adobe InDesign',
        'Lightroom',
        'Cinema 4D',
        'Blender',
        'DaVinci Resolve',
        'Canva',
        'Figma',
      ];

      const combinedSkills = Array.from(new Set([...extractedSkills, ...defaultTools]));
      setAllSkills(combinedSkills);

      // Extract categories dynamically
      const defaultCategories = [
        'Motion Graphics',
        'Graphic Design',
        'Branding',
        'Social Media',
        'Poster Design',
        'Campaign Design',
      ];
      const categoriesFromApi: string[] = data.data?.categories || [];
      const combinedCategories = Array.from(new Set([...defaultCategories, ...categoriesFromApi]));
      setAllCategories(combinedCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndData();
  }, []);

  const openNewProject = () => {
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
      coverImage: '/images/projects/project-lumina-motion.jpg',
      gallery: [],
      images: [],
      videoUrl: '',
      videos: [],
      youtubeUrl: '',
      vimeoUrl: '',
      googleDriveUrl: '',
      googleDriveMaterialsUrl: '',
      behanceUrl: '',
      tools: ['Adobe Photoshop', 'Adobe Illustrator'],
      softwareUsed: ['Adobe Photoshop', 'Adobe Illustrator'],
      projectUrl: '',
      featured: true,
      tags: ['Campaign', 'Design'],
      status: 'published',
      sortOrder: projects.length + 1,
    });
    setGalleryUrlInput('');
    setNewCatInput('');
    setNewSkillInput('');
    setIsModalOpen(true);
  };

  const openEditProject = (p: Project) => {
    const categories =
      p.categories && p.categories.length > 0
        ? p.categories
        : p.category
        ? [p.category]
        : ['Motion Graphics'];

    const gallery = p.gallery || p.images || [];
    const videos: ProjectVideo[] =
      p.videos && p.videos.length > 0
        ? p.videos
        : p.videoUrl
        ? [{ id: 'vid-1', url: p.videoUrl, title: 'Main Reel' }]
        : [];

    const googleDriveMaterialsUrl =
      p.googleDriveMaterialsUrl || p.googleDriveUrl || '';

    setEditingProject({
      ...p,
      categories,
      gallery,
      images: gallery,
      videos,
      googleDriveMaterialsUrl,
      googleDriveUrl: googleDriveMaterialsUrl,
      tools: p.tools || p.softwareUsed || [],
      softwareUsed: p.tools || p.softwareUsed || [],
      client: p.client || p.clientName || '',
      clientName: p.client || p.clientName || '',
    });
    setGalleryUrlInput('');
    setNewCatInput('');
    setNewSkillInput('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setSaving(true);
    setMessage('');

    try {
      // Ensure primary category and videoUrl are synced for backward compatibility
      const categories =
        editingProject.categories && editingProject.categories.length > 0
          ? editingProject.categories
          : [editingProject.category || 'Motion Graphics'];

      const gallery = editingProject.gallery || [];
      const videos = editingProject.videos || [];
      const firstVideoUrl = videos[0]?.url || editingProject.videoUrl || '';
      const driveUrl =
        editingProject.googleDriveMaterialsUrl || editingProject.googleDriveUrl || '';

      const payload: Partial<Project> = {
        ...editingProject,
        category: categories[0],
        categories,
        gallery,
        images: gallery,
        videos,
        videoUrl: firstVideoUrl,
        googleDriveMaterialsUrl: driveUrl,
        googleDriveUrl: driveUrl,
        client: editingProject.client || '',
        clientName: editingProject.client || '',
        tools: editingProject.tools || [],
        softwareUsed: editingProject.tools || [],
      };

      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage('Project saved successfully!');
        setIsModalOpen(false);
        fetchProjectsAndData();
        setTimeout(() => setMessage(''), 4000);
      } else {
        alert('Failed to save project. Please check fields.');
      }
    } catch {
      alert('Network error while saving project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this project?')) return;

    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      }
    } catch {
      alert('Delete failed');
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

  // Upload Cover Image with Smart Frame dimension detection
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
          return next;
        });
      }
    } catch {
      alert('Cover upload failed');
    } finally {
      setUploadingCover(false);
      setAnalyzingMedia(false);
    }
  };

  const autoDetectCoverDimensions = async (url: string) => {
    if (!url || !editingProject) return;
    try {
      const dim = await detectMediaDimensionsClient(url);
      if (dim && dim.width > 0 && dim.height > 0) {
        setEditingProject((prev) => (prev ? { ...prev, ...dim } : prev));
      }
    } catch {
      // ignore
    }
  };

  // --------------------------------------------------------------------------
  // MULTI-IMAGE GALLERY MANAGEMENT
  // --------------------------------------------------------------------------
  const handleAddGalleryImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProject) return;

    setUploadingGallery(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.media?.url) {
          newUrls.push(data.media.url);
        }
      }

      if (newUrls.length > 0) {
        setEditingProject((prev) => {
          if (!prev) return prev;
          const current = prev.gallery || [];
          return {
            ...prev,
            gallery: [...current, ...newUrls],
            images: [...current, ...newUrls],
          };
        });
      }
    } catch {
      alert('Failed to upload gallery images');
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleAddGalleryImageUrl = () => {
    const trimmed = galleryUrlInput.trim();
    if (!trimmed || !editingProject) return;

    const current = editingProject.gallery || [];
    setEditingProject({
      ...editingProject,
      gallery: [...current, trimmed],
      images: [...current, trimmed],
    });
    setGalleryUrlInput('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    if (!editingProject) return;
    const current = [...(editingProject.gallery || [])];
    current.splice(index, 1);
    setEditingProject({
      ...editingProject,
      gallery: current,
      images: current,
    });
  };

  const handleMoveGalleryImage = (index: number, direction: 'left' | 'right') => {
    if (!editingProject) return;
    const current = [...(editingProject.gallery || [])];
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;

    setEditingProject({
      ...editingProject,
      gallery: current,
      images: current,
    });
  };

  const handleMakeCover = async (imgUrl: string) => {
    if (!editingProject) return;
    setEditingProject((prev) => (prev ? { ...prev, coverImage: imgUrl } : prev));
    autoDetectCoverDimensions(imgUrl);
  };

  // --------------------------------------------------------------------------
  // MULTI-VIDEO SHOWCASE MANAGEMENT
  // --------------------------------------------------------------------------
  const handleAddVideo = () => {
    if (!editingProject) return;
    const current = editingProject.videos || [];
    const newVid: ProjectVideo = {
      id: `vid-${Date.now()}-${current.length + 1}`,
      title: `Motion Video ${current.length + 1}`,
      url: '',
      type: 'direct',
    };
    setEditingProject({
      ...editingProject,
      videos: [...current, newVid],
      videoUrl: current.length === 0 ? '' : editingProject.videoUrl,
    });
  };

  const handleUpdateVideo = (index: number, field: keyof ProjectVideo, value: string) => {
    if (!editingProject) return;
    const current = [...(editingProject.videos || [])];
    if (!current[index]) return;
    current[index] = { ...current[index], [field]: value };

    setEditingProject({
      ...editingProject,
      videos: current,
      videoUrl: current[0]?.url || '',
    });
  };

  const handleRemoveVideo = (index: number) => {
    if (!editingProject) return;
    const current = [...(editingProject.videos || [])];
    current.splice(index, 1);
    setEditingProject({
      ...editingProject,
      videos: current,
      videoUrl: current[0]?.url || '',
    });
  };

  const handleMoveVideo = (index: number, direction: 'up' | 'down') => {
    if (!editingProject) return;
    const current = [...(editingProject.videos || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;

    setEditingProject({
      ...editingProject,
      videos: current,
      videoUrl: current[0]?.url || '',
    });
  };

  const handleUploadVideoFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.media?.url) {
        handleUpdateVideo(index, 'url', data.media.url);
      }
    } catch {
      alert('Video upload failed');
    } finally {
      e.target.value = '';
    }
  };

  // --------------------------------------------------------------------------
  // CATEGORIES MULTI-SELECT
  // --------------------------------------------------------------------------
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

  const handleAddNewCategory = async () => {
    const trimmed = newCatInput.trim();
    if (!trimmed || !editingProject) return;

    // Add to allCategories if not exists
    if (!allCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setAllCategories([...allCategories, trimmed]);
      // Persist to central category store
      fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: trimmed }),
      }).catch(console.error);
    }

    // Add to project
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

  // --------------------------------------------------------------------------
  // SOFTWARE / SKILLS MULTI-SELECT
  // --------------------------------------------------------------------------
  const toggleSkill = (skill: string, skillId?: string) => {
    if (!editingProject) return;
    const current = editingProject.tools || [];
    const currentIds = editingProject.skillIds || [];
    const exists = current.some((s) => s.toLowerCase() === skill.toLowerCase());
    let next: string[];
    let nextIds: string[];

    if (exists) {
      next = current.filter((s) => s.toLowerCase() !== skill.toLowerCase());
      nextIds = skillId ? currentIds.filter((id) => id !== skillId) : currentIds;
    } else {
      next = [...current, skill];
      nextIds = skillId && !currentIds.includes(skillId) ? [...currentIds, skillId] : currentIds;
    }

    setEditingProject({
      ...editingProject,
      tools: next,
      softwareUsed: next,
      skillIds: nextIds,
    });
  };

  const handleAddNewSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed || !editingProject) return;

    if (!allSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setAllSkills([...allSkills, trimmed]);
    }

    const current = editingProject.tools || [];
    if (!current.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      const next = [...current, trimmed];
      setEditingProject({
        ...editingProject,
        tools: next,
        softwareUsed: next,
      });
    }
    setNewSkillInput('');
  };

  if (loading) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading Projects...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            Projects CMS & Showcase
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Manage complete multi-media creative campaigns, galleries, videos, and dynamic categories.
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
            onClick={openNewProject}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Campaign / Project</span>
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {projects.map((project, idx) => (
          <div
            key={project.id}
            className="p-4 sm:p-5 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#F59E0B]/40 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Media Thumbnail */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#151A23] border border-[#F0F3F6]/10 flex-shrink-0">
                <Image
                  src={project.coverImage || '/images/projects/project-lumina-motion.jpg'}
                  alt={project.title}
                  fill
                  className="object-cover"
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
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#F0F3F6] truncate">
                  {project.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] font-mono mt-1">
                  <span>{project.client || 'Personal Project'}</span>
                  <span>•</span>
                  <span>{project.projectDate}</span>
                  {project.gallery && project.gallery.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-[#F0F3F6]">
                        {project.gallery.length} Stills
                      </span>
                    </>
                  )}
                  {project.videos && project.videos.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-[#F59E0B]">
                        {project.videos.length} Videos
                      </span>
                    </>
                  )}
                  {(project.googleDriveMaterialsUrl || project.googleDriveUrl) && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">Drive Materials</span>
                    </>
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
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={idx === projects.length - 1}
                  onClick={() => moveOrder(idx, 'down')}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white disabled:opacity-30"
                  title="Move Down"
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
                title="View Case Study"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Edit */}
              <button
                onClick={() => openEditProject(project)}
                className="p-2.5 rounded-xl bg-[#151A23] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                title="Edit Project"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(project.id)}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Project Modal */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-[#07090D]/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl my-8 bg-[#10141C] border border-[#F0F3F6]/15 rounded-3xl p-6 sm:p-10 shadow-2xl max-h-[92vh] overflow-y-auto space-y-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-6 border-b border-[#F0F3F6]/10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#F0F3F6]">
                  {editingProject.title ? `Edit: ${editingProject.title}` : 'Add New Campaign Project'}
                </h2>
                <p className="text-xs text-[#94A3B8] font-mono mt-1">
                  Complete Project & Campaign Management — Multi-Image, Multi-Video, Multi-Category
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 rounded-2xl bg-[#151A23] text-[#94A3B8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-10">
              {/* SECTION 1: PROJECT INFORMATION */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-[#F0F3F6]/10 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                    1. Project Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                      Project Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.title || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, title: e.target.value })
                      }
                      placeholder="Dr. Hazem Clinic Social Campaign"
                      className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                      Project Name (Arabic)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={editingProject.titleAr || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, titleAr: e.target.value })
                      }
                      placeholder="عيادة د. حازم محمود — حملة سوشيال ميديا"
                      className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                      Slug (URL Key) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.slug || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, slug: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={editingProject.client || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, client: e.target.value, clientName: e.target.value })
                      }
                      placeholder="Dr. Hazem Mahmoud Clinic"
                      className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                      Project Date / Year
                    </label>
                    <input
                      type="text"
                      value={editingProject.projectDate || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, projectDate: e.target.value })
                      }
                      placeholder="2024"
                      className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                      Publication Status
                    </label>
                    <select
                      value={editingProject.status || 'published'}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          status: e.target.value as Status,
                        })
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#F0F3F6]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProject.featured)}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, featured: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#F59E0B] focus:ring-0"
                    />
                    <span>Highlight as Featured Case Study on Portfolio Homepage</span>
                  </label>
                </div>
              </div>

              {/* SECTION 2: DYNAMIC CATEGORIES (MULTI-SELECT) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0F3F6]/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#F59E0B]" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                      2. Categories (Multi-Select)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#94A3B8]">
                    Select all disciplines that apply to this campaign
                  </span>
                </div>

                {/* Selected Category Chips */}
                <div className="flex flex-wrap items-center gap-2 min-h-[38px] p-3 rounded-2xl bg-[#151A23]/50 border border-[#F0F3F6]/10">
                  {editingProject.categories && editingProject.categories.length > 0 ? (
                    editingProject.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#F59E0B]/20 to-[#FF7A18]/20 border border-[#F59E0B]/40 text-xs font-semibold text-[#F0F3F6]"
                      >
                        <span>{cat}</span>
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className="hover:text-red-400 transition-colors p-0.5"
                          title="Remove category"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-mono text-[#94A3B8]/60">
                      No categories selected yet. Choose from below or add a new one.
                    </span>
                  )}
                </div>

                {/* Available Categories Selector */}
                <div className="p-4 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#94A3B8] uppercase">
                      Select Available Categories:
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => {
                      const isSelected = editingProject.categories?.some(
                        (c) => c.toLowerCase() === cat.toLowerCase()
                      );
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#F59E0B] text-[#07090D] font-bold shadow-md'
                              : 'bg-[#10141C] text-[#94A3B8] border border-[#F0F3F6]/10 hover:text-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{cat}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add New Category On The Fly */}
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewCategory();
                        }
                      }}
                      placeholder="Add new category (e.g. Campaign Design, Poster Design)..."
                      className="flex-1 px-4 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="px-4 py-2 rounded-xl bg-[#10141C] border border-[#F59E0B]/30 text-xs font-semibold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                    >
                      + Add Category
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: DYNAMIC SOFTWARE / SKILLS USED (MULTI-SELECT) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0F3F6]/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#F59E0B]" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                      3. Software Used / Skills (Multi-Select)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#94A3B8]">
                    Dynamic from portfolio skills (~25 available)
                  </span>
                </div>

                {/* Selected Software Chips */}
                <div className="flex flex-wrap items-center gap-2 min-h-[38px] p-3 rounded-2xl bg-[#151A23]/50 border border-[#F0F3F6]/10">
                  {editingProject.tools && editingProject.tools.length > 0 ? (
                    editingProject.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10141C] border border-[#F0F3F6]/15 text-xs font-medium text-[#F0F3F6]"
                      >
                        <SoftwareIcon name={tool} className="w-3.5 h-3.5" />
                        <span>{tool}</span>
                        <button
                          type="button"
                          onClick={() => toggleSkill(tool)}
                          className="hover:text-red-400 transition-colors p-0.5 ml-0.5"
                          title="Remove software"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-mono text-[#94A3B8]/60">
                      No software selected yet. Choose from below or add custom.
                    </span>
                  )}
                </div>

                {/* Available Software Checklist */}
                <div className="p-4 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-mono text-[#94A3B8] uppercase">
                      Select Software / Competencies:
                    </span>
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search software..."
                      className="px-3 py-1 rounded-lg bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] max-w-[200px]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
                    {allSkills
                      .filter((s) => s.toLowerCase().includes(skillSearch.toLowerCase()))
                      .map((skill) => {
                        const isSelected = editingProject.tools?.some(
                          (t) => t.toLowerCase() === skill.toLowerCase()
                        );
                        const matched = centralSkills.find(
                          (cs) => cs.name.toLowerCase() === skill.toLowerCase()
                        );
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill, matched?.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#F59E0B] text-[#07090D] font-bold shadow-md'
                                : 'bg-[#10141C] text-[#94A3B8] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/30 hover:text-white'
                            }`}
                          >
                            <SoftwareIcon
                              name={skill}
                              iconUrl={matched?.iconUrl}
                              className="w-3.5 h-3.5"
                            />
                            <span>{skill}</span>
                            {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                  </div>

                  {/* Add Custom Software */}
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewSkill();
                        }
                      }}
                      placeholder="Add custom software or skill (e.g. DaVinci Resolve, Octane)..."
                      className="flex-1 px-4 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewSkill}
                      className="px-4 py-2 rounded-xl bg-[#10141C] border border-[#F59E0B]/30 text-xs font-semibold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                    >
                      + Add Tool
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 4: MEDIA MANAGEMENT — IMAGES & VIDEOS */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#F0F3F6]/10 pb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#F59E0B]" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                      4. Media Management (Mixed Media Campaign)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#94A3B8]">
                    Supports multiple images AND multiple videos simultaneously
                  </span>
                </div>

                {/* 4.A COVER IMAGE (Primary Visual with Smart Frame Auto-Detection) */}
                <div className="p-5 rounded-3xl bg-[#151A23]/60 border border-[#F0F3F6]/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#F0F3F6]">
                        Project Cover Visual (Main Artwork)
                      </h4>
                      <p className="text-xs text-[#94A3B8]">
                        The hero visual for cards and case study presentation
                      </p>
                    </div>

                    {editingProject.width && editingProject.height ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10141C] border border-[#F59E0B]/30 text-xs font-mono text-[#F59E0B]">
                        <span>{editingProject.width} × {editingProject.height}</span>
                        <span>•</span>
                        <span>{getRatioLabel(editingProject.width, editingProject.height)}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={editingProject.coverImage || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, coverImage: e.target.value })
                      }
                      onBlur={(e) => autoDetectCoverDimensions(e.target.value)}
                      placeholder="/images/projects/your-artwork.jpg"
                      className="flex-1 px-4 py-3 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                    />
                    <label className="cursor-pointer px-5 py-3 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/10 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] flex items-center gap-1.5 text-xs font-semibold transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingCover ? 'Detecting...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Adaptive Smart Frame Preview */}
                  {editingProject.coverImage && (
                    <div
                      className="relative mx-auto rounded-2xl overflow-hidden bg-[#10141C] border border-[#F0F3F6]/10 flex items-center justify-center shadow-lg"
                      style={{
                        width: '100%',
                        maxWidth:
                          editingProject.aspectRatio && editingProject.aspectRatio < 0.9
                            ? '260px'
                            : '480px',
                        aspectRatio: editingProject.aspectRatio ? `${editingProject.aspectRatio}` : '16/9',
                        maxHeight: '320px',
                      }}
                    >
                      <img
                        src={editingProject.coverImage}
                        alt="Cover Preview"
                        className="w-full h-full object-contain"
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          if (
                            img.naturalWidth > 0 &&
                            img.naturalHeight > 0 &&
                            (!editingProject.width || !editingProject.height)
                          ) {
                            const dim = calculateMediaDimensions(img.naturalWidth, img.naturalHeight);
                            setEditingProject((prev) => (prev ? { ...prev, ...dim } : prev));
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 4.B MULTIPLE IMAGES GALLERY (Unlimited Images) */}
                <div className="p-5 rounded-3xl bg-[#151A23]/60 border border-[#F0F3F6]/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#F0F3F6] flex items-center gap-2">
                        <span>Campaign Images Gallery</span>
                        <span className="text-xs font-mono text-[#F59E0B] px-2 py-0.5 rounded-full bg-[#10141C]">
                          {editingProject.gallery?.length || 0} Images
                        </span>
                      </h4>
                      <p className="text-xs text-[#94A3B8]">
                        Posters, story designs, variations, branding assets (supports unlimited images)
                      </p>
                    </div>

                    {/* Upload Multiple Images Button */}
                    <label className="cursor-pointer px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all self-start sm:self-auto">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingGallery ? 'Uploading...' : '+ Upload Images'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleAddGalleryImagesUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Add Image by URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={galleryUrlInput}
                      onChange={(e) => setGalleryUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddGalleryImageUrl();
                        }
                      }}
                      placeholder="Paste image URL (e.g. /images/projects/... or https://...) and click Add..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryImageUrl}
                      className="px-4 py-2.5 rounded-xl bg-[#10141C] border border-[#F59E0B]/30 text-xs font-semibold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                    >
                      + Add Image
                    </button>
                  </div>

                  {/* Gallery Thumbnails Grid */}
                  {editingProject.gallery && editingProject.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                      {editingProject.gallery.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-2xl overflow-hidden bg-[#10141C] border border-[#F0F3F6]/10 aspect-square flex flex-col justify-between p-2 shadow-md hover:border-[#F59E0B]/50 transition-all"
                        >
                          <img
                            src={imgUrl}
                            alt={`Gallery item ${idx + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#07090D]/90 via-[#07090D]/30 to-transparent pointer-events-none" />

                          {/* Top Controls */}
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md bg-[#07090D]/80 text-[10px] font-mono text-[#F0F3F6]">
                              #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="p-1 rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                              title="Delete Image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Bottom Controls */}
                          <div className="relative z-10 flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveGalleryImage(idx, 'left')}
                                className="p-1 rounded bg-[#151A23]/80 text-[#94A3B8] hover:text-white disabled:opacity-30"
                                title="Move Left"
                              >
                                <MoveLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (editingProject.gallery?.length || 0) - 1}
                                onClick={() => handleMoveGalleryImage(idx, 'right')}
                                className="p-1 rounded bg-[#151A23]/80 text-[#94A3B8] hover:text-white disabled:opacity-30"
                                title="Move Right"
                              >
                                <MoveRight className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleMakeCover(imgUrl)}
                              className="px-2 py-1 rounded bg-[#F59E0B]/90 text-[#07090D] text-[10px] font-bold hover:bg-[#F59E0B] transition-colors"
                              title="Set as Cover Image"
                            >
                              Make Cover
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-[#10141C] border border-dashed border-[#F0F3F6]/15 text-center text-xs font-mono text-[#94A3B8]">
                      No additional gallery images added yet. Click &quot;+ Upload Images&quot; or enter a URL above.
                    </div>
                  )}
                </div>

                {/* 4.C MULTIPLE VIDEOS SHOWCASE (Unlimited Videos) */}
                <div className="p-5 rounded-3xl bg-[#151A23]/60 border border-[#F0F3F6]/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#F0F3F6] flex items-center gap-2">
                        <Film className="w-4 h-4 text-[#F59E0B]" />
                        <span>Campaign Videos & Reels</span>
                        <span className="text-xs font-mono text-[#F59E0B] px-2 py-0.5 rounded-full bg-[#10141C]">
                          {editingProject.videos?.length || 0} Videos
                        </span>
                      </h4>
                      <p className="text-xs text-[#94A3B8]">
                        Add multiple motion videos, YouTube links, Vimeo showcases, or MP4 uploads
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="px-4 py-2.5 rounded-2xl bg-[#10141C] border border-[#F59E0B]/30 text-xs font-bold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Video Entry</span>
                    </button>
                  </div>

                  {/* Video Entries List */}
                  {editingProject.videos && editingProject.videos.length > 0 ? (
                    <div className="space-y-3">
                      {editingProject.videos.map((vid, idx) => (
                        <div
                          key={vid.id || idx}
                          className="p-4 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/10 space-y-3 shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-[#F59E0B] font-bold">
                              Video #{idx + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveVideo(idx, 'up')}
                                className="p-1 rounded text-[#94A3B8] hover:text-white disabled:opacity-30"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (editingProject.videos?.length || 0) - 1}
                                onClick={() => handleMoveVideo(idx, 'down')}
                                className="p-1 rounded text-[#94A3B8] hover:text-white disabled:opacity-30"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveVideo(idx)}
                                className="p-1 rounded text-red-400 hover:text-red-300 ml-2"
                                title="Remove Video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-4">
                              <input
                                type="text"
                                value={vid.title || ''}
                                onChange={(e) => handleUpdateVideo(idx, 'title', e.target.value)}
                                placeholder="Video Label (e.g. Motion Reel 01)"
                                className="w-full px-3 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                              />
                            </div>

                            <div className="sm:col-span-8 flex gap-2">
                              <input
                                type="text"
                                value={vid.url || ''}
                                onChange={(e) => handleUpdateVideo(idx, 'url', e.target.value)}
                                placeholder="YouTube / Vimeo / MP4 URL"
                                className="flex-1 px-3 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                              />
                              <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] flex items-center gap-1 text-xs font-semibold transition-colors">
                                <Upload className="w-3 h-3" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => handleUploadVideoFile(e, idx)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-[#10141C] border border-dashed border-[#F0F3F6]/15 text-center text-xs font-mono text-[#94A3B8]">
                      No video items added to this project yet. Click &quot;+ Add Video Entry&quot; to add motion reels.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 5: EXTERNAL LINKS & PROJECT MATERIALS */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-[#F0F3F6]/10 pb-2">
                  <FolderDown className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                    5. Project Materials & External Showcase Links
                  </h3>
                </div>

                {/* Google Drive Materials Link (Crucial Requirement) */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#151A23] to-[#10141C] border border-[#F59E0B]/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                    <label className="block text-xs font-mono uppercase text-[#F0F3F6] font-bold">
                      Google Drive Materials Link
                    </label>
                  </div>
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
                    className="w-full px-4 py-3 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:border-[#F59E0B]"
                  />
                  <p className="text-[11px] text-[#94A3B8] font-mono leading-relaxed">
                    Provides direct access to all original designs, Photoshop files, Illustrator files, After Effects files, exports, and materials. Clicking the public button will open this folder directly in a new tab.
                  </p>
                </div>

                {/* Behance, YouTube, Vimeo, Project URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                      Behance URL
                    </label>
                    <input
                      type="text"
                      value={editingProject.behanceUrl || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, behanceUrl: e.target.value })
                      }
                      placeholder="https://behance.net/gallery/..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                      Vimeo Showcase
                    </label>
                    <input
                      type="text"
                      value={editingProject.vimeoUrl || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, vimeoUrl: e.target.value })
                      }
                      placeholder="https://vimeo.com/..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                      YouTube URL
                    </label>
                    <input
                      type="text"
                      value={editingProject.youtubeUrl || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, youtubeUrl: e.target.value })
                      }
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                      Live Project / Demo URL
                    </label>
                    <input
                      type="text"
                      value={editingProject.projectUrl || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, projectUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: CASE STUDY DESCRIPTION */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-[#F0F3F6]/10 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                    6. Case Study Narrative & Description
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                    Description (English) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editingProject.description || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, description: e.target.value })
                    }
                    placeholder="Comprehensive overview of the campaign objectives, design language, and deliverables..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                    Description (Arabic)
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={editingProject.descriptionAr || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, descriptionAr: e.target.value })
                    }
                    placeholder="تفاصيل الحملة وأهدافها والحلول الإبداعية..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#F0F3F6]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-full bg-[#151A23] text-xs font-semibold text-[#94A3B8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_24px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Project...' : 'Save & Publish Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
