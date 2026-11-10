'use client';

import React from 'react';
import { useLanguage } from '../navigation/LanguageContext';
import { sound } from '@/lib/audio/sound';
import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import {
  LinkedInIcon,
  WhatsAppIcon,
} from '../ui/Icons';
import { ContactChannel } from '@/lib/types';

interface ContactSectionProps {
  email?: string;
  whatsappUrl?: string;
  linkedinUrl?: string;
  contactChannels?: ContactChannel[];
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  email = 'smsma4140@gmail.com',
  whatsappUrl = 'https://api.whatsapp.com/send/?phone=201092463750&text&type=phone_number&app_absent=',
  linkedinUrl = 'https://www.linkedin.com/in/eslam-ahmed-a7bb0a308/',
}) => {
  const { t, language } = useLanguage();

  const preparedEmailSubject = encodeURIComponent(
    language === 'ar' ? 'طلب مشروع جديد — إسلام أحمد' : 'Project Inquiry — Islam Ahmed'
  );
  const preparedEmailBody = encodeURIComponent(
    language === 'ar'
      ? 'مرحباً إسلام،\n\nأود مناقشة تفاصيل مشروع جديد معك:\n- نوع المشروع: \n- تفاصيل الفكرة: \n- الموعد النهائي المقترح: \n\nتحياتي،'
      : 'Hello Islam,\n\nI would like to collaborate with you on a new creative project:\n- Project Type: \n- Scope & Vision: \n- Estimated Timeline: \n\nBest regards,'
  );

  const emailMailtoLink = `mailto:${email}?subject=${preparedEmailSubject}&body=${preparedEmailBody}`;

  const exactWhatsAppUrl = 'https://api.whatsapp.com/send/?phone=201092463750&text&type=phone_number&app_absent=';

  return (
    <section id="contact" className="relative py-28 md:py-40 bg-[var(--bg-primary)] overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-[#F59E0B]/06 blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-[#F59E0B] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span>{t('contact.eyebrow')}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[var(--text-primary)] mb-6">
            {t('contact.heading')}
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light leading-relaxed">
            {t('contact.subheading')}
          </p>
        </div>

        {/* Direct Contact Cards Row (WhatsApp + Email) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {/* WhatsApp Direct Card */}
          <a
            href={exactWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            onMouseEnter={() => sound.playHover()}
            className="group relative p-8 md:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[#25D366]/20 hover:border-[#25D366] transition-all duration-300 shadow-sm hover:shadow-[0_15px_35px_rgba(37,211,102,0.15)] flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
                  <WhatsAppIcon className="w-7 h-7 text-[#25D366]" />
                </div>
                <div className="w-9 h-9 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] group-hover:border-[#25D366] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[#25D366] transition-colors">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              <span className="text-xs font-mono text-[#25D366] uppercase tracking-wider block mb-1">
                INSTANT MESSAGING
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] group-hover:text-[#25D366] transition-colors mb-2">
                WhatsApp Direct
              </h3>
              <p className="text-sm font-mono text-[var(--text-secondary)]">
                +20 109 246 3750
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono font-bold text-[#25D366] uppercase tracking-wider">
              <span>{t('contact.whatsappCta')}</span>
              <span>CHAT NOW ➔</span>
            </div>
          </a>

          {/* Email Direct Card */}
          <a
            href={emailMailtoLink}
            onClick={() => sound.playClick()}
            onMouseEnter={() => sound.playHover()}
            className="group relative p-8 md:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[#F59E0B]/20 hover:border-[#F59E0B] transition-all duration-300 shadow-sm hover:shadow-[0_15px_35px_rgba(245,158,11,0.15)] flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                  <Mail className="w-7 h-7 text-[#F59E0B]" />
                </div>
                <div className="w-9 h-9 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] group-hover:border-[#F59E0B] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[#F59E0B] transition-colors">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              <span className="text-xs font-mono text-[#F59E0B] uppercase tracking-wider block mb-1">
                OFFICIAL INQUIRIES
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] group-hover:text-[#F59E0B] transition-colors mb-2">
                Email Prepared
              </h3>
              <p className="text-sm font-mono text-[var(--text-secondary)]">
                {email}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono font-bold text-[#F59E0B] uppercase tracking-wider">
              <span>{t('contact.emailCta')}</span>
              <span>OPEN MAIL ➔</span>
            </div>
          </a>
        </div>

        {/* Location & Social Connections Bar */}
        <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[#F59E0B]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase block">
                LOCATION
              </span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {t('contact.location')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase me-2">
              LINKEDIN:
            </span>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#0A66C2] text-xs font-mono text-[var(--text-primary)] hover:text-[#0A66C2] transition-colors"
            >
              <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />
              <span>Islam Ahmed</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
