'use client';

import React, { useEffect, useState } from 'react';
import { ContactChannel, SiteSettings, SocialLink } from '@/lib/types';
import {
  Save,
  CheckCircle2,
  Settings,
  Upload,
  Globe,
  FileText,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  Eye,
  XCircle,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [contactChannels, setContactChannels] = useState<ContactChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadingLegal, setUploadingLegal] = useState(false);

  useEffect(() => {
    fetch('/api/admin/data')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setSettings(res.data.settings);
          setSocialLinks(res.data.socialLinks || []);
          setContactChannels(res.data.contactChannels || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cv' | 'legal'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setErrorMessage('');

    // Strict PDF validation
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setErrorMessage(
        `Invalid file type for ${type === 'cv' ? 'CV' : 'Legal document'}. Only PDF files (.pdf) are permitted.`
      );
      setTimeout(() => setErrorMessage(''), 5000);
      e.target.value = '';
      return;
    }

    if (type === 'cv') setUploadingCv(true);
    else setUploadingLegal(true);

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.media?.url) {
        if (type === 'cv') {
          setSettings({ ...settings, cvUrl: data.media.url });
        } else {
          setSettings({ ...settings, privacyTermsUrl: data.media.url });
        }
        setMessage(`${type === 'cv' ? 'CV' : 'Privacy & Terms'} PDF uploaded successfully! Remember to save settings.`);
        setTimeout(() => setMessage(''), 4000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'PDF upload failed. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      if (type === 'cv') setUploadingCv(false);
      else setUploadingLegal(false);
      e.target.value = '';
    }
  };

  const handleRemoveDocument = (type: 'cv' | 'legal') => {
    if (!settings) return;
    if (!confirm(`Are you sure you want to remove the current ${type === 'cv' ? 'CV' : 'Privacy & Terms'} document?`)) {
      return;
    }
    if (type === 'cv') {
      setSettings({ ...settings, cvUrl: '' });
    } else {
      setSettings({ ...settings, privacyTermsUrl: '' });
    }
    setMessage(`${type === 'cv' ? 'CV' : 'Privacy & Terms'} reference removed. Click Save Settings to persist.`);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage('Site settings, CV, Legal PDF, and configurations updated successfully!');
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

  // Direct Channels Management
  const addChannel = () => {
    const newChan: ContactChannel = {
      id: `channel-${Date.now()}`,
      platform: 'custom',
      title: 'New Channel',
      titleAr: 'قناة جديدة',
      subtitle: 'Connect with me',
      subtitleAr: 'تواصل معي',
      icon: 'link',
      url: 'https://',
      enabled: true,
      sortOrder: contactChannels.length + 1,
    };
    setContactChannels([...contactChannels, newChan]);
  };

  const saveChannel = async (channel: ContactChannel) => {
    try {
      const res = await fetch('/api/admin/contact-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channel),
      });
      if (res.ok) {
        setMessage(`Channel "${channel.title}" saved successfully!`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      alert('Failed to save channel');
    }
  };

  const deleteChannel = async (id: string) => {
    if (!confirm('Remove this contact channel?')) return;
    try {
      await fetch(`/api/admin/contact-channels?id=${id}`, { method: 'DELETE' });
      setContactChannels(contactChannels.filter((c) => c.id !== id));
      setMessage('Channel deleted.');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      alert('Failed to delete channel');
    }
  };

  // Social Links Management
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
    setMessage(`Social link "${link.platform}" saved.`);
    setTimeout(() => setMessage(''), 3000);
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
    <div className="max-w-4xl space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#F0F3F6] tracking-tight">
            Site Settings & Documents CMS
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Manage global site metadata, CV document, Privacy & Terms PDF, and dynamic direct channels.
          </p>
        </div>

        {message && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: SITE DOCUMENTS (CV & PRIVACY / TERMS) */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <div className="border-b border-[#F0F3F6]/10 pb-3">
            <h2 className="text-lg font-bold text-[#F0F3F6] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F59E0B]" />
              <span>Official Site Documents (PDFs)</span>
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Documents linked directly to the public top navigation. PDF format only.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. CV / Resume */}
            <div className="p-6 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Curriculum Vitae (CV)</span>
                </span>
                {settings.cvUrl ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold">
                    Configured
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400">
                    Not Set
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1.5">
                  CV PDF File URL
                </label>
                <input
                  type="text"
                  value={settings.cvUrl || ''}
                  onChange={(e) => setSettings({ ...settings, cvUrl: e.target.value })}
                  placeholder="/cv/Islam_Ahmed_CV.pdf or https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:border-[#F59E0B]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Upload / Replace */}
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#10141C] border border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] flex items-center gap-1.5 text-xs font-bold transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingCv ? 'Uploading...' : settings.cvUrl ? 'Replace CV PDF' : 'Upload CV PDF'}</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleDocumentUpload(e, 'cv')}
                    className="hidden"
                    disabled={uploadingCv}
                  />
                </label>

                {/* View Current */}
                {settings.cvUrl && (
                  <a
                    href={settings.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] hover:text-[#F59E0B] flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Current</span>
                  </a>
                )}

                {/* Remove */}
                {settings.cvUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument('cv')}
                    className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                    title="Remove CV"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* 2. Privacy & Terms */}
            <div className="p-6 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy & Terms</span>
                </span>
                {settings.privacyTermsUrl ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold">
                    Configured
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400">
                    Not Set
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1.5">
                  Privacy & Terms PDF URL
                </label>
                <input
                  type="text"
                  value={settings.privacyTermsUrl || ''}
                  onChange={(e) => setSettings({ ...settings, privacyTermsUrl: e.target.value })}
                  placeholder="/legal/Privacy_and_Terms.pdf or https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] focus:border-[#F59E0B]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Upload / Replace */}
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#10141C] border border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] flex items-center gap-1.5 text-xs font-bold transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLegal ? 'Uploading...' : settings.privacyTermsUrl ? 'Replace Legal PDF' : 'Upload Legal PDF'}</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleDocumentUpload(e, 'legal')}
                    className="hidden"
                    disabled={uploadingLegal}
                  />
                </label>

                {/* View Current */}
                {settings.privacyTermsUrl && (
                  <a
                    href={settings.privacyTermsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] hover:text-[#F59E0B] flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Current</span>
                  </a>
                )}

                {/* Remove */}
                {settings.privacyTermsUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument('legal')}
                    className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                    title="Remove Legal Document"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: EXTENSIBLE DIRECT CHANNELS (VISITOR REACH) */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F3F6]/10 pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#F0F3F6] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F59E0B]" />
                <span>Extensible Direct Channels (Visitor Communication)</span>
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Configure contact channels rendered dynamically on the public &quot;Get In Touch&quot; section. Enabled channels are visible; disabled channels are hidden.
              </p>
            </div>
            <button
              type="button"
              onClick={addChannel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#151A23] border border-[#F59E0B]/30 text-xs font-bold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Channel</span>
            </button>
          </div>

          <div className="space-y-4">
            {contactChannels.map((chan, idx) => (
              <div
                key={chan.id}
                className="p-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 space-y-4 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase font-bold text-[#F59E0B]">
                      Channel #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-[#94A3B8]">({chan.platform})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#F0F3F6] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chan.enabled}
                        onChange={(e) => {
                          const updated = [...contactChannels];
                          updated[idx].enabled = e.target.checked;
                          setContactChannels(updated);
                        }}
                        className="w-4 h-4 rounded text-[#F59E0B] focus:ring-0"
                      />
                      <span>{chan.enabled ? 'Enabled (Public)' : 'Disabled (Hidden)'}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => saveChannel(chan)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#10141C] border border-[#F59E0B]/40 text-xs font-bold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteChannel(chan.id)}
                      className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      title="Delete channel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1">
                      Platform Type
                    </label>
                    <select
                      value={chan.platform}
                      onChange={(e) => {
                        const updated = [...contactChannels];
                        updated[idx].platform = e.target.value;
                        setContactChannels(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="telegram">Telegram</option>
                      <option value="discord">Discord</option>
                      <option value="behance">Behance</option>
                      <option value="dribbble">Dribbble</option>
                      <option value="instagram">Instagram</option>
                      <option value="x">X / Twitter</option>
                      <option value="skype">Skype</option>
                      <option value="custom">Custom / Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1">
                      Display Title (EN)
                    </label>
                    <input
                      type="text"
                      value={chan.title}
                      onChange={(e) => {
                        const updated = [...contactChannels];
                        updated[idx].title = e.target.value;
                        setContactChannels(updated);
                      }}
                      placeholder="WhatsApp"
                      className="w-full px-3 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1">
                      Display Subtitle (EN)
                    </label>
                    <input
                      type="text"
                      value={chan.subtitle || ''}
                      onChange={(e) => {
                        const updated = [...contactChannels];
                        updated[idx].subtitle = e.target.value;
                        setContactChannels(updated);
                      }}
                      placeholder="Chat with me"
                      className="w-full px-3 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={chan.sortOrder}
                      onChange={(e) => {
                        const updated = [...contactChannels];
                        updated[idx].sortOrder = parseInt(e.target.value) || 0;
                        setContactChannels(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1">
                      Target URL / Link (Behind the card)
                    </label>
                    <input
                      type="text"
                      value={chan.url}
                      onChange={(e) => {
                        const updated = [...contactChannels];
                        updated[idx].url = e.target.value;
                        setContactChannels(updated);
                      }}
                      placeholder="https://wa.me/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1">
                      Display Subtitle (Arabic)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={chan.subtitleAr || ''}
                      onChange={(e) => {
                        const updated = [...contactChannels];
                        updated[idx].subtitleAr = e.target.value;
                        setContactChannels(updated);
                      }}
                      placeholder="ابدأ محادثة مباشرة"
                      className="w-full px-3 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: SEO METADATA */}
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

        {/* SECTION 4: PRIMARY CONFIGURATIONS (BACKWARD COMPATIBLE) */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <h2 className="text-lg font-bold text-[#F0F3F6]">Primary Configuration Links</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Primary WhatsApp URL (Configured for direct clicks)
              </label>
              <input
                type="text"
                required
                value={settings.whatsappUrl}
                onChange={(e) => setSettings({ ...settings, whatsappUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                Primary LinkedIn URL
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

        {/* SECTION 5: SOCIAL MEDIA PLATFORMS */}
        <div className="p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F0F3F6]">Social Media Platforms</h2>
              <p className="text-xs text-[#94A3B8]">Managed platforms appearing in Hero & Footer.</p>
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

        {/* Global Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_24px_rgba(245,158,11,0.35)] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Site Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
