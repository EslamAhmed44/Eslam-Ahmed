'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/navigation/LanguageContext';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Scale,
  Maximize2,
  Minimize2,
  Printer,
  ExternalLink,
  Globe,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Lock,
  Coins,
  Clock,
  Palette,
  MessageSquare,
  Calendar,
  Layers,
} from 'lucide-react';
import { PrivacyTermsData } from '@/lib/types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getDefaultPrivacyTerms } from '@/lib/legal/defaultTerms';

interface PrivacyTermsViewerProps {
  designerName?: string;
  designerNameAr?: string;
  privacyTermsUrl?: string;
  privacyTerms?: PrivacyTermsData;
}

export const PrivacyTermsViewer: React.FC<PrivacyTermsViewerProps> = ({
  designerName = 'Islam Ahmed',
  designerNameAr = 'إسلام أحمد',
  privacyTermsUrl,
  privacyTerms,
}) => {
  const { language, setLanguage, dir, t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'web' | 'pdf'>('web');
  const [activeSection, setActiveSection] = useState<'all' | 'privacy' | 'terms'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const isArabic = language === 'ar';
  const displayName = isArabic ? designerNameAr : designerName;

  // Use passed privacyTerms or fallback to default
  const effectiveTerms: PrivacyTermsData = privacyTerms || getDefaultPrivacyTerms();
  const effectivePdfUrl = effectiveTerms.pdfUrl || privacyTermsUrl || '';

  // Toggle Fullscreen using HTML5 API
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const pageTitle = isArabic
    ? effectiveTerms.titleAr || effectiveTerms.title
    : effectiveTerms.title;

  const pageSubtitle = isArabic
    ? effectiveTerms.subtitleAr || effectiveTerms.subtitle
    : effectiveTerms.subtitle;

  const privacyText = isArabic
    ? effectiveTerms.privacyPolicyContentAr || effectiveTerms.privacyPolicyContent
    : effectiveTerms.privacyPolicyContent;

  const termsText = isArabic
    ? effectiveTerms.termsContentAr || effectiveTerms.termsContent
    : effectiveTerms.termsContent;

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '118 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-[#07090D] text-[#F0F3F6] flex flex-col ${
        isFullscreen ? 'p-0' : ''
      }`}
      dir={dir}
    >
      {/* Top Controls Header Bar — Visual Sibling to CV Viewer */}
      <header className="sticky top-0 z-40 bg-[#10141C]/95 backdrop-blur-xl border-b border-[#F0F3F6]/10 px-4 sm:px-6 py-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3 print:hidden">
        {/* Left: Back to Portfolio */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/50 hover:bg-[#1A202C] transition-all duration-200 group"
          >
            {dir === 'rtl' ? (
              <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B] group-hover:translate-x-0.5 transition-transform" />
            ) : (
              <ArrowLeft className="w-3.5 h-3.5 text-[#F59E0B] group-hover:-translate-x-0.5 transition-transform" />
            )}
            <span>{t('legal.back')}</span>
          </Link>

          {/* Document Title & Badge */}
          <div className="hidden md:flex items-center gap-2 border-s border-[#F0F3F6]/10 ps-3">
            <Scale className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs font-bold text-[#F0F3F6] tracking-tight">
              {displayName} — {pageTitle}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#151A23] border border-[#F59E0B]/30 text-[10px] font-mono text-[#F59E0B]">
              <ShieldCheck className="w-3 h-3 text-[#F59E0B]" />
              <span>{t('legal.badge')}</span>
            </span>
          </div>
        </div>

        {/* Right: Controls (View Mode Switcher + Language + Print + Fullscreen + Raw PDF) */}
        <div className="flex items-center gap-2 sm:gap-2.5 ms-auto">
          {/* Mode Switcher: Web Document vs Official PDF */}
          {effectivePdfUrl && (
            <div className="flex items-center bg-[#151A23] border border-[#F0F3F6]/10 rounded-full p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('web')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all ${
                  viewMode === 'web'
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold shadow'
                    : 'text-[#94A3B8] hover:text-[#F0F3F6]'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span className="hidden xs:inline">{isArabic ? 'المستند الرقمي' : 'Web Document'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all ${
                  viewMode === 'pdf'
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold shadow'
                    : 'text-[#94A3B8] hover:text-[#F0F3F6]'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>{isArabic ? 'ملف PDF الرسمي' : 'Official PDF'}</span>
              </button>
            </div>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
            title="Toggle Language (العربية / English)"
            aria-label="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="font-mono">{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Print / Save Document */}
          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/40 transition-colors"
            title={t('legal.print')}
            aria-label={t('legal.print')}
          >
            <Printer className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="hidden md:inline">{t('legal.print')}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/40 transition-colors"
            title="Fullscreen"
            aria-label="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* External Link to Raw PDF */}
          {effectivePdfUrl && (
            <a
              href={effectivePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex p-2 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/40 transition-colors"
              title={t('legal.openOriginalPdf')}
              aria-label={t('legal.openOriginalPdf')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </header>

      {/* Main Document Viewer Canvas Area */}
      <main className="flex-1 w-full bg-[#07090D] relative flex flex-col items-center justify-start p-3 sm:p-6 md:p-10 overflow-y-auto">
        {/* Subtle Ambient Glow — Exactly matching CV Viewer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[350px] bg-gradient-to-b from-[#F59E0B]/08 via-[#FF7A18]/03 to-transparent blur-3xl pointer-events-none" />

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: WEB DOCUMENT VIEW */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'web' && (
          <>
            {/* Quick Section Filter Pills */}
            <div className="w-full max-w-4xl relative z-20 mb-4 sm:mb-6 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none print:hidden">
              <button
                onClick={() => setActiveSection('all')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  activeSection === 'all'
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold shadow-md'
                    : 'bg-[#10141C] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/30'
                }`}
              >
                {isArabic ? 'كافة بنود الاتفاقية' : 'All Sections'}
              </button>
              <button
                onClick={() => setActiveSection('privacy')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  activeSection === 'privacy'
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold shadow-md'
                    : 'bg-[#10141C] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/30'
                }`}
              >
                {isArabic ? 'سياسة الخصوصية وسرية البيانات' : 'Privacy Policy'}
              </button>
              <button
                onClick={() => setActiveSection('terms')}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  activeSection === 'terms'
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold shadow-md'
                    : 'bg-[#10141C] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/30'
                }`}
              >
                {isArabic ? 'الشروط والأحكام والاتفاقية المالية' : 'Terms & Conditions'}
              </button>
            </div>

            {/* Centered Document Container — Matching CV Viewer Container Design */}
            <article className="w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-[#F0F3F6]/10 bg-[#10141C] shadow-2xl relative transition-all duration-200 p-5 sm:p-8 md:p-12 z-10 print:border-none print:shadow-none print:bg-white print:text-black">
              {/* Document Header Section */}
              <header className="border-b border-[#F0F3F6]/10 pb-8 sm:pb-10 mb-8 sm:mb-10">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  {/* Left/Main Heading Block */}
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151A23] border border-[#F59E0B]/30 text-xs font-mono text-[#F59E0B] mb-4">
                      <FileCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{t('legal.status')}</span>
                    </div>

                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F0F3F6] tracking-tight leading-snug print:text-black mb-2">
                      {pageTitle}
                    </h1>
                    {pageSubtitle && (
                      <p className="text-sm sm:text-base text-[#94A3B8] font-light leading-relaxed print:text-gray-700">
                        {pageSubtitle}
                      </p>
                    )}
                  </div>

                  {/* Document Metadata Pill Box */}
                  <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2.5 bg-[#151A23]/60 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-[#F0F3F6]/08 sm:border-0 text-xs font-mono text-[#94A3B8]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#94A3B8]/60">{t('legal.version')}:</span>
                      <span className="text-[#F0F3F6] font-semibold">2026.1 Official</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#94A3B8]/60">{t('legal.lastUpdated')}:</span>
                      <span className="text-[#F59E0B] font-semibold">
                        {effectiveTerms.updatedAt
                          ? new Date(effectiveTerms.updatedAt).toLocaleDateString(
                              isArabic ? 'ar-EG' : 'en-US',
                              { month: 'long', year: 'numeric' }
                            )
                          : isArabic
                          ? 'أكتوبر 2026'
                          : 'October 2026'}
                      </span>
                    </div>
                    <div className="hidden sm:block text-[11px] text-[#94A3B8]/50">
                      {isArabic ? 'المبادئ العامة للعقود الرقمية' : 'Electronic Commercial Agreements'}
                    </div>
                  </div>
                </div>

                {/* Official PDF Document Strip (if attached) */}
                {effectivePdfUrl && (
                  <div className="mt-6 pt-5 border-t border-[#F0F3F6]/08 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#151A23]/40 p-3.5 rounded-2xl border border-[#F0F3F6]/05 print:hidden">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#10141C] text-[#F59E0B]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#F0F3F6]">
                          {effectiveTerms.pdfFileName || 'Official Signed Contract PDF'}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] font-mono">
                          PDF • {formatBytes(effectiveTerms.pdfFileSize)} • {isArabic ? 'نسخة رسمية معتمدة' : 'Official Document'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode('pdf')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#10141C] border border-[#F59E0B]/30 text-xs font-semibold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'عرض ملف PDF' : 'View PDF Document'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </header>

              {/* SECTION 1: PRIVACY POLICY */}
              {(activeSection === 'all' || activeSection === 'privacy') && (
                <section className="mb-12 rounded-2xl bg-[#151A23]/40 border border-[#F0F3F6]/08 p-6 sm:p-8">
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#F0F3F6]/08">
                    <span className="p-1.5 rounded-xl bg-[#10141C] border border-[#F59E0B]/30 text-[#F59E0B]">
                      <Lock className="w-4 h-4" />
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-[#F0F3F6]">
                      {isArabic ? 'سياسة الخصوصية وسرية البيانات' : 'Privacy Policy & Digital Communications'}
                    </h2>
                  </div>

                  <MarkdownRenderer content={privacyText} isRtl={isArabic} />
                </section>
              )}

              {/* SECTION 2: TERMS & CONDITIONS */}
              {(activeSection === 'all' || activeSection === 'terms') && (
                <section className="mb-12 rounded-2xl bg-[#151A23]/40 border border-[#F0F3F6]/08 p-6 sm:p-8">
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#F0F3F6]/08">
                    <span className="p-1.5 rounded-xl bg-[#10141C] border border-[#F59E0B]/30 text-[#F59E0B]">
                      <Scale className="w-4 h-4" />
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-[#F0F3F6]">
                      {isArabic ? 'الشروط والأحكام (الاتفاقية التجارية)' : 'Terms & Conditions (Commercial Agreement)'}
                    </h2>
                  </div>

                  <MarkdownRenderer content={termsText} isRtl={isArabic} />
                </section>
              )}

              {/* Electronic Acceptance & Signatures Block */}
              <section className="mt-12 pt-10 border-t border-[#F0F3F6]/10">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#151A23] border border-[#F59E0B]/30 text-xs font-mono text-[#F59E0B] mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>{t('legal.verified')}</span>
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#F0F3F6]">
                    {isArabic ? 'القبول والتوقيع الإلكتروني' : 'Electronic Acceptance & Verification'}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1.5">
                    {t('legal.acceptanceNote')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Party 1: Service Provider */}
                  <div className="p-5 rounded-2xl bg-[#151A23]/60 border border-[#F0F3F6]/08 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-mono text-[#F59E0B] uppercase tracking-wider mb-1">
                        {t('legal.parties.first')}
                      </div>
                      <div className="text-base font-bold text-[#F0F3F6]">
                        {displayName}
                      </div>
                      <div className="text-xs text-[#94A3B8] font-light">
                        {isArabic
                          ? 'مصمم جرافيك وموشن جرافيك'
                          : 'Graphic & Motion Graphic Designer'}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#F0F3F6]/08 flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]/60 font-mono">
                        {isArabic ? 'الحالة التعاقدية:' : 'Contractual Status:'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[#F59E0B] font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-[#F59E0B]" />
                        {isArabic ? 'معتمد رسمياً' : 'Verified & Executed'}
                      </span>
                    </div>
                  </div>

                  {/* Party 2: Client */}
                  <div className="p-5 rounded-2xl bg-[#151A23]/60 border border-[#F0F3F6]/08 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-mono text-[#F59E0B] uppercase tracking-wider mb-1">
                        {t('legal.parties.second')}
                      </div>
                      <div className="text-base font-bold text-[#F0F3F6]">
                        {isArabic ? 'العميل المعتمد' : 'Authorized Client'}
                      </div>
                      <div className="text-xs text-[#94A3B8] font-light">
                        {isArabic
                          ? 'صاحب العمل / ممثل الجهة أو المشروع'
                          : 'Project Owner / Commissioning Entity'}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#F0F3F6]/08 flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]/60 font-mono">
                        {isArabic ? 'آلية التوقيع:' : 'Execution Mode:'}
                      </span>
                      <span className="font-mono text-[#94A3B8] text-[11px]">
                        {isArabic ? 'سداد العربون أو التأكيد الرقمي' : 'Deposit or Digital Confirmation'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Disclaimer */}
                <div className="mt-8 text-center text-[11px] text-[#94A3B8]/50 font-mono">
                  © {new Date().getFullYear()} {displayName} • {pageTitle} • All Rights Reserved.
                </div>
              </section>
            </article>

            {/* Back to top / Return button at bottom of document */}
            <div className="my-8 text-center print:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-bold text-[#F0F3F6] hover:border-[#F59E0B]/60 hover:bg-[#1A202C] transition-all duration-200 group shadow-lg"
              >
                {dir === 'rtl' ? (
                  <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B] group-hover:translate-x-0.5 transition-transform" />
                ) : (
                  <ArrowLeft className="w-3.5 h-3.5 text-[#F59E0B] group-hover:-translate-x-0.5 transition-transform" />
                )}
                <span>{t('legal.back')}</span>
              </Link>
            </div>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: EMBEDDED OFFICIAL PDF VIEWER (EXACT CV VIEWER SHELL) */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'pdf' && effectivePdfUrl && (
          <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
            {/* Top Toolbar in PDF mode */}
            <div className="w-full flex items-center justify-between gap-3 mb-4 bg-[#10141C] p-3 px-5 rounded-2xl border border-[#F0F3F6]/10 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F59E0B]" />
                <span className="font-bold text-[#F0F3F6]">
                  {effectiveTerms.pdfFileName || 'Official Privacy & Terms PDF'}
                </span>
                <span className="hidden sm:inline text-xs font-mono text-[#94A3B8]">
                  ({formatBytes(effectiveTerms.pdfFileSize)})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('web')}
                  className="px-3 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
                >
                  {isArabic ? 'العودة للمستند الرقمي' : 'Back to Web Text'}
                </button>
                <a
                  href={effectivePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F0F3F6]"
                  title="Open Raw PDF in New Tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* PDF Embedded Object Frame */}
            <div
              className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#F0F3F6]/10 bg-[#10141C] shadow-2xl relative transition-all duration-200"
              style={{
                height: isFullscreen ? 'calc(100vh - 120px)' : 'calc(100vh - 150px)',
                minHeight: '600px',
              }}
            >
              <object
                data={`${effectivePdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                type="application/pdf"
                className="w-full h-full rounded-2xl sm:rounded-3xl bg-[#151A23]"
                title={`${displayName} — ${pageTitle}`}
              >
                <iframe
                  src={`${effectivePdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  title={`${displayName} — ${pageTitle}`}
                  className="w-full h-full rounded-2xl sm:rounded-3xl border-0 bg-[#151A23]"
                >
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-[#94A3B8]">
                    <FileText className="w-12 h-12 text-[#F59E0B] mb-4" />
                    <h3 className="text-base font-bold text-[#F0F3F6] mb-2">
                      PDF Document Preview
                    </h3>
                    <p className="text-xs max-w-sm mb-6 font-light">
                      Your browser does not support embedded PDF previewing. You can open the official document directly.
                    </p>
                    <a
                      href={effectivePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]"
                    >
                      Open PDF in New Tab
                    </a>
                  </div>
                </iframe>
              </object>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
