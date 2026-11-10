'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { sound } from '@/lib/audio/sound';
import { Sparkles, Compass, ShieldCheck, Cpu } from 'lucide-react';
import { SoftwareIcon } from '../ui/SoftwareIcon';

interface AboutSectionProps {
  shortBio: string;
  shortBioAr: string;
  longBio: string;
  longBioAr: string;
  stats?: {
    experienceYears: string;
    projectsCount: string;
    clientsCount: string;
    toolsCount: string;
  };
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  shortBio,
  shortBioAr,
  longBio,
  longBioAr,
}) => {
  const { language, t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-70px' });

  const activeShortBio = language === 'ar' ? (shortBioAr || 'صياغة هويات بصرية وسرديات حركية تطمس الحدود بين الوضوح الجرافيكي والعمق السينمائي المعبر.') : (shortBio || 'Crafting visual identities and kinetic narratives that blur the boundary between graphic clarity and cinematic emotion.');
  const activeLongBio = language === 'ar' ? (longBioAr || 'وراء كل حضور رقمي ناجح هندسة دقيقة تجمع بين التصميم، الحركة، والضوء. أعمل في نقطة التقاطع بين الابتكار الجرافيكي والموشن جرافيك الديناميكي لأحول الرؤى المجرّدة إلى واقع رقمي يهيمن على الشاشات ويثبت في الذاكرة.') : (longBio || 'Behind every compelling digital presence lies a meticulous architecture of design, movement, and light. Operating at the intersection of graphic innovation, dynamic motion graphics, and striking imagery, I transform abstract visions into unforgettable digital realities that command attention and communicate with purpose.');

  const coreSkills = [
    { name: 'Motion Graphics', ar: 'موشن جرافيك', software: 'After Effects' },
    { name: 'Brand Identity', ar: 'الهوية البصرية', software: 'Illustrator' },
    { name: 'Social Media Design', ar: 'تصميم السوشيال ميديا', software: 'Photoshop' },
    { name: 'Video Editing', ar: 'مونتاج الفيديو', software: 'Premiere Pro' },
  ];

  const statItems = [
    { value: '2025', label: language === 'ar' ? 'سنة التأسيس والانطلاق' : 'Designing Since' },
    { value: '2+', label: language === 'ar' ? 'سنوات من الخبرة العملية' : 'Years Experience' },
    { value: '100%', label: language === 'ar' ? 'دقة تنفيذية والتزام' : 'Visual Precision' },
    { value: 'Cairo', label: language === 'ar' ? 'المقر (متاح عالمياً)' : 'Base Location (Global)' },
  ];

  return (
    <section id="about" ref={ref} className="relative py-28 md:py-40 bg-[var(--bg-secondary)] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#F59E0B]/05 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Eyebrow Label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
            {t('about.eyebrow')}
          </span>
        </div>

        {/* Section Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[var(--text-primary)] max-w-4xl mb-14"
        >
          {t('about.heading')}
        </motion.h2>

        {/* Editorial Story Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 mb-16 items-stretch">
          {/* Left Column: Short Bio Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 p-8 md:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative overflow-hidden flex flex-col justify-between group shadow-sm"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#F59E0B]/08 rounded-full blur-3xl group-hover:bg-[#F59E0B]/15 transition-all duration-500" />
            <div className="relative z-10">
              <span className="text-xs font-mono text-[#F59E0B] uppercase tracking-widest block mb-4">
                STATEMENT // 01
              </span>
              <p className="text-xl sm:text-2xl md:text-3xl font-light leading-relaxed text-[var(--text-primary)]">
                &ldquo;{activeShortBio}&rdquo;
              </p>
            </div>

            <div className="relative z-10 pt-8 border-t border-[var(--border-subtle)] mt-8 flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-secondary)]">ISLAM AHMED</span>
              <span className="text-xs font-mono text-[#F59E0B]">CREATIVE DIRECTION</span>
            </div>
          </motion.div>

          {/* Right Column: Detailed Narrative & Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="lg:col-span-6 flex flex-col justify-between space-y-6"
          >
            <div className="p-8 md:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <span className="text-xs font-mono text-[#F59E0B] uppercase tracking-widest block mb-4">
                BACKGROUND // 02
              </span>
              <p className="text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
                {activeLongBio}
              </p>
            </div>

            {/* Core Competencies Matrix */}
            <div className="grid grid-cols-2 gap-4">
              {coreSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#F59E0B]/40 transition-colors flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      {language === 'ar' ? skill.ar : skill.name}
                    </h4>
                    <span className="text-xs font-mono text-[var(--text-tertiary)]">
                      {skill.software}
                    </span>
                  </div>
                  <SoftwareIcon name={skill.software} className="w-4 h-4" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Brand Philosophy Banner: GRAVITY IN MOTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-[#0C1017] via-[#121824] to-[#0C1017] border border-[#F59E0B]/30 mb-16 relative overflow-hidden text-center md:text-start"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-mono text-[#F59E0B] uppercase tracking-widest block mb-2">
                {t('philosophy.eyebrow')}
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#F0F3F6] mb-3">
                {t('philosophy.title')}
              </h3>
              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                &ldquo;{t('philosophy.quote')}&rdquo;
              </p>
            </div>

            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#151A24] border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <Compass className="w-8 h-8 animate-[spin_30s_linear_infinite]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verified Statistics Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {statItems.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
              className="p-6 md:p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col items-center justify-center text-center group hover:border-[#F59E0B]/40 transition-colors shadow-sm"
            >
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F59E0B] font-mono tracking-tight mb-2 group-hover:scale-105 transition-transform">
                {stat.value}
              </span>
              <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
