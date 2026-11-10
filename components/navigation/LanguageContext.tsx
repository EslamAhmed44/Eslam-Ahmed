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
    'nav.projects': 'Selected Work',
    'nav.services': 'Services',
    'nav.workflow': 'Workflow',
    'nav.testimonials': 'Testimonials',
    'nav.contact': 'Contact',
    'nav.viewCv': 'View CV',
    'nav.downloadCv': 'Download CV',
    'nav.privacyTerms': 'Privacy & Terms',

    // Intro Experience
    'intro.badge': 'SYSTEM READY // EST. 2025',
    'intro.name': 'ISLAM AHMED',
    'intro.tagline': 'Creative Visual Solutions',
    'intro.roles': 'Graphic & Motion Graphic Designer',
    'intro.pressStart': 'PRESS START',
    'intro.skip': 'Skip Intro',
    'intro.initializing': 'INITIALIZING EXPERIENCE...',
    'intro.soundHint': 'Audio enabled • Click to enter',

    // CV Viewer
    'cv.title': 'Curriculum Vitae',
    'cv.back': 'Back to Portfolio',
    'cv.download': 'Download CV',
    'cv.verified': 'Verified Document',
    'cv.zoomIn': 'Zoom In',
    'cv.zoomOut': 'Zoom Out',
    'cv.fullscreen': 'Fullscreen',
    'cv.openNewTab': 'Open in New Tab',

    // Legal / Privacy & Terms Viewer
    'legal.pageTitle': 'Privacy & Terms',
    'legal.badge': 'Official Legal Document',
    'legal.verified': 'Binding Agreement',
    'legal.back': 'Back to Portfolio',
    'legal.print': 'Print / Save',
    'legal.openOriginalPdf': 'Original PDF',
    'legal.filterAll': 'All Clauses',
    'legal.filterPrivacy': 'Privacy & Channels',
    'legal.filterFinancial': 'Financial & Milestones',
    'legal.filterTerms': 'Timelines & Revisions',
    'legal.filterIp': 'IP & Rights',
    'legal.status': 'Active Legal Agreement',
    'legal.version': 'Version',
    'legal.lastUpdated': 'Last Updated',
    'legal.parties.first': 'First Party (Service Provider)',
    'legal.parties.second': 'Second Party (The Client)',
    'legal.acceptanceNote': 'Legally binding upon deposit payment or electronic confirmation.',

    // Hero
    'hero.greeting': "Hello, I'm",
    'hero.designerName': 'Islam Ahmed',
    'hero.role': 'Graphic & Motion Graphic Designer',
    'hero.brandStatement': 'Creative Visual Solutions',
    'hero.cta.primary': 'View My Work',
    'hero.cta.secondary': 'Contact Me',
    'hero.scrollDown': 'Scroll to explore',
    'hero.location': 'Cairo, Egypt',
    'hero.experienceBadge': 'Active Since 2025',

    // About
    'about.eyebrow': 'About Me',
    'about.heading': 'Intentional Design. Purposeful Motion.',
    'about.stat.experience': 'Years Experience',
    'about.stat.projects': 'Completed Projects',
    'about.stat.clients': 'Global Clients',
    'about.stat.tools': 'Creative Tools',

    // Philosophy
    'philosophy.eyebrow': 'Design Philosophy',
    'philosophy.title': 'Gravity in Motion',
    'philosophy.quote': 'Weight, Mass, Inertia, and Deceleration. In visual communication as in physics, every element must carry intention, purpose, and visual gravity.',

    // Experience
    'experience.eyebrow': 'Career Timeline',
    'experience.heading': 'Development & Evolution',
    'experience.present': 'Present',

    // Skills
    'skills.eyebrow': 'Capabilities & Stack',
    'skills.heading': 'Core Competencies & Toolset',

    // Projects
    'projects.eyebrow': 'Selected Work',
    'projects.heading': 'Visual & Motion Gallery',
    'projects.filter.all': 'All Projects',
    'projects.filter.motion': 'Motion Graphics',
    'projects.filter.design': 'Graphic Design',
    'projects.filter.branding': 'Branding',
    'projects.filter.social': 'Social Media',
    'projects.filter.poster': 'Poster Design',
    'projects.filter.campaign': 'Campaign Design',
    'projects.viewDetails': 'Explore Project',
    'projects.viewLive': 'Watch / Preview',
    'projects.empty': 'Projects coming soon.',

    // Project Modal
    'projects.modal.close': 'Close',
    'projects.modal.prev': 'Previous Project',
    'projects.modal.next': 'Next Project',
    'projects.modal.client': 'Client',
    'projects.modal.year': 'Year',
    'projects.modal.tools': 'Tools & Software',
    'projects.modal.watchVideo': 'Watch Reel / Video',
    'projects.modal.gallery': 'Supporting Visuals',
    'projects.modal.driveLink': 'Open Materials (Drive)',

    // Services
    'services.eyebrow': 'Services',
    'services.heading': 'Creative Visual Solutions',
    'services.motionGroup': 'Motion Graphics & Video Editing',
    'services.designGroup': 'Graphic Design & Brand Identity',
    'services.contactCta': 'Contact Me',

    // Workflow
    'workflow.eyebrow': 'Workflow',
    'workflow.heading': 'From Concept to Screen',
    'workflow.step1.title': '01 — Brief',
    'workflow.step1.desc': 'Discovery into project goals, brand voice, target audience, and key deliverables.',
    'workflow.step2.title': '02 — Research',
    'workflow.step2.desc': 'Visual benchmarking, moodboarding, typographic curation, and aesthetic mapping.',
    'workflow.step3.title': '03 — Concept',
    'workflow.step3.desc': 'Storyboards, kinetic sequences, color palettes, and structured layout blueprints.',
    'workflow.step4.title': '04 — Design',
    'workflow.step4.desc': 'High-precision crafting in Photoshop, Illustrator, Premiere, and After Effects with intentional physics.',
    'workflow.step5.title': '05 — Delivery',
    'workflow.step5.desc': 'Final rendering, multi-format export for web and social, and organized production packages.',

    // Testimonials
    'testimonials.eyebrow': 'Client Feedback',
    'testimonials.heading': 'Real Client Endorsements',
    'testimonials.subheading': 'Unfiltered feedback and reviews from trusted clients.',
    'testimonials.clickToExpand': 'Click to enlarge',
    'testimonials.close': 'Close (Esc)',
    'testimonials.previous': 'Previous',
    'testimonials.next': 'Next',
    'testimonials.empty': 'Client feedback will appear here soon.',

    // Contact
    'contact.eyebrow': 'Get In Touch',
    'contact.heading': "Let's Build Something Memorable",
    'contact.subheading': 'Direct channels only — reach out directly via WhatsApp or Email.',
    'contact.whatsappCta': 'Chat on WhatsApp',
    'contact.emailCta': 'Send Email (Direct)',
    'contact.location': 'Cairo, Egypt',
    'contact.directChannels': 'Direct Channels',

    // Footer
    'footer.brandTitle': 'Islam Ahmed',
    'footer.brandSubtitle': 'Graphic & Motion Graphic Designer',
    'footer.tagline': 'Creative Visual Solutions — Designed with intention, animated with gravity.',
    'footer.rights': 'All rights reserved.',
    'footer.backToTop': 'Back to top',
    'footer.adminLink': 'Admin Portal',
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
    'nav.experience': 'المسار المهني',
    'nav.skills': 'المهارات',
    'nav.projects': 'أعمال مختارة',
    'nav.services': 'الخدمات',
    'nav.workflow': 'مسار العمل',
    'nav.testimonials': 'آراء العملاء',
    'nav.contact': 'تواصل معي',
    'nav.viewCv': 'السيرة الذاتية',
    'nav.downloadCv': 'تحميل السيرة الذاتية',
    'nav.privacyTerms': 'الخصوصية والشروط',

    // Intro Experience
    'intro.badge': 'النظام جاهز // تأسس 2025',
    'intro.name': 'إسلام أحمد',
    'intro.tagline': 'حلول بصرية إبداعية',
    'intro.roles': 'مصمم جرافيك وموشن جرافيك',
    'intro.pressStart': 'اضغط للبدء',
    'intro.skip': 'تخطي المقدمة',
    'intro.initializing': 'جاري تهيئة التجربة...',
    'intro.soundHint': 'المؤثرات الصوتية مفعلة • انقر للدخول',

    // CV Viewer
    'cv.title': 'السيرة الذاتية',
    'cv.back': 'العودة للموقع',
    'cv.download': 'تحميل السيرة الذاتية',
    'cv.verified': 'مستند موثق',
    'cv.zoomIn': 'تكبير',
    'cv.zoomOut': 'تصغير',
    'cv.fullscreen': 'ملء الشاشة',
    'cv.openNewTab': 'فتح في نافذة جديدة',

    // Legal / Privacy & Terms Viewer
    'legal.pageTitle': 'الخصوصية والشروط',
    'legal.badge': 'وثيقة قانونية رسمية',
    'legal.verified': 'اتفاقية ملزمة',
    'legal.back': 'العودة للموقع',
    'legal.print': 'طباعة / حفظ',
    'legal.openOriginalPdf': 'المستند الأصلي',
    'legal.filterAll': 'كافة البنود',
    'legal.filterPrivacy': 'الخصوصية وقنوات التواصل',
    'legal.filterFinancial': 'الآلية المالية والدفعات',
    'legal.filterTerms': 'الجدول والتعديلات',
    'legal.filterIp': 'الملكية الفكرية',
    'legal.status': 'اتفاقية قانونية معتمدة',
    'legal.version': 'الإصدار',
    'legal.lastUpdated': 'آخر تحديث',
    'legal.parties.first': 'الطرف الأول (مقدم الخدمة)',
    'legal.parties.second': 'الطرف الثاني (العميل)',
    'legal.acceptanceNote': 'ملزم قانوناً بمجرد سداد الدفعة المقدمة أو التأكيد عبر القنوات الرسمية.',

    // Hero
    'hero.greeting': 'مرحبًا، أنا',
    'hero.designerName': 'إسلام أحمد',
    'hero.role': 'مصمم جرافيك وموشن جرافيك',
    'hero.brandStatement': 'حلول بصرية إبداعية',
    'hero.cta.primary': 'تصفح أعمالي',
    'hero.cta.secondary': 'تواصل معي',
    'hero.scrollDown': 'انتقل للاستكشاف',
    'hero.location': 'القاهرة، مصر',
    'hero.experienceBadge': 'نشط منذ 2025',

    // About
    'about.eyebrow': 'نبذة عني',
    'about.heading': 'تصميم بغاية. حركة بهدف.',
    'about.stat.experience': 'سنوات من الخبرة',
    'about.stat.projects': 'مشروع منجز',
    'about.stat.clients': 'عميل ومؤسسة',
    'about.stat.tools': 'أداة وتقنية متقنة',

    // Philosophy
    'philosophy.eyebrow': 'فلسفة التصميم',
    'philosophy.title': 'جاذبية في حركة',
    'philosophy.quote': 'الوزن، الكتلة، القصور الذاتي، والتباطؤ المدروس. في التصميم البصري كما في قوانين الفيزياء، كل عنصر يجب أن يحمل غاية ووزناً بصرياً مقنعاً.',

    // Experience
    'experience.eyebrow': 'المسار المهني',
    'experience.heading': 'رحلة التطور الإبداعي والنمو',
    'experience.present': 'حتى الآن',

    // Skills
    'skills.eyebrow': 'القدرات والأدوات',
    'skills.heading': 'الكفاءات الإبداعية والبرمجية',

    // Projects
    'projects.eyebrow': 'أعمال مختارة',
    'projects.heading': 'معرض الأعمال الحركية والبصرية',
    'projects.filter.all': 'كافة المشاريع',
    'projects.filter.motion': 'موشن جرافيك',
    'projects.filter.design': 'تصميم جرافيك',
    'projects.filter.branding': 'الهوية البصرية',
    'projects.filter.social': 'سوشيال ميديا',
    'projects.filter.poster': 'تصميم الملصقات',
    'projects.filter.campaign': 'تصميم الحملات',
    'projects.viewDetails': 'استعراض المشروع',
    'projects.viewLive': 'مشاهدة العرض',
    'projects.empty': 'سيتم إضافة مشاريع قريباً.',

    // Project Modal
    'projects.modal.close': 'إغلاق',
    'projects.modal.prev': 'المشروع السابق',
    'projects.modal.next': 'المشروع التالي',
    'projects.modal.client': 'العميل',
    'projects.modal.year': 'السنة',
    'projects.modal.tools': 'البرامج والتقنيات',
    'projects.modal.watchVideo': 'مشاهدة الفيديو كاملاً',
    'projects.modal.gallery': 'معرض الصور الداعمة',
    'projects.modal.driveLink': 'فتح ملفات ومواد المشروع',

    // Services
    'services.eyebrow': 'الخدمات المتخصصة',
    'services.heading': 'حلول بصرية مصممة لنجاح علامتك',
    'services.motionGroup': 'الموشن جرافيك ومونتاج الفيديو',
    'services.designGroup': 'التصميم الجرافيكي وبناء الهوية',
    'services.contactCta': 'تواصل معي للبدء',

    // Workflow
    'workflow.eyebrow': 'مسار العمل',
    'workflow.heading': 'من الفكرة إلى الشاشة',
    'workflow.step1.title': '01 — تحديد الأهداف',
    'workflow.step1.desc': 'فهم عميق لأهداف المشروع، نبرة الهوية، والجمهور المستهدف والنتائج المرجوة.',
    'workflow.step2.title': '02 — البحث والتحليل',
    'workflow.step2.desc': 'دراسة معيارية بصرية شاملة، جمع المودبورد، واختيار الخطوط والألوان الملائمة.',
    'workflow.step3.title': '03 — الفكرة والتخطيط',
    'workflow.step3.desc': 'رسم تسلسلات التحريك، بناء الهيكل البصري، وتنسيق التكوين الفني المتناسق.',
    'workflow.step4.title': '04 — التنفيذ الإبداعي',
    'workflow.step4.desc': 'تنفيذ احترافي دقيق عبر فوتوشوب، إليستريتور، وأفتر إفكتس بفيزياء حركة مدروسة.',
    'workflow.step5.title': '05 — التسليم النهائي',
    'workflow.step5.desc': 'تصدير نهائي بأعلى جودة لمختلف المنصات الرقمية مع تسليم منظم لكافة الملفات المصدرية.',

    // Testimonials / Client Feedback
    'testimonials.eyebrow': 'آراء وتقييمات العملاء',
    'testimonials.heading': 'شهادات وانطباعات العملاء الحقيقية',
    'testimonials.subheading': 'لقطات حقيقية من محادثات ورسائل العملاء وتقييماتهم المباشرة.',
    'testimonials.clickToExpand': 'انقر لعرض الصورة بالحجم الكامل',
    'testimonials.close': 'إغلاق (Esc)',
    'testimonials.previous': 'السابق',
    'testimonials.next': 'التالي',
    'testimonials.empty': 'سيتم نشر لقطات آراء العملاء قريباً.',

    // Contact
    'contact.eyebrow': 'تواصل مباشر',
    'contact.heading': 'لنصنع معاً عملاً بصرياً استثنائياً',
    'contact.subheading': 'تواصل فوري ومباشر عبر واتساب أو البريد الإلكتروني دون استمارات معقدة.',
    'contact.whatsappCta': 'محادثة عبر واتساب',
    'contact.emailCta': 'مراسلة بالبريد المباشر',
    'contact.location': 'القاهرة، مصر',
    'contact.directChannels': 'قنوات التواصل المباشر',

    // Footer
    'footer.brandTitle': 'إسلام أحمد',
    'footer.brandSubtitle': 'مصمم جرافيك وموشن جرافيك',
    'footer.tagline': 'حلول بصرية إبداعية — مصممة بغاية، ومتحركة بجاذبية.',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.backToTop': 'للأعلى',
    'footer.adminLink': 'لوحة التحكم',

    // Contact / Start a Project
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
