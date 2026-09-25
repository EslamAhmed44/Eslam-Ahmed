'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProjectMediaItem } from '@/lib/types';
import { Play } from 'lucide-react';
import { calculateMediaDimensions } from '@/lib/media/dimensions';

interface ProjectMediaSlideshowProps {
  mediaItems: ProjectMediaItem[];
  title: string;
  className?: string;
  intervalMs?: number;
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
  intervalMs = 6000, // 6 seconds per requirement
  onDimensionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  // Filter valid media items
  const validItems = useMemo(() => {
    return (mediaItems || []).filter((item) => Boolean(item && item.url));
  }, [mediaItems]);

  const hasMultiple = validItems.length > 1;

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

  // 6-Second Auto-rotation loop
  useEffect(() => {
    if (!hasMultiple || !isVisible) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validItems.length);
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [hasMultiple, isVisible, validItems.length, intervalMs]);

  // Video playback management based on current slide & visibility
  useEffect(() => {
    videoRefs.current.forEach((videoEl, index) => {
      if (!videoEl) return;
      if (index === currentIndex && isVisible) {
        videoEl.currentTime = 0;
        videoEl.play().catch(() => {
          // Autoplay policy prevented playback, keep muted
        });
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
            muted
            playsInline
            loop
            autoPlay={isVisible}
            className="w-full h-full object-contain rounded-2xl"
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (onDimensionChange && v.videoWidth > 0 && v.videoHeight > 0) {
                onDimensionChange(calculateMediaDimensions(v.videoWidth, v.videoHeight));
              }
            }}
          />
        ) : (
          <img
            src={single.url}
            alt={title}
            className="w-full h-full object-contain rounded-2xl transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (onDimensionChange && img.naturalWidth > 0 && img.naturalHeight > 0) {
                onDimensionChange(calculateMediaDimensions(img.naturalWidth, img.naturalHeight));
              }
            }}
          />
        )}
      </div>
    );
  }

  // Multi-media Slideshow (>1 items): Smooth 6-second rotation
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
                  muted
                  playsInline
                  loop
                  preload={Math.abs(index - currentIndex) <= 1 ? 'metadata' : 'none'}
                  className="w-full h-full object-contain rounded-2xl"
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    if (index === 0 && onDimensionChange && v.videoWidth > 0 && v.videoHeight > 0) {
                      onDimensionChange(calculateMediaDimensions(v.videoWidth, v.videoHeight));
                    }
                  }}
                />
                <div className="absolute top-3 end-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-amber-400 flex items-center gap-1 pointer-events-none">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>VIDEO</span>
                </div>
              </div>
            ) : (
              <img
                src={item.url}
                alt={`${title} - visual ${index + 1}`}
                className="w-full h-full object-contain rounded-2xl transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading={index === 0 ? 'eager' : 'lazy'}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (index === 0 && onDimensionChange && img.naturalWidth > 0 && img.naturalHeight > 0) {
                    onDimensionChange(calculateMediaDimensions(img.naturalWidth, img.naturalHeight));
                  }
                }}
              />
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
