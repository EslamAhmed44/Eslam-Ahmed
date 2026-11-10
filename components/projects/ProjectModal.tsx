'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ProjectMediaItem } from '@/lib/types';
import { useLanguage } from '../navigation/LanguageContext';
import { sound } from '@/lib/audio/sound';
import { SoftwareIcon } from '../ui/SoftwareIcon';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  ExternalLink,
  Layers,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
} from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  allProjects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (p: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  allProjects,
  isOpen,
  onClose,
  onSelectProject,
}) => {
  const { language, t, dir } = useLanguage();
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Collect all media items for the project
  const mediaList: ProjectMediaItem[] = React.useMemo(() => {
    if (!project) return [];
    if (Array.isArray(project.mediaItems) && project.mediaItems.length > 0) {
      return project.mediaItems;
    }
    const items: ProjectMediaItem[] = [];
    if (project.videoUrl) {
      items.push({
        id: 'primary-video',
        type: 'video',
        url: project.videoUrl,
        title: project.title,
        sortOrder: 1,
      });
    }
    if (project.coverImage) {
      items.push({
        id: 'cover-image',
        type: 'image',
        url: project.coverImage,
        title: project.title,
        sortOrder: 2,
      });
    }
    if (Array.isArray(project.gallery)) {
      project.gallery.forEach((url, idx) => {
        if (url !== project.coverImage) {
          items.push({
            id: `gal-${idx}`,
            type: 'image',
            url,
            title: `Visual ${idx + 1}`,
            sortOrder: idx + 3,
          });
        }
      });
    }
    return items;
  }, [project]);

  // Reset active media when project changes
  useEffect(() => {
    setActiveMediaIndex(0);
    setIsPlaying(true);
  }, [project?.id]);

  // Handle body scroll lock & sound
  useEffect(() => {
    if (isOpen) {
      sound.playModalOpen();
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Current project index and navigation
  const currentIndex = allProjects.findIndex((p) => p.id === project?.id);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : allProjects[allProjects.length - 1];
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : allProjects[0];

  const handlePrev = () => {
    if (prevProject) {
      sound.playClick();
      onSelectProject(prevProject);
    }
  };

  const handleNext = () => {
    if (nextProject) {
      sound.playClick();
      onSelectProject(nextProject);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        dir === 'rtl' ? handleNext() : handlePrev();
      } else if (e.key === 'ArrowRight') {
        dir === 'rtl' ? handlePrev() : handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dir, handlePrev, handleNext, onClose]);

  // Touch Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 60) {
      if (deltaX > 0) {
        // Swiped right
        dir === 'rtl' ? handleNext() : handlePrev();
      } else {
        // Swiped left
        dir === 'rtl' ? handlePrev() : handleNext();
      }
    }
    touchStartX.current = null;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  if (!isOpen || !project) return null;

  const title = language === 'ar' && project.titleAr ? project.titleAr : project.title;
  const description = language === 'ar' && project.descriptionAr ? project.descriptionAr : project.description;
  const categories = project.categories && project.categories.length > 0 ? project.categories : [project.category || 'Graphic Design'];
  const tools = project.tools || project.softwareUsed || [];
  const currentMedia = mediaList[activeMediaIndex] || mediaList[0];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="fixed inset-0 bg-[#000000]/85 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0B0F17] text-[#F0F3F6] border border-[#F0F3F6]/10 rounded-2xl md:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10"
        >
          {/* Top Bar: Category badges, Project counter, Close button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F3F6]/08 bg-[#0E131F]/90 backdrop-blur-md">
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-[#151A24] border border-[#F59E0B]/30 text-xs font-mono font-semibold text-[#F59E0B] uppercase tracking-wider"
                >
                  {cat}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#94A3B8]">
                {currentIndex + 1} / {allProjects.length}
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="w-9 h-9 rounded-full bg-[#151A24] border border-[#F0F3F6]/10 flex items-center justify-center text-[#94A3B8] hover:text-[#F0F3F6] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors cursor-pointer"
                title={t('projects.modal.close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Content Body */}
          <div className="overflow-y-auto p-6 md:p-8 space-y-8">
            {/* 1. Primary Large Showcase Media (Video or High-Res Image) */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-[#07090D] border border-[#F0F3F6]/08 aspect-video max-h-[58vh] flex items-center justify-center group">
              {currentMedia?.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={currentMedia.url}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-contain"
                  />

                  {/* Video Overlay Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-2 rounded-xl bg-[#07090D]/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={togglePlay}
                      className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-[#F59E0B]" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={currentMedia?.url || project.coverImage || '/images/projects/project-vortex-brand.jpg'}
                    alt={title}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-contain"
                    priority
                  />
                </div>
              )}
            </div>

            {/* Supporting Gallery Thumbnails Strip (if more than 1 item) */}
            {mediaList.length > 1 && (
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] mb-3">
                  {t('projects.modal.gallery')} ({mediaList.length})
                </p>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {mediaList.map((m, idx) => (
                    <button
                      key={m.id || idx}
                      onClick={() => {
                        sound.playHover();
                        setActiveMediaIndex(idx);
                      }}
                      className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                        activeMediaIndex === idx
                          ? 'border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {m.type === 'video' ? (
                        <div className="w-full h-full bg-[#151A24] flex items-center justify-center text-[#F59E0B]">
                          <Play className="w-4 h-4" />
                        </div>
                      ) : (
                        <Image
                          src={m.url}
                          alt={m.title || `Thumbnail ${idx}`}
                          fill
                          className="object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Project Title & Narrative */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#F0F3F6] mb-4">
                {title}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-[#94A3B8] max-w-3xl">
                {description}
              </p>
            </div>

            {/* 3. Conditional Metadata Grid: Client, Date, Software */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F0F3F6]/08">
              {/* Client */}
              {project.client && (
                <div className="p-4 rounded-xl bg-[#0E131F] border border-[#F0F3F6]/05">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase tracking-wider mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{t('projects.modal.client')}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#F0F3F6]">{project.client}</p>
                </div>
              )}

              {/* Date */}
              {project.projectDate && (
                <div className="p-4 rounded-xl bg-[#0E131F] border border-[#F0F3F6]/05">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase tracking-wider mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t('projects.modal.year')}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#F0F3F6]">{project.projectDate}</p>
                </div>
              )}

              {/* Tools & Software Tags */}
              {tools.length > 0 && (
                <div className="p-4 rounded-xl bg-[#0E131F] border border-[#F0F3F6]/05 sm:col-span-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase tracking-wider mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{t('projects.modal.tools')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#151A24] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6]"
                      >
                        <SoftwareIcon name={tool} className="w-3.5 h-3.5" />
                        <span>{tool}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Google Drive or External Link (if available) */}
            {project.googleDriveUrl && (
              <div className="pt-2">
                <a
                  href={project.googleDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#151A24] border border-[#F59E0B]/40 text-xs font-mono text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-all duration-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('projects.modal.driveLink')}</span>
                </a>
              </div>
            )}
          </div>

          {/* Bottom Navigation: Previous / Next Project */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#F0F3F6]/08 bg-[#0E131F]/90 backdrop-blur-md">
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#151A24] border border-[#F0F3F6]/10 text-xs font-mono text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors cursor-pointer"
            >
              {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span className="hidden sm:inline">{t('projects.modal.prev')}</span>
            </button>

            <span className="text-xs font-mono text-[#64748B]">
              USE ← → ARROW KEYS TO NAVIGATE
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#151A24] border border-[#F0F3F6]/10 text-xs font-mono text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">{t('projects.modal.next')}</span>
              {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
