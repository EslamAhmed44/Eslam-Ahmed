'use client';

import React, { useState } from 'react';
import { Project } from '@/lib/types';
import { User, Calendar, Layers, Video, ChevronDown, ChevronUp, Palette, Sparkles } from 'lucide-react';

interface ProjectMetadataGridProps {
  project: Project;
}

export const ProjectMetadataGrid: React.FC<ProjectMetadataGridProps> = ({ project }) => {
  const [isDisciplinesExpanded, setIsDisciplinesExpanded] = useState(false);

  // Extract normalized disciplines list
  const disciplines: string[] = React.useMemo(() => {
    if (Array.isArray(project.categories) && project.categories.length > 0) {
      return project.categories.filter(Boolean);
    }
    if (project.category) {
      return [project.category];
    }
    return ['Creative Design'];
  }, [project.categories, project.category]);

  // Determine Project Scope / Type
  const hasVideos = Boolean(
    (project.videos && project.videos.length > 0) || project.videoUrl
  );
  const hasGallery = Boolean(project.gallery && project.gallery.length > 0);
  const isBranding = disciplines.some((d) => d.toLowerCase().includes('brand'));

  let projectTypeLabel = 'Key Visuals & Stills';
  let projectTypeIcon = <Palette className="w-3.5 h-3.5 text-[#F59E0B]" />;

  if (hasVideos && hasGallery) {
    projectTypeLabel = 'Mixed Media Campaign';
    projectTypeIcon = <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />;
  } else if (hasVideos) {
    projectTypeLabel = 'Motion & Video Reel';
    projectTypeIcon = <Video className="w-3.5 h-3.5 text-[#F59E0B]" />;
  } else if (isBranding) {
    projectTypeLabel = 'Brand Identity & Visuals';
    projectTypeIcon = <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />;
  }

  // Smart discipline threshold: show up to 2 chips in compact mode, or all when expanded
  const shouldCollapseDisciplines = disciplines.length > 2;
  const visibleDisciplines =
    shouldCollapseDisciplines && !isDisciplinesExpanded
      ? disciplines.slice(0, 2)
      : disciplines;
  const hiddenCount = disciplines.length - 2;

  return (
    <div className="rounded-3xl bg-[#10141C] border border-[#F0F3F6]/10 p-5 sm:p-7 mb-16 shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* CARD 1: CLIENT */}
        <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#151A23]/40 border border-[#F0F3F6]/05 hover:border-[#F59E0B]/20 transition-all duration-300 min-h-[105px]">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#F59E0B] mb-2">
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Client</span>
            </div>
            <div
              className="text-sm sm:text-base font-bold text-[#F0F3F6] leading-snug break-words"
              title={project.client || 'Creative Initiative'}
            >
              {project.client || 'Creative Initiative'}
            </div>
          </div>
        </div>

        {/* CARD 2: YEAR / TIMELINE */}
        <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#151A23]/40 border border-[#F0F3F6]/05 hover:border-[#F59E0B]/20 transition-all duration-300 min-h-[105px]">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#F59E0B] mb-2">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Timeline / Year</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-[#F0F3F6] font-mono">
              {project.projectDate || 'Recent Work'}
            </div>
          </div>
        </div>

        {/* CARD 3: DISCIPLINES (SMART CHIPS & CONTROLLED EXPANSION) */}
        <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#151A23]/40 border border-[#F0F3F6]/05 hover:border-[#F59E0B]/20 transition-all duration-300 min-h-[105px] overflow-hidden">
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#F59E0B]">
                <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Disciplines</span>
              </div>
              {disciplines.length > 1 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#10141C] border border-[#F0F3F6]/10 text-[#94A3B8]">
                  {disciplines.length}
                </span>
              )}
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {visibleDisciplines.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#10141C] border border-[#F0F3F6]/10 text-xs font-medium text-[#F0F3F6] shadow-sm hover:border-[#F59E0B]/40 transition-colors"
                >
                  {item}
                </span>
              ))}

              {/* View More / Toggle Button */}
              {shouldCollapseDisciplines && (
                <button
                  type="button"
                  onClick={() => setIsDisciplinesExpanded(!isDisciplinesExpanded)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#10141C] border border-[#F59E0B]/30 text-xs font-mono font-medium text-[#F59E0B] hover:bg-[#F59E0B]/10 hover:border-[#F59E0B]/60 transition-colors cursor-pointer"
                  title={
                    isDisciplinesExpanded
                      ? 'Collapse disciplines list'
                      : `View ${hiddenCount} more: ${disciplines.slice(2).join(', ')}`
                  }
                  aria-expanded={isDisciplinesExpanded}
                >
                  <span>{isDisciplinesExpanded ? 'Less' : `+${hiddenCount} more`}</span>
                  {isDisciplinesExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CARD 4: PROJECT TYPE */}
        <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#151A23]/40 border border-[#F0F3F6]/05 hover:border-[#F59E0B]/20 transition-all duration-300 min-h-[105px]">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#F59E0B] mb-2">
              {projectTypeIcon}
              <span>Project Type</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-[#F0F3F6] leading-snug">
              {projectTypeLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
