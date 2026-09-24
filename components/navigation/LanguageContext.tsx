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
    'projects.filter.poster': 'Poster Design',
    'projects.filter.campaign': 'Campaign Design',
    'projects.viewDetails': 'View Case Study',
    'projects.viewLive': 'Watch / Preview',
    'projects.empty': 'Projects coming soon.',

    // Services
    'services.eyebrow': 'Specialized Services',
    'services.heading': 'Tailored Creative Solutions',
    'services.motionGroup': 'Motion Graphics & Video Editing',
    'services.designGroup': 'Graphic Design & Brand Identity',

    // Testimonials / Client Feedback
    'testimonials.eyebrow': 'Authentic Feedback',
    'testimonials.heading': 'Real Client Feedback & Reviews',
    'testimonials.subheading': 'Unfiltered screenshots of conversations, chat praise, and reviews from trusted clients.',
    'testimonials.clickToExpand': 'Click to enlarge',
    'testimonials.close': 'Close (Esc)',
    'testimonials.previous': 'Previous',
    'testimonials.next': 'Next',
    'testimonials.empty': 'Client feedback screenshots will appear here soon.',

    // Contact / Start a Project
    'contact.eyebrow': 'Collaboration',
    'contact.heading': 'Start a Project',
    'contact.subheading': "Have a project in mind? Tell me a little about it and let's create something great.",
    'contact.directChannels': 'Direct Channels',
    'contact.form.name': 'Your Name',
    'contact.form.namePlaceholder': 'Enter your full name',
    'contact.form.contactMethod': 'Preferred Contact Method',
    'contact.form.email': 'Email Address',
    'contact.form.emailPlaceholder': 'you@example.com',
    'contact.form.whatsapp': 'WhatsApp Number',
    'contact.form.whatsappPlaceholder': '+20 100 000 0000',
    'contact.form.services': 'What do you need?',
    'contact.form.description': 'Tell me about your project',
    'contact.form.descriptionPlaceholder': "Tell me what you're looking to create, your goals, and any important details.",
    'contact.form.budget': 'Estimated Budget',
    'contact.form.budgetOptional': '(Optional)',
    'contact.form.references': 'Project References',
    'contact.form.referencesSubtitle': "Have any examples, references, inspiration, or project materials you'd like to share?",
    'contact.form.uploadFiles': 'Upload Reference Files',
    'contact.form.uploadFilesHint': 'JPG, PNG, WEBP, or PDF up to 10MB',
    'contact.form.referenceLink': 'Reference Link',
    'contact.form.addReferenceLink': '+ Add another reference',
    'contact.form.googleDriveHint': 'Have a larger collection of files? You can share a Google Drive folder link instead.',
    'contact.form.googleDrivePlaceholder': 'https://drive.google.com/...',
    'contact.form.send': 'Submit Project Inquiry',
    'contact.form.sending': 'Transmitting Inquiry...',
    'contact.form.successTitle': 'Project Inquiry Sent',
    'contact.form.successMessage': "Thank you for reaching out. I've received your project details and will get back to you using your preferred contact method.",
    'contact.form.backToPortfolio': 'Back to Portfolio',
    'contact.form.errorDefault': 'Something went wrong while sending your inquiry. Please try again.',

    // Footer
    'footer.rights': 'All Rights Reserved.',
    'footer.backToTop': 'Back to top',
    'footer.adminLink': 'Admin Portal',

    // Detail page
    'detail.back': 'Back to Projects',
    'detail.client': 'Client',
    'detail.date': 'Timeline',
    'detail.category': 'Discipline',
    'detail.categories': 'Disciplines',
    'detail.tools': 'Software & Stack',
    'detail.videoPreview': 'Cinematic Video Reel',
    'detail.videos': 'Campaign Motion & Video Showcase',
    'detail.gallery': 'Key Visuals & Stills',
    'detail.externalLinks': 'External Presentations',
    'detail.materials': 'Project Materials',
    'detail.viewMaterials': 'View Project Materials',
    'detail.googleDrive': 'Google Drive Materials',
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
    'projects.filter.poster': 'تصميم الملصقات',
    'projects.filter.campaign': 'تصميم الحملات',
    'projects.viewDetails': 'عرض تفاصيل المشروع',
    'projects.viewLive': 'مشاهدة العرض',
    'projects.empty': 'سيتم إضافة مشاريع قريباً.',

    // Services
    'services.eyebrow': 'الخدمات المتخصصة',
    'services.heading': 'حلول بصرية مصممة لنجاح علامتك',
    'services.motionGroup': 'الموشن جرافيك ومونتاج الفيديو',
    'services.designGroup': 'التصميم الجرافيكي وبناء الهوية',

    // Testimonials / Client Feedback
    'testimonials.eyebrow': 'آراء وتقييمات العملاء',
    'testimonials.heading': 'شهادات وانطباعات العملاء الحقيقية',
    'testimonials.subheading': 'لقطات حقيقية من محادثات ورسائل العملاء وتقييماتهم المباشرة.',
    'testimonials.clickToExpand': 'انقر لعرض الصورة بالحجم الكامل',
    'testimonials.close': 'إغلاق (Esc)',
    'testimonials.previous': 'السابق',
    'testimonials.next': 'التالي',
    'testimonials.empty': 'سيتم نشر لقطات آراء العملاء قريباً.',

    // Contact / Start a Project
    'contact.eyebrow': 'التعاون والمشاريع',
    'contact.heading': 'ابدأ مشروعك',
    'contact.subheading': 'هل لديك فكرة أو مشروع في ذهنك؟ أخبرني قليلاً عنه ولنصنع معاً عملاً استثنائياً.',
    'contact.directChannels': 'قنوات التواصل المباشر',
    'contact.form.name': 'اسمك الكريم',
    'contact.form.namePlaceholder': 'أدخل اسمك بالكامل',
    'contact.form.contactMethod': 'طريقة التواصل المفضلة',
    'contact.form.email': 'البريد الإلكتروني',
    'contact.form.emailPlaceholder': 'you@example.com',
    'contact.form.whatsapp': 'رقم الواتساب',
    'contact.form.whatsappPlaceholder': '+20 100 000 0000',
    'contact.form.services': 'ما الذي تحتاجه في مشروعك؟',
    'contact.form.description': 'أخبرني عن تفاصيل مشروعك',
    'contact.form.descriptionPlaceholder': 'أخبرني بما تتطلع لإنشائه، أهدافك، وأي تفاصيل مهمة.',
    'contact.form.budget': 'الميزانية التقديرية',
    'contact.form.budgetOptional': '(اختياري)',
    'contact.form.references': 'مراجع ومصادر المشروع',
    'contact.form.referencesSubtitle': 'هل لديك نماذج، مراجع، إلهام بصري، أو ملفات مشروع تود مشاركتها؟',
    'contact.form.uploadFiles': 'رفع ملفات مراجع',
    'contact.form.uploadFilesHint': 'JPG أو PNG أو WEBP أو PDF بحد أقصى 10 ميجابايت',
    'contact.form.referenceLink': 'رابط مرجعي',
    'contact.form.addReferenceLink': '+ إضافة رابط آخر',
    'contact.form.googleDriveHint': 'هل لديك مجموعة كبيرة من الملفات؟ يمكنك مشاركة رابط مجلد Google Drive بدلاً من ذلك.',
    'contact.form.googleDrivePlaceholder': 'https://drive.google.com/...',
    'contact.form.send': 'إرسال طلب المشروع',
    'contact.form.sending': 'جارٍ إرسال الطلب...',
    'contact.form.successTitle': 'تم إرسال طلب المشروع بنجاح',
    'contact.form.successMessage': 'شكراً لتواصلك. لقد استلمت تفاصيل مشروعك وسأقوم بالرد عليك عبر وسيلة التواصل المفضلة لديك قريباً.',
    'contact.form.backToPortfolio': 'العودة للموقع',
    'contact.form.errorDefault': 'حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.',

    // Footer
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.backToTop': 'للأعلى',
    'footer.adminLink': 'لوحة التحكم',

    // Detail page
    'detail.back': 'العودة للأعمال',
    'detail.client': 'العميل',
    'detail.date': 'السنة',
    'detail.category': 'التخصص',
    'detail.categories': 'التخصصات',
    'detail.tools': 'البرامج والتقنيات',
    'detail.videoPreview': 'العرض الحركي السينمائي',
    'detail.videos': 'فيديوهات وعروض الحملة',
    'detail.gallery': 'المشاهد والتفاصيل البصرية',
    'detail.externalLinks': 'روابط العروض الخارجية',
    'detail.materials': 'ملفات ومصادر المشروع',
    'detail.viewMaterials': 'مشاهدة ملفات المشروع',
    'detail.googleDrive': 'ملفات جوجل درايف',
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
