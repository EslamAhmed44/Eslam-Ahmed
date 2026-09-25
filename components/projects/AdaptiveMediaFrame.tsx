'use client';

import React, { useState, useEffect } from 'react';
import { ProjectMediaItem } from '@/lib/types';
import { calculateMediaDimensions, getRatioLabel } from '@/lib/media/dimensions';
import { ProjectMediaSlideshow } from './ProjectMediaSlideshow';

interface AdaptiveMediaFrameProps {
  coverImage: string;
  videoUrl?: string;
  title: string;
  mediaItems?: ProjectMediaItem[];
  initialWidth?: number;
  initialHeight?: number;
  initialAspectRatio?: number;
  initialOrientation?: 'portrait' | 'landscape' | 'square';
  className?: string;
  showBadge?: boolean;
  priority?: boolean;
}

export const AdaptiveMediaFrame: React.FC<AdaptiveMediaFrameProps> = ({
  coverImage,
  videoUrl,
  title,
  mediaItems,
  initialWidth,
  initialHeight,
  initialAspectRatio,
  initialOrientation,
  className = '',
  showBadge = true,
  priority = false,
}) => {
  const [dimensions, setDimensions] = useState<{
    width?: number;
    height?: number;
    aspectRatio?: number;
    orientation?: 'portrait' | 'landscape' | 'square';
  }>({
    width: initialWidth,
    height: initialHeight,
    aspectRatio: initialAspectRatio,
    orientation: initialOrientation,
  });

  // Automatically detect dimensions if not provided
  useEffect(() => {
    if (dimensions.width && dimensions.height && dimensions.aspectRatio) return;

    if (videoUrl) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.muted = true;
      v.playsInline = true;
      v.onloadedmetadata = () => {
        if (v.videoWidth > 0 && v.videoHeight > 0) {
          const dim = calculateMediaDimensions(v.videoWidth, v.videoHeight);
          setDimensions(dim);
        }
      };
      v.src = videoUrl;
    } else if (coverImage) {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          const dim = calculateMediaDimensions(img.naturalWidth, img.naturalHeight);
          setDimensions(dim);
        }
      };
      img.src = coverImage;
    }
  }, [coverImage, videoUrl, dimensions.width, dimensions.height, dimensions.aspectRatio]);

  const isPortrait = dimensions.orientation === 'portrait' || (dimensions.aspectRatio && dimensions.aspectRatio < 0.9);
  const isSquare = dimensions.orientation === 'square' || (dimensions.aspectRatio && Math.abs(dimensions.aspectRatio - 1) < 0.08);

  // Dynamic max-width based on detected orientation
  let maxWidth = '100%';
  if (isPortrait) {
    maxWidth = '540px';
  } else if (isSquare) {
    maxWidth = '720px';
  }

  const hasMultipleMedia = mediaItems && mediaItems.length > 1;

  return (
    <div className={`relative mx-auto w-full flex flex-col items-center ${className}`}>
      {/* Outer Adaptive Frame */}
      <div
        className="relative w-full rounded-3xl overflow-hidden bg-[#10141C] border border-[#F0F3F6]/10 shadow-[0_24px_60px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all duration-500"
        style={{
          maxWidth,
          aspectRatio: dimensions.aspectRatio ? `${dimensions.aspectRatio}` : undefined,
          maxHeight: '85vh',
        }}
      >
        {/* Ambient Glow Backdrop (derived from the artwork itself) */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none"
          style={{ backgroundImage: `url(${coverImage})` }}
        />

        {/* Multi-Media Slideshow if > 1 media item */}
        {hasMultipleMedia ? (
          <ProjectMediaSlideshow
            mediaItems={mediaItems}
            title={title}
            intervalMs={6000}
            className="relative z-10 w-full h-full max-h-[85vh] rounded-3xl"
            onDimensionChange={(dim) => {
              if (dim.width && dim.height) {
                setDimensions(dim);
              }
            }}
          />
        ) : videoUrl ? (
          /* Single Video with artwork preservation */
          <video
            src={videoUrl}
            controls
            autoPlay
            muted
            loop
            playsInline
            poster={coverImage}
            className="relative z-10 w-full h-full max-h-[85vh] object-contain rounded-3xl"
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoWidth > 0 && v.videoHeight > 0 && (!dimensions.width || !dimensions.height)) {
                setDimensions(calculateMediaDimensions(v.videoWidth, v.videoHeight));
              }
            }}
          />
        ) : (
          /* Single Image with artwork preservation */
          <img
            src={coverImage}
            alt={title}
            className="relative z-10 w-full h-full max-h-[85vh] object-contain rounded-3xl"
            loading={priority ? 'eager' : 'lazy'}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth > 0 && img.naturalHeight > 0 && (!dimensions.width || !dimensions.height)) {
                setDimensions(calculateMediaDimensions(img.naturalWidth, img.naturalHeight));
              }
            }}
          />
        )}
      </div>

      {/* Smart Metadata Readout */}
      {showBadge && dimensions.width && dimensions.height && (
        <div className="mt-3 flex items-center gap-2 text-xs font-mono text-[#94A3B8]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          <span>
            Original Frame: {dimensions.width} × {dimensions.height} ({getRatioLabel(dimensions.width, dimensions.height)})
          </span>
          {hasMultipleMedia && (
            <span className="text-[#F59E0B]">• {mediaItems.length} Rotating Slides</span>
          )}
        </div>
      )}
    </div>
  );
};
