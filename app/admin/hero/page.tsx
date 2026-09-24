'use client';

import React, { useEffect, useState } from 'react';
import { SiteSettings } from '@/lib/types';
import { Save, Plus, Trash2, CheckCircle2, Sparkles, Upload } from 'lucide-react';

export default function AdminHeroPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/data')
      .then((r) => r.json())
      .then((res) => {
        if (res.data?.settings) {
          setSettings(res.data.settings);
        }
      })
      .finally(() => setLoading(false));
  }, []);

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
        setMessage('Hero settings saved successfully! Live website updated.');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.media?.url) {
        setSettings({ ...settings, ogImageUrl: data.media.url });
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addRole = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      rotatingRoles: [...settings.rotatingRoles, 'New Motion Role'],
      rotatingRolesAr: [...settings.rotatingRolesAr, 'تخصص جديد'],
    });
  };

  const removeRole = (index: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      rotatingRoles: settings.rotatingRoles.filter((_, i) => i !== index),
      rotatingRolesAr: settings.rotatingRolesAr.filter((_, i) => i !== index),
    });
  };

  if (loading || !settings) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading Hero Settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            Hero Section CMS
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Manage your headline, titles, rotating roles, and profile imagery.
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
        {/* Name & Headline English / Arabic */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <h2 className="text-lg font-bold text-[#F0F3F6] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span>Headline & Designer Name</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Designer Name (English)
              </label>
              <input
                type="text"
                value={settings.designerName}
                onChange={(e) => setSettings({ ...settings, designerName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Designer Name (Arabic)
              </label>
              <input
                type="text"
                dir="rtl"
                value={settings.designerNameAr}
                onChange={(e) => setSettings({ ...settings, designerNameAr: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Hero Greeting (English)
              </label>
              <input
                type="text"
                value={settings.heroHeadline}
                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Hero Greeting (Arabic)
              </label>
              <input
                type="text"
                dir="rtl"
                value={settings.heroHeadlineAr}
                onChange={(e) => setSettings({ ...settings, heroHeadlineAr: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
          </div>
        </div>

        {/* Rotating Motion Roles */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F0F3F6]">Rotating Roles (Typing Animation)</h2>
              <p className="text-xs text-[#94A3B8]">These titles cycle seamlessly in the Hero section.</p>
            </div>
            <button
              type="button"
              onClick={addRole}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
          </div>

          <div className="space-y-4">
            {settings.rotatingRoles.map((role, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="English Role"
                  value={role}
                  onChange={(e) => {
                    const updated = [...settings.rotatingRoles];
                    updated[idx] = e.target.value;
                    setSettings({ ...settings, rotatingRoles: updated });
                  }}
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                />
                <input
                  type="text"
                  dir="rtl"
                  placeholder="اللقب بالعربية"
                  value={settings.rotatingRolesAr[idx] || ''}
                  onChange={(e) => {
                    const updated = [...settings.rotatingRolesAr];
                    updated[idx] = e.target.value;
                    setSettings({ ...settings, rotatingRolesAr: updated });
                  }}
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
                />
                {settings.rotatingRoles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRole(idx)}
                    className="p-3 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Profile Image & WhatsApp Action */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <h2 className="text-lg font-bold text-[#F0F3F6]">Profile Image & Direct WhatsApp CTA</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Profile Portrait Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.ogImageUrl}
                  onChange={(e) => setSettings({ ...settings, ogImageUrl: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
                />
                <label className="cursor-pointer px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors flex items-center gap-1.5 text-xs font-semibold">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? '...' : 'Upload'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                WhatsApp Direct URL (Tawasul Ma'i CTA)
              </label>
              <input
                type="text"
                value={settings.whatsappUrl}
                onChange={(e) => setSettings({ ...settings, whatsappUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
              />
            </div>
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
            <span>{saving ? 'Publishing Changes...' : 'Save & Publish Hero'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
