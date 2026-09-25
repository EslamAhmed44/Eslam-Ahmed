'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { FileText, Globe, Menu, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  cvUrl?: string;
  privacyTermsUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cvUrl = '/cv/Islam_Ahmed_CV.pdf',
  privacyTermsUrl,
}) => {
  const { language, setLanguage, dir, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#home', label: t('nav.home') },
    { href: '#about', label: t('nav.about') },
    { href: '#experience', label: t('nav.experience') },
    { href: '#skills', label: t('nav.skills') },
    { href: '#projects', label: t('nav.projects') },
    { href: '#services', label: t('nav.services') },
    { href: '#testimonials', label: t('nav.testimonials') },
    { href: '#contact', label: t('nav.contact') },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-4 md:py-6 pointer-events-none">
        <nav
          className={`pointer-events-auto w-full max-w-7xl mx-auto flex items-center justify-between px-5 md:px-7 py-3 rounded-full transition-all duration-500 ${
            scrolled
              ? 'bg-[#10141C]/85 backdrop-blur-xl border border-[#F0F3F6]/10 shadow-[0_16px_36px_rgba(0,0,0,0.6)]'
              : 'bg-[#10141C]/50 backdrop-blur-md border border-[#F0F3F6]/05 shadow-[0_8px_20px_rgba(0,0,0,0.3)]'
          }`}
          aria-label="Main Navigation"
        >
          {/* Brand Logo */}
          <Link
            href="#home"
            className="flex items-center gap-2 group text-xl font-bold tracking-tighter text-[#F0F3F6]"
            aria-label="Home"
          >
            <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#151A23] border border-[#F0F3F6]/15 group-hover:border-[#F59E0B] transition-colors duration-300">
              <span className="text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors">
                IA
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F59E0B] ring-2 ring-[#07090D]" />
            </span>
          </Link>

          {/* Desktop Center Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-medium text-[#94A3B8]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-full hover:text-[#F0F3F6] hover:bg-[#F0F3F6]/05 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Right Controls (Language + Privacy & Terms + CV) */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
              title="Toggle English / Arabic"
            >
              <Globe className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{language === 'en' ? 'AR' : 'EN'}</span>
            </button>

            {/* Privacy & Terms Document */}
            {privacyTermsUrl && (
              <a
                href={privacyTermsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/40 hover:bg-[#1A202C] transition-all duration-200"
                title={t('nav.privacyTerms')}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{t('nav.privacyTerms')}</span>
              </a>
            )}

            {/* Download CV (Compact & visually balanced with FileText icon) */}
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#07090D] bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] hover:shadow-[0_0_18px_rgba(245,158,11,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('nav.downloadCv')}</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#F0F3F6]"
            >
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-[#F0F3F6]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-4 top-20 z-40 sm:hidden bg-[#10141C]/95 backdrop-blur-2xl border border-[#F0F3F6]/10 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-2xl text-base font-medium text-[#F0F3F6] hover:bg-[#151A23] transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-[#F0F3F6]/10 flex flex-col gap-2">
                {privacyTermsUrl && (
                  <a
                    href={privacyTermsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-xs font-semibold text-[#94A3B8] hover:text-[#F0F3F6] bg-[#151A23] border border-[#F0F3F6]/10"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>{t('nav.privacyTerms')}</span>
                  </a>
                )}
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-xs font-bold text-[#07090D] bg-gradient-to-r from-[#F59E0B] to-[#FF7A18]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t('nav.downloadCv')}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
