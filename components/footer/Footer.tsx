'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../navigation/LanguageContext';
import { ArrowUp, Lock } from 'lucide-react';
import { SocialLink } from '@/lib/types';
import {
  WhatsAppIcon,
  LinkedInIcon,
  BehanceIcon,
  VimeoIcon,
  YouTubeIcon,
  InstagramIcon,
} from '../ui/Icons';

interface FooterProps {
  socialLinks: SocialLink[];
}

export const Footer: React.FC<FooterProps> = ({ socialLinks }) => {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Configure visible social channels: WhatsApp, LinkedIn, and the third configured social channel
  const whatsappLink = socialLinks?.find((s) => s.platform.toLowerCase().includes('whatsapp')) || {
    id: 'soc-whatsapp',
    platform: 'WhatsApp',
    url: 'https://wa.me/201092463750',
  };

  const linkedinLink = socialLinks?.find((s) => s.platform.toLowerCase().includes('linkedin')) || {
    id: 'soc-linkedin',
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/eslam-ahmed-a7bb0a308/',
  };

  const thirdLink = socialLinks?.find(
    (s) =>
      !s.platform.toLowerCase().includes('whatsapp') &&
      !s.platform.toLowerCase().includes('linkedin')
  ) || {
    id: 'soc-behance',
    platform: 'Behance',
    url: 'https://www.behance.net',
  };

  const visibleSocials = [whatsappLink, linkedinLink, thirdLink];

  const renderSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('whatsapp')) return <WhatsAppIcon className="w-4 h-4" />;
    if (p.includes('linkedin')) return <LinkedInIcon className="w-4 h-4" />;
    if (p.includes('behance')) return <BehanceIcon className="w-4 h-4" />;
    if (p.includes('vimeo')) return <VimeoIcon className="w-4 h-4" />;
    if (p.includes('youtube')) return <YouTubeIcon className="w-4 h-4" />;
    if (p.includes('instagram')) return <InstagramIcon className="w-4 h-4" />;
    return <BehanceIcon className="w-4 h-4" />;
  };

  return (
    <footer className="relative bg-[#07090D] border-t border-[#F0F3F6]/08 py-16 text-[#94A3B8] text-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-bold text-[#F0F3F6]">
              IA
            </span>
            <span className="font-mono text-xs tracking-wider text-[#F0F3F6] uppercase">
              Islam Ahmed
            </span>
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-mono">
            <a href="#about" className="hover:text-[#F0F3F6] transition-colors">
              {t('nav.about')}
            </a>
            <a href="#experience" className="hover:text-[#F0F3F6] transition-colors">
              {t('nav.experience')}
            </a>
            <a href="#projects" className="hover:text-[#F0F3F6] transition-colors">
              {t('nav.projects')}
            </a>
            <a href="#services" className="hover:text-[#F0F3F6] transition-colors">
              {t('nav.services')}
            </a>
            <a href="#contact" className="hover:text-[#F0F3F6] transition-colors">
              {t('nav.contact')}
            </a>
          </div>

          {/* Social Icons + Admin Link + Back to top */}
          <div className="flex flex-wrap items-center justify-center gap-5">
            {/* Clean Recognizable Social Icons */}
            <div className="flex items-center gap-2.5" aria-label="Social and Contact Links">
              {visibleSocials.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.platform}
                  title={link.platform}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F59E0B] hover:border-[#F59E0B]/40 hover:bg-[#1A202C] hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
                >
                  {renderSocialIcon(link.platform)}
                </a>
              ))}
            </div>

            <div className="h-4 w-px bg-[#F0F3F6]/10 hidden sm:block" />

            {/* Back to top & Quick Admin Login Link */}
            <div className="flex items-center gap-4">
              <Link
                href="/admin/login"
                className="flex items-center gap-1.5 text-xs text-[#94A3B8]/70 hover:text-[#F59E0B] transition-colors"
                title="Quick Admin Login"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t('footer.adminLink')}</span>
              </Link>

              <button
                onClick={scrollToTop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
                aria-label="Back to top"
              >
                <span>{t('footer.backToTop')}</span>
                <ArrowUp className="w-3 h-3 text-[#F59E0B]" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-[#F0F3F6]/05 flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8]/50 gap-4">
          <p>© {new Date().getFullYear()} Islam Ahmed. {t('footer.rights')}</p>
          <p className="font-mono">Engineered for Cinematic Motion & High-End Agency Standards</p>
        </div>
      </div>
    </footer>
  );
};
