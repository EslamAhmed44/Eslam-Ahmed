'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { sound } from '@/lib/audio/sound';
import {
  Globe,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Menu,
  X,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  cvUrl?: string;
  privacyTermsUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cvUrl = '/cv/Islam_Ahmed_CV.pdf',
  privacyTermsUrl = '/privacy-terms',
}) => {
  const { language, setLanguage, dir, t } = useLanguage();
  const { theme, toggleTheme, soundMuted, toggleSound } = useTheme();
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
    { href: '#projects', label: t('nav.projects') },
    { href: '#about', label: t('nav.about') },
    { href: '#services', label: t('nav.services') },
    { href: '#workflow', label: t('nav.workflow') },
    { href: '#contact', label: t('nav.contact') },
  ];

  const handleToggleLanguage = () => {
    sound.playClick();
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleToggleTheme = () => {
    sound.playClick();
    toggleTheme();
  };

  const handleLinkClick = () => {
    sound.playClick();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 py-4 md:py-6 pointer-events-none">
        <nav
          className={`pointer-events-auto w-full max-w-7xl mx-auto flex items-center justify-between px-5 md:px-7 py-3 rounded-full transition-all duration-500 ${
            scrolled
              ? 'bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-strong)] shadow-[0_16px_36px_rgba(0,0,0,0.4)]'
              : 'bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--border-subtle)] shadow-[0_8px_20px_rgba(0,0,0,0.2)]'
          }`}
          aria-label="Main Navigation"
        >
          {/* Brand Monogram Logo */}
          <Link
            href="#home"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 group text-lg font-bold tracking-tighter text-[var(--text-primary)]"
            aria-label="Islam Ahmed Home"
          >
            <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] group-hover:border-[#F59E0B] transition-colors duration-300 shadow-sm">
              <span className="font-mono text-xs font-black text-[var(--text-primary)] group-hover:text-[#F59E0B] transition-colors">
                IA
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#F59E0B] ring-2 ring-[var(--bg-primary)]" />
            </span>
            <div className="hidden sm:flex flex-col text-start">
              <span className="text-xs font-black tracking-tight leading-tight">Islam Ahmed</span>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest leading-none">
                Motion & Design
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-mono font-medium text-[var(--text-secondary)]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="px-3.5 py-1.5 rounded-full hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Right Controls (Language + Theme + Audio + CV) */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="w-9 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[#F59E0B] hover:border-[#F59E0B]/50 transition-colors cursor-pointer"
              title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#F59E0B]" />}
            </button>

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={handleToggleTheme}
              className="w-9 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[#F59E0B] hover:border-[#F59E0B]/50 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#475569]" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={handleToggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono font-bold text-[var(--text-primary)] hover:border-[#F59E0B]/50 transition-colors cursor-pointer"
              title="Toggle English / Arabic"
            >
              <Globe className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{language === 'en' ? 'AR' : 'EN'}</span>
            </button>

            {/* CV Viewer Shortcut */}
            <Link
              href="/cv"
              onClick={handleLinkClick}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F59E0B] text-[#07090D] text-xs font-mono font-bold tracking-wider uppercase hover:shadow-[0_0_16px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('nav.viewCv')}</span>
            </Link>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="lg:hidden w-9 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 pt-28 pb-10 px-6 bg-[var(--bg-primary)]/95 backdrop-blur-2xl flex flex-col justify-between lg:hidden"
          >
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
                NAVIGATION
              </span>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className="text-2xl font-black text-[var(--text-primary)] hover:text-[#F59E0B] py-2 border-b border-[var(--border-subtle)] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-6 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/cv"
                  onClick={handleLinkClick}
                  className="flex-1 py-3 text-center rounded-xl bg-[#F59E0B] text-[#07090D] font-mono font-bold text-xs uppercase"
                >
                  {t('nav.viewCv')}
                </Link>
                <Link
                  href="/privacy-terms"
                  onClick={handleLinkClick}
                  className="flex-1 py-3 text-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs"
                >
                  {t('nav.privacyTerms')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
