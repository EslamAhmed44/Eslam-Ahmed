'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '@/lib/audio/sound';
import { useLanguage } from '../navigation/LanguageContext';
import { Volume2, VolumeX, Sparkles, Terminal } from 'lucide-react';

interface IntroOverlayProps {
  onComplete?: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
  const { t, language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [soundMuted, setSoundMuted] = useState(false);

  const fullName = language === 'ar' ? 'إسلام أحمد' : 'ISLAM AHMED';
  const roleName = language === 'ar' ? 'مصمم جرافيك وموشن جرافيك' : 'GRAPHIC & MOTION GRAPHIC DESIGNER';

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('islam_intro_seen');
      if (seen) {
        setIsVisible(false);
        onComplete?.();
        return;
      }
      setIsVisible(true);
      setSoundMuted(sound.getMuted());
    } catch {
      setIsVisible(true);
    }
  }, [onComplete]);

  // Character typewriter effect
  useEffect(() => {
    if (!isVisible) return;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx <= fullName.length) {
        setDisplayedText(fullName.slice(0, idx));
        if (idx > 0 && idx % 2 === 0) {
          sound.playHover();
        }
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 70);
    return () => clearInterval(interval);
  }, [isVisible, fullName]);

  const handleStart = () => {
    if (hasStarted) return;
    setHasStarted(true);
    sound.playStartChime();

    // Progress bar animation
    const startTime = Date.now();
    const duration = 1200; // Fast and snappy (1.2s)
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(current);
      if (current >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          dismissIntro();
        }, 250);
      }
    }, 25);
  };

  const dismissIntro = () => {
    try {
      sessionStorage.setItem('islam_intro_seen', 'true');
    } catch {}
    setIsVisible(false);
    sound.playClick();
    onComplete?.();
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = sound.toggleMute();
    setSoundMuted(nextMuted);
    if (!nextMuted) {
      sound.playClick();
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="intro-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#06080C] text-[#F0F3F6] select-none p-6 md:p-12 overflow-hidden"
      >
        {/* Ambient Grid and Radial Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#F59E0B]/10 blur-[140px] pointer-events-none" />

        {/* Top Header: System status & controls */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span>{t('intro.badge')}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141923] border border-[#F0F3F6]/10 text-xs text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors cursor-pointer"
              title="Toggle Audio"
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#F59E0B]" />}
              <span className="hidden sm:inline">{soundMuted ? 'Muted' : 'Audio On'}</span>
            </button>

            {/* Skip Intro */}
            <button
              onClick={dismissIntro}
              className="px-3.5 py-1.5 rounded-full bg-[#141923] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] hover:text-[#07090D] hover:bg-[#F0F3F6] transition-all duration-300 cursor-pointer"
            >
              {t('intro.skip')}
            </button>
          </div>
        </div>

        {/* Center: Monumental Kinetic Type & Press Start Button */}
        <div className="relative z-10 max-w-4xl mx-auto w-full text-center flex flex-col items-center justify-center my-auto">
          {/* Subtle Terminal Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#141923] border border-[#F59E0B]/30 text-xs font-mono text-[#F59E0B] mb-6"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{roleName}</span>
          </motion.div>

          {/* Dynamic Typographic Character Reveal */}
          <div className="min-h-[5rem] sm:min-h-[7rem] md:min-h-[9rem] flex items-center justify-center">
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#F0F3F6] font-mono">
              {displayedText}
              <span className="inline-block w-3 sm:w-5 h-8 sm:h-14 md:h-20 bg-[#F59E0B] ms-2 animate-pulse align-middle" />
            </h1>
          </div>

          {/* Subtitle Brand Statement */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm sm:text-base md:text-lg text-[#94A3B8] font-mono tracking-widest uppercase mt-4 mb-10"
          >
            {t('intro.tagline')} • GRAVITY IN MOTION
          </motion.p>

          {/* Interactive PRESS START Control */}
          {!hasStarted ? (
            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="relative group px-10 py-5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-mono font-bold text-sm sm:text-base tracking-widest uppercase shadow-[0_0_35px_rgba(245,158,11,0.35)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transition-all duration-300 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                <span>{t('intro.pressStart')}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#07090D]/20 font-mono">↵</span>
              </span>
            </motion.button>
          ) : (
            /* Snappy Creative Loading Sequence */
            <div className="w-full max-w-md mx-auto flex flex-col items-center">
              <div className="w-full h-1.5 bg-[#141923] rounded-full overflow-hidden border border-[#F0F3F6]/10 mb-3">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between w-full text-xs font-mono text-[#94A3B8]">
                <span>{t('intro.initializing')}</span>
                <span className="text-[#F59E0B] font-bold">{progress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer: Coordinates & Editorial Markers */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#64748B] border-t border-[#F0F3F6]/05 pt-4">
          <div className="flex items-center gap-4">
            <span>CAIRO, EG [30.0444° N, 31.2357° E]</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">PRECISION // EDITORIAL</span>
          </div>
          <div>
            <span>INDEX 001 // PORTFOLIO</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

