'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { MagneticButton } from '../ui/MagneticButton';
import { SocialLink } from '@/lib/types';
import {
  ArrowDown,
  ArrowUpRight,
  MessageSquare,
  Palette,
  Video,
  Globe,
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
  heroHeadline,
  heroHeadlineAr,
  rotatingRoles,
  rotatingRolesAr,
  whatsappUrl,
  socialLinks,
  profileImage = '/images/islam-ahmed.jpg',
}) => {
  const { language, dir, t } = useLanguage();
  const [roleIndex, setRoleIndex] = useState(0);
  const activeRoles = language === 'ar' ? rotatingRolesAr : rotatingRoles;
  const currentRole = activeRoles[roleIndex % activeRoles.length] || '';

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % activeRoles.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [activeRoles.length]);

  const getSocialIcon = (iconName: string, platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('whatsapp')) return <WhatsAppIcon className="w-4 h-4" />;
    if (p.includes('linkedin')) return <LinkedInIcon className="w-4 h-4" />;
    if (p.includes('behance')) return <BehanceIcon className="w-4 h-4" />;
    if (p.includes('vimeo')) return <VimeoIcon className="w-4 h-4" />;
    if (p.includes('youtube')) return <YouTubeIcon className="w-4 h-4" />;
    if (p.includes('instagram')) return <InstagramIcon className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <section
      id="home"
      className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-16 md:py-32 overflow-hidden"
    >
      {/* Cinematic Ambient Glow Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#F59E0B]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] rounded-full bg-[#FF7A18]/08 blur-[110px] pointer-events-none" />

      {/* Subtle Motion Grid Line Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typographic Narrative */}
          <div className="lg:col-span-7 flex flex-col items-start z-10 text-start">
            {/* Status Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-medium text-[#94A3B8] mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              <span>Available for Commercial & Motion Projects</span>
            </motion.div>

            {/* Greeting */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base sm:text-lg font-mono tracking-widest text-[#94A3B8] uppercase mb-2"
            >
              {language === 'ar' ? heroHeadlineAr : heroHeadline}
            </motion.p>

            {/* Designer Name (Bold Monumental Editorial) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black tracking-tight text-[#F0F3F6] mb-4"
            >
              {language === 'ar' ? designerNameAr : designerName}
            </motion.h1>

            {/* Kinetic Rotating Role */}
            <div className="h-12 sm:h-14 flex items-center mb-8 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentRole}
                  initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -24, filter: 'blur(8px)' }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#F59E0B] via-[#FF7A18] to-[#F59E0B] bg-clip-text text-transparent"
                >
                  {currentRole}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 sm:gap-5 mb-10 w-full sm:w-auto"
            >
              {/* Primary: Tawasul Ma'i -> WhatsApp */}
              <MagneticButton
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="w-full sm:w-auto text-base px-8 py-4"
              >
                <span className="flex items-center gap-2">
                  <span>{t('hero.cta.primary')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </MagneticButton>

              {/* Secondary: View Projects */}
              <MagneticButton
                href="#projects"
                variant="secondary"
                className="w-full sm:w-auto text-base px-8 py-4"
              >
                <span>{t('hero.cta.secondary')}</span>
              </MagneticButton>
            </motion.div>

            {/* Social Links Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-3"
            >
              <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]/70 me-2">
                Connect:
              </span>
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.platform}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F59E0B] hover:border-[#F59E0B]/50 hover:bg-[#10141C] transition-all duration-300"
                >
                  {getSocialIcon(link.icon, link.platform)}
                </a>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Circular Framed Portrait Visual with Subtle Motion */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 flex items-center justify-center transform-gpu"
            >
              {/* Outer Orbit Rings */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#F59E0B]/25 animate-[spin_40s_linear_infinite]" />
              <div className="absolute -inset-4 rounded-full border border-[#F0F3F6]/05 pointer-events-none" />

              {/* Glowing Accent Ring with Gradient */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#F59E0B]/40 via-transparent to-[#FF7A18]/30 blur-md pointer-events-none" />

              {/* Orbiting Satellite Dot */}
              <div className="absolute inset-0 rounded-full animate-[spin_24s_linear_infinite] pointer-events-none">
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#F59E0B] shadow-[0_0_12px_#F59E0B]" />
              </div>

              {/* Circular Framed Photo Container (Identity & Natural Texture Fully Preserved) */}
              <div className="relative w-[90%] h-[90%] rounded-full overflow-hidden border-2 border-[#F0F3F6]/20 bg-[#151A23] shadow-2xl">
                <Image
                  src={profileImage}
                  alt={designerName}
                  fill
                  priority
                  className="object-cover object-center scale-[1.03] transition-transform duration-700 ease-out hover:scale-[1.08]"
                  sizes="(max-width: 768px) 280px, (max-width: 1200px) 380px, 420px"
                />
                {/* Subtle Cinematic Vignette */}
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/40 pointer-events-none" />
              </div>

              {/* Motion Designer Floating Badge */}
              <div className="absolute -bottom-2 -left-2 sm:bottom-4 sm:left-0 px-4 py-2 rounded-2xl bg-[#10141C]/90 backdrop-blur-xl border border-[#F0F3F6]/10 shadow-xl flex items-center gap-2 text-xs font-semibold text-[#F0F3F6]">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>Motion & Visuals</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="mt-14 lg:mt-20 flex justify-center">
          <a
            href="#about"
            className="flex flex-col items-center gap-2 text-xs font-mono text-[#94A3B8]/60 hover:text-[#F59E0B] transition-colors"
          >
            <span>{t('hero.scrollDown')}</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};
