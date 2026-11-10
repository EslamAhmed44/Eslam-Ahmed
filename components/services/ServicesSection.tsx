'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { sound } from '@/lib/audio/sound';
import { ServiceItem } from '@/lib/types';
import { SoftwareIcon } from '../ui/SoftwareIcon';
import {
  ArrowUpRight,
  ChevronDown,
  Layers,
  Sparkles,
  Video,
  Wand2,
} from 'lucide-react';

interface ServicesSectionProps {
  services?: ServiceItem[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services = [] }) => {
  const { language, t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-70px' });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const defaultServices = [
    {
      number: '01',
      title: 'Motion Graphics & Video Editing',
      titleAr: 'الموشن جرافيك ومونتاج الفيديو',
      description: 'Dynamic 2D/3D motion graphics, commercial animated promos, and cinematic video editing with rhythmically synchronized sound design.',
      descriptionAr: 'تصميم موشن جرافيك ثنائي وثلاثي الأبعاد، فيديوهات ترويجية إعلانية، ومونتاج سينمائي متقن بتزامن صوتي مؤثر.',
      tools: ['After Effects', 'Premiere Pro'],
      category: 'Motion Graphics',
    },
    {
      number: '02',
      title: 'Brand Identity Systems',
      titleAr: 'أنظمة الهوية البصرية المتكاملة',
      description: 'End-to-end visual identity architecture: memorable logos, color psychology, typographic rules, and scalable brand design guidelines.',
      descriptionAr: 'بناء الهوية البصرية من الصفر: تصميم الشعارات الفريدة، سيكولوجية الألوان، قواعد التايبوجرافي، وأدلة الهوية المتكاملة.',
      tools: ['Illustrator', 'Photoshop'],
      category: 'Branding',
    },
    {
      number: '03',
      title: 'Social Media Campaign Design',
      titleAr: 'تصميم حملات السوشيال ميديا',
      description: 'High-converting social media visual suites designed for Instagram, Facebook, and LinkedIn with strict aesthetic consistency.',
      descriptionAr: 'تصاميم إعلانية ومحتوى احترافي لمنصات إنستغرام، فيسبوك، ولينكد إن لزيادة التفاعل وبناء المصداقية.',
      tools: ['Photoshop', 'Illustrator'],
      category: 'Social Media',
    },
    {
      number: '04',
      title: 'Kinetic Typography & Social Promos',
      titleAr: 'التايبوجرافي الحركي والإعلانات الترويجية',
      description: 'Choreographed typography and kinetic text pacing that gives words emotional weight, momentum, and instant visual impact.',
      descriptionAr: 'تحريك النصوص والعبارات بإيقاع بصري جذاب يمنح الكلمات وزناً وتأثيراً فورياً على المشاهد.',
      tools: ['After Effects'],
      category: 'Motion Graphics',
    },
    {
      number: '05',
      title: 'Print & Commercial Marketing Collateral',
      titleAr: 'المطبوعات والمواد الترويجية',
      description: 'Brochures, posters, exhibition packaging, and marketing collateral prepared with flawless pre-press color profiles and technical precision.',
      descriptionAr: 'بروشورات فاخرة، ملصقات، بطاقات عمل، ومطبوعات معارض مجهزة بأعلى معايير الطباعة وضبط الألوان.',
      tools: ['Illustrator', 'InDesign', 'Photoshop'],
      category: 'Graphic Design',
    },
    {
      number: '06',
      title: 'Visual Art Direction & Key Visuals',
      titleAr: 'التوجيه الفني والمفاتيح البصرية',
      description: 'Futuristic conceptual visuals, product launch anchors, and art-directed key imagery that define the mood and tone of campaigns.',
      descriptionAr: 'مفاتيح بصرية حصرية وتوجيه فني متكامل للحملات الكبرى لترسيخ طابع بصري مميز لا يُنسى.',
      tools: ['Photoshop', 'After Effects'],
      category: 'Graphic Design',
    },
  ];

  const handleToggle = (idx: number) => {
    sound.playClick();
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <section id="services" ref={ref} className="relative py-28 md:py-40 bg-[var(--bg-primary)] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] rounded-full bg-[#F59E0B]/05 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-[var(--border-subtle)] pb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
                {t('services.eyebrow')}
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[var(--text-primary)]">
              {t('services.heading')}
            </h2>
          </div>

          <p className="text-sm sm:text-base font-mono text-[var(--text-secondary)] max-w-md">
            EDITORIAL EXPERTISE • MOTION PHYSICS • BRAND CLARITY
          </p>
        </div>

        {/* Creative Numbered List Layout (Refined Accordion / Expandable Item Rows) */}
        <div className="space-y-4">
          {defaultServices.map((srv, idx) => {
            const isExpanded = expandedIndex === idx;
            const title = language === 'ar' ? srv.titleAr : srv.title;
            const description = language === 'ar' ? srv.descriptionAr : srv.description;

            return (
              <motion.div
                key={srv.number}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => handleToggle(idx)}
                className={`group rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                  isExpanded
                    ? 'bg-[var(--bg-surface)] border-[#F59E0B]/50 shadow-[0_10px_30px_rgba(245,158,11,0.08)]'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                {/* Collapsed Header Bar */}
                <div className="flex items-center justify-between p-6 sm:p-8">
                  <div className="flex items-center gap-4 sm:gap-8">
                    <span className="text-lg sm:text-2xl font-mono font-bold text-[#F59E0B]">
                      {srv.number}
                    </span>
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] group-hover:text-[#F59E0B] transition-colors">
                      {title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-tertiary)] uppercase">
                      {srv.category}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-[#F59E0B]' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="px-6 sm:px-8 pb-8 pt-2 border-t border-[var(--border-subtle)]"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        <div className="lg:col-span-8">
                          <p className="text-base sm:text-lg leading-relaxed text-[var(--text-secondary)] mb-6">
                            {description}
                          </p>

                          {/* Software Tools Tag Row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-[#F59E0B] uppercase tracking-wider me-2">
                              {language === 'ar' ? 'البرامج المعتمدة:' : 'Tools & Software:'}
                            </span>
                            {srv.tools.map((tool, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)]"
                              >
                                <SoftwareIcon name={tool} className="w-3.5 h-3.5" />
                                <span>{tool}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="lg:col-span-4 flex justify-start lg:justify-end">
                          <a
                            href="#contact"
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.playClick();
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F59E0B] text-[#07090D] font-mono font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md"
                          >
                            <span>{t('services.contactCta')}</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Clear Post-Services CTA */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between p-8 md:p-12 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-strong)] gap-6">
          <div>
            <h4 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-2">
              {language === 'ar' ? 'هل لديك فكرة أو مشروع خاص؟' : 'Need a specialized creative project?'}
            </h4>
            <p className="text-sm font-mono text-[var(--text-secondary)]">
              {language === 'ar' ? 'تواصل معي مباشرة لمناقشة التفاصيل وبدء التنفيذ.' : 'Reach out directly to discuss timelines, scope, and technical deliverables.'}
            </p>
          </div>

          <a
            href="#contact"
            onClick={() => sound.playClick()}
            className="px-8 py-4 rounded-full bg-[#F59E0B] text-[#07090D] font-mono font-bold text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] whitespace-nowrap cursor-pointer"
          >
            {t('services.contactCta')}
          </a>
        </div>
      </div>
    </section>
  );
};
