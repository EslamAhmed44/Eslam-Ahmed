'use client';

import React, { useState } from 'react';
import { Project } from '@/lib/types';
import { ProjectCard } from './ProjectCard';
import { useLanguage } from '../navigation/LanguageContext';
import { Sparkles } from 'lucide-react';

interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const categories = [
    { id: 'All', label: t('projects.filter.all') },
    { id: 'Motion Graphics', label: t('projects.filter.motion') },
    { id: 'Graphic Design', label: t('projects.filter.design') },
    { id: 'Branding', label: t('projects.filter.branding') },
    { id: 'Social Media', label: t('projects.filter.social') },
  ];

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  // Layout assignment for asymmetric editorial grid
  const getLayoutVariant = (index: number): 'large' | 'tall' | 'wide' | 'standard' => {
    const cycle = index % 4;
    if (cycle === 0) return 'large';
    if (cycle === 1) return 'tall';
    if (cycle === 2) return 'tall';
    return 'large';
  };

  return (
    <section id="projects" className="relative py-24 md:py-36 bg-[#07090D] overflow-hidden">
      {/* Ambient Radial Spotlight */}
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full bg-[#F59E0B]/06 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header and Filter Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
                {t('projects.eyebrow')}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#F0F3F6]">
              {t('projects.heading')}
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-[#10141C] border border-[#F0F3F6]/10 self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                  activeFilter === cat.id
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] shadow-[0_0_16px_rgba(245,158,11,0.3)]'
                    : 'text-[#94A3B8] hover:text-[#F0F3F6] hover:bg-[#151A23]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetric Editorial Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                layoutVariant={getLayoutVariant(idx)}
                index={idx}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-3xl bg-[#10141C] border border-dashed border-[#F0F3F6]/15 text-center">
            <p className="text-lg font-mono text-[#94A3B8]">{t('projects.empty')}</p>
          </div>
        )}
      </div>
    </section>
  );
};
