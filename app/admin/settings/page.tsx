'use client';

import React, { useEffect, useState } from 'react';
import { SiteSettings, SocialLink } from '@/lib/types';
import {
  Save,
  CheckCircle2,
  Settings,
  Upload,
  Globe,
  MousePointer,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);

  useEffect(() => {
    fetch('/api/admin/data')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setSettings(res.data.settings);
          setSocialLinks(res.data.socialLinks || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploadingCv(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.media?.url) {
        setSettings({ ...settings, cvUrl: data.media.url });
      }
    } catch {
      alert('CV upload failed');
    } finally {
      setUploadingCv(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage('Site settings & SEO updated successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addSocial = () => {
    const newLink: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: 'Platform',
      url: 'https://',
      icon: 'Globe',
      sortOrder: socialLinks.length + 1,
      isActive: true,
    };
    setSocialLinks([...socialLinks, newLink]);
  };

  const saveSocial = async (link: SocialLink) => {
    await fetch('/api/admin/social-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    });
  };

  const deleteSocial = async (id: string) => {
    if (!confirm('Remove this social link?')) return;
    await fetch(`/api/admin/social-links?id=${id}`, { method: 'DELETE' });
    setSocialLinks(socialLinks.filter((s) => s.id !== id));
  };

  if (loading || !settings) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading Settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            Site Settings & SEO
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Configure global site metadata, CV file, custom cursor, and social channels.
          </p>
        </div>

        {message && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SEO Metadata */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <h2 className="text-lg font-bold text-[#F0F3F6] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#F59E0B]" />
            <span>Search Engine Optimization (SEO)</span>
          </h2>

          <div>
            <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
              Website Meta Title
            </label>
            <input
              type="text"
              required
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
              Meta Description
            </label>
            <textarea
              rows={3}
              required
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
              SEO Keywords (Comma separated)
            </label>
            <input
              type="text"
              value={settings.seoKeywords}
              onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
            />
          </div>
        </div>

        {/* CV & Interactive Cursor */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <h2 className="text-lg font-bold text-[#F0F3F6] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            <span>CV Document & Portfolio Download</span>
          </h2>

          <div className="max-w-xl">
            <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
              Active CV Document URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.cvUrl}
                onChange={(e) => setSettings({ ...settings, cvUrl: e.target.value })}
                className="flex-1 px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
              />
              <label className="cursor-pointer px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-[#F59E0B] flex items-center gap-1.5 text-xs font-semibold">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingCv ? '...' : 'Upload CV'}</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleCvUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Contact Channels */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <h2 className="text-lg font-bold text-[#F0F3F6]">Primary Contact Channels</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Direct Email
              </label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                LinkedIn Profile URL
              </label>
              <input
                type="text"
                required
                value={settings.linkedinUrl}
                onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
              />
            </div>
          </div>
        </div>

        {/* Social Platforms Manager */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F0F3F6]">Social Media Platforms</h2>
              <p className="text-xs text-[#94A3B8]">Managed platforms appearing in Hero & Contact.</p>
            </div>
            <button
              type="button"
              onClick={addSocial}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F59E0B]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Social Link</span>
            </button>
          </div>

          <div className="space-y-3">
            {socialLinks.map((soc, idx) => (
              <div
                key={soc.id}
                className="p-4 rounded-2xl bg-[#151A23]/60 border border-[#F0F3F6]/05 flex flex-col sm:flex-row items-center gap-4"
              >
                <input
                  type="text"
                  placeholder="Platform Name"
                  value={soc.platform}
                  onChange={(e) => {
                    const updated = [...socialLinks];
                    updated[idx].platform = e.target.value;
                    setSocialLinks(updated);
                  }}
                  className="w-full sm:w-44 px-3 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                />
                <input
                  type="text"
                  placeholder="https://..."
                  value={soc.url}
                  onChange={(e) => {
                    const updated = [...socialLinks];
                    updated[idx].url = e.target.value;
                    setSocialLinks(updated);
                  }}
                  className="flex-1 w-full px-3 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                />
                <button
                  type="button"
                  onClick={() => saveSocial(soc)}
                  className="px-4 py-2 rounded-xl bg-[#151A23] text-xs font-semibold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => deleteSocial(soc.id)}
                  className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_24px_rgba(245,158,11,0.35)] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Site Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
