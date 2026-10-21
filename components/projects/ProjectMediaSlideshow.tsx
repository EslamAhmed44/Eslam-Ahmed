'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { ProjectMediaItem } from '@/lib/types';
import { Play } from 'lucide-react';
import { calculateMediaDimensions } from '@/lib/media/dimensions';

export interface ProjectMediaSlideshowProps {
  mediaItems: ProjectMediaItem[];
  title: string;
  className?: string;
  intervalMs?: number;
  isMotionGraphics?: boolean;
  priority?: boolean;
  onActiveMediaChange?: (item: ProjectMediaItem, index: number) => void;
  onDimensionChange?: (dim: {
    width?: number;
    height?: number;
    aspectRatio?: number;
    orientation?: 'portrait' | 'landscape' | 'square';
  }) => void;
}

export const ProjectMediaSlideshow: React.FC<ProjectMediaSlideshowProps> = ({
  mediaItems,
  title,
  className = '',
  intervalMs = 6000,
  isMotionGraphics = false,
  priority = false,
  onActiveMediaChange,
  onDimensionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const lastActiveIndexRef = useRef<number | null>(null);

  // Filter valid media items
  const validItems = useMemo(() => {
    return (mediaItems || []).filter((item) => Boolean(item && item.url));
  }, [mediaItems]);

  const hasMultiple = validItems.length > 1;
  const currentItem = validItems[currentIndex];
  const isCurrentVideo = currentItem?.type === 'video';

  // Notify parent component of current active media item for smart text contrast
  useEffect(() => {
    if (validItems[currentIndex]) {
      onActiveMediaChange?.(validItems[currentIndex], currentIndex);
    }
  }, [currentIndex, validItems, onActiveMediaChange]);

  // Advance to next media item in project sequence
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % validItems.length);
  }, [validItems.length]);

  // Viewport IntersectionObserver to optimize CPU/GPU and only animate when visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.15,
        rootMargin: '50px 0px',
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Single-Source Transition Controller:
  // - For Motion Graphics projects:
  //   * If active item is a VIDEO: do NOT use a fixed timer (5s/6s).
  //     The video's natural `onEnded` event triggers goToNext().
  //     A generous 120s safety ceiling is provided only in case of catastrophic network freeze.
  //   * If active item is an IMAGE: use the normal intervalMs image display timer.
  // - For non-Motion Graphics projects:
  //   * Retain standard fixed timer behavior.
  useEffect(() => {
    if (!hasMultiple || !isVisible) return;

    if (isMotionGraphics && isCurrentVideo) {
      // Video duration controls transition timing; no fixed 5-6s timer
      const safetyCeilingTimer = setTimeout(() => {
        goToNext();
      }, 120000);

      return () => {
        clearTimeout(safetyCeilingTimer);
      };
    }

    // Standard timer for images or non-Motion Graphics projects
    const timer = setTimeout(() => {
      goToNext();
    }, intervalMs);

    return () => {
      clearTimeout(timer);
    };
  }, [hasMultiple, isVisible, currentIndex, isMotionGraphics, isCurrentVideo, intervalMs, goToNext]);

  // Video playback management based on current slide & visibility
  useEffect(() => {
    videoRefs.current.forEach((videoEl, index) => {
      if (!videoEl) return;
      if (index === currentIndex && isVisible) {
        // Reset to start only on actual slide change (not on viewport scroll resume)
        if (lastActiveIndexRef.current !== currentIndex) {
          lastActiveIndexRef.current = currentIndex;
          try {
            videoEl.currentTime = 0;
          } catch {
            // Video metadata not ready yet
          }
        }
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay policy prevented playback, keep muted
          });
        }
      } else {
        videoEl.pause();
      }
    });
  }, [currentIndex, isVisible]);

  // If no media items provided
  if (validItems.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`w-full h-full flex items-center justify-center bg-[#151A23] ${className}`}
      >
        <span className="text-xs font-mono text-[#94A3B8]">No media visual</span>
      </div>
    );
  }

  // Find poster fallback image for videos
  const fallbackImageItem = validItems.find((m) => m.type === 'image');

  // Single media item: static display with no slideshow interval overhead
  if (!hasMultiple) {
    const single = validItems[0];
    const isVideo = single.type === 'video';

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      >
        {isVideo ? (
          <video
            src={single.url}
            poster={single.posterUrl}
            muted
            playsInline
            loop={!isMotionGraphics}
            autoPlay={isVisible}
            preload={isVisible ? 'auto' : 'none'}
            className="w-full h-full object-contain rounded-2xl"
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (onDimensionChange && v.videoWidth > 0 && v.videoHeight > 0) {
                onDimensionChange(calculateMediaDimensions(v.videoWidth, v.videoHeight));
              }
            }}
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={single.url}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              className="object-contain rounded-2xl transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (onDimensionChange && img.naturalWidth > 0 && img.naturalHeight > 0) {
                  onDimensionChange(calculateMediaDimensions(img.naturalWidth, img.naturalHeight));
                }
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Multi-media Slideshow (>1 items): Media-aware sequence & transition
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
    >
      {validItems.map((item, index) => {
        const isActive = index === currentIndex;
        const isVideo = item.type === 'video';

        return (
          <div
            key={item.id || `${item.url}-${index}`}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {isVideo ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(index, el);
                    else videoRefs.current.delete(index);
                  }}
                  src={item.url}
                  poster={item.posterUrl || fallbackImageItem?.url}
                  muted
                  playsInline
                  loop={!isMotionGraphics}
                  preload={
                    !isVisible
                      ? 'none'
                      : isActive
                      ? 'auto'
                      : Math.abs(index - currentIndex) === 1
                      ? 'metadata'
                      : 'none'
                  }
                  className="w-full h-full object-contain rounded-2xl"
                  onEnded={() => {
                    // Video finished naturally: trigger transition to next media item
                    if (isMotionGraphics && isActive) {
                      goToNext();
                    }
                  }}
                  onError={() => {
                    // Fail-safe: advance after 2s if video encounters loading error
                    if (isMotionGraphics && isActive) {
                      setTimeout(goToNext, 2000);
                    }
                  }}
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    if (index === 0 && onDimensionChange && v.videoWidth > 0 && v.videoHeight > 0) {
                      onDimensionChange(calculateMediaDimensions(v.videoWidth, v.videoHeight));
                    }
                    if (isActive && isVisible && lastActiveIndexRef.current !== currentIndex) {
                      lastActiveIndexRef.current = currentIndex;
                      try {
                        v.currentTime = 0;
                      } catch {}
                      v.play().catch(() => {});
                    }
                  }}
                />
                <div className="absolute top-3 end-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-amber-400 flex items-center gap-1 pointer-events-none">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>VIDEO</span>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={item.url}
                  alt={`${title} - visual ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={priority && index === 0}
                  loading={priority && index === 0 ? 'eager' : 'lazy'}
                  className="object-contain rounded-2xl transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (index === 0 && onDimensionChange && img.naturalWidth > 0 && img.naturalHeight > 0) {
                      onDimensionChange(calculateMediaDimensions(img.naturalWidth, img.naturalHeight));
                    }
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Subtle Slide Indicators */}
      <div className="absolute bottom-24 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#07090D]/75 backdrop-blur-md border border-[#F0F3F6]/10 shadow-lg">
          {validItems.map((_, dotIdx) => (
            <span
              key={dotIdx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                dotIdx === currentIndex
                  ? 'w-4 bg-[#F59E0B]'
                  : 'w-1.5 bg-[#F0F3F6]/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
