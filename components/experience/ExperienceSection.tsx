'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { Experience } from '@/lib/types';
import { Briefcase, Calendar } from 'lucide-react';

interface ExperienceSectionProps {
  experiences: Experience[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences }) => {
  const { language, t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  // Format years/date display
  const formatDateRange = (exp: Experience) => {
    const startYear = exp.startDate ? new Date(exp.startDate).getFullYear() : '2023';
    if (exp.isPresent) {
      return `${startYear} — ${t('experience.present')}`;
    }
    const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : startYear;
    return `${startYear} — ${endYear}`;
  };

  return (
    <section
      id="experience"
      ref={ref}
      className="relative py-24 md:py-32 bg-[#10141C] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
            {t('experience.eyebrow')}
          </span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#F0F3F6] mb-16"
        >
          {t('experience.heading')}
        </motion.h2>

        {/* Timeline Container */}
        <div className="relative border-s border-[#F0F3F6]/10 ms-4 md:ms-8 space-y-12">
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="relative ps-8 md:ps-12 group"
            >
              {/* Glowing Timeline Marker Node */}
              <div className="absolute -start-[9px] top-1.5 w-4 h-4 rounded-full bg-[#151A23] border-2 border-[#F59E0B] group-hover:scale-125 group-hover:shadow-[0_0_16px_#F59E0B] transition-all duration-300">
                <span className="absolute inset-1 rounded-full bg-[#F59E0B]" />
              </div>

              {/* Timeline Card */}
              <div className="p-7 rounded-3xl bg-[#151A23]/70 border border-[#F0F3F6]/08 hover:border-[#F59E0B]/30 hover:bg-[#151A23] transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors">
                      {language === 'ar' && exp.titleAr ? exp.titleAr : exp.title}
                    </h3>
                    <p className="text-sm font-medium text-[#94A3B8]">
                      {language === 'ar' && exp.companyAr ? exp.companyAr : exp.company}
                    </p>
                  </div>

                  {/* Year Tag Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#10141C] border border-[#F0F3F6]/10 text-xs font-mono font-semibold text-[#F59E0B]">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDateRange(exp)}</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-[#94A3B8]/90">
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
