'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Scale,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Eye,
  Trash2,
  ExternalLink,
  Maximize2,
  Minimize2,
  X,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Globe,
  RefreshCw,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Lock,
} from 'lucide-react';
import { PrivacyTermsData } from '@/lib/types';
import { getDefaultPrivacyTerms } from '@/lib/legal/defaultTerms';

export default function AdminPrivacyTermsPage() {
  const [data, setData] = useState<PrivacyTermsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'ar'>('en');

  // Preview tab state for editors: 'edit' or 'preview'
  const [privacyEditorTab, setPrivacyEditorTab] = useState<'edit' | 'preview'>('edit');
  const [termsEditorTab, setTermsEditorTab] = useState<'edit' | 'preview'>('edit');

  // PDF Preview modal state
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  // Live Public Page Preview toggle
  const [showFullPublicPreview, setShowFullPublicPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const privacyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const termsTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch current Privacy & Terms data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/privacy-terms');
      if (res.ok) {
        const json = await res.json();
        if (json.privacyTerms) {
          setData(json.privacyTerms);
          return;
        }
      }
      // Fallback
      setData(getDefaultPrivacyTerms());
    } catch {
      setData(getDefaultPrivacyTerms());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format file size
  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Safe Save / Publish
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!data) return;

    // Safety validation: Prevent blanking out essential legal protections
    if (!data.privacyPolicyContent?.trim() || !data.termsContent?.trim()) {
      setMessage({
        type: 'error',
        text: 'Safety Warning: Privacy Policy and Terms & Conditions content cannot be empty.',
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/privacy-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.privacyTerms);
        setMessage({
          type: 'success',
          text: 'Privacy & Terms published successfully! Live website updated.',
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({
          type: 'error',
          text: json.error || 'Failed to save changes. Your previous working version is safe.',
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'Network error occurred while saving.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Safe PDF Upload / Replacement
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    // Strict PDF validation
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setMessage({
        type: 'error',
        text: 'Validation Error: Only valid PDF documents (.pdf) are supported.',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Size limit: 15MB
    if (file.size > 15 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Validation Error: PDF file size must be less than 15 MB.',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingPdf(true);
    setMessage(null);

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const resData = await res.json();
      if (res.ok && resData.media?.url) {
        // Successfully uploaded: update working state safely
        const updatedData: PrivacyTermsData = {
          ...data,
          pdfUrl: resData.media.url,
          pdfFileName: file.name,
          pdfFileSize: file.size,
          pdfUpdatedAt: new Date().toISOString(),
        };

        setData(updatedData);

        // Auto-save the new PDF reference immediately to persist
        const saveRes = await fetch('/api/admin/privacy-terms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        });

        if (saveRes.ok) {
          setMessage({
            type: 'success',
            text: `Official PDF "${file.name}" uploaded and published successfully!`,
          });
        } else {
          setMessage({
            type: 'success',
            text: `PDF uploaded. Click "Save & Publish" to commit changes.`,
          });
        }
      } else {
        setMessage({
          type: 'error',
          text: resData.error || 'PDF upload failed. Your previous working PDF was preserved.',
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'Upload failed. Previous PDF preserved.',
      });
    } finally {
      setUploadingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Safe PDF Removal with confirmation
  const handleRemovePdf = () => {
    if (!data?.pdfUrl) return;
    const confirmDelete = window.confirm(
      'Are you sure you want to remove the current official PDF? The web text version will remain available.'
    );
    if (!confirmDelete) return;

    setData({
      ...data,
      pdfUrl: '',
      pdfFileName: '',
      pdfFileSize: 0,
      pdfUpdatedAt: '',
    });
    setMessage({
      type: 'success',
      text: 'PDF reference removed. Click "Save & Publish" to update the live site.',
    });
  };

  // Quick Formatting Toolbar helper
  const insertFormatting = (
    textareaRef: React.RefObject<HTMLTextAreaElement | null>,
    prefix: string,
    suffix: string = '',
    field: 'privacyPolicyContent' | 'privacyPolicyContentAr' | 'termsContent' | 'termsContentAr'
  ) => {
    const el = textareaRef.current;
    if (!el || !data) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentVal = data[field] || '';
    const selectedText = currentVal.substring(start, end) || 'text';

    const replacement = `${prefix}${selectedText}${suffix}`;
    const nextVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    setData({
      ...data,
      [field]: nextVal,
    });

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  // Simple Markdown renderer for Preview tabs
  const renderSimpleMarkdown = (content: string, isRtl: boolean = false) => {
    if (!content) return <p className="text-gray-500 italic">No content</p>;

    const lines = content.split('\n');
    return (
      <div
        className={`space-y-3 leading-relaxed text-xs sm:text-sm text-[#F0F3F6] ${
          isRtl ? 'text-right' : 'text-left'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={idx} className="text-lg sm:text-xl font-bold text-[#F59E0B] pt-2 pb-1 border-b border-[#F0F3F6]/10">
                {trimmed.replace(/^#\s+/, '')}
              </h2>
            );
          }

          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-base sm:text-lg font-bold text-[#F0F3F6] pt-2 pb-1">
                {trimmed.replace(/^##\s+/, '')}
              </h3>
            );
          }

          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm sm:text-base font-semibold text-[#F59E0B] pt-1">
                {trimmed.replace(/^###\s+/, '')}
              </h4>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 ps-2">
                <span className="text-[#F59E0B] mt-1">•</span>
                <span className="text-[#94A3B8]">{trimmed.replace(/^[-•*]\s+/, '')}</span>
              </div>
            );
          }

          if (/^\d+\.\s+/.test(trimmed)) {
            const match = trimmed.match(/^(\d+\.)\s+(.*)/);
            return (
              <div key={idx} className="flex items-start gap-2 ps-2">
                <span className="text-[#F59E0B] font-mono text-xs">{match?.[1]}</span>
                <span className="text-[#94A3B8]">{match?.[2]}</span>
              </div>
            );
          }

          if (trimmed.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="border-s-2 border-[#F59E0B] bg-[#151A23]/60 px-3 py-2 rounded-r-xl text-xs text-[#F0F3F6] italic"
              >
                {trimmed.replace(/^>\s+/, '')}
              </blockquote>
            );
          }

          if (trimmed === '---') {
            return <hr key={idx} className="border-[#F0F3F6]/10 my-3" />;
          }

          return (
            <p key={idx} className="text-[#94A3B8]">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-sm font-mono text-[#94A3B8]">
        <RefreshCw className="w-5 h-5 animate-spin text-[#F59E0B] me-2" />
        Loading Privacy & Terms CMS...
      </div>
    );
  }

  const isRtl = activeLang === 'ar';

  return (
    <div className="max-w-5xl space-y-8 pb-16">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0F3F6]/08 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151A23] border border-[#F59E0B]/30 text-xs font-mono text-[#F59E0B] mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Standalone Legal & Privacy CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F0F3F6] tracking-tight">
            Privacy & Terms Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Manage your public Privacy Policy, Terms & Conditions web content, and official signed PDF document.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Live Public Page */}
          <Link
            href="/privacy-terms"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 hover:bg-[#1A202C] transition-all duration-200"
            title="Open Live Privacy & Terms Page"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>View Live Page</span>
          </Link>

          {/* Save & Publish Button */}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#07090D] bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm transition-all duration-300 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-current"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Publication Status & Safety Controls */}
      <div className="p-6 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/10 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] mb-1">
            Publication Status
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setData({ ...data, published: !data.published })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                data.published ? 'bg-[#F59E0B]' : 'bg-[#151A23] border border-[#F0F3F6]/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  data.published ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-xs font-bold text-[#F0F3F6]">
              {data.published ? 'Published (Live)' : 'Draft Mode (Hidden)'}
            </span>
          </div>
        </div>

        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] mb-1">
            Last Updated
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F0F3F6]">
            <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>
              {data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'Never'}
            </span>
          </div>
        </div>

        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] mb-1">
            Data Integrity
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Persistent Database Synced</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* SECTION: OFFICIAL PDF DOCUMENT MANAGEMENT */}
      {/* ---------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F3F6]/08 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-lg font-bold text-[#F0F3F6]">Official Signed PDF Document</h2>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Upload, preview, or replace the official contract PDF. The PDF is available alongside the web text on the public viewer.
            </p>
          </div>

          {data.pdfUrl ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 font-semibold self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active PDF Attached</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400 self-start sm:self-auto">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>No PDF Configured</span>
            </span>
          )}
        </div>

        {/* Current PDF Card */}
        {data.pdfUrl ? (
          <div className="p-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#10141C] border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shrink-0 shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#F0F3F6] truncate max-w-md">
                  {data.pdfFileName || data.pdfUrl.split('/').pop() || 'Privacy_and_Terms.pdf'}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-[#94A3B8]">
                  <span className="px-2 py-0.5 rounded bg-[#10141C] text-[#F59E0B] font-semibold">PDF</span>
                  <span>•</span>
                  <span>{formatBytes(data.pdfFileSize)}</span>
                  <span>•</span>
                  <span>
                    Uploaded: {data.pdfUpdatedAt ? new Date(data.pdfUpdatedAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
              {/* Preview PDF Modal Button */}
              <button
                type="button"
                onClick={() => setPdfPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
                title="Preview PDF inside modal"
              >
                <Eye className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Preview PDF</span>
              </button>

              {/* Open in New Tab */}
              <a
                href={data.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/15 text-xs font-semibold text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Open Raw</span>
              </a>

              {/* Replace PDF Button */}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10141C] border border-[#F59E0B]/40 text-xs font-bold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-all duration-200">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingPdf ? 'Uploading...' : 'Replace PDF'}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  disabled={uploadingPdf}
                  className="hidden"
                />
              </label>

              {/* Remove PDF Button */}
              <button
                type="button"
                onClick={handleRemovePdf}
                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Remove current PDF reference"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#151A23]/60 border border-dashed border-[#F0F3F6]/20 text-center flex flex-col items-center justify-center">
            <FileText className="w-10 h-10 text-[#94A3B8] mb-3" />
            <h3 className="text-sm font-bold text-[#F0F3F6] mb-1">Upload Official PDF Document</h3>
            <p className="text-xs text-[#94A3B8] max-w-md mb-4 font-light">
              Upload the signed digital agreement PDF (max 15MB). The PDF will be securely stored and linked to the public document viewer.
            </p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#07090D] bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] hover:shadow-lg hover:scale-105 transition-all">
              <Upload className="w-4 h-4" />
              <span>{uploadingPdf ? 'Uploading PDF...' : 'Select PDF File'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfUpload}
                disabled={uploadingPdf}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* SECTION: EDITABLE WEB CONTENT (Bilingual Tabs & Rich Formatter) */}
      {/* ---------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0F3F6]/08 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-lg font-bold text-[#F0F3F6]">Web Content & Clauses</h2>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Edit the responsive web version of Privacy Policy and Terms & Conditions. Use formatting controls for headings, lists, and bold text.
            </p>
          </div>

          {/* Language Switcher Tabs */}
          <div className="flex items-center bg-[#151A23] border border-[#F0F3F6]/10 rounded-full p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveLang('en')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeLang === 'en'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] shadow'
                  : 'text-[#94A3B8] hover:text-[#F0F3F6]'
              }`}
            >
              English (LTR)
            </button>
            <button
              type="button"
              onClick={() => setActiveLang('ar')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeLang === 'ar'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] shadow'
                  : 'text-[#94A3B8] hover:text-[#F0F3F6]'
              }`}
            >
              العربية (RTL)
            </button>
          </div>
        </div>

        {/* Page Titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#94A3B8] mb-1.5">
              {activeLang === 'en' ? 'Page Title (English)' : 'عنوان الصفحة (عربي)'}
            </label>
            <input
              type="text"
              value={activeLang === 'en' ? data.title : data.titleAr || ''}
              onChange={(e) =>
                setData({
                  ...data,
                  [activeLang === 'en' ? 'title' : 'titleAr']: e.target.value,
                })
              }
              dir={isRtl ? 'rtl' : 'ltr'}
              className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:border-[#F59E0B] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#94A3B8] mb-1.5">
              {activeLang === 'en' ? 'Subtitle / Agreement Scope' : 'الوصف التعاقدي / النطاق'}
            </label>
            <input
              type="text"
              value={activeLang === 'en' ? data.subtitle || '' : data.subtitleAr || ''}
              onChange={(e) =>
                setData({
                  ...data,
                  [activeLang === 'en' ? 'subtitle' : 'subtitleAr']: e.target.value,
                })
              }
              dir={isRtl ? 'rtl' : 'ltr'}
              className="w-full px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:border-[#F59E0B] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* ------------------------------------------- */}
        {/* SUBSECTION 1: PRIVACY POLICY CONTENT */}
        {/* ------------------------------------------- */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#151A23]/50 border border-[#F0F3F6]/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-sm sm:text-base font-bold text-[#F0F3F6]">
                {activeLang === 'en' ? '1. Privacy Policy & Digital Communications' : '١. سياسة الخصوصية وسرية البيانات'}
              </h3>
            </div>

            {/* Edit / Preview Tabs for Privacy */}
            <div className="flex items-center bg-[#10141C] border border-[#F0F3F6]/10 rounded-xl p-1 self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setPrivacyEditorTab('edit')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  privacyEditorTab === 'edit'
                    ? 'bg-[#151A23] text-[#F59E0B] font-bold'
                    : 'text-[#94A3B8] hover:text-[#F0F3F6]'
                }`}
              >
                Edit Markdown
              </button>
              <button
                type="button"
                onClick={() => setPrivacyEditorTab('preview')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  privacyEditorTab === 'preview'
                    ? 'bg-[#151A23] text-[#F59E0B] font-bold'
                    : 'text-[#94A3B8] hover:text-[#F0F3F6]'
                }`}
              >
                Formatted Preview
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          {privacyEditorTab === 'edit' && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#94A3B8]">
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    privacyTextareaRef,
                    '**',
                    '**',
                    activeLang === 'en' ? 'privacyPolicyContent' : 'privacyPolicyContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Bold (**text**)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    privacyTextareaRef,
                    '*',
                    '*',
                    activeLang === 'en' ? 'privacyPolicyContent' : 'privacyPolicyContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Italic (*text*)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-3 bg-[#F0F3F6]/15 mx-1" />
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    privacyTextareaRef,
                    '## ',
                    '',
                    activeLang === 'en' ? 'privacyPolicyContent' : 'privacyPolicyContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    privacyTextareaRef,
                    '### ',
                    '',
                    activeLang === 'en' ? 'privacyPolicyContent' : 'privacyPolicyContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Heading 3"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-3 bg-[#F0F3F6]/15 mx-1" />
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    privacyTextareaRef,
                    '- ',
                    '',
                    activeLang === 'en' ? 'privacyPolicyContent' : 'privacyPolicyContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Bullet List (- item)"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    privacyTextareaRef,
                    '1. ',
                    '',
                    activeLang === 'en' ? 'privacyPolicyContent' : 'privacyPolicyContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Numbered List (1. item)"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    privacyTextareaRef,
                    '> ',
                    '',
                    activeLang === 'en' ? 'privacyPolicyContent' : 'privacyPolicyContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Callout Blockquote (> text)"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {privacyEditorTab === 'edit' ? (
            <textarea
              ref={privacyTextareaRef}
              rows={12}
              value={
                activeLang === 'en'
                  ? data.privacyPolicyContent || ''
                  : data.privacyPolicyContentAr || ''
              }
              onChange={(e) =>
                setData({
                  ...data,
                  [activeLang === 'en' ? 'privacyPolicyContent' : 'privacyPolicyContentAr']:
                    e.target.value,
                })
              }
              dir={isRtl ? 'rtl' : 'ltr'}
              className="w-full px-4 py-3 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs sm:text-sm font-mono text-[#F0F3F6] focus:border-[#F59E0B] focus:outline-none leading-relaxed transition-colors"
              placeholder="# Privacy Policy..."
            />
          ) : (
            <div className="p-5 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/10 min-h-[200px]">
              {renderSimpleMarkdown(
                activeLang === 'en'
                  ? data.privacyPolicyContent || ''
                  : data.privacyPolicyContentAr || '',
                isRtl
              )}
            </div>
          )}
        </div>

        {/* ------------------------------------------- */}
        {/* SUBSECTION 2: TERMS & CONDITIONS CONTENT */}
        {/* ------------------------------------------- */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#151A23]/50 border border-[#F0F3F6]/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-sm sm:text-base font-bold text-[#F0F3F6]">
                {activeLang === 'en' ? '2. Terms & Conditions (Commercial Agreement)' : '٢. الشروط والأحكام (الاتفاقية التجارية)'}
              </h3>
            </div>

            {/* Edit / Preview Tabs for Terms */}
            <div className="flex items-center bg-[#10141C] border border-[#F0F3F6]/10 rounded-xl p-1 self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setTermsEditorTab('edit')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  termsEditorTab === 'edit'
                    ? 'bg-[#151A23] text-[#F59E0B] font-bold'
                    : 'text-[#94A3B8] hover:text-[#F0F3F6]'
                }`}
              >
                Edit Markdown
              </button>
              <button
                type="button"
                onClick={() => setTermsEditorTab('preview')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  termsEditorTab === 'preview'
                    ? 'bg-[#151A23] text-[#F59E0B] font-bold'
                    : 'text-[#94A3B8] hover:text-[#F0F3F6]'
                }`}
              >
                Formatted Preview
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          {termsEditorTab === 'edit' && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#94A3B8]">
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    termsTextareaRef,
                    '**',
                    '**',
                    activeLang === 'en' ? 'termsContent' : 'termsContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Bold (**text**)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    termsTextareaRef,
                    '*',
                    '*',
                    activeLang === 'en' ? 'termsContent' : 'termsContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Italic (*text*)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-3 bg-[#F0F3F6]/15 mx-1" />
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    termsTextareaRef,
                    '## ',
                    '',
                    activeLang === 'en' ? 'termsContent' : 'termsContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    termsTextareaRef,
                    '### ',
                    '',
                    activeLang === 'en' ? 'termsContent' : 'termsContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Heading 3"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-3 bg-[#F0F3F6]/15 mx-1" />
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    termsTextareaRef,
                    '- ',
                    '',
                    activeLang === 'en' ? 'termsContent' : 'termsContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Bullet List (- item)"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    termsTextareaRef,
                    '1. ',
                    '',
                    activeLang === 'en' ? 'termsContent' : 'termsContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Numbered List (1. item)"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertFormatting(
                    termsTextareaRef,
                    '> ',
                    '',
                    activeLang === 'en' ? 'termsContent' : 'termsContentAr'
                  )
                }
                className="p-1.5 rounded hover:bg-[#151A23] hover:text-[#F0F3F6]"
                title="Callout Blockquote (> text)"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {termsEditorTab === 'edit' ? (
            <textarea
              ref={termsTextareaRef}
              rows={18}
              value={
                activeLang === 'en' ? data.termsContent || '' : data.termsContentAr || ''
              }
              onChange={(e) =>
                setData({
                  ...data,
                  [activeLang === 'en' ? 'termsContent' : 'termsContentAr']: e.target.value,
                })
              }
              dir={isRtl ? 'rtl' : 'ltr'}
              className="w-full px-4 py-3 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs sm:text-sm font-mono text-[#F0F3F6] focus:border-[#F59E0B] focus:outline-none leading-relaxed transition-colors"
              placeholder="# Terms & Conditions..."
            />
          ) : (
            <div className="p-5 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/10 min-h-[300px]">
              {renderSimpleMarkdown(
                activeLang === 'en' ? data.termsContent || '' : data.termsContentAr || '',
                isRtl
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* SECTION: EMBEDDED PREVIEW & PUBLISH BAR */}
      {/* ---------------------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFullPublicPreview(!showFullPublicPreview)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
          >
            <Eye className="w-4 h-4 text-[#F59E0B]" />
            <span>{showFullPublicPreview ? 'Hide Live Preview' : 'Preview Privacy & Terms View'}</span>
          </button>
          <span className="text-xs text-[#94A3B8]">
            Simulate how visitors experience the legal document.
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-[#07090D] bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Publishing Changes...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible In-Admin Full Document Preview */}
      {showFullPublicPreview && (
        <div className="rounded-3xl border border-[#F0F3F6]/10 bg-[#07090D] p-6 sm:p-10 relative overflow-hidden shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0F3F6]/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
              <Eye className="w-4 h-4" />
              <span>Simulated Public Page Preview</span>
            </div>
            <button
              onClick={() => setShowFullPublicPreview(false)}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl border border-[#F0F3F6]/10 bg-[#10141C] p-6 sm:p-10 space-y-8">
            <div className="border-b border-[#F0F3F6]/10 pb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F0F3F6]">
                {activeLang === 'en' ? data.title : data.titleAr || data.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                {activeLang === 'en' ? data.subtitle : data.subtitleAr || data.subtitle}
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#151A23]/60 border border-[#F0F3F6]/08">
                {renderSimpleMarkdown(
                  activeLang === 'en'
                    ? data.privacyPolicyContent || ''
                    : data.privacyPolicyContentAr || '',
                  isRtl
                )}
              </div>

              <div className="p-5 rounded-2xl bg-[#151A23]/60 border border-[#F0F3F6]/08">
                {renderSimpleMarkdown(
                  activeLang === 'en'
                    ? data.termsContent || ''
                    : data.termsContentAr || '',
                  isRtl
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* MODAL: PDF DOCUMENT VIEWER (PREVIEW WITHOUT FORCED DOWNLOAD) */}
      {/* ---------------------------------------------------------------- */}
      {pdfPreviewOpen && data.pdfUrl && (
        <div className="fixed inset-0 z-50 bg-[#07090D]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-4xl h-[90vh] bg-[#10141C] border border-[#F0F3F6]/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#151A23] border-b border-[#F0F3F6]/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F0F3F6]">
                <FileText className="w-4 h-4 text-[#F59E0B]" />
                <span className="truncate max-w-md">
                  {data.pdfFileName || 'Official Privacy & Terms PDF Preview'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#10141C] border border-[#F59E0B]/30 text-[10px] font-mono text-[#F59E0B]">
                  Verified
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={data.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-[#10141C] text-[#94A3B8] hover:text-white"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPdfPreviewOpen(false)}
                  className="p-1.5 rounded-lg bg-[#10141C] text-[#94A3B8] hover:text-white"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer (CV Viewer Visual Presentation) */}
            <div className="flex-1 w-full bg-[#07090D] p-3 sm:p-6 flex items-center justify-center overflow-hidden">
              <object
                data={`${data.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                type="application/pdf"
                className="w-full h-full rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10"
                title="Privacy & Terms PDF Preview"
              >
                <iframe
                  src={`${data.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  title="Privacy & Terms PDF Preview"
                  className="w-full h-full rounded-2xl border-0 bg-[#151A23]"
                >
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-[#94A3B8]">
                    <FileText className="w-12 h-12 text-[#F59E0B] mb-4" />
                    <p className="text-xs mb-4">
                      Embedded PDF preview is not supported by your browser viewer.
                    </p>
                    <a
                      href={data.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6]"
                    >
                      Open Document in New Tab
                    </a>
                  </div>
                </iframe>
              </object>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
