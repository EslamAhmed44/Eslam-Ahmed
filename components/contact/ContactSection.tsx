'use client';

import React from 'react';
import { useLanguage } from '../navigation/LanguageContext';
import {
  ArrowUpRight,
  ExternalLink,
  MessageSquare,
  Send,
  Globe,
} from 'lucide-react';
import {
  LinkedInIcon,
  WhatsAppIcon,
  BehanceIcon,
  VimeoIcon,
  YouTubeIcon,
  InstagramIcon,
} from '../ui/Icons';
import { ContactChannel } from '@/lib/types';

interface ContactSectionProps {
  email?: string;
  whatsappUrl?: string;
  linkedinUrl?: string;
  contactChannels?: ContactChannel[];
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  whatsappUrl = 'https://wa.me/201092463750',
  linkedinUrl = 'https://www.linkedin.com/in/eslam-ahmed-a7bb0a308/',
  contactChannels = [],
}) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  // Fallback default channels if none are configured from CMS
  const defaultChannels: ContactChannel[] = [
    {
      id: 'channel-whatsapp',
      platform: 'whatsapp',
      title: 'WhatsApp',
      titleAr: 'واتساب',
      subtitle: 'Chat with me',
      subtitleAr: 'ابدأ محادثة مباشرة',
      icon: 'whatsapp',
      url: whatsappUrl || 'https://wa.me/201092463750',
      enabled: true,
      sortOrder: 1,
    },
    {
      id: 'channel-linkedin',
      platform: 'linkedin',
      title: 'LinkedIn Network',
      titleAr: 'شبكة لينكد إن',
      subtitle: 'Islam Ahmed',
      subtitleAr: 'إسلام أحمد',
      icon: 'linkedin',
      url: linkedinUrl || 'https://www.linkedin.com/in/eslam-ahmed-a7bb0a308/',
      enabled: true,
      sortOrder: 2,
    },
  ];

  // Use configured channels from CMS or fallback, filter active and sort
  const activeChannels = (
    contactChannels && contactChannels.length > 0 ? contactChannels : defaultChannels
  )
    .filter((c) => c.enabled !== false && c.platform?.toLowerCase() !== 'email')
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const renderChannelIcon = (platform: string, iconName?: string) => {
    const key = (platform || iconName || '').toLowerCase();
    if (key.includes('whatsapp')) {
      return <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />;
    }
    if (key.includes('linkedin')) {
      return <LinkedInIcon className="w-5 h-5 text-[#0A66C2]" />;
    }
    if (key.includes('telegram')) {
      return <Send className="w-5 h-5 text-[#229ED9]" />;
    }
    if (key.includes('behance')) {
      return <BehanceIcon className="w-5 h-5 text-[#0057FF]" />;
    }
    if (key.includes('vimeo')) {
      return <VimeoIcon className="w-5 h-5 text-[#1AB7EA]" />;
    }
    if (key.includes('youtube')) {
      return <YouTubeIcon className="w-5 h-5 text-[#FF0000]" />;
    }
    if (key.includes('instagram')) {
      return <InstagramIcon className="w-5 h-5 text-[#E4405F]" />;
    }
    return <ExternalLink className="w-5 h-5 text-[#F59E0B]" />;
  };

  return (
    <section id="contact" className="relative py-28 md:py-36 bg-[#10141C] overflow-hidden">
      {/* Background Accent Atmospheric Halos */}
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#F59E0B]/08 blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[#31A8FF]/04 blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center">
        {/* Section Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151A23] border border-[#F59E0B]/30 mb-6">
          <MessageSquare className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B] font-semibold">
            {t('contact.eyebrow')}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#F0F3F6] mb-6 leading-[1.1]">
          {t('contact.heading')}
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mb-14 font-light leading-relaxed">
          {t('contact.subheading')}
        </p>

        {/* Direct Channels Cards (Dynamic, Extensible, No Raw Numbers, No Direct Email) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl mx-auto">
          {activeChannels.map((channel) => {
            const displayTitle = isAr && channel.titleAr ? channel.titleAr : channel.title;
            const displaySubtitle = isAr && channel.subtitleAr
              ? channel.subtitleAr
              : channel.subtitle || displayTitle;

            return (
              <a
                key={channel.id}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-6 sm:p-7 rounded-3xl bg-[#151A23] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/50 hover:bg-[#181E29] transition-all duration-300 shadow-xl hover:shadow-[0_12px_36px_rgba(245,158,11,0.1)] flex items-center justify-between gap-4 cursor-pointer overflow-hidden text-left rtl:text-right"
              >
                {/* Subtle ambient hover glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/05 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="flex items-center gap-4 relative z-10 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#07090D] border border-[#F0F3F6]/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#F59E0B]/40 group-hover:scale-105 transition-all duration-300">
                    {renderChannelIcon(channel.platform, channel.icon)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                      {displayTitle}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors truncate mt-0.5">
                      {displaySubtitle}
                    </div>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-[#07090D] border border-[#F0F3F6]/10 flex items-center justify-center text-[#94A3B8] group-hover:text-[#07090D] group-hover:bg-[#F59E0B] group-hover:border-[#F59E0B] group-hover:scale-105 transition-all duration-300 flex-shrink-0 relative z-10">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
