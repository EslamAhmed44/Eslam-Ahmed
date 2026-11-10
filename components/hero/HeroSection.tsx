'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { sound } from '@/lib/audio/sound';
import { SocialLink } from '@/lib/types';
import {
  ArrowDown,
  ArrowUpRight,
  Globe,
  MapPin,
  Sparkles,
  Compass,
} from 'lucide-react';
import {
  LinkedInIcon,
  WhatsAppIcon,
  BehanceIcon,
  VimeoIcon,
  YouTubeIcon,
  InstagramIcon,
} from '../ui/Icons';

interface HeroSectionProps {
  designerName: string;
  designerNameAr: string;
  heroHeadline: string;
  heroHeadlineAr: string;
  rotatingRoles: string[];
  rotatingRolesAr: string[];
  whatsappUrl: string;
  socialLinks: SocialLink[];
  profileImage?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  designerName,
  designerNameAr,
  whatsappUrl,
  socialLinks,
  profileImage = '/images/islam-ahmed.jpg',
}) => {
  const { language, t } = useLanguage();

  const getSocialIcon = (iconName: string, platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('whatsapp')) return <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />;
    if (p.includes('linkedin')) return <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />;
    if (p.includes('behance')) return <BehanceIcon className="w-4 h-4 text-[#0057FF]" />;
    if (p.includes('vimeo')) return <VimeoIcon className="w-4 h-4 text-[#1AB7EA]" />;
    if (p.includes('youtube')) return <YouTubeIcon className="w-4 h-4 text-[#FF0000]" />;
    if (p.includes('instagram')) return <InstagramIcon className="w-4 h-4 text-[#E4405F]" />;
    return <Globe className="w-4 h-4 text-[#F59E0B]" />;
  };

  const name = language === 'ar' ? (designerNameAr || 'إسلام أحمد') : (designerName || 'Islam Ahmed');
  const role = language === 'ar' ? 'مصمم جرافيك وموشن جرافيك' : 'Graphic & Motion Graphic Designer';
  const brandStatement = language === 'ar' ? 'حلول بصرية إبداعية' : 'Creative Visual Solutions';

  return (
    <section
      id="home"
      className="relative min-h-[96vh] flex items-center justify-center pt-32 pb-20 md:py-36 overflow-hidden bg-[var(--bg-primary)] transition-colors duration-300"
    >
      {/* Cinematic Ambient Glow Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#F59E0B]/08 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-[#FF7A18]/06 blur-[130px] pointer-events-none" />

      {/* Structural Editorial Grid Texture */}
      <div className="absolute inset-0 bg-editorial-grid pointer-events-none [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_70%,transparent_100%)]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typographic Narrative */}
          <div className="lg:col-span-7 flex flex-col items-start text-start">
            {/* Editorial Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] mb-6 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              <span>{t('hero.experienceBadge')}</span>
              <span className="text-[#64748B]">•</span>
              <span className="flex items-center gap-1 text-[#F59E0B]">
                <MapPin className="w-3 h-3" />
                <span>{t('hero.location')}</span>
              </span>
            </motion.div>

            {/* Designer Name (Monumental Editorial Display) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-7xl md:text-8xl xl:text-9xl font-black tracking-tight text-[var(--text-primary)] mb-4 leading-none"
            >
              {name}
            </motion.h1>

            {/* Professional Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F59E0B] tracking-tight mb-4"
            >
              {role}
            </motion.h2>

            {/* Main Brand Statement */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg sm:text-xl md:text-2xl font-light text-[var(--text-secondary)] tracking-wide mb-10 max-w-2xl leading-relaxed"
            >
              {brandStatement} — <span className="font-mono text-sm uppercase tracking-widest text-[#F59E0B]">GRAVITY IN MOTION</span>
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4 sm:gap-5 mb-10 w-full sm:w-auto"
            >
              {/* Primary CTA: View My Work */}
              <a
                href="#projects"
                onClick={() => sound.playClick()}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#F59E0B] text-[#07090D] font-mono font-bold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span>{t('hero.cta.primary')}</span>
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
              </a>

              {/* Secondary CTA: Contact Me */}
              <a
                href="#contact"
                onClick={() => sound.playClick()}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] font-mono font-semibold text-sm tracking-wider uppercase hover:border-[#F59E0B] hover:text-[#F59E0B] transition-all duration-300 cursor-pointer"
              >
                <span>{t('hero.cta.secondary')}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Verified Social Connect Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex items-center gap-3"
            >
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] me-2">
                Connect:
              </span>
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.platform}
                  onClick={() => sound.playClick()}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#F59E0B]/50 hover:bg-[var(--bg-surface-elevated)] hover:scale-110 active:scale-95 transition-all duration-300"
                >
                  {getSocialIcon(link.icon, link.platform)}
                </a>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Professional Portrait with Cinematic Editorial Framing */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 flex items-center justify-center transform-gpu"
            >
              {/* Outer Precision Orbit Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#F59E0B]/25 animate-[spin_40s_linear_infinite] transform-gpu pointer-events-none" />
              
              {/* Technical Marker Rings */}
              <div className="absolute -inset-3 rounded-full border border-dotted border-[var(--border-subtle)] animate-[spin_65s_linear_infinite_reverse] transform-gpu pointer-events-none" />
              <div className="absolute -inset-6 rounded-full border border-[var(--border-subtle)] pointer-events-none" />

              {/* Studio Rim Glow */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#F59E0B]/25 via-transparent to-[#FF7A18]/20 blur-md pointer-events-none transform-gpu" />

              {/* Orbiting Satellite Node */}
              <div className="absolute inset-0 rounded-full animate-[spin_28s_linear_infinite] transform-gpu pointer-events-none">
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.8)] ring-2 ring-[var(--bg-primary)]" />
              </div>

              {/* Verified Portrait Container */}
              <div className="relative w-[88%] h-[88%] rounded-full overflow-hidden border-2 border-[var(--border-strong)] bg-[#10141C] shadow-2xl">
                <Image
                  src={profileImage}
                  alt={name}
                  fill
                  priority
                  className="object-cover object-center scale-[1.02] transition-transform duration-700 ease-out hover:scale-108"
                  sizes="(max-width: 768px) 280px, (max-width: 1200px) 380px, 420px"
                />
                {/* Subtle Cinematic Vignette */}
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/40 pointer-events-none" />
              </div>

              {/* Bottom Editorial Floating Pill */}
              <div className="absolute -bottom-3 -left-2 sm:bottom-4 sm:left-0 px-4 py-2 rounded-2xl bg-[var(--bg-surface)]/90 backdrop-blur-xl border border-[var(--border-strong)] shadow-xl flex items-center gap-2 text-xs font-mono font-semibold text-[var(--text-primary)]">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>ISLAM AHMED // CAIRO</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="mt-16 lg:mt-24 flex justify-center">
          <a
            href="#about"
            onClick={() => sound.playClick()}
            className="flex flex-col items-center gap-2 text-xs font-mono text-[var(--text-tertiary)] hover:text-[#F59E0B] transition-colors cursor-pointer"
          >
            <span>{t('hero.scrollDown')}</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};
