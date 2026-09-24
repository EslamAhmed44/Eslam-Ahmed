export type Status = 'published' | 'draft' | 'hidden';

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  designerName: string;
  designerNameAr: string;
  heroHeadline: string;
  heroHeadlineAr: string;
  rotatingRoles: string[];
  rotatingRolesAr: string[];
  shortBio: string;
  shortBioAr: string;
  longBio: string;
  longBioAr: string;
  stats: {
    experienceYears: string;
    projectsCount: string;
    clientsCount: string;
    toolsCount: string;
  };
  contactEmail: string;
  whatsappNumber: string;
  whatsappUrl: string;
  linkedinUrl: string;
  cvUrl: string;
  customCursorEnabled: boolean;
  defaultLanguage: 'en' | 'ar';
  seoKeywords: string;
  ogImageUrl: string;
}

export interface ProjectVideo {
  id?: string;
  url: string;
  title?: string;
  titleAr?: string;
  type?: 'youtube' | 'vimeo' | 'mp4' | 'direct' | 'other';
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  titleAr?: string;
  category: string; // for backward compatibility, mapped to categories[0]
  categories?: string[]; // Multiple categories support
  description: string;
  descriptionAr?: string;
  client: string;
  clientName?: string; // alias
  projectDate: string;
  coverImage: string;
  gallery: string[];
  images?: string[]; // alias for gallery
  videoUrl?: string;
  videos?: ProjectVideo[]; // Multiple videos support
  youtubeUrl?: string;
  vimeoUrl?: string;
  googleDriveUrl?: string;
  googleDriveMaterialsUrl?: string; // Dedicated Google Drive Materials link
  behanceUrl?: string;
  tools: string[]; // Software Used
  softwareUsed?: string[]; // alias
  projectUrl?: string;
  featured: boolean;
  tags: string[];
  sortOrder: number;
  status: Status;
  width?: number;
  height?: number;
  aspectRatio?: number;
  orientation?: 'portrait' | 'landscape' | 'square';
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  title: string;
  titleAr?: string;
  company: string;
  companyAr?: string;
  startDate: string;
  endDate?: string;
  isPresent: boolean;
  description: string;
  descriptionAr?: string;
  sortOrder: number;
  status: Status;
}

export interface SkillItem {
  id: string;
  name: string;
  level?: number;
  sortOrder: number;
}

export interface SkillGroup {
  id: string;
  title: string;
  titleAr: string;
  sortOrder: number;
  skills: SkillItem[];
}

export interface ServiceItem {
  id: string;
  title: string;
  titleAr: string;
  category: 'Motion Graphics & Video Editing' | 'Graphic Design & Brand Identity';
  description: string;
  descriptionAr: string;
  sortOrder: number;
  status: Status;
}

export type FeedbackType = 'WhatsApp' | 'Messenger' | 'Email' | 'Review' | 'Other';

export interface Testimonial {
  id: string;
  screenshotUrl: string; // The primary content: client feedback screenshot
  imageUrl?: string;     // alias for screenshotUrl
  photoUrl?: string;     // backwards compatibility
  clientName?: string;   // optional client name
  projectName?: string;  // optional project name
  feedbackType?: FeedbackType | string;
  caption?: string;      // optional short caption
  captionAr?: string;    // optional Arabic caption
  date?: string;         // optional date e.g. "2024" or "May 2024"
  sortOrder: number;
  status: Status;        // 'published' | 'draft'
  width?: number;
  height?: number;
  aspectRatio?: number;
  orientation?: 'portrait' | 'landscape' | 'square';
  // Legacy fields kept for backward compatibility:
  position?: string;
  company?: string;
  quote?: string;
  quoteAr?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'pdf' | 'other';
  sizeBytes: number;
  uploadedAt: string;
}

export interface AppData {
  settings: SiteSettings;
  projects: Project[];
  experiences: Experience[];
  skillGroups: SkillGroup[];
  services: ServiceItem[];
  testimonials: Testimonial[];
  socialLinks: SocialLink[];
  media: MediaFile[];
  categories?: string[];
}
