'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { SkillGroup } from '@/lib/types';
import { Layers } from 'lucide-react';
import { SoftwareIcon } from '../ui/SoftwareIcon';

interface SkillsSectionProps {
  skillGroups: SkillGroup[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skillGroups }) => {
  const { language, t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="skills" ref={ref} className="relative py-24 md:py-32 bg-[#07090D] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
            {t('skills.eyebrow')}
          </span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#F0F3F6] mb-16"
        >
          {t('skills.heading')}
        </motion.h2>

        {/* Skill Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {(skillGroups || []).map((group, idx) => {
            const visibleSkills = (group.skills || []).filter((s) => s.enabled !== false);
            if (visibleSkills.length === 0) return null;

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-7 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 hover:border-[#F59E0B]/40 hover:bg-[#151A23] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors">
                      {language === 'ar' && group.titleAr ? group.titleAr : group.title}
                    </h3>
                    <span className="text-xs font-mono text-[#94A3B8]/60">0{idx + 1}</span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {visibleSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-medium text-[#F0F3F6] group-hover:border-[#F59E0B]/30 hover:border-[#F59E0B] transition-all duration-200 shadow-sm"
                      >
                        <SoftwareIcon
                          name={skill.name}
                          iconUrl={skill.iconUrl}
                          className="w-4 h-4"
                        />
                        <span>
                          {language === 'ar' && skill.nameAr ? skill.nameAr : skill.name}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
