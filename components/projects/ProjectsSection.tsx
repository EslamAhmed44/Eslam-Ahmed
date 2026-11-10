'use client';

import React, { useState, useMemo } from 'react';
import { Project } from '@/lib/types';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';
import { useLanguage } from '../navigation/LanguageContext';
import { sound } from '@/lib/audio/sound';
import { Sparkles, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Dynamically extract unique categories from actual project data + core creative fields
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    ['Motion Graphics', 'Graphic Design', 'Branding', 'Social Media'].forEach((c) => set.add(c));
    projects.forEach((p) => {
      if (Array.isArray(p.categories)) {
        p.categories.forEach((c) => c && set.add(c));
      } else if (p.category) {
        set.add(p.category);
      }
    });
    return Array.from(set);
  }, [projects]);

  const filterTabs = [
    { id: 'All', label: t('projects.filter.all') },
    ...categoriesList.map((cat) => {
      const lower = cat.toLowerCase();
      let label = cat;
      if (lower.includes('motion')) label = t('projects.filter.motion');
      else if (lower.includes('graphic') && !lower.includes('motion')) label = t('projects.filter.design');
      else if (lower.includes('brand')) label = t('projects.filter.branding');
      else if (lower.includes('social')) label = t('projects.filter.social');
      else if (lower.includes('poster')) label = t('projects.filter.poster');
      else if (lower.includes('campaign')) label = t('projects.filter.campaign');
      return { id: cat, label };
    }),
  ];

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return projects;
    return projects.filter((p) => {
      if (Array.isArray(p.categories) && p.categories.length > 0) {
        return p.categories.some(
          (c) => c.trim().toLowerCase() === activeFilter.trim().toLowerCase()
        );
      }
      return p.category?.trim().toLowerCase() === activeFilter.trim().toLowerCase();
    });
  }, [projects, activeFilter]);

  // Mixed Editorial Layout assignment
  const getLayoutVariant = (index: number): 'large' | 'tall' | 'wide' | 'standard' => {
    const cycle = index % 3;
    if (cycle === 0) return 'large';
    if (cycle === 1) return 'tall';
    return 'wide';
  };

  const handleFilterClick = (id: string) => {
    sound.playClick();
    setActiveFilter(id);
  };

  return (
    <section id="projects" className="relative py-28 md:py-40 bg-[var(--bg-primary)] overflow-hidden">
      {/* Structural ambient light */}
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] rounded-full bg-[#F59E0B]/05 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-[#FF7A18]/04 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 border-b border-[var(--border-subtle)] pb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
                {t('projects.eyebrow')}
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[var(--text-primary)]">
              {t('projects.heading')}
            </h2>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] self-start lg:self-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleFilterClick(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-semibold transition-all duration-300 cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#F59E0B] text-[#07090D] shadow-[0_0_18px_rgba(245,158,11,0.35)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mixed Editorial Portfolio Grid */}
        {filteredProjects.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8"
          >
            <AnimatePresence>
              {filteredProjects.map((proj, idx) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  layoutVariant={getLayoutVariant(idx)}
                  onSelect={(p) => setSelectedProject(p)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <p className="text-[#94A3B8] font-mono">{t('projects.empty')}</p>
          </div>
        )}
      </div>

      {/* Internal Interactive Modal */}
      <ProjectModal
        project={selectedProject}
        allProjects={projects}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(p) => setSelectedProject(p)}
      />
    </section>
  );
};
