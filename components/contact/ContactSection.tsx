'use client';

import React, { useState } from 'react';
import { useLanguage } from '../navigation/LanguageContext';
import { Mail, MessageSquare, ArrowUpRight, Send, CheckCircle2 } from 'lucide-react';
import { LinkedInIcon, WhatsAppIcon } from '../ui/Icons';
import { MagneticButton } from '../ui/MagneticButton';

interface ContactSectionProps {
  email: string;
  whatsappUrl: string;
  linkedinUrl: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  email,
  whatsappUrl,
  linkedinUrl,
}) => {
  const { t } = useLanguage();
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: '', email: '', message: '' });
    }, 900);
  };

  return (
    <section id="contact" className="relative py-24 md:py-36 bg-[#10141C] overflow-hidden">
      {/* Background Accent Halo */}
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#F59E0B]/08 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Bold Headline & Direct Channels */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
                {t('contact.eyebrow')}
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#F0F3F6] mb-6 leading-[1.1]">
              {t('contact.heading')}
            </h2>

            <p className="text-base sm:text-lg text-[#94A3B8] max-w-lg mb-10 font-light leading-relaxed">
              {t('contact.subheading')}
            </p>

            {/* Direct Channel Cards */}
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              {/* WhatsApp Direct */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 p-4 px-6 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#07090D] flex items-center justify-center text-[#F59E0B]">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#94A3B8]">WhatsApp Chat</div>
                    <div className="text-sm font-bold text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors">
                      +20 109 246 3750
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>

              {/* Email Direct */}
              <a
                href={`mailto:${email}`}
                className="group flex items-center justify-between gap-6 p-4 px-6 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#07090D] flex items-center justify-center text-[#F59E0B]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#94A3B8]">Direct Email</div>
                    <div className="text-sm font-bold text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors">
                      {email}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>

              {/* LinkedIn Direct */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 p-4 px-6 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#07090D] flex items-center justify-center text-[#F59E0B]">
                    <LinkedInIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#94A3B8]">LinkedIn Network</div>
                    <div className="text-sm font-bold text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors">
                      Islam Ahmed
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-6 w-full">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#151A23]/80 border border-[#F0F3F6]/10 backdrop-blur-xl shadow-2xl">
              {submitted ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#F0F3F6] mb-2">Message Received</h3>
                  <p className="text-sm text-[#94A3B8] max-w-sm mb-6">
                    {t('contact.form.success')}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold text-[#F59E0B] hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-2">
                      {t('contact.form.name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#F59E0B] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-2">
                      {t('contact.form.email')}
                    </label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="alex@studio.com"
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#F59E0B] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-2">
                      {t('contact.form.message')}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Tell me about the campaign, timeline, and motion requirements..."
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#10141C] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#F59E0B] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-4 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_24px_rgba(245,158,11,0.35)] transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>{t('contact.form.sending')}</span>
                    ) : (
                      <>
                        <span>{t('contact.form.send')}</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
