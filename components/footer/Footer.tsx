'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../navigation/LanguageContext';
import { sound } from '@/lib/audio/sound';
import { ArrowUp, Mail, ShieldCheck } from 'lucide-react';
import { SocialLink } from '@/lib/types';
import {
  WhatsAppIcon,
  LinkedInIcon,
} from '../ui/Icons';

interface FooterProps {
  socialLinks?: SocialLink[];
  contactEmail?: string;
  whatsappUrl?: string;
  linkedinUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  socialLinks = [],
  contactEmail = 'smsma4140@gmail.com',
  whatsappUrl = 'https://api.whatsapp.com/send/?phone=201092463750&text&type=phone_number&app_absent=',
  linkedinUrl = 'https://www.linkedin.com/in/eslam-ahmed-a7bb0a308/',
}) => {
  const { t, language } = useLanguage();

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] pt-20 pb-12 text-[var(--text-secondary)] text-sm overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Top Row: Brand & Navigation */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16 border-b border-[var(--border-subtle)] pb-12">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] text-xs font-mono font-black text-[var(--text-primary)]">
              IA
            </span>
            <div>
              <h3 className="text-base font-black text-[var(--text-primary)] tracking-tight">
                {t('footer.brandTitle')}
              </h3>
              <p className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                {t('footer.brandSubtitle')}
              </p>
            </div>
          </div>

          {/* Quick Section Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            <a href="#home" onClick={() => sound.playClick()} className="hover:text-[var(--text-primary)] transition-colors">
              {t('nav.home')}
            </a>
            <a href="#projects" onClick={() => sound.playClick()} className="hover:text-[var(--text-primary)] transition-colors">
              {t('nav.projects')}
            </a>
            <a href="#about" onClick={() => sound.playClick()} className="hover:text-[var(--text-primary)] transition-colors">
              {t('nav.about')}
            </a>
            <a href="#services" onClick={() => sound.playClick()} className="hover:text-[var(--text-primary)] transition-colors">
              {t('nav.services')}
            </a>
            <a href="#workflow" onClick={() => sound.playClick()} className="hover:text-[var(--text-primary)] transition-colors">
              {t('nav.workflow')}
            </a>
            <a href="#contact" onClick={() => sound.playClick()} className="hover:text-[var(--text-primary)] transition-colors">
              {t('nav.contact')}
            </a>
            <Link href="/privacy-terms" onClick={() => sound.playClick()} className="hover:text-[#F59E0B] transition-colors">
              {t('nav.privacyTerms')}
            </Link>
          </div>

          {/* Social Icons + Back to Top */}
          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              onClick={() => sound.playClick()}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#25D366] hover:text-[#25D366] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            </a>

            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              onClick={() => sound.playClick()}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#0A66C2] hover:text-[#0A66C2] transition-colors"
            >
              <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />
            </a>

            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full bg-[#F59E0B] text-[#07090D] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              title={t('footer.backToTop')}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Monumental Editorial Brand Statement */}
        <div className="py-12 border-b border-[var(--border-subtle)] text-center select-none overflow-hidden">
          <p className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[var(--border-strong)] uppercase font-mono leading-none hover:text-[#F59E0B]/20 transition-colors duration-500">
            GRAVITY IN MOTION
          </p>
          <p className="text-xs sm:text-sm font-mono text-[var(--text-tertiary)] uppercase tracking-widest mt-4">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Bottom Metadata & Legal Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-tertiary)]">
          <div>
            © {currentYear} Islam Ahmed. {t('footer.rights')}
          </div>

          <div className="flex items-center gap-6">
            <span>CAIRO, EGYPT</span>
            <span>•</span>
            <Link
              href="/admin"
              className="opacity-50 hover:opacity-100 hover:text-[#F59E0B] transition-opacity"
            >
              {t('footer.adminLink')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
