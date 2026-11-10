'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Project } from '@/lib/types';
import { useLanguage } from '../navigation/LanguageContext';
import { sound } from '@/lib/audio/sound';
import { ArrowUpRight, Play, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { SoftwareIcon } from '../ui/SoftwareIcon';

interface ProjectCardProps {
  project: Project;
  layoutVariant?: 'large' | 'tall' | 'wide' | 'standard';
  onSelect: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  layoutVariant = 'standard',
  onSelect,
}) => {
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const title = language === 'ar' && project.titleAr ? project.titleAr : project.title;
  const categories =
    project.categories && project.categories.length > 0
      ? project.categories
      : [project.category || 'Graphic Design'];
  const tools = project.tools || project.softwareUsed || [];

  const isVideo = Boolean(
    project.videoUrl ||
    (Array.isArray(project.videos) && project.videos.length > 0) ||
    project.category?.toLowerCase().includes('motion')
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.playHover();
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    sound.playClick();
    onSelect(project);
  };

  // Editorial sizing variations
  const containerClasses =
    layoutVariant === 'large'
      ? 'col-span-1 md:col-span-2 lg:col-span-8 min-h-[420px] md:min-h-[500px]'
      : layoutVariant === 'tall'
      ? 'col-span-1 md:col-span-1 lg:col-span-4 min-h-[420px] md:min-h-[500px]'
      : 'col-span-1 md:col-span-1 lg:col-span-6 min-h-[380px] md:min-h-[440px]';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer border border-[#F0F3F6]/08 hover:border-[#F59E0B]/50 bg-[#0E121A] transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)] flex flex-col justify-end ${containerClasses}`}
    >
      {/* Background Media (Image or Video preview) */}
      <div className="absolute inset-0 overflow-hidden">
        {isVideo && project.videoUrl ? (
          <video
            ref={videoRef}
            src={project.videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
            poster={project.coverImage}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <Image
            src={project.coverImage || '/images/projects/project-vortex-brand.jpg'}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={layoutVariant === 'large'}
          />
        )}

        {/* Cinematic Vignette & Dynamic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080C] via-[#06080C]/40 to-transparent opacity-85 group-hover:opacity-75 transition-opacity duration-500" />
      </div>

      {/* Top Floating Badges (Category & Media indicator) */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.slice(0, 2).map((cat, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-[#06080C]/75 backdrop-blur-md border border-[#F0F3F6]/10 text-[11px] font-mono font-medium text-[#F0F3F6] tracking-wider uppercase"
            >
              {cat}
            </span>
          ))}
        </div>

        {isVideo ? (
          <div className="w-9 h-9 rounded-full bg-[#F59E0B] text-[#07090D] flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-current ms-0.5" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#06080C]/75 backdrop-blur-md border border-[#F0F3F6]/15 text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:border-[#F59E0B]/50 flex items-center justify-center transition-all duration-300">
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        )}
      </div>

      {/* Bottom Content Card Info */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end">
        {/* Software / Tools minimal tags */}
        {tools.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {tools.slice(0, 3).map((tool, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#07090D]/80 backdrop-blur-md border border-[#F0F3F6]/10 text-[10px] text-[#94A3B8]"
              >
                <SoftwareIcon name={tool} className="w-3 h-3" />
                <span>{tool}</span>
              </span>
            ))}
          </div>
        )}

        {/* Project Title */}
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors duration-300">
          {title}
        </h3>

        {/* Short client / date line */}
        {(project.client || project.projectDate) && (
          <p className="text-xs sm:text-sm font-mono text-[#94A3B8] mt-1">
            {[project.client, project.projectDate].filter(Boolean).join(' • ')}
          </p>
        )}
      </div>
    </motion.div>
  );
};
