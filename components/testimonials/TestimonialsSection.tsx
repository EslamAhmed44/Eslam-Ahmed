'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../navigation/LanguageContext';
import { Testimonial } from '@/lib/types';
import { Quote, Star } from 'lucide-react';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
}) => {
  const { language, t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="testimonials" ref={ref} className="relative py-24 md:py-36 bg-[#07090D] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Quote className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
            {t('testimonials.eyebrow')}
          </span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#F0F3F6] mb-16"
        >
          {t('testimonials.heading')}
        </motion.h2>

        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="p-8 sm:p-10 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 hover:border-[#F59E0B]/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Star Rating & Quote Mark */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1 text-[#F59E0B]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-[#94A3B8]/30" />
                  </div>

                  <p className="text-base sm:text-lg leading-relaxed text-[#F0F3F6] italic mb-8">
                    &ldquo;{language === 'ar' && item.quoteAr ? item.quoteAr : item.quote}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-[#F0F3F6]/08">
                  {item.photoUrl ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#151A23]">
                      <Image
                        src={item.photoUrl}
                        alt={item.clientName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 flex items-center justify-center font-bold text-[#F59E0B]">
                      {item.clientName.charAt(0)}
                    </div>
                  )}

                  <div>
                    <h4 className="text-base font-bold text-[#F0F3F6]">{item.clientName}</h4>
                    <p className="text-xs text-[#94A3B8]">
                      {item.position} • {item.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-3xl bg-[#10141C] border border-dashed border-[#F0F3F6]/15 text-center">
            <p className="text-lg font-mono text-[#94A3B8]">{t('testimonials.empty')}</p>
          </div>
        )}
      </div>
    </section>
  );
};
