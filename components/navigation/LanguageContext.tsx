'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.experience': 'Experience',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.services': 'Services',
    'nav.testimonials': 'Testimonials',
    'nav.contact': 'Get In Touch',
    'nav.downloadCv': 'Download CV',

    // Hero
    'hero.greeting': "Hello, I'm",
    'hero.cta.primary': 'Tawasul Ma’i',
    'hero.cta.secondary': 'View Projects',
    'hero.scrollDown': 'Scroll to explore',

    // About
    'about.eyebrow': 'About The Craft',
    'about.heading': 'Design with intention. Motion with purpose.',
    'about.stat.experience': 'Years Experience',
    'about.stat.projects': 'Completed Projects',
    'about.stat.clients': 'Global Clients',
    'about.stat.tools': 'Creative Tools',

    // Experience
    'experience.eyebrow': 'Career Timeline',
    'experience.heading': 'Commercial & Creative Journey',
    'experience.present': 'Present',

    // Skills
    'skills.eyebrow': 'Capabilities & Stack',
    'skills.heading': 'Creative Competencies & Toolset',

    // Projects
    'projects.eyebrow': 'Selected Works',
    'projects.heading': 'Motion & Editorial Showcase',
    'projects.filter.all': 'All',
    'projects.filter.motion': 'Motion Graphics',
    'projects.filter.design': 'Graphic Design',
    'projects.filter.branding': 'Branding',
    'projects.filter.social': 'Social Media',
    'projects.viewDetails': 'View Case Study',
    'projects.viewLive': 'Watch / Preview',
    'projects.empty': 'Projects coming soon.',

    // Services
    'services.eyebrow': 'Specialized Services',
    'services.heading': 'Tailored Creative Solutions',
    'services.motionGroup': 'Motion Graphics & Video Editing',
    'services.designGroup': 'Graphic Design & Brand Identity',

    // Testimonials
    'testimonials.eyebrow': 'Endorsements',
    'testimonials.heading': 'What Collaborators Say',
    'testimonials.empty': 'Testimonials will be added soon.',

    // Contact
    'contact.eyebrow': 'Collaboration',
    'contact.heading': "Let's create something in motion.",
    'contact.subheading':
      'Have a visionary project, broadcast campaign, or brand launch? Reach out and let’s craft cinematic visuals together.',
    'contact.directChannels': 'Direct Channels',
    'contact.form.name': 'Your Name',
    'contact.form.email': 'Your Email',
    'contact.form.message': 'Project Details or Inquiry',
    'contact.form.send': 'Send Message',
    'contact.form.success': 'Thank you! Your message has been sent.',
    'contact.form.sending': 'Transmitting...',

    // Footer
    'footer.rights': 'All Rights Reserved.',
    'footer.backToTop': 'Back to top',
    'footer.adminLink': 'Admin Portal',

    // Detail page
    'detail.back': 'Back to Projects',
    'detail.client': 'Client',
    'detail.date': 'Timeline',
    'detail.category': 'Discipline',
    'detail.tools': 'Software & Stack',
    'detail.videoPreview': 'Cinematic Video Reel',
    'detail.gallery': 'Key Visuals & Stills',
    'detail.externalLinks': 'External Presentations',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'نبذة عني',
    'nav.experience': 'الخبرات',
    'nav.skills': 'المهارات',
    'nav.projects': 'الأعمال',
    'nav.services': 'الخدمات',
    'nav.testimonials': 'آراء العملاء',
    'nav.contact': 'تواصل معي',
    'nav.downloadCv': 'تحميل السيرة الذاتية',

    // Hero
    'hero.greeting': 'مرحبًا، أنا',
    'hero.cta.primary': 'تواصل معي',
    'hero.cta.secondary': 'استكشف أعمالي',
    'hero.scrollDown': 'انتقل للاستكشاف',

    // About
    'about.eyebrow': 'عن الفلسفة الإبداعية',
    'about.heading': 'تصميم بغاية. حركة بهدف.',
    'about.stat.experience': 'سنوات من الخبرة',
    'about.stat.projects': 'مشروع منجز',
    'about.stat.clients': 'عميل ومؤسسة',
    'about.stat.tools': 'أداة وتقنية متقنة',

    // Experience
    'experience.eyebrow': 'المسار المهني',
    'experience.heading': 'رحلة التطور الإبداعي والوكالات',
    'experience.present': 'حتى الآن',

    // Skills
    'skills.eyebrow': 'القدرات والأدوات',
    'skills.heading': 'الكفاءات الإبداعية والبرمجية',

    // Projects
    'projects.eyebrow': 'أبرز الأعمال',
    'projects.heading': 'معرض الموشن جرافيك والتصميم التحريري',
    'projects.filter.all': 'الكل',
    'projects.filter.motion': 'موشن جرافيك',
    'projects.filter.design': 'تصميم جرافيك',
    'projects.filter.branding': 'الهوية البصرية',
    'projects.filter.social': 'سوشيال ميديا',
    'projects.viewDetails': 'عرض تفاصيل المشروع',
    'projects.viewLive': 'مشاهدة العرض',
    'projects.empty': 'سيتم إضافة مشاريع قريباً.',

    // Services
    'services.eyebrow': 'الخدمات المتخصصة',
    'services.heading': 'حلول بصرية مصممة لنجاح علامتك',
    'services.motionGroup': 'الموشن جرافيك ومونتاج الفيديو',
    'services.designGroup': 'التصميم الجرافيكي وبناء الهوية',

    // Testimonials
    'testimonials.eyebrow': 'شهادات الشركاء',
    'testimonials.heading': 'ماذا يقول العملاء والمخرجون',
    'testimonials.empty': 'سيتم نشر آراء العملاء قريباً.',

    // Contact
    'contact.eyebrow': 'التعاون والمشاريع',
    'contact.heading': 'لنصنع معاً عملاً نابضاً بالحركة والإلهام.',
    'contact.subheading':
      'هل لديك مشروع استثنائي، حملة إعلانية، أو إطلاق علامة تجارية؟ تواصل معي لنحول رؤيتك إلى واقع بصري سينمائي.',
    'contact.directChannels': 'قنوات التواصل المباشر',
    'contact.form.name': 'الاسم بالكامل',
    'contact.form.email': 'البريد الإلكتروني',
    'contact.form.message': 'تفاصيل المشروع أو الاستفسار',
    'contact.form.send': 'إرسال الرسالة',
    'contact.form.success': 'شكراً لتواصلك! تم إرسال رسالتك بنجاح.',
    'contact.form.sending': 'جارٍ الإرسال...',

    // Footer
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.backToTop': 'للأعلى',
    'footer.adminLink': 'لوحة التحكم',

    // Detail page
    'detail.back': 'العودة للأعمال',
    'detail.client': 'العميل',
    'detail.date': 'السنة',
    'detail.category': 'التخصص',
    'detail.tools': 'البرامج والتقنيات',
    'detail.videoPreview': 'العرض الحركي السينمائي',
    'detail.gallery': 'المشاهد والتفاصيل البصرية',
    'detail.externalLinks': 'روابط العروض الخارجية',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  dir: 'ltr',
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  defaultLang?: Language;
}> = ({ children, defaultLang = 'en' }) => {
  const [language, setLanguageState] = useState<Language>(defaultLang);

  useEffect(() => {
    // Read from localStorage if set
    const saved = localStorage.getItem('eslam_lang') as Language;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eslam_lang', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
