'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { ServiceItem } from '@/lib/types';
import { Video, Sparkles, Wand2, ArrowUpRight } from 'lucide-react';

interface ServicesSectionProps {
  services: ServiceItem[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
  const { language, t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const motionServices = services.filter(
    (s) => s.category === 'Motion Graphics & Video Editing'
  );
  const designServices = services.filter(
    (s) => s.category === 'Graphic Design & Brand Identity'
  );

  return (
    <section id="services" ref={ref} className="relative py-24 md:py-36 bg-[#10141C] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
            {t('services.eyebrow')}
          </span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#F0F3F6] mb-16"
        >
          {t('services.heading')}
        </motion.h2>

        <div className="space-y-16">
          {/* Group 1: Motion Graphics & Video Editing */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 flex items-center justify-center text-[#F59E0B]">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F0F3F6]">
                {t('services.motionGroup')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {motionServices.map((srv, idx) => (
                <motion.div
                  key={srv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-7 rounded-3xl bg-[#151A23]/70 border border-[#F0F3F6]/08 hover:border-[#F59E0B]/40 hover:bg-[#151A23] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono text-[#F59E0B]">0{idx + 1}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold text-[#F0F3F6] mb-2 group-hover:text-[#F59E0B] transition-colors">
                      {language === 'ar' && srv.titleAr ? srv.titleAr : srv.title}
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#94A3B8]">
                      {language === 'ar' && srv.descriptionAr ? srv.descriptionAr : srv.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Group 2: Graphic Design & Brand Identity */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 flex items-center justify-center text-[#FF7A18]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F0F3F6]">
                {t('services.designGroup')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {designServices.map((srv, idx) => (
                <motion.div
                  key={srv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                  className="p-7 rounded-3xl bg-[#151A23]/70 border border-[#F0F3F6]/08 hover:border-[#FF7A18]/40 hover:bg-[#151A23] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono text-[#FF7A18]">0{idx + 1}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FF7A18] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                    <h4 className="text-lg font-bold text-[#F0F3F6] mb-2 group-hover:text-[#FF7A18] transition-colors">
                      {language === 'ar' && srv.titleAr ? srv.titleAr : srv.title}
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#94A3B8]">
                      {language === 'ar' && srv.descriptionAr ? srv.descriptionAr : srv.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
