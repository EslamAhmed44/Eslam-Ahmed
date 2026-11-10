'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { Experience } from '@/lib/types';
import { Calendar, Briefcase } from 'lucide-react';
import { sound } from '@/lib/audio/sound';

interface ExperienceSectionProps {
  experiences: Experience[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences }) => {
  const { language, t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  // Format years/date display starting with 2025
  const formatDateRange = (exp: Experience) => {
    const startYear = exp.startDate ? new Date(exp.startDate).getFullYear() : '2025';
    if (exp.isPresent) {
      return `${startYear} — ${t('experience.present')}`;
    }
    const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : startYear;
    return `${startYear} — ${endYear}`;
  };

  if (!experiences || experiences.length === 0) return null;

  return (
    <section
      id="experience"
      ref={ref}
      className="relative py-24 md:py-32 bg-[var(--bg-secondary)] overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
            {t('experience.eyebrow')}
          </span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-16"
        >
          {t('experience.heading')}
        </motion.h2>

        {/* Timeline Container */}
        <div className="relative border-s border-[var(--border-subtle)] ms-4 md:ms-8 space-y-10">
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              onMouseEnter={() => sound.playHover()}
              className="relative ps-8 md:ps-12 group"
            >
              {/* Timeline Marker Node */}
              <div className="absolute -start-[9px] top-2 w-4 h-4 rounded-full bg-[var(--bg-primary)] border-2 border-[#F59E0B] group-hover:scale-125 group-hover:shadow-[0_0_16px_#F59E0B] transition-all duration-300">
                <span className="absolute inset-1 rounded-full bg-[#F59E0B]" />
              </div>

              {/* Timeline Card */}
              <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#F59E0B]/40 transition-all duration-300 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[#F59E0B] transition-colors">
                      {language === 'ar' && exp.titleAr ? exp.titleAr : exp.title}
                    </h3>
                    <p className="text-sm font-mono text-[var(--text-secondary)]">
                      {language === 'ar' && exp.companyAr ? exp.companyAr : exp.company}
                    </p>
                  </div>

                  {/* Year Tag Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs font-mono font-semibold text-[#F59E0B]">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDateRange(exp)}</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
                  {language === 'ar' && exp.descriptionAr ? exp.descriptionAr : exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
