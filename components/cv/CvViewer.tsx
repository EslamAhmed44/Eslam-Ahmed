'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/navigation/LanguageContext';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Eye,
  FileText,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface CvViewerProps {
  cvUrl?: string;
  designerName?: string;
}

export const CvViewer: React.FC<CvViewerProps> = ({
  cvUrl = '/cv/Islam_Ahmed_CV.pdf',
  designerName = 'Islam Ahmed',
}) => {
  const { language, dir, t } = useLanguage();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom handlers (step: 15%, min: 60%, max: 180%)
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 15, 180));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 15, 60));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  // Fullscreen toggle handler using HTML5 Fullscreen API
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

  // Listen for fullscreen change events (e.g. Esc key pressed by user)
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-[#07090D] text-[#F0F3F6] flex flex-col ${
        isFullscreen ? 'p-0' : ''
      }`}
      dir={dir}
    >
      {/* Top Controls Header Bar */}
      <header className="sticky top-0 z-40 bg-[#10141C]/95 backdrop-blur-xl border-b border-[#F0F3F6]/10 px-4 sm:px-6 py-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
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
            <span>{t('cv.back')}</span>
          </Link>

          {/* Document Title & Badge */}
          <div className="hidden md:flex items-center gap-2 border-s border-[#F0F3F6]/10 ps-3">
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs font-bold text-[#F0F3F6] tracking-tight">
              {designerName} — {t('cv.title')}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#151A23] border border-[#F59E0B]/30 text-[10px] font-mono text-[#F59E0B]">
              <ShieldCheck className="w-3 h-3 text-[#F59E0B]" />
              <span>{t('cv.verified')}</span>
            </span>
          </div>
        </div>

        {/* Right: Controls & Secondary Explicit Download */}
        <div className="flex items-center gap-2 sm:gap-2.5 ms-auto">
          {/* Zoom Controls */}
          <div className="flex items-center bg-[#151A23] border border-[#F0F3F6]/10 rounded-full p-1 gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 60}
              className="p-1.5 rounded-full text-[#94A3B8] hover:text-[#F0F3F6] hover:bg-[#10141C] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title={t('cv.zoomOut')}
              aria-label={t('cv.zoomOut')}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetZoom}
              className="px-2 py-0.5 text-[11px] font-mono font-medium text-[#F0F3F6] hover:text-[#F59E0B] transition-colors"
              title="Reset Zoom (100%)"
            >
              {zoomLevel}%
            </button>

            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 180}
              className="p-1.5 rounded-full text-[#94A3B8] hover:text-[#F0F3F6] hover:bg-[#10141C] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title={t('cv.zoomIn')}
              aria-label={t('cv.zoomIn')}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/40 transition-colors"
            title={t('cv.fullscreen')}
            aria-label={t('cv.fullscreen')}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Open in New Tab */}
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex p-2 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/40 transition-colors"
            title={t('cv.openNewTab')}
            aria-label={t('cv.openNewTab')}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Secondary Explicit Download Action (ONLY downloads upon direct user click) */}
          <a
            href={cvUrl}
            download="Islam_Ahmed_CV.pdf"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#07090D] bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] hover:shadow-[0_0_18px_rgba(245,158,11,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md"
            title={t('cv.download')}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">{t('cv.download')}</span>
          </a>
        </div>
      </header>

      {/* Main Canvas / PDF Viewer Area */}
      <main className="flex-1 w-full bg-[#07090D] relative flex items-center justify-center p-3 sm:p-6 overflow-auto">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[350px] bg-gradient-to-b from-[#F59E0B]/08 via-[#FF7A18]/03 to-transparent blur-3xl pointer-events-none" />

        <div
          className="w-full h-full flex items-center justify-center transition-all duration-200 relative z-10"
          style={{
            maxWidth: `${Math.max(zoomLevel, 100)}%`,
          }}
        >
          <div
            className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#F0F3F6]/10 bg-[#10141C] shadow-2xl relative transition-all duration-200"
            style={{
              height: isFullscreen ? 'calc(100vh - 65px)' : 'calc(100vh - 95px)',
              maxWidth: '960px',
            }}
          >
            {/* Real PDF Embed using Object / iFrame Fallback */}
            <object
              data={`${cvUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              type="application/pdf"
              className="w-full h-full rounded-2xl sm:rounded-3xl bg-[#151A23]"
              title={`${designerName} — Curriculum Vitae`}
            >
              <iframe
                src={`${cvUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                title={`${designerName} — Curriculum Vitae`}
                className="w-full h-full rounded-2xl sm:rounded-3xl border-0 bg-[#151A23]"
              >
                {/* Fallback for browsers with disabled inline PDF plugins */}
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-[#94A3B8]">
                  <FileText className="w-12 h-12 text-[#F59E0B] mb-4" />
                  <h3 className="text-base font-bold text-[#F0F3F6] mb-2">
                    PDF Preview
                  </h3>
                  <p className="text-xs max-w-sm mb-6 font-light">
                    Your browser does not support embedded PDF previewing. You can open or download the PDF document directly.
                  </p>
                  <div className="flex items-center gap-3">
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]"
                    >
                      {t('cv.openNewTab')}
                    </a>
                    <a
                      href={cvUrl}
                      download="Islam_Ahmed_CV.pdf"
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-xs font-bold text-[#07090D]"
                    >
                      {t('cv.download')}
                    </a>
                  </div>
                </div>
              </iframe>
            </object>
          </div>
        </div>
      </main>
    </div>
  );
};
