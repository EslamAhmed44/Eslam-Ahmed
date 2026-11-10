'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { sound } from '@/lib/audio/sound';
import {
  FileText,
  Search,
  Lightbulb,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const { language, t, dir } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-70px' });

  const steps = [
    {
      num: '01',
      icon: FileText,
      title: t('workflow.step1.title'),
      desc: t('workflow.step1.desc'),
    },
    {
      num: '02',
      icon: Search,
      title: t('workflow.step2.title'),
      desc: t('workflow.step2.desc'),
    },
    {
      num: '03',
      icon: Lightbulb,
      title: t('workflow.step3.title'),
      desc: t('workflow.step3.desc'),
    },
    {
      num: '04',
      icon: Palette,
      title: t('workflow.step4.title'),
      desc: t('workflow.step4.desc'),
    },
    {
      num: '05',
      icon: CheckCircle2,
      title: t('workflow.step5.title'),
      desc: t('workflow.step5.desc'),
    },
  ];

  return (
    <section id="workflow" ref={ref} className="relative py-28 md:py-40 bg-[var(--bg-secondary)] overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#F59E0B]/05 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-[var(--border-subtle)] pb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
                {t('workflow.eyebrow')}
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[var(--text-primary)]">
              {t('workflow.heading')}
            </h2>
          </div>

          <p className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-widest">
            PHASE 01 ➔ PHASE 05 • LINEAR PRODUCTION
          </p>
        </div>

        {/* Sequential Timeline Track */}
        <div className="relative">
          {/* Desktop Connecting Line */}
          <div className="hidden lg:block absolute top-12 left-8 right-8 h-0.5 bg-[var(--border-subtle)] z-0" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 relative z-10">
            {steps.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 25 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={() => sound.playHover()}
                  className="group relative p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#F59E0B]/50 transition-all duration-300 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Top Node & Number */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] group-hover:border-[#F59E0B] flex items-center justify-center text-[#F59E0B] shadow-inner transition-colors">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--text-tertiary)] group-hover:text-[#F59E0B] transition-colors">
                        {step.num}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#F59E0B] transition-colors mb-3">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
                    <span>STEP {idx + 1}</span>
                    <span className="text-[#F59E0B]">COMPLETED</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

