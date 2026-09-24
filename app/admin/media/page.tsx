'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MediaFile } from '@/lib/types';
import {
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  FileText,
  Video,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (data.data?.media) {
        setMedia(data.data.media);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append('file', files[i]);
      try {
        await fetch('/api/upload', { method: 'POST', body: fd });
      } catch (err) {
        console.error('File upload failed:', err);
      }
    }
    setUploading(false);
    fetchMedia();
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMedia(media.filter((m) => m.id !== id));
      }
    } catch {
      alert('Delete failed');
    }
  };

  const filtered = media.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            Media Library & Assets
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Upload images, video reels, and PDF CVs. Copy URLs directly into project forms.
          </p>
        </div>

        {/* Upload Trigger */}
        <label className="cursor-pointer px-6 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Transmitting File...' : 'Upload Media Asset'}</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
          />
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute start-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['all', 'image', 'video', 'pdf'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                filterType === type
                  ? 'bg-[#F59E0B] text-[#07090D]'
                  : 'text-[#94A3B8] hover:text-[#F0F3F6] bg-[#151A23]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-sm font-mono text-[#94A3B8]">Loading Assets...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 hover:border-[#F59E0B]/40 transition-all flex flex-col justify-between group"
            >
              {/* Preview Thumbnail */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#151A23] mb-3 flex items-center justify-center">
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="220px"
                  />
                ) : item.type === 'video' ? (
                  <div className="flex flex-col items-center gap-1 text-[#F59E0B]">
                    <Video className="w-8 h-8" />
                    <span className="text-[10px] font-mono">Video Reel</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-[#F59E0B]">
                    <FileText className="w-8 h-8" />
                    <span className="text-[10px] font-mono">PDF Doc</span>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div>
                <p className="text-xs font-semibold text-[#F0F3F6] truncate mb-1" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] mb-3">
                  <span className="uppercase">{item.type}</span>
                  <span>{Math.round(item.sizeBytes / 1024)} KB</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#F0F3F6]/05">
                  <button
                    onClick={() => copyUrl(item.id, item.url)}
                    className="flex-1 py-1.5 rounded-xl bg-[#151A23] hover:bg-[#F59E0B] hover:text-[#07090D] text-[11px] font-semibold text-[#F0F3F6] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    className="p-2 rounded-xl bg-[#151A23] text-[#94A3B8] hover:text-white"
                    title="Open File"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-3xl bg-[#10141C] border border-dashed border-[#F0F3F6]/15 text-center">
          <p className="text-sm font-mono text-[#94A3B8]">No media assets match your query.</p>
        </div>
      )}
    </div>
  );
}
