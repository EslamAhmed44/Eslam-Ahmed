'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { Sparkles } from 'lucide-react';

interface AboutSectionProps {
  shortBio: string;
  shortBioAr: string;
  longBio: string;
  longBioAr: string;
  stats: {
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
  stats,
}) => {
  const { language, t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const activeShortBio = language === 'ar' ? shortBioAr : shortBio;
  const activeLongBio = language === 'ar' ? longBioAr : longBio;

  const statItems = [
    { value: stats.experienceYears || '2+', label: t('about.stat.experience') },
    { value: stats.projectsCount || '35+', label: t('about.stat.projects') },
    { value: stats.clientsCount || '20+', label: t('about.stat.clients') },
    { value: stats.toolsCount || '12+', label: t('about.stat.tools') },
  ];

  return (
    <section id="about" ref={ref} className="relative py-24 md:py-32 bg-[#07090D] overflow-hidden">
      {/* Subtle Ambient Radial Light */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#F59E0B]/05 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Eyebrow Label */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
            {t('about.eyebrow')}
          </span>
        </div>

        {/* Section Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#F0F3F6] max-w-4xl mb-12"
        >
          {t('about.heading')}
        </motion.h2>

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 mb-16 items-start">
          {/* Highlight Short Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/08 rounded-full blur-2xl group-hover:bg-[#F59E0B]/15 transition-all duration-500" />
            <p className="text-xl sm:text-2xl font-light leading-relaxed text-[#F0F3F6]">
              &ldquo;{activeShortBio}&rdquo;
            </p>
          </motion.div>

          {/* Detailed Editorial Narrative */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <p className="text-base sm:text-lg leading-relaxed text-[#94A3B8]">
              {activeLongBio}
            </p>
          </motion.div>
        </div>

        {/* Animated Statistics Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {statItems.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
              className="p-6 sm:p-8 rounded-2xl bg-[#151A23]/60 border border-[#F0F3F6]/05 hover:border-[#F59E0B]/30 hover:bg-[#151A23] transition-all duration-300"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F0F3F6] tracking-tight mb-2">
                <span className="bg-gradient-to-r from-[#F0F3F6] via-[#F59E0B] to-[#FF7A18] bg-clip-text text-transparent">
                  {stat.value}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-medium text-[#94A3B8]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
