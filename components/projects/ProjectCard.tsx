'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types';
import { useLanguage } from '../navigation/LanguageContext';
import { ArrowUpRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateMediaDimensions, getRatioLabel } from '@/lib/media/dimensions';
import { SoftwareIcon } from '../ui/SoftwareIcon';
import { ProjectMediaSlideshow } from './ProjectMediaSlideshow';

interface ProjectCardProps {
  project: Project;
  layoutVariant: 'large' | 'wide' | 'tall' | 'standard';
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  layoutVariant,
  index,
}) => {
  const { language } = useLanguage();
  const [liveDim, setLiveDim] = useState<{
    width?: number;
    height?: number;
    aspectRatio?: number;
    orientation?: 'portrait' | 'landscape' | 'square';
  }>({
    width: project.width,
    height: project.height,
    aspectRatio: project.aspectRatio,
    orientation: project.orientation,
  });

  const title = language === 'ar' && project.titleAr ? project.titleAr : project.title;
  const description =
    language === 'ar' && project.descriptionAr ? project.descriptionAr : project.description;

  const currentRatio = liveDim.aspectRatio || project.aspectRatio;
  const currentOrientation = liveDim.orientation || project.orientation;

  const isPortrait = currentOrientation === 'portrait' || (currentRatio && currentRatio < 0.88);
  const isSquare = currentOrientation === 'square' || (currentRatio && Math.abs(currentRatio - 1) < 0.12);
  const isLandscape = currentOrientation === 'landscape' || (currentRatio && currentRatio >= 1.2);

  // Dynamic grid spanning adapting automatically to media dimensions
  let spanClasses = 'md:col-span-1 lg:col-span-4 min-h-[460px] lg:min-h-[520px]';

  if (isPortrait) {
    spanClasses = 'md:col-span-1 lg:col-span-4 min-h-[520px] lg:min-h-[620px]';
  } else if (isSquare) {
    spanClasses = 'md:col-span-1 lg:col-span-6 min-h-[460px] lg:min-h-[520px]';
  } else if (isLandscape) {
    if (layoutVariant === 'wide') {
      spanClasses = 'md:col-span-2 lg:col-span-12 min-h-[440px] lg:min-h-[520px]';
    } else {
      spanClasses = 'md:col-span-2 lg:col-span-8 min-h-[440px] lg:min-h-[520px]';
    }
  } else {
    if (layoutVariant === 'large') {
      spanClasses = 'md:col-span-2 lg:col-span-8 min-h-[460px] lg:min-h-[540px]';
    } else if (layoutVariant === 'tall') {
      spanClasses = 'md:col-span-1 lg:col-span-4 min-h-[500px] lg:min-h-[580px]';
    }
  }

  const ratioBadge = liveDim.width && liveDim.height
    ? getRatioLabel(liveDim.width, liveDim.height).split(' ')[0]
    : currentRatio
    ? currentRatio < 0.65
      ? '9:16'
      : currentRatio < 0.85
      ? '4:5'
      : Math.abs(currentRatio - 1) < 0.08
      ? '1:1'
      : '16:9'
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
      className={`group relative rounded-3xl overflow-hidden bg-[#10141C] border border-[#F0F3F6]/10 flex flex-col justify-end transition-all duration-500 hover:border-[#F59E0B]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] ${spanClasses}`}
    >
      <Link href={`/projects/${project.slug}`} className="absolute inset-0 z-20" aria-label={title}>
        <span className="sr-only">{title}</span>
      </Link>

      {/* Atmospheric Ambient Glow (extracted from the media colors) */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-125 transition-transform duration-700 ease-out group-hover:scale-130 pointer-events-none"
        style={{ backgroundImage: `url(${project.coverImage || '/images/projects/project-lumina-motion.jpg'})` }}
      />

      {/* Uncropped Original Artwork Frame with Automatic 6s Live Slideshow */}
      <div className="absolute inset-0 p-3 sm:p-5 pb-28 sm:pb-32 flex items-center justify-center overflow-hidden">
        <ProjectMediaSlideshow
          mediaItems={
            project.mediaItems && project.mediaItems.length > 0
              ? project.mediaItems
              : [
                  {
                    id: 'cover',
                    type: 'image',
                    url: project.coverImage || '/images/projects/project-lumina-motion.jpg',
                    sortOrder: 1,
                  },
                  ...(project.gallery || []).map((url, i) => ({
                    id: `gal-${i}`,
                    type: 'image' as const,
                    url,
                    sortOrder: i + 2,
                  })),
                  ...(project.videos || []).map((v, i) => ({
                    id: v.id || `vid-${i}`,
                    type: 'video' as const,
                    url: v.url,
                    sortOrder: i + 10,
                  })),
                ]
          }
          title={title}
          intervalMs={6000}
          onDimensionChange={(dim) => {
            if (!project.aspectRatio && dim.width && dim.height) {
              setLiveDim(dim);
            }
          }}
        />
        {/* Subtle Dark Gradient Footnote Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07090D] via-[#07090D]/85 to-transparent pointer-events-none z-10" />
      </div>

      {/* Top Badges (Category & Detected Aspect Ratio / Video / Gallery Indicator) */}
      <div className="absolute top-5 inset-x-5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-wrap items-center gap-1.5 max-w-[65%]">
          {(project.categories && project.categories.length > 0 ? project.categories : [project.category])
            .slice(0, 2)
            .map((cat, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-[#07090D]/80 backdrop-blur-md border border-[#F0F3F6]/15 text-xs font-semibold text-[#F0F3F6] tracking-wide"
              >
                {cat}
              </span>
            ))}
          {project.categories && project.categories.length > 2 && (
            <span className="px-2 py-0.5 rounded-full bg-[#151A23]/80 border border-[#F0F3F6]/10 text-[10px] font-mono text-[#94A3B8]">
              +{project.categories.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {ratioBadge && (
            <span className="px-2.5 py-1 rounded-full bg-[#151A23]/85 backdrop-blur-md border border-[#F0F3F6]/10 text-[11px] font-mono font-medium text-[#F59E0B]">
              {ratioBadge}
            </span>
          )}

          {((project.videos && project.videos.length > 0) || project.videoUrl) && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B] text-[#07090D] text-xs font-bold shadow-lg">
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">
                {project.videos && project.videos.length > 1 ? `${project.videos.length} Videos` : 'Reel'}
              </span>
            </span>
          )}

          {project.gallery && project.gallery.length > 0 && (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#10141C]/85 backdrop-blur-md border border-[#F0F3F6]/15 text-[11px] font-mono text-[#F0F3F6]">
              <span>+{project.gallery.length} Stills</span>
            </span>
          )}
        </div>
      </div>

      {/* Content Footnote */}
      <div className="relative z-10 p-6 sm:p-7 flex flex-col gap-2.5 pointer-events-none">
        <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
          <span>{project.client || 'Creative Project'}</span>
          <span>•</span>
          <span>{project.projectDate}</span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors leading-snug">
            {title}
          </h3>

          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#151A23]/80 backdrop-blur-md border border-[#F0F3F6]/15 text-[#F0F3F6] group-hover:bg-[#F59E0B] group-hover:text-[#07090D] group-hover:scale-110 transition-all duration-300">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#94A3B8] line-clamp-2 max-w-xl font-light">
          {description}
        </p>

        {/* Tools Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(project.resolvedTools && project.resolvedTools.length > 0
            ? project.resolvedTools.slice(0, 3)
            : project.tools.slice(0, 3).map((t) => ({ id: t, name: t, nameAr: undefined, iconUrl: undefined }))
          ).map((tool, i) => (
            <span
              key={tool.id || i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#151A23]/90 text-[10px] font-mono text-[#94A3B8]"
            >
              <SoftwareIcon name={tool.name} iconUrl={tool.iconUrl} className="w-3 h-3" />
              <span>{language === 'ar' && tool.nameAr ? tool.nameAr : tool.name}</span>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
