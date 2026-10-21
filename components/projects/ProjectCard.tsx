'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Project, ProjectMediaItem } from '@/lib/types';
import { useLanguage } from '../navigation/LanguageContext';
import { ArrowUpRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateMediaDimensions, getRatioLabel } from '@/lib/media/dimensions';
import { SoftwareIcon } from '../ui/SoftwareIcon';
import { ProjectMediaSlideshow } from './ProjectMediaSlideshow';
import {
  MediaContrastInfo,
  getInitialMediaContrast,
  analyzeMediaContrast,
} from '@/lib/media/contrast';

/**
 * Detects whether a project belongs to Motion Graphics (including hybrid categories like
 * "Motion Graphics + Branding", "Motion Graphics + Social Media", etc.)
 */
export function isMotionGraphicsProject(project: {
  category?: string;
  categories?: string[];
}): boolean {
  const motionRegex = /motion\s*graphics/i;
  if (project.category && motionRegex.test(project.category)) {
    return true;
  }
  if (Array.isArray(project.categories)) {
    return project.categories.some((cat) => typeof cat === 'string' && motionRegex.test(cat));
  }
  return false;
}

function cleanMediaUrl(url?: string): string {
  if (!url) return '';
  return url.trim().toLowerCase().split('?')[0].split('#')[0];
}

/**
 * Builds the media sequence strictly preserving:
 * 1. Cover image strictly first (index 0).
 * 2. Next media follows actual project media order (mediaItems).
 * 3. Deduplication prevents the cover image from reappearing prematurely between other slides.
 */
export function getProjectPreviewMediaItems(project: Project): ProjectMediaItem[] {
  const coverUrl = (project.coverImage || '').trim();
  const normalizedCover = cleanMediaUrl(coverUrl);

  const rawItems: ProjectMediaItem[] =
    Array.isArray(project.mediaItems) && project.mediaItems.length > 0
      ? [...project.mediaItems].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      : [
          ...(project.gallery || []).map((url, i) => ({
            id: `gal-${i}`,
            type: 'image' as const,
            url,
            sortOrder: i + 1,
          })),
          ...(project.videos || []).map((v, i) => ({
            id: v.id || `vid-${i}`,
            type: 'video' as const,
            url: v.url,
            sortOrder: i + 10,
          })),
        ];

  const result: ProjectMediaItem[] = [];
  const seenUrls = new Set<string>();

  // 1. Cover image strictly first
  if (coverUrl) {
    const existingCoverItem = rawItems.find(
      (m) => cleanMediaUrl(m.url) === normalizedCover
    );
    result.push({
      id: existingCoverItem?.id || 'cover-item',
      type: 'image',
      url: coverUrl,
      title: existingCoverItem?.title || project.title,
      titleAr: existingCoverItem?.titleAr || project.titleAr,
      aspectRatio: existingCoverItem?.aspectRatio || project.aspectRatio,
      width: existingCoverItem?.width || project.width,
      height: existingCoverItem?.height || project.height,
      sortOrder: 0,
    });
    seenUrls.add(normalizedCover);
  }

  // 2. Add remaining media items in project's defined order, skipping cover duplicates
  for (const item of rawItems) {
    if (!item || !item.url) continue;
    const norm = cleanMediaUrl(item.url);
    if (!seenUrls.has(norm)) {
      seenUrls.add(norm);
      result.push(item);
    }
  }

  // Fallback if empty
  if (result.length === 0) {
    result.push({
      id: 'default-cover',
      type: 'image',
      url: '/images/projects/project-lumina-motion.jpg',
      title: project.title,
      sortOrder: 0,
    });
  }

  return result;
}

interface ProjectCardProps {
  project: Project;
  layoutVariant: 'large' | 'wide' | 'tall' | 'standard';
  index: number;
  priority?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  layoutVariant,
  index,
  priority = false,
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

  const isMotion = isMotionGraphicsProject(project);

  const previewMediaItems = useMemo(() => {
    return getProjectPreviewMediaItems(project);
  }, [project]);

  // Smart Dynamic Text Contrast State initialized synchronously with zero flickering
  const [contrastInfo, setContrastInfo] = useState<MediaContrastInfo>(() => {
    const initialUrl = previewMediaItems[0]?.url || project.coverImage;
    return getInitialMediaContrast(initialUrl);
  });

  // Handle active slide media change and update contrast state
  const handleActiveMediaChange = useCallback(
    (item: ProjectMediaItem) => {
      const targetUrl = item.url || project.coverImage;
      const initial = getInitialMediaContrast(targetUrl);
      setContrastInfo(initial);
      analyzeMediaContrast(targetUrl, (detected) => {
        setContrastInfo(detected);
      });
    },
    [project.coverImage]
  );

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

      {/* Atmospheric Ambient Glow (optimized low-res thumbnail prevents massive uncompressed download) */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-125 transition-transform duration-700 ease-out group-hover:scale-130 pointer-events-none"
        style={{
          backgroundImage: `url(${
            project.coverImage
              ? `/_next/image?url=${encodeURIComponent(project.coverImage)}&w=64&q=75`
              : '/images/projects/project-lumina-motion.jpg'
          })`,
        }}
      />

      {/* Uncropped Original Artwork Frame with Media-Aware Live Slideshow */}
      <div className="absolute inset-0 p-3 sm:p-5 pb-28 sm:pb-32 flex items-center justify-center overflow-hidden">
        <ProjectMediaSlideshow
          mediaItems={previewMediaItems}
          title={title}
          intervalMs={6000}
          isMotionGraphics={isMotion}
          priority={priority}
          onActiveMediaChange={handleActiveMediaChange}
          onDimensionChange={(dim) => {
            if (!project.aspectRatio && dim.width && dim.height) {
              setLiveDim(dim);
            }
          }}
        />
      </div>

      {/* Dynamic Adaptive Scrim / Readability Layer */}
      <div
        className={`absolute inset-x-0 bottom-0 h-52 pointer-events-none z-[5] transition-all duration-700 ease-out ${contrastInfo.scrimClass}`}
      />

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

      {/* Content Footnote with Dynamic Contrast */}
      <div className="relative z-10 p-6 sm:p-7 flex flex-col gap-2.5 pointer-events-none transition-colors duration-500">
        <div
          className={`flex items-center gap-2 text-xs font-mono transition-colors duration-500 ${contrastInfo.subtitleClass}`}
        >
          <span>{project.client || 'Creative Project'}</span>
          <span>•</span>
          <span>{project.projectDate}</span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <h3
            className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight transition-colors duration-500 leading-snug ${contrastInfo.titleClass}`}
            style={{ filter: contrastInfo.textShadowStyle }}
          >
            {title}
          </h3>

          <div
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center backdrop-blur-md transition-all duration-300 ${contrastInfo.arrowBtnClass} group-hover:scale-110`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <p
          className={`text-xs sm:text-sm line-clamp-2 max-w-xl font-light transition-colors duration-500 ${contrastInfo.descriptionClass}`}
          style={{ filter: contrastInfo.textShadowStyle }}
        >
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
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors duration-500 ${contrastInfo.tagClass}`}
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
