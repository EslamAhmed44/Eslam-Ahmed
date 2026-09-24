'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { Testimonial } from '@/lib/types';
import {
  MessageSquareQuote,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Star,
  MessageCircle,
  Calendar,
} from 'lucide-react';
import { WhatsAppIcon, MessengerIcon } from '../ui/Icons';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials = [],
}) => {
  const { language, t, dir } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  // Lightbox state
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Filter only published items (safeguard)
  const publishedItems = testimonials.filter((item) => item.status === 'published');

  // Open lightbox
  const openLightbox = (index: number) => {
    setActiveIdx(index);
  };

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setActiveIdx(null);
  }, []);

  // Next / Prev navigation
  const nextItem = useCallback(() => {
    if (activeIdx === null || publishedItems.length === 0) return;
    setActiveIdx((prev) => ((prev ?? 0) + 1) % publishedItems.length);
  }, [activeIdx, publishedItems.length]);

  const prevItem = useCallback(() => {
    if (activeIdx === null || publishedItems.length === 0) return;
    setActiveIdx((prev) => ((prev ?? 0) - 1 + publishedItems.length) % publishedItems.length);
  }, [activeIdx, publishedItems.length]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (activeIdx === null) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        if (dir === 'rtl') prevItem();
        else nextItem();
      } else if (e.key === 'ArrowLeft') {
        if (dir === 'rtl') nextItem();
        else prevItem();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIdx, closeLightbox, nextItem, prevItem, dir]);

  // Helper to render feedback type badge
  const renderFeedbackBadge = (type?: string) => {
    const norm = (type || 'WhatsApp').toLowerCase();

    if (norm.includes('whatsapp')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>WhatsApp</span>
        </span>
      );
    }

    if (norm.includes('messenger')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
          <MessengerIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Messenger</span>
        </span>
      );
    }

    if (norm.includes('email') || norm.includes('mail')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
          <Mail className="w-3.5 h-3.5 text-amber-400" />
          <span>Email</span>
        </span>
      );
    }

    if (norm.includes('review')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/25 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
          <Star className="w-3.5 h-3.5 text-purple-400 fill-current" />
          <span>Client Review</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#151A23] text-[#94A3B8] border border-[#F0F3F6]/10">
        <MessageCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
        <span>{type || 'Client Chat'}</span>
      </span>
    );
  };

  const currentItem = activeIdx !== null ? publishedItems[activeIdx] : null;

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative py-24 md:py-36 bg-[#07090D] overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -start-40 w-96 h-96 bg-[#F59E0B]/04 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -end-40 w-96 h-96 bg-[#FF7A18]/03 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Eyebrow & Title */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquareQuote className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
              {t('testimonials.eyebrow')}
            </span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#F0F3F6] mb-4"
          >
            {t('testimonials.heading')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg text-[#94A3B8] font-light leading-relaxed"
          >
            {t('testimonials.subheading')}
          </motion.p>
        </div>

        {/* Dynamic Client Feedback Grid */}
        {publishedItems.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 sm:gap-8 [column-fill:_balance]">
            {publishedItems.map((item, idx) => {
              const screenshot = item.screenshotUrl || item.imageUrl || item.photoUrl || '';
              const caption =
                language === 'ar' && item.captionAr ? item.captionAr : item.caption || item.quote;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: Math.min(idx * 0.1, 0.4) }}
                  className="break-inside-avoid mb-6 sm:mb-8 group"
                >
                  <div className="rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 hover:border-[#F59E0B]/40 transition-all duration-300 p-4 sm:p-5 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.7)]">
                    {/* Card Header: Channel & Date */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      {renderFeedbackBadge(item.feedbackType)}

                      {item.date && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-[#94A3B8]/70">
                          <Calendar className="w-3 h-3 text-[#F59E0B]/70" />
                          <span>{item.date}</span>
                        </span>
                      )}
                    </div>

                    {/* Screenshot Container (Clickable with Zoom Hover) */}
                    <div
                      onClick={() => openLightbox(idx)}
                      className="relative rounded-2xl overflow-hidden bg-[#07090D] border border-[#F0F3F6]/10 cursor-pointer group/img transition-all duration-300 hover:border-[#F59E0B]/40"
                    >
                      {/* Screenshot Graphic - Uncropped & Crisp */}
                      {screenshot ? (
                        <div className="relative w-full flex items-center justify-center bg-[#07090D]/80">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={screenshot}
                            alt={item.clientName || 'Client Feedback Screenshot'}
                            loading="lazy"
                            className="w-full h-auto max-h-[550px] object-contain block transition-transform duration-500 group-hover/img:scale-[1.015]"
                          />
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-xs font-mono text-[#94A3B8]">
                          Screenshot pending
                        </div>
                      )}

                      {/* Hover Overlay with Zoom Icon */}
                      <div className="absolute inset-0 bg-[#07090D]/50 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#151A23]/90 border border-[#F59E0B]/50 text-[#F0F3F6] text-xs font-semibold shadow-xl transform translate-y-2 group-hover/img:translate-y-0 transition-transform duration-300">
                          <Maximize2 className="w-4 h-4 text-[#F59E0B]" />
                          <span>{t('testimonials.clickToExpand')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Client Info & Optional Caption */}
                    {(item.clientName || item.projectName || caption) && (
                      <div className="mt-4 pt-3.5 border-t border-[#F0F3F6]/08 flex flex-col gap-1.5">
                        {(item.clientName || item.projectName) && (
                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                            {item.clientName && (
                              <span className="font-bold text-[#F0F3F6]">{item.clientName}</span>
                            )}
                            {item.clientName && item.projectName && (
                              <span className="text-[#94A3B8]/40">•</span>
                            )}
                            {item.projectName && (
                              <span className="text-[#94A3B8] font-mono text-[11px]">
                                {item.projectName}
                              </span>
                            )}
                          </div>
                        )}

                        {caption && (
                          <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                            {caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 rounded-3xl bg-[#10141C] border border-dashed border-[#F0F3F6]/15 text-center">
            <p className="text-base sm:text-lg font-mono text-[#94A3B8]">
              {t('testimonials.empty')}
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Screenshot Lightbox Viewer */}
      <AnimatePresence>
        {activeIdx !== null && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-[#07090D]/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 md:p-8"
            onClick={closeLightbox}
          >
            {/* Lightbox Top Header Bar */}
            <div
              className="flex items-center justify-between gap-4 w-full max-w-6xl mx-auto z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Details */}
              <div className="flex items-center gap-3">
                {renderFeedbackBadge(currentItem.feedbackType)}
                <div className="hidden sm:block">
                  <div className="text-sm font-bold text-[#F0F3F6]">
                    {currentItem.clientName || 'Client Feedback'}
                  </div>
                  {currentItem.projectName && (
                    <div className="text-[11px] font-mono text-[#94A3B8]">
                      {currentItem.projectName}
                    </div>
                  )}
                </div>
              </div>

              {/* Center Counter */}
              <div className="px-3.5 py-1 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-mono text-[#94A3B8]">
                {activeIdx + 1} / {publishedItems.length}
              </div>

              {/* Right Close Button */}
              <button
                onClick={closeLightbox}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-[#F0F3F6] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors duration-200"
                aria-label="Close Lightbox"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-mono">ESC</span>
              </button>
            </div>

            {/* Lightbox Center Content with Nav Arrows & Screenshot */}
            <div
              className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center min-h-0 my-3 sm:my-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Button */}
              {publishedItems.length > 1 && (
                <button
                  onClick={prevItem}
                  className="absolute start-2 sm:start-4 z-20 p-3 rounded-full bg-[#10141C]/80 backdrop-blur-md border border-[#F0F3F6]/15 text-[#F0F3F6] hover:bg-[#F59E0B] hover:text-[#07090D] hover:border-[#F59E0B] transition-all duration-200 shadow-xl"
                  aria-label="Previous Screenshot"
                >
                  <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                </button>
              )}

              {/* Main Screenshot Container */}
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="relative max-h-full max-w-full flex items-center justify-center p-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    currentItem.screenshotUrl ||
                    currentItem.imageUrl ||
                    currentItem.photoUrl ||
                    ''
                  }
                  alt={currentItem.clientName || 'Client Feedback'}
                  className="max-h-[78vh] sm:max-h-[80vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-[#F0F3F6]/15 select-none"
                />
              </motion.div>

              {/* Next Button */}
              {publishedItems.length > 1 && (
                <button
                  onClick={nextItem}
                  className="absolute end-2 sm:end-4 z-20 p-3 rounded-full bg-[#10141C]/80 backdrop-blur-md border border-[#F0F3F6]/15 text-[#F0F3F6] hover:bg-[#F59E0B] hover:text-[#07090D] hover:border-[#F59E0B] transition-all duration-200 shadow-xl"
                  aria-label="Next Screenshot"
                >
                  <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </button>
              )}
            </div>

            {/* Lightbox Bottom Caption Bar */}
            <div
              className="w-full max-w-3xl mx-auto text-center z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {(currentItem.caption || currentItem.captionAr || currentItem.quote) && (
                <div className="inline-block px-5 py-2.5 rounded-2xl bg-[#10141C]/90 border border-[#F0F3F6]/10 text-xs sm:text-sm text-[#F0F3F6]/90 shadow-xl">
                  {language === 'ar' && currentItem.captionAr
                    ? currentItem.captionAr
                    : currentItem.caption || currentItem.quote}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
