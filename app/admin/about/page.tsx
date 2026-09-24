'use client';

import React, { useEffect, useState } from 'react';
import { SiteSettings } from '@/lib/types';
import { Save, CheckCircle2, User, BarChart3 } from 'lucide-react';

export default function AdminAboutPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
        setMessage('About & Statistics updated successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="text-sm font-mono text-[#94A3B8]">Loading About Settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            About & Statistics CMS
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Edit your design philosophy, editorial biographies, and animated counter metrics.
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
        {/* Short & Long Bios */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <h2 className="text-lg font-bold text-[#F0F3F6] flex items-center gap-2">
            <User className="w-4 h-4 text-[#F59E0B]" />
            <span>Editorial Biographies</span>
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Short Highlight Bio (English)
              </label>
              <textarea
                rows={2}
                value={settings.shortBio}
                onChange={(e) => setSettings({ ...settings, shortBio: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Short Highlight Bio (Arabic)
              </label>
              <textarea
                rows={2}
                dir="rtl"
                value={settings.shortBioAr}
                onChange={(e) => setSettings({ ...settings, shortBioAr: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Long Comprehensive Bio (English)
              </label>
              <textarea
                rows={4}
                value={settings.longBio}
                onChange={(e) => setSettings({ ...settings, longBio: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Long Comprehensive Bio (Arabic)
              </label>
              <textarea
                rows={4}
                dir="rtl"
                value={settings.longBioAr}
                onChange={(e) => setSettings({ ...settings, longBioAr: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
          </div>
        </div>

        {/* Live Statistics Metrics */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <h2 className="text-lg font-bold text-[#F0F3F6] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#F59E0B]" />
            <span>Counter Statistics</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Experience Years
              </label>
              <input
                type="text"
                value={settings.stats.experienceYears}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    stats: { ...settings.stats, experienceYears: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm font-bold text-[#F0F3F6]"
                placeholder="2+"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Projects Count
              </label>
              <input
                type="text"
                value={settings.stats.projectsCount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    stats: { ...settings.stats, projectsCount: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm font-bold text-[#F0F3F6]"
                placeholder="35+"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Clients Count
              </label>
              <input
                type="text"
                value={settings.stats.clientsCount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    stats: { ...settings.stats, clientsCount: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm font-bold text-[#F0F3F6]"
                placeholder="20+"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Tools Count
              </label>
              <input
                type="text"
                value={settings.stats.toolsCount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    stats: { ...settings.stats, toolsCount: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm font-bold text-[#F0F3F6]"
                placeholder="12+"
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
            <span>{saving ? 'Publishing...' : 'Save & Publish About'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
