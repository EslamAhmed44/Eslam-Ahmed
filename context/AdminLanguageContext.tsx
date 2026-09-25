'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminLanguage = 'en' | 'ar';
export type AdminDirection = 'ltr' | 'rtl';

interface AdminLanguageContextType {
  language: AdminLanguage;
  direction: AdminDirection;
  setLanguage: (lang: AdminLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<AdminLanguage, Record<string, string>> = {
  en: {
    // Nav
    'nav.overview': 'Overview',
    'nav.hero': 'Hero Content',
    'nav.about': 'About & Stats',
    'nav.projects': 'Projects Manager',
    'nav.experience': 'Experience Timeline',
    'nav.skills': 'Skills & Stack',
    'nav.services': 'Services',
    'nav.testimonials': 'Client Feedback',
    'nav.media': 'Media Library',
    'nav.settings': 'Site Settings & SEO',
    'nav.liveSite': 'View Live Site',
    'nav.signOut': 'Sign Out',
    'nav.cmsTitle': 'CMS Dashboard',
    'nav.engine': 'Content Management Engine',

    // Common
    'common.save': 'Save Changes',
    'common.saving': 'Saving...',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.status': 'Status',
    'common.published': 'Published',
    'common.draft': 'Draft',
    'common.hidden': 'Hidden',
    'common.order': 'Order',
    'common.actions': 'Actions',
    'common.preview': 'Preview',
    'common.upload': 'Upload',
    'common.uploading': 'Uploading...',
    'common.success': 'Saved successfully',
    'common.failed': 'Operation failed',
    'common.close': 'Close',
    'common.confirmDelete': 'Are you sure you want to delete this item?',

    // Projects
    'projects.title': 'Projects & Creative Campaigns',
    'projects.subtitle': 'Manage multi-media showcases, ordered images, videos, and dynamic categories.',
    'projects.addNew': 'Add New Campaign / Project',
    'projects.tabBasic': 'A. Basic Info',
    'projects.tabMedia': 'B. Media Showcase',
    'projects.tabDetails': 'C. Tools & Details',
    'projects.tabLinks': 'D. Links',
    'projects.tabPublish': 'E. Publishing',
    'projects.nameEn': 'Project Name (English) *',
    'projects.nameAr': 'Project Name (Arabic)',
    'projects.client': 'Client / Brand',
    'projects.date': 'Project Date / Year',
    'projects.category': 'Categories',
    'projects.descEn': 'Project Description (English)',
    'projects.descAr': 'Project Description (Arabic)',
    'projects.coverVisual': 'Main Cover Visual',
    'projects.mediaQueue': 'Project Media Sequence (Admin Order = Live Order)',
    'projects.mediaHelp': 'Add multiple images and videos. The order below is exactly how they rotate on the live portfolio slideshow.',
    'projects.addImage': 'Add Image(s)',
    'projects.addVideo': 'Add Video (MP4 / Link)',
    'projects.uploadVideo': 'Upload Video File',
    'projects.videoUrlPrompt': 'Or enter MP4 / YouTube / Vimeo URL',
    'projects.moveUp': 'Move Up',
    'projects.moveDown': 'Move Down',
    'projects.setCover': 'Set as Cover',
    'projects.removeMedia': 'Remove',
    'projects.replace': 'Replace',
    'projects.featured': 'Featured Project (Show on Homepage)',
    'projects.sortOrder': 'Sort Order Number',
    'projects.driveUrl': 'Google Drive Materials Folder',
    'projects.behanceUrl': 'Behance URL',
    'projects.youtubeUrl': 'YouTube URL',
    'projects.vimeoUrl': 'Vimeo URL',
    'projects.projectUrl': 'Live URL / Website',
    'projects.toolsUsed': 'Tools / Software Used',
    'projects.tags': 'Tags / Keywords',

    // Skills
    'skills.title': 'Skills & Software Matrix CMS',
    'skills.subtitle': 'Hierarchical organization: Skill Categories → Software / Tools with persistent icons.',
    'skills.addGroup': 'Add Skill Category',
    'skills.addSkill': 'Add Software / Tool',
    'skills.groupTitleEn': 'Category Title (English) *',
    'skills.groupTitleAr': 'Category Title (Arabic)',
    'skills.skillName': 'Software / Skill Name *',
    'skills.skillIcon': 'Software Icon (PNG, SVG, JPG)',
    'skills.uploadIcon': 'Upload Custom Icon',
    'skills.iconPreview': 'Icon Preview',
    'skills.searchPlaceholder': 'Search skills or software...',
    'skills.filterCategory': 'Filter Category',
    'skills.visible': 'Visible on Portfolio',
    'skills.hiddenState': 'Hidden',
    'skills.duplicateWarning': 'This software already exists in this category.',
    'skills.categoryAssignment': 'Category Assignment',
  },
  ar: {
    // Nav
    'nav.overview': 'نظرة عامة',
    'nav.hero': 'محتوى البداية',
    'nav.about': 'من أنا والإحصائيات',
    'nav.projects': 'إدارة المشاريع',
    'nav.experience': 'المسار المهني',
    'nav.skills': 'المهارات والبرامج',
    'nav.services': 'الخدمات',
    'nav.testimonials': 'آراء العملاء',
    'nav.media': 'مكتبة الوسائط',
    'nav.settings': 'الإعدادات والسيو',
    'nav.liveSite': 'الموقع المباشر',
    'nav.signOut': 'تسجيل الخروج',
    'nav.cmsTitle': 'لوحة التحكم',
    'nav.engine': 'محرك إدارة المحتوى',

    // Common
    'common.save': 'حفظ التغييرات',
    'common.saving': 'جارٍ الحفظ...',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث...',
    'common.filter': 'تصفية',
    'common.all': 'الكل',
    'common.status': 'الحالة',
    'common.published': 'منشور',
    'common.draft': 'مسودة',
    'common.hidden': 'مخفي',
    'common.order': 'الترتيب',
    'common.actions': 'إجراءات',
    'common.preview': 'معاينة',
    'common.upload': 'رفع ملف',
    'common.uploading': 'جارٍ الرفع...',
    'common.success': 'تم الحفظ بنجاح',
    'common.failed': 'فشلت العملية',
    'common.close': 'إغلاق',
    'common.confirmDelete': 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟',

    // Projects
    'projects.title': 'المشاريع والحملات الإبداعية',
    'projects.subtitle': 'إدارة المعارض متعددة الوسائط، تسلسل الصور والفيديوهات، والتصنيفات الديناميكية.',
    'projects.addNew': 'إضافة مشروع / حملة جديدة',
    'projects.tabBasic': 'أ. البيانات الأساسية',
    'projects.tabMedia': 'ب. معرض الوسائط',
    'projects.tabDetails': 'ج. البرامج والتفاصيل',
    'projects.tabLinks': 'د. الروابط الخارجية',
    'projects.tabPublish': 'هـ. النشر والعرض',
    'projects.nameEn': 'اسم المشروع (إنجليزي) *',
    'projects.nameAr': 'اسم المشروع (عربي)',
    'projects.client': 'العميل / العلامة التجارية',
    'projects.date': 'تاريخ المشروع / السنة',
    'projects.category': 'التصنيفات',
    'projects.descEn': 'وصف المشروع (إنجليزي)',
    'projects.descAr': 'وصف المشروع (عربي)',
    'projects.coverVisual': 'الغلاف البصري الرئيسي',
    'projects.mediaQueue': 'تسلسل وسائط المشروع (ترتيب لوحة التحكم = ترتيب الموقع المباشر)',
    'projects.mediaHelp': 'أضف صوراً وفيديوهات متعددة. الترتيب المعروض أدناه هو بالضبط تسلسل العرض التلقائي على الموقع.',
    'projects.addImage': 'إضافة صور',
    'projects.addVideo': 'إضافة فيديو (MP4 / رابط)',
    'projects.uploadVideo': 'رفع ملف فيديو',
    'projects.videoUrlPrompt': 'أو أدخل رابط MP4 / يوتيوب / فيميو',
    'projects.moveUp': 'تحريك للأعلى',
    'projects.moveDown': 'تحريك للأسفل',
    'projects.setCover': 'تعيين كغلاف',
    'projects.removeMedia': 'إزالة',
    'projects.replace': 'استبدال',
    'projects.featured': 'مشروع مميز (يظهر في الصفحة الرئيسية)',
    'projects.sortOrder': 'رقم ترتيب الظهور',
    'projects.driveUrl': 'مجلد ملفات جوجل درايف',
    'projects.behanceUrl': 'رابط بيهانس',
    'projects.youtubeUrl': 'رابط يوتيوب',
    'projects.vimeoUrl': 'رابط فيميو',
    'projects.projectUrl': 'رابط الموقع / المعاينة المباشرة',
    'projects.toolsUsed': 'البرامج والأدوات المستخدمة',
    'projects.tags': 'الوسوم / الكلمات المفتاحية',

    // Skills
    'skills.title': 'مصفوفة المهارات والبرامج الاحترافية',
    'skills.subtitle': 'تنظيم هرمي: تصنيفات المهارات ← البرامج والأدوات مع أيقونات ثابتة وخيارات الظهور.',
    'skills.addGroup': 'إضافة تصنيف مهارات',
    'skills.addSkill': 'إضافة برنامج / أداة',
    'skills.groupTitleEn': 'عنوان التصنيف (إنجليزي) *',
    'skills.groupTitleAr': 'عنوان التصنيف (عربي)',
    'skills.skillName': 'اسم البرنامج / المهارة *',
    'skills.skillIcon': 'أيقونة البرنامج (PNG, SVG, JPG)',
    'skills.uploadIcon': 'رفع أيقونة مخصصة',
    'skills.iconPreview': 'معاينة الأيقونة',
    'skills.searchPlaceholder': 'ابحث في المهارات أو البرامج...',
    'skills.filterCategory': 'تصفية حسب التصنيف',
    'skills.visible': 'ظاهر في الموقع',
    'skills.hiddenState': 'مخفي',
    'skills.duplicateWarning': 'هذا البرنامج موجود مسبقاً في هذا التصنيف.',
    'skills.categoryAssignment': 'تعيين التصنيف',
  },
};

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

export const AdminLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AdminLanguage>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_lang');
      if (saved === 'en' || saved === 'ar') {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: AdminLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('admin_lang', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const direction: AdminDirection = language === 'ar' ? 'rtl' : 'ltr';

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || fallback || key;
  };

  return (
    <AdminLanguageContext.Provider
      value={{
        language,
        direction,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      <div dir={direction} className={language === 'ar' ? 'font-sans rtl' : 'font-sans ltr'}>
        {children}
      </div>
    </AdminLanguageContext.Provider>
  );
};

export const useAdminLanguage = () => {
  const ctx = useContext(AdminLanguageContext);
  if (!ctx) {
    throw new Error('useAdminLanguage must be used within an AdminLanguageProvider');
  }
  return ctx;
};
