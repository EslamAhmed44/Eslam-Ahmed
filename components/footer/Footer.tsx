'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../navigation/LanguageContext';
import { ArrowUp, Mail } from 'lucide-react';
import { SocialLink } from '@/lib/types';
import {
  WhatsAppIcon,
  LinkedInIcon,
  BehanceIcon,
  VimeoIcon,
  YouTubeIcon,
  InstagramIcon,
  AdminBirdMessageIcon,
} from '../ui/Icons';

interface FooterProps {
  socialLinks?: SocialLink[];
  contactEmail?: string;
  whatsappUrl?: string;
  linkedinUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  socialLinks,
  contactEmail,
  whatsappUrl,
  linkedinUrl,
}) => {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resolve actual configured links behind icons (reusing CMS settings where possible)
  const resolvedWhatsapp =
    whatsappUrl ||
    socialLinks?.find((s) => s.platform.toLowerCase().includes('whatsapp'))?.url ||
    'https://wa.me/201092463750';

  const resolvedEmail = contactEmail
    ? `mailto:${contactEmail}`
    : 'mailto:smsma4140@gmail.com';

  const resolvedLinkedin =
    linkedinUrl ||
    socialLinks?.find((s) => s.platform.toLowerCase().includes('linkedin'))?.url ||
    'https://www.linkedin.com/in/eslam-ahmed-a7bb0a308/';

  return (
    <footer className="relative bg-[#07090D] border-t border-[#F0F3F6]/08 py-16 text-[#94A3B8] text-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 text-xs font-bold text-[#F0F3F6]" title="IA">
              IA
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

          {/* Social Icons + Subtle Admin Trigger + Back to top */}
          <div className="flex flex-wrap items-center justify-center gap-5">
            {/* Clean Clickable Social/Contact Icons ONLY (no raw text) */}
            <div className="flex items-center gap-2.5" aria-label="Social and Contact Links">
              {/* WhatsApp */}
              <a
                href={resolvedWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="WhatsApp"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#1A202C] hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>

              {/* Email */}
              <a
                href={resolvedEmail}
                aria-label="Email"
                title="Email"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F59E0B] hover:border-[#F59E0B]/40 hover:bg-[#1A202C] hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
              >
                <Mail className="w-4 h-4" />
              </a>

              {/* LinkedIn */}
              <a
                href={resolvedLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#1A202C] hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            </div>

            <div className="h-4 w-px bg-[#F0F3F6]/10 hidden sm:block" />

            {/* Back to top & Creative Admin Message Icon */}
            <div className="flex items-center gap-3">
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
                aria-label="Back to top"
              >
                <ArrowUp className="w-3 h-3 text-[#F59E0B]" />
                <span>{t('footer.backToTop')}</span>
              </button>

              {/* Elegant divider */}
              <span className="h-3.5 w-px bg-[#F0F3F6]/15 select-none" aria-hidden="true" />

              {/* Creative Admin Message Icon */}
              <Link
                href="/admin/messages"
                className="group relative w-8 h-8 rounded-full flex items-center justify-center bg-[#151A23] border border-[#F0F3F6]/10 text-[#94A3B8] hover:text-[#F59E0B] hover:border-[#F59E0B]/40 hover:bg-[#1A202C] hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-out shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/50"
                title="Admin Messages"
                aria-label="Admin Messages"
              >
                <AdminBirdMessageIcon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-[#F0F3F6]/05 flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8]/50 gap-4">
          <p>© {new Date().getFullYear()} IA. {t('footer.rights')}</p>
          <p className="font-mono">Engineered for Cinematic Motion & High-End Agency Standards</p>
        </div>
      </div>
    </footer>
  );
};
