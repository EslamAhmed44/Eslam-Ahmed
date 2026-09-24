'use client';

import React from 'react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  variant = 'primary',
  href,
  target,
  rel,
  className = '',
  onClick,
  ...props
}) => {
  let baseStyles =
    'relative inline-flex items-center justify-center font-medium tracking-wide transition-all duration-300 rounded-full px-7 py-3.5 text-sm select-none focus:outline-none cursor-pointer transform-gpu';

  if (variant === 'primary') {
    baseStyles +=
      ' bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-semibold shadow-[0_0_24px_rgba(245,158,11,0.25)] hover:shadow-[0_0_36px_rgba(245,158,11,0.45)] hover:scale-[1.03] active:scale-[0.97]';
  } else if (variant === 'secondary') {
    baseStyles +=
      ' bg-[#151A23]/90 text-[#F0F3F6] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/50 hover:bg-[#151A23] hover:text-white backdrop-blur-md hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:scale-[1.02] active:scale-[0.98]';
  } else if (variant === 'outline') {
    baseStyles +=
      ' bg-transparent text-[#F0F3F6] border border-[#F0F3F6]/20 hover:border-[#F59E0B] hover:text-[#F59E0B] hover:scale-[1.02] active:scale-[0.98]';
  } else {
    baseStyles += ' bg-transparent text-[#94A3B8] hover:text-[#F0F3F6] hover:scale-[1.02] active:scale-[0.98]';
  }

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={`${baseStyles} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${className}`}
      {...(props as any)}
    >
      {children}
    </button>
  );
};
