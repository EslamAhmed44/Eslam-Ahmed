'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Project, Status } from '@/lib/types';
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
} from 'lucide-react';
import {
  detectMediaDimensionsClient,
  calculateMediaDimensions,
  getRatioLabel,
} from '@/lib/media/dimensions';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [analyzingMedia, setAnalyzingMedia] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.data?.projects) {
        setProjects(data.data.projects);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openNewProject = () => {
    setEditingProject({
      id: `proj-${Date.now()}`,
      slug: `project-${Date.now()}`,
      title: '',
      titleAr: '',
      category: 'Motion Graphics',
      description: '',
      descriptionAr: '',
      client: '',
      projectDate: new Date().getFullYear().toString(),
      coverImage: '/images/projects/project-lumina-motion.jpg',
      gallery: [],
      videoUrl: '',
      youtubeUrl: '',
      vimeoUrl: '',
      googleDriveUrl: '',
      behanceUrl: '',
      tools: ['After Effects', 'Premiere Pro'],
      projectUrl: '',
      featured: true,
      tags: ['Motion', 'Cinematic'],
      status: 'published',
      sortOrder: projects.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditProject = (p: Project) => {
    setEditingProject({ ...p });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      });
      if (res.ok) {
        setMessage('Project saved successfully!');
        setIsModalOpen(false);
        fetchProjects();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch {
      alert('Failed to save project');
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

  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'coverImage' | 'videoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    if (field === 'coverImage') setUploadingCover(true);
    if (field === 'videoUrl') setUploadingVideo(true);
    setAnalyzingMedia(true);

    try {
      // 1. Instantly read actual dimensions from client file
      const clientDim = await detectMediaDimensionsClient(file);

      // 2. Upload file to server
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
          const next = { ...prev, [field]: data.media.url };
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
      alert('Upload failed');
    } finally {
      if (field === 'coverImage') setUploadingCover(false);
      if (field === 'videoUrl') setUploadingVideo(false);
      setAnalyzingMedia(false);
    }
  };

  const autoDetectUrlDimensions = async (url: string) => {
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
            Create, edit, reorder, and manage draft/published states for your portfolio projects.
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
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Projects List / Table */}
      <div className="space-y-3">
        {projects.map((project, idx) => (
          <div
            key={project.id}
            className="p-5 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#F59E0B]/30 transition-all"
          >
            {/* Left: Thumbnail & Details */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-[#151A23] border border-[#F0F3F6]/10 flex-shrink-0">
                <Image
                  src={project.coverImage || '/images/projects/project-lumina-motion.jpg'}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-[#F0F3F6]">{project.title}</h3>
                  {project.featured && (
                    <span className="p-1 rounded bg-[#F59E0B]/10 text-[#F59E0B]" title="Featured">
                      <Star className="w-3 h-3 fill-current" />
                    </span>
                  )}
                  {project.videoUrl && (
                    <span className="p-1 rounded bg-[#151A23] text-[#F59E0B]" title="Has Video">
                      <Play className="w-3 h-3 fill-current" />
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
                  <span className="px-2 py-0.5 rounded bg-[#151A23] font-mono">
                    {project.category}
                  </span>
                  <span>•</span>
                  {project.width && project.height ? (
                    <>
                      <span className="px-2 py-0.5 rounded bg-[#151A23] border border-[#F59E0B]/30 text-[#F59E0B] font-mono text-[11px]">
                        {getRatioLabel(project.width, project.height).split(' ')[0]} ({project.orientation})
                      </span>
                      <span>•</span>
                    </>
                  ) : null}
                  <span>{project.client || 'Creative'}</span>
                  <span>•</span>
                  <span>{project.projectDate}</span>
                </div>
              </div>
            </div>

            {/* Right: Status & Actions */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* Order Controls */}
              <div className="flex items-center gap-1 bg-[#151A23] p-1 rounded-xl border border-[#F0F3F6]/05">
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
        <div className="fixed inset-0 z-50 bg-[#07090D]/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-3xl my-8 bg-[#10141C] border border-[#F0F3F6]/15 rounded-3xl p-6 sm:p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-6 border-b border-[#F0F3F6]/10 mb-8">
              <h2 className="text-2xl font-black text-[#F0F3F6]">
                {editingProject.title ? `Edit: ${editingProject.title}` : 'Add New Project'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-[#151A23] text-[#94A3B8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                    Project Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
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
                    onChange={(e) => setEditingProject({ ...editingProject, titleAr: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                    Slug (URL Key)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.slug || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                    Category
                  </label>
                  <select
                    value={editingProject.category || 'Motion Graphics'}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                  >
                    <option value="Motion Graphics">Motion Graphics</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Branding">Branding</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                  Description (English)
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.description || ''}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
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
                  className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
              </div>

              {/* Cover Image & Video Upload with Automatic Media Detection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                    Cover Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={editingProject.coverImage || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, coverImage: e.target.value })
                      }
                      onBlur={(e) => autoDetectUrlDimensions(e.target.value)}
                      placeholder="/images/projects/your-artwork.jpg"
                      className="flex-1 px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                    />
                    <label className="cursor-pointer px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] flex items-center gap-1.5 text-xs font-semibold transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingCover ? 'Detecting...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleMediaUpload(e, 'coverImage')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                    Direct Video / Reel (MP4)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingProject.videoUrl || ''}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, videoUrl: e.target.value })
                      }
                      onBlur={(e) => autoDetectUrlDimensions(e.target.value)}
                      placeholder="https://.../reel.mp4"
                      className="flex-1 px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                    />
                    <label className="cursor-pointer px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] flex items-center gap-1.5 text-xs font-semibold transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingVideo ? 'Detecting...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleMediaUpload(e, 'videoUrl')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Automatic Media Frame Preview (Calculated Automatically from Media — Zero Cropping) */}
              {(editingProject.coverImage || editingProject.videoUrl) && (
                <div className="p-5 rounded-3xl bg-[#07090D] border border-[#F0F3F6]/10 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-wider text-[#F0F3F6] font-bold">
                        Smart Frame Auto-Detection
                      </span>
                    </div>

                    {editingProject.width && editingProject.height ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#151A23] border border-[#F59E0B]/30 text-xs font-mono text-[#F59E0B]">
                        <span>{editingProject.width} × {editingProject.height}</span>
                        <span>•</span>
                        <span>{getRatioLabel(editingProject.width, editingProject.height)}</span>
                        <span>•</span>
                        <span className="capitalize">{editingProject.orientation}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-[#94A3B8]">
                        {analyzingMedia ? 'Analyzing dimensions from media...' : 'Auto-detecting...'}
                      </span>
                    )}
                  </div>

                  {/* Adaptive Preview Frame (Sizes dynamically to match detected media ratio) */}
                  <div
                    className="relative mx-auto rounded-2xl overflow-hidden bg-[#10141C] border border-[#F0F3F6]/10 flex items-center justify-center shadow-2xl transition-all duration-300"
                    style={{
                      width: '100%',
                      maxWidth:
                        editingProject.aspectRatio && editingProject.aspectRatio < 0.9
                          ? '280px'
                          : editingProject.aspectRatio && Math.abs(editingProject.aspectRatio - 1) < 0.1
                          ? '380px'
                          : '560px',
                      aspectRatio: editingProject.aspectRatio ? `${editingProject.aspectRatio}` : '16/9',
                      maxHeight: '380px',
                    }}
                  >
                    {/* Ambient Glow */}
                    <div
                      className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none"
                      style={{ backgroundImage: `url(${editingProject.coverImage})` }}
                    />

                    {editingProject.videoUrl ? (
                      <video
                        src={editingProject.videoUrl}
                        poster={editingProject.coverImage}
                        controls
                        muted
                        playsInline
                        className="relative z-10 w-full h-full max-h-[380px] object-contain rounded-2xl"
                        onLoadedMetadata={(e) => {
                          const v = e.currentTarget;
                          if (v.videoWidth > 0 && v.videoHeight > 0 && (!editingProject.width || !editingProject.height)) {
                            const dim = calculateMediaDimensions(v.videoWidth, v.videoHeight);
                            setEditingProject((prev) => (prev ? { ...prev, ...dim } : prev));
                          }
                        }}
                      />
                    ) : (
                      <img
                        src={editingProject.coverImage}
                        alt="Smart Frame Preview"
                        className="relative z-10 w-full h-full max-h-[380px] object-contain rounded-2xl"
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          if (img.naturalWidth > 0 && img.naturalHeight > 0 && (!editingProject.width || !editingProject.height)) {
                            const dim = calculateMediaDimensions(img.naturalWidth, img.naturalHeight);
                            setEditingProject((prev) => (prev ? { ...prev, ...dim } : prev));
                          }
                        }}
                      />
                    )}
                  </div>

                  <p className="text-[11px] text-[#94A3B8]/70 text-center mt-3 font-mono">
                    Frame dimensions detected automatically • Complete original artwork preserved with zero cropping
                  </p>
                </div>
              )}

              {/* External Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                    Vimeo URL
                  </label>
                  <input
                    type="text"
                    value={editingProject.vimeoUrl || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, vimeoUrl: e.target.value })
                    }
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
                    className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                  />
                </div>
              </div>

              {/* Meta & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={editingProject.client || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, client: e.target.value })
                    }
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

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#F0F3F6]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProject.featured)}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, featured: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#F59E0B] focus:ring-0"
                    />
                    <span>Featured Case Study</span>
                  </label>
                </div>
              </div>

              {/* Tools & Tags */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                  Tools Used (Comma separated)
                </label>
                <input
                  type="text"
                  value={editingProject.tools?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      tools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="After Effects, Cinema 4D, Octane Render"
                  className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F3F6]/10">
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
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save & Publish Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
