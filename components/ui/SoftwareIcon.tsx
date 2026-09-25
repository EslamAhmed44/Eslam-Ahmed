'use client';

import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { getDefaultSoftwareIconUrl } from '@/lib/media/softwareIcons';

interface SoftwareIconProps {
  name: string;
  iconUrl?: string;
  className?: string;
}

export const SoftwareIcon: React.FC<SoftwareIconProps> = ({
  name,
  iconUrl,
  className = 'w-4 h-4',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Determine actual asset URL: custom uploaded URL takes priority, then standard persistent asset URL
  const effectiveUrl = iconUrl || getDefaultSoftwareIconUrl(name);

  // 1. If persistent icon image is available and has not failed network loading
  if (effectiveUrl && !imgFailed) {
    return (
      <img
        src={effectiveUrl}
        alt={name}
        className={`${className} object-contain rounded-sm flex-shrink-0`}
        loading="lazy"
        onError={() => setImgFailed(true)}
      />
    );
  }

  // 2. Safe failure fallback badge (rendered ONLY if network image load fails or no icon exists)
  const initials = (name || '').trim().slice(0, 2).toUpperCase();
  return (
    <div
      className={`${className} rounded-[3px] bg-[#151A23] border border-[#F0F3F6]/15 flex items-center justify-center flex-shrink-0 text-[9px] font-mono font-bold text-[#F59E0B]`}
      title={name}
    >
      {initials ? initials : <Wrench className="w-2.5 h-2.5 text-[#F59E0B]" />}
    </div>
  );
};
