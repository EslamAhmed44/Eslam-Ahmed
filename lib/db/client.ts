import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AppData,
  ContactChannel,
  Experience,
  InquiryStatus,
  MediaFile,
  PreferredContactMethod,
  Project,
  ProjectInquiry,
  ProjectVideo,
  ServiceItem,
  SiteSettings,
  SkillGroup,
  SocialLink,
  Testimonial,
} from '@/lib/types';
import { createServerClient, isServerSupabaseConfigured } from '@/lib/supabase/server';

export const DEFAULT_CATEGORIES = [
  'Motion Graphics',
  'Graphic Design',
  'Branding',
  'Social Media',
  'Poster Design',
  'Campaign Design',
];

export function normalizeProject(p: any): Project {
  if (!p) return p;
  const categories: string[] =
    Array.isArray(p.categories) && p.categories.length > 0
      ? p.categories
      : p.category
      ? [p.category]
      : ['Motion Graphics'];

  const gallery: string[] = Array.isArray(p.gallery)
    ? p.gallery
    : Array.isArray(p.images)
    ? p.images
    : [];

  const rawVideos = Array.isArray(p.videos) ? p.videos : [];
  let videos: ProjectVideo[] = rawVideos
    .map((v: any, idx: number) => {
      if (typeof v === 'string') {
        return { id: `vid-${idx + 1}`, url: v, title: `Video ${idx + 1}` };
      }
      return {
        id: v.id || `vid-${idx + 1}`,
        url: v.url || '',
        title: v.title || `Video ${idx + 1}`,
        titleAr: v.titleAr,
        type: v.type,
      };
    })
    .filter((v: ProjectVideo) => Boolean(v.url));

  if (videos.length === 0 && p.videoUrl) {
    videos = [{ id: 'vid-1', url: p.videoUrl, title: 'Main Reel' }];
  } else if (videos.length === 0 && p.video_url) {
    videos = [{ id: 'vid-1', url: p.video_url, title: 'Main Reel' }];
  }

  const videoUrl = p.videoUrl || p.video_url || (videos[0]?.url || '');
  const googleDriveMaterialsUrl =
    p.googleDriveMaterialsUrl ||
    p.google_drive_materials_url ||
    p.googleDriveUrl ||
    p.google_drive_url ||
    '';
  const tools = Array.isArray(p.tools)
    ? p.tools
    : Array.isArray(p.softwareUsed)
    ? p.softwareUsed
    : [];
  const client = p.client || p.clientName || '';

  return {
    ...p,
    category: categories[0] || 'Motion Graphics',
    categories,
    gallery,
    images: gallery,
    videoUrl,
    videos,
    googleDriveUrl: googleDriveMaterialsUrl,
    googleDriveMaterialsUrl,
    tools,
    softwareUsed: tools,
    client,
    clientName: client,
    status: p.status || 'published',
  };
}

const storeFilePath = path.join(process.cwd(), 'lib', 'db', 'store.json');

// Read JSON store safely
export function readLocalStore(): AppData {
  try {
    if (!fs.existsSync(storeFilePath)) {
      throw new Error(`Store file not found at ${storeFilePath}`);
    }
    const raw = fs.readFileSync(storeFilePath, 'utf-8');
    const parsed = JSON.parse(raw) as AppData;
    parsed.inquiries = parsed.inquiries || [];
    return parsed;
  } catch (error) {
    console.error('Failed to read local store:', error);
    throw error;
  }
}

// Write JSON store safely with serverless read-only filesystem resilience
export function writeLocalStore(data: AppData): void {
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error: any) {
    if (error?.code === 'EROFS' || error?.message?.includes('read-only')) {
      console.warn('[LocalStore] Skipped writing to store.json on read-only serverless filesystem.');
      return;
    }
    console.error('Failed to write local store:', error?.message || error);
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      return;
    }
    throw error;
  }
}

// ----------------------------------------------------
// GET ALL SITE DATA
// ----------------------------------------------------
export async function getSiteData(includeDrafts: boolean = false): Promise<AppData> {
  const supabase = createServerClient();

  // If Supabase is active, fetch from PostgreSQL
  if (supabase && isServerSupabaseConfigured()) {
    try {
      const [
        { data: settingsData },
        { data: projectsData },
        { data: experiencesData },
        { data: skillGroupsData },
        { data: skillsData },
        { data: servicesData },
        { data: testimonialsData },
        { data: socialLinksData },
        { data: mediaData },
      ] = await Promise.all([
        supabase.from('site_settings').select('*').limit(1).maybeSingle(),
        supabase
          .from('projects')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('experiences')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('skill_groups')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('skills')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('services')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('testimonials')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('social_links')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('media_files')
          .select('*')
          .order('uploaded_at', { ascending: false }),
      ]);

      if (settingsData) {
        // Map Supabase skill groups + skills together
        const groups: SkillGroup[] = (skillGroupsData || []).map((g: any) => ({
          id: g.id,
          title: g.title,
          titleAr: g.title_ar,
          sortOrder: g.sort_order,
          skills: (skillsData || [])
            .filter((s: any) => s.group_id === g.id)
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              level: s.level,
              sortOrder: s.sort_order,
            })),
        }));

        const appData: AppData = {
          settings: {
            siteTitle: settingsData.site_title,
            siteDescription: settingsData.site_description,
            designerName: settingsData.designer_name,
            designerNameAr: settingsData.designer_name_ar,
            heroHeadline: settingsData.hero_headline,
            heroHeadlineAr: settingsData.hero_headline_ar,
            rotatingRoles: settingsData.rotating_roles || [],
            rotatingRolesAr: settingsData.rotating_roles_ar || [],
            shortBio: settingsData.short_bio,
            shortBioAr: settingsData.short_bio_ar,
            longBio: settingsData.long_bio,
            longBioAr: settingsData.long_bio_ar,
            stats: settingsData.stats || {},
            contactEmail: settingsData.contact_email,
            whatsappNumber: settingsData.whatsapp_number,
            whatsappUrl: settingsData.whatsapp_url,
            linkedinUrl: settingsData.linkedin_url,
            cvUrl: settingsData.cv_url,
            privacyTermsUrl: settingsData.privacy_terms_url || '',
            customCursorEnabled: settingsData.custom_cursor_enabled ?? true,
            defaultLanguage: settingsData.default_language || 'en',
            seoKeywords: settingsData.seo_keywords || '',
            ogImageUrl: settingsData.og_image_url || '',
          },
          projects: (projectsData || []).map((p: any) =>
            normalizeProject({
              id: p.id,
              slug: p.slug,
              title: p.title,
              titleAr: p.title_ar,
              category: p.category,
              categories: p.categories,
              description: p.description,
              descriptionAr: p.description_ar,
              client: p.client || '',
              projectDate: p.project_date || '',
              coverImage: p.cover_image,
              gallery: p.gallery || [],
              videoUrl: p.video_url || '',
              videos: p.videos || [],
              youtubeUrl: p.youtube_url || '',
              vimeoUrl: p.vimeo_url || '',
              googleDriveUrl: p.google_drive_url || '',
              googleDriveMaterialsUrl: p.google_drive_materials_url || p.google_drive_url || '',
              behanceUrl: p.behance_url || '',
              tools: p.tools || [],
              projectUrl: p.project_url || '',
              featured: Boolean(p.featured),
              tags: p.tags || [],
              sortOrder: p.sort_order || 0,
              status: p.status || 'published',
              width: p.width,
              height: p.height,
              aspectRatio: p.aspect_ratio || p.aspectRatio,
              orientation: p.orientation,
              createdAt: p.created_at,
              updatedAt: p.updated_at,
            })
          ),
          experiences: (experiencesData || []).map((e: any) => ({
            id: e.id,
            title: e.title,
            titleAr: e.title_ar,
            company: e.company,
            companyAr: e.company_ar,
            startDate: e.start_date,
            endDate: e.end_date || '',
            isPresent: Boolean(e.is_present),
            description: e.description,
            descriptionAr: e.description_ar,
            sortOrder: e.sort_order || 0,
            status: e.status || 'published',
          })),
          skillGroups: groups,
          services: (servicesData || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            titleAr: s.title_ar,
            category: s.category,
            description: s.description,
            descriptionAr: s.description_ar,
            sortOrder: s.sort_order || 0,
            status: s.status || 'published',
          })),
          testimonials: (testimonialsData || []).map((t: any) => {
            const screenshot = t.screenshot_url || t.photo_url || '';
            return {
              id: t.id,
              screenshotUrl: screenshot,
              imageUrl: screenshot,
              photoUrl: screenshot,
              clientName: t.client_name || '',
              projectName: t.project_name || '',
              feedbackType: t.feedback_type || 'WhatsApp',
              caption: t.caption || '',
              captionAr: t.caption_ar || '',
              date: t.date || '',
              sortOrder: t.sort_order || 0,
              status: t.status || 'published',
              width: t.width,
              height: t.height,
              aspectRatio: t.aspect_ratio,
              orientation: t.orientation,
              position: t.position || '',
              company: t.company || '',
              quote: t.quote || '',
              quoteAr: t.quote_ar || '',
            };
          }),
          socialLinks: (socialLinksData || []).map((l: any) => ({
            id: l.id,
            platform: l.platform,
            url: l.url,
            icon: l.icon,
            sortOrder: l.sort_order || 0,
            isActive: Boolean(l.is_active),
          })),
          media: (mediaData || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            url: m.url,
            type: m.file_type,
            sizeBytes: m.size_bytes || 0,
            uploadedAt: m.uploaded_at,
          })),
          contactChannels: readLocalStore().contactChannels || [],
          categories: DEFAULT_CATEGORIES,
          inquiries: [],
        };

        if (!includeDrafts) {
          appData.projects = appData.projects.filter((p) => p.status === 'published');
          appData.experiences = appData.experiences.filter((e) => e.status === 'published');
          appData.services = appData.services.filter((s) => s.status === 'published');
          appData.testimonials = appData.testimonials.filter((t) => t.status === 'published');
          appData.socialLinks = appData.socialLinks.filter((s) => s.isActive);
          appData.contactChannels = (appData.contactChannels || []).filter((c) => c.enabled);
        }

        return appData;
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local store:', err);
    }
  }

  // Fallback to local store
  const data = readLocalStore();
  const normalizedData: AppData = {
    ...data,
    categories: data.categories || DEFAULT_CATEGORIES,
    projects: (data.projects || []).map((p) => normalizeProject(p)),
    contactChannels: data.contactChannels || [],
    inquiries: data.inquiries || [],
  };

  if (includeDrafts) {
    return normalizedData;
  }

  return {
    ...normalizedData,
    projects: normalizedData.projects.filter((p) => p.status === 'published'),
    experiences: normalizedData.experiences.filter((e) => e.status === 'published'),
    services: normalizedData.services.filter((s) => s.status === 'published'),
    testimonials: normalizedData.testimonials.filter((t) => t.status === 'published'),
    socialLinks: normalizedData.socialLinks.filter((s) => s.isActive),
    contactChannels: (normalizedData.contactChannels || []).filter((c) => c.enabled),
  };
}

// ----------------------------------------------------
// SETTINGS
// ----------------------------------------------------
export async function updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const store = readLocalStore();
  store.settings = { ...store.settings, ...settings };
  writeLocalStore(store);

  const supabase = createServerClient();
  if (supabase && isServerSupabaseConfigured()) {
    try {
      await supabase.from('site_settings').upsert({
        site_title: store.settings.siteTitle,
        site_description: store.settings.siteDescription,
        designer_name: store.settings.designerName,
        designer_name_ar: store.settings.designerNameAr,
        hero_headline: store.settings.heroHeadline,
        hero_headline_ar: store.settings.heroHeadlineAr,
        rotating_roles: store.settings.rotatingRoles,
        rotating_roles_ar: store.settings.rotatingRolesAr,
        short_bio: store.settings.shortBio,
        short_bio_ar: store.settings.shortBioAr,
        long_bio: store.settings.longBio,
        long_bio_ar: store.settings.longBioAr,
        stats: store.settings.stats,
        contact_email: store.settings.contactEmail,
        whatsapp_number: store.settings.whatsappNumber,
        whatsapp_url: store.settings.whatsappUrl,
        linkedin_url: store.settings.linkedinUrl,
        cv_url: store.settings.cvUrl,
        privacy_terms_url: store.settings.privacyTermsUrl,
        custom_cursor_enabled: store.settings.customCursorEnabled,
        default_language: store.settings.defaultLanguage,
        seo_keywords: store.settings.seoKeywords,
        og_image_url: store.settings.ogImageUrl,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Supabase settings update error:', e);
    }
  }

  return store.settings;
}

// ----------------------------------------------------
// PROJECTS CRUD
// ----------------------------------------------------
export async function getProjects(includeDrafts = false): Promise<Project[]> {
  const data = await getSiteData(includeDrafts);
  return data.projects.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const data = await getSiteData(true);
  return data.projects.find((p) => p.slug === slug) || null;
}

export async function saveProject(project: Partial<Project> & { id?: string }): Promise<Project> {
  const store = readLocalStore();
  const now = new Date().toISOString();

  // Normalize incoming project
  const incoming = normalizeProject(project);

  // If new categories are in the project, ensure they are stored in store.categories
  if (incoming.categories && incoming.categories.length > 0) {
    const existingCats = store.categories || [...DEFAULT_CATEGORIES];
    let changed = false;
    incoming.categories.forEach((cat) => {
      const trimmed = cat.trim();
      if (trimmed && !existingCats.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        existingCats.push(trimmed);
        changed = true;
      }
    });
    if (changed || !store.categories) {
      store.categories = existingCats;
    }
  }

  let savedProject: Project;
  const existingIndex = store.projects.findIndex((p) => p.id === project.id);

  if (existingIndex >= 0) {
    savedProject = normalizeProject({
      ...store.projects[existingIndex],
      ...incoming,
      updatedAt: now,
    });
    store.projects[existingIndex] = savedProject;
  } else {
    savedProject = normalizeProject({
      id: project.id || `proj-${Date.now()}`,
      slug: project.slug || `project-${Date.now()}`,
      title: project.title || 'Untitled Project',
      titleAr: project.titleAr || '',
      category: incoming.category,
      categories: incoming.categories,
      description: project.description || '',
      descriptionAr: project.descriptionAr || '',
      client: incoming.client,
      clientName: incoming.client,
      projectDate: project.projectDate || new Date().getFullYear().toString(),
      coverImage: project.coverImage || '/images/projects/project-lumina-motion.jpg',
      gallery: incoming.gallery,
      images: incoming.gallery,
      videoUrl: incoming.videoUrl,
      videos: incoming.videos,
      youtubeUrl: project.youtubeUrl || '',
      vimeoUrl: project.vimeoUrl || '',
      googleDriveUrl: incoming.googleDriveMaterialsUrl,
      googleDriveMaterialsUrl: incoming.googleDriveMaterialsUrl,
      behanceUrl: project.behanceUrl || '',
      tools: incoming.tools,
      softwareUsed: incoming.tools,
      projectUrl: project.projectUrl || '',
      featured: Boolean(project.featured),
      tags: project.tags || [],
      sortOrder: project.sortOrder ?? store.projects.length + 1,
      status: project.status || 'published',
      width: project.width,
      height: project.height,
      aspectRatio: project.aspectRatio,
      orientation: project.orientation,
      createdAt: now,
      updatedAt: now,
    });
    store.projects.push(savedProject);
  }

  writeLocalStore(store);

  const supabase = createServerClient();
  if (supabase && isServerSupabaseConfigured()) {
    try {
      await supabase.from('projects').upsert({
        id: savedProject.id,
        slug: savedProject.slug,
        title: savedProject.title,
        title_ar: savedProject.titleAr,
        category: savedProject.category,
        categories: savedProject.categories,
        description: savedProject.description,
        description_ar: savedProject.descriptionAr,
        client: savedProject.client,
        project_date: savedProject.projectDate,
        cover_image: savedProject.coverImage,
        gallery: savedProject.gallery,
        video_url: savedProject.videoUrl,
        videos: savedProject.videos,
        youtube_url: savedProject.youtubeUrl,
        vimeo_url: savedProject.vimeoUrl,
        google_drive_url: savedProject.googleDriveUrl,
        google_drive_materials_url: savedProject.googleDriveMaterialsUrl,
        behance_url: savedProject.behanceUrl,
        tools: savedProject.tools,
        project_url: savedProject.projectUrl,
        featured: savedProject.featured,
        tags: savedProject.tags,
        sort_order: savedProject.sortOrder,
        status: savedProject.status,
        updated_at: now,
      });
    } catch (e) {
      console.error('Supabase project upsert error:', e);
    }
  }

  return savedProject;
}

// ----------------------------------------------------
// CATEGORIES
// ----------------------------------------------------
export async function getCategories(): Promise<string[]> {
  const data = await getSiteData(true);
  return data.categories || DEFAULT_CATEGORIES;
}

export async function saveCategory(category: string): Promise<string[]> {
  const store = readLocalStore();
  const current = store.categories || [...DEFAULT_CATEGORIES];
  const trimmed = category.trim();
  if (trimmed && !current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    current.push(trimmed);
    store.categories = current;
    writeLocalStore(store);
  }
  return store.categories || current;
}

export async function deleteCategory(category: string): Promise<string[]> {
  const store = readLocalStore();
  const current = store.categories || [...DEFAULT_CATEGORIES];
  const trimmed = category.trim();
  store.categories = current.filter((c) => c.toLowerCase() !== trimmed.toLowerCase());
  writeLocalStore(store);
  return store.categories;
}

export async function deleteProject(id: string): Promise<boolean> {
  const store = readLocalStore();
  store.projects = store.projects.filter((p) => p.id !== id);
  writeLocalStore(store);

  const supabase = createServerClient();
  if (supabase && isServerSupabaseConfigured()) {
    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase project delete error:', e);
    }
  }

  return true;
}

export async function reorderProjects(ids: string[]): Promise<void> {
  const store = readLocalStore();
  const idToOrder = new Map(ids.map((id, index) => [id, index + 1]));

  store.projects.forEach((p) => {
    if (idToOrder.has(p.id)) {
      p.sortOrder = idToOrder.get(p.id)!;
    }
  });

  store.projects.sort((a, b) => a.sortOrder - b.sortOrder);
  writeLocalStore(store);

  const supabase = createServerClient();
  if (supabase && isServerSupabaseConfigured()) {
    try {
      for (const [id, order] of idToOrder.entries()) {
        await supabase.from('projects').update({ sort_order: order }).eq('id', id);
      }
    } catch (e) {
      console.error('Supabase project reorder error:', e);
    }
  }
}

// ----------------------------------------------------
// EXPERIENCE CRUD
// ----------------------------------------------------
export async function saveExperience(exp: Partial<Experience> & { id?: string }): Promise<Experience> {
  const store = readLocalStore();
  let saved: Experience;
  const existingIdx = store.experiences.findIndex((e) => e.id === exp.id);

  if (existingIdx >= 0) {
    saved = { ...store.experiences[existingIdx], ...exp } as Experience;
    store.experiences[existingIdx] = saved;
  } else {
    saved = {
      id: exp.id || `exp-${Date.now()}`,
      title: exp.title || '',
      titleAr: exp.titleAr || '',
      company: exp.company || '',
      companyAr: exp.companyAr || '',
      startDate: exp.startDate || '2024-01-01',
      endDate: exp.endDate || '',
      isPresent: Boolean(exp.isPresent),
      description: exp.description || '',
      descriptionAr: exp.descriptionAr || '',
      sortOrder: exp.sortOrder ?? store.experiences.length + 1,
      status: exp.status || 'published',
    };
    store.experiences.push(saved);
  }

  writeLocalStore(store);

  const supabase = createServerClient();
  if (supabase && isServerSupabaseConfigured()) {
    try {
      await supabase.from('experiences').upsert({
        id: saved.id,
        title: saved.title,
        title_ar: saved.titleAr,
        company: saved.company,
        company_ar: saved.companyAr,
        start_date: saved.startDate,
        end_date: saved.isPresent ? null : saved.endDate,
        is_present: saved.isPresent,
        description: saved.description,
        description_ar: saved.descriptionAr,
        sort_order: saved.sortOrder,
        status: saved.status,
      });
    } catch (e) {
      console.error('Supabase experience upsert error:', e);
    }
  }

  return saved;
}

export async function deleteExperience(id: string): Promise<boolean> {
  const store = readLocalStore();
  store.experiences = store.experiences.filter((e) => e.id !== id);
  writeLocalStore(store);

  const supabase = createServerClient();
  if (supabase && isServerSupabaseConfigured()) {
    try {
      await supabase.from('experiences').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase experience delete error:', e);
    }
  }

  return true;
}

// ----------------------------------------------------
// SKILLS CRUD
// ----------------------------------------------------
export async function saveSkillGroup(group: Partial<SkillGroup> & { id?: string }): Promise<SkillGroup> {
  const store = readLocalStore();
  let saved: SkillGroup;
  const idx = store.skillGroups.findIndex((g) => g.id === group.id);

  if (idx >= 0) {
    saved = { ...store.skillGroups[idx], ...group } as SkillGroup;
    store.skillGroups[idx] = saved;
  } else {
    saved = {
      id: group.id || `group-${Date.now()}`,
      title: group.title || 'New Skill Group',
      titleAr: group.titleAr || 'مجموعة مهارات جديدة',
      sortOrder: group.sortOrder ?? store.skillGroups.length + 1,
      skills: group.skills || [],
    };
    store.skillGroups.push(saved);
  }

  writeLocalStore(store);
  return saved;
}

export async function deleteSkillGroup(id: string): Promise<boolean> {
  const store = readLocalStore();
  store.skillGroups = store.skillGroups.filter((g) => g.id !== id);
  writeLocalStore(store);
  return true;
}

// ----------------------------------------------------
// CONTACT CHANNELS CRUD
// ----------------------------------------------------
export async function getContactChannels(includeDisabled = false): Promise<ContactChannel[]> {
  const store = readLocalStore();
  const channels = store.contactChannels || [];
  if (includeDisabled) return channels;
  return channels.filter((c) => c.enabled);
}

export async function saveContactChannel(channel: Partial<ContactChannel> & { id?: string }): Promise<ContactChannel> {
  const store = readLocalStore();
  store.contactChannels = store.contactChannels || [];
  let saved: ContactChannel;
  const idx = store.contactChannels.findIndex((c) => c.id === channel.id);

  if (idx >= 0) {
    saved = { ...store.contactChannels[idx], ...channel } as ContactChannel;
    store.contactChannels[idx] = saved;
  } else {
    saved = {
      id: channel.id || `channel-${Date.now()}`,
      platform: channel.platform || 'custom',
      title: channel.title || 'New Channel',
      titleAr: channel.titleAr || '',
      subtitle: channel.subtitle || '',
      subtitleAr: channel.subtitleAr || '',
      icon: channel.icon || 'link',
      url: channel.url || '',
      enabled: channel.enabled ?? true,
      sortOrder: channel.sortOrder ?? store.contactChannels.length + 1,
    };
    store.contactChannels.push(saved);
  }

  writeLocalStore(store);
  return saved;
}

export async function deleteContactChannel(id: string): Promise<boolean> {
  const store = readLocalStore();
  store.contactChannels = (store.contactChannels || []).filter((c) => c.id !== id);
  writeLocalStore(store);
  return true;
}

// ----------------------------------------------------
// SERVICES CRUD
// ----------------------------------------------------
export async function saveService(service: Partial<ServiceItem> & { id?: string }): Promise<ServiceItem> {
  const store = readLocalStore();
  let saved: ServiceItem;
  const idx = store.services.findIndex((s) => s.id === service.id);

  if (idx >= 0) {
    saved = { ...store.services[idx], ...service } as ServiceItem;
    store.services[idx] = saved;
  } else {
    saved = {
      id: service.id || `srv-${Date.now()}`,
      title: service.title || '',
      titleAr: service.titleAr || '',
      category: service.category || 'Motion Graphics & Video Editing',
      description: service.description || '',
      descriptionAr: service.descriptionAr || '',
      sortOrder: service.sortOrder ?? store.services.length + 1,
      status: service.status || 'published',
    };
    store.services.push(saved);
  }

  writeLocalStore(store);
  return saved;
}

export async function deleteService(id: string): Promise<boolean> {
  const store = readLocalStore();
  store.services = store.services.filter((s) => s.id !== id);
  writeLocalStore(store);
  return true;
}

// ----------------------------------------------------
// TESTIMONIALS CRUD
// ----------------------------------------------------
export async function saveTestimonial(testimonial: Partial<Testimonial> & { id?: string }): Promise<Testimonial> {
  const store = readLocalStore();
  let saved: Testimonial;
  const idx = store.testimonials.findIndex((t) => t.id === testimonial.id);
  const screenshotUrl = testimonial.screenshotUrl || testimonial.imageUrl || testimonial.photoUrl || '';

  if (idx >= 0) {
    saved = {
      ...store.testimonials[idx],
      ...testimonial,
      screenshotUrl,
      imageUrl: screenshotUrl,
      photoUrl: screenshotUrl,
    } as Testimonial;
    store.testimonials[idx] = saved;
  } else {
    saved = {
      id: testimonial.id || `t-${Date.now()}`,
      screenshotUrl,
      imageUrl: screenshotUrl,
      photoUrl: screenshotUrl,
      clientName: testimonial.clientName || '',
      projectName: testimonial.projectName || '',
      feedbackType: testimonial.feedbackType || 'WhatsApp',
      caption: testimonial.caption || '',
      captionAr: testimonial.captionAr || '',
      date: testimonial.date || '',
      position: testimonial.position || '',
      company: testimonial.company || '',
      quote: testimonial.quote || '',
      quoteAr: testimonial.quoteAr || '',
      sortOrder: testimonial.sortOrder ?? store.testimonials.length + 1,
      status: testimonial.status || 'published',
      width: testimonial.width,
      height: testimonial.height,
      aspectRatio: testimonial.aspectRatio,
      orientation: testimonial.orientation,
    };
    store.testimonials.push(saved);
  }

  writeLocalStore(store);
  return saved;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const store = readLocalStore();
  store.testimonials = store.testimonials.filter((t) => t.id !== id);
  writeLocalStore(store);
  return true;
}

// ----------------------------------------------------
// SOCIAL LINKS CRUD
// ----------------------------------------------------
export async function saveSocialLink(link: Partial<SocialLink> & { id?: string }): Promise<SocialLink> {
  const store = readLocalStore();
  let saved: SocialLink;
  const idx = store.socialLinks.findIndex((s) => s.id === link.id);

  if (idx >= 0) {
    saved = { ...store.socialLinks[idx], ...link } as SocialLink;
    store.socialLinks[idx] = saved;
  } else {
    saved = {
      id: link.id || `soc-${Date.now()}`,
      platform: link.platform || 'Platform',
      url: link.url || '',
      icon: link.icon || 'Link',
      sortOrder: link.sortOrder ?? store.socialLinks.length + 1,
      isActive: link.isActive ?? true,
    };
    store.socialLinks.push(saved);
  }

  writeLocalStore(store);
  return saved;
}

export async function deleteSocialLink(id: string): Promise<boolean> {
  const store = readLocalStore();
  store.socialLinks = store.socialLinks.filter((s) => s.id !== id);
  writeLocalStore(store);
  return true;
}

// ----------------------------------------------------
// MEDIA LIBRARY
// ----------------------------------------------------
export async function saveMediaFile(file: Omit<MediaFile, 'id' | 'uploadedAt'>): Promise<MediaFile> {
  const store = readLocalStore();
  const saved: MediaFile = {
    ...file,
    id: `med-${Date.now()}`,
    uploadedAt: new Date().toISOString(),
  };

  store.media.unshift(saved);
  writeLocalStore(store);

  const supabase = createServerClient();
  if (supabase && isServerSupabaseConfigured()) {
    try {
      await supabase.from('media_files').insert({
        name: saved.name,
        url: saved.url,
        file_type: saved.type,
        size_bytes: saved.sizeBytes,
        uploaded_at: saved.uploadedAt,
      });
    } catch (e) {
      console.error('Supabase media insert error:', e);
    }
  }

  return saved;
}

export async function deleteMediaFile(id: string): Promise<boolean> {
  const store = readLocalStore();
  store.media = store.media.filter((m) => m.id !== id);
  writeLocalStore(store);

  const supabase = createServerClient();
  if (supabase && isServerSupabaseConfigured()) {
    try {
      await supabase.from('media_files').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase media delete error:', e);
    }
  }

  return true;
}

// ----------------------------------------------------
// PROJECT INQUIRIES
// ----------------------------------------------------
export async function saveInquiry(
  inquiry: Omit<ProjectInquiry, 'id' | 'createdAt' | 'status'> & {
    id?: string;
    status?: InquiryStatus;
    createdAt?: string;
  }
): Promise<ProjectInquiry> {
  // Ensure valid UUID format for PostgreSQL UUID primary key
  let generatedId = inquiry.id;
  if (!generatedId) {
    try {
      generatedId = crypto.randomUUID();
    } catch {
      generatedId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
  }

  const createdAt = inquiry.createdAt || new Date().toISOString();

  const saved: ProjectInquiry = {
    id: generatedId,
    name: inquiry.name,
    contactMethod: inquiry.contactMethod,
    email: inquiry.email || '',
    whatsapp: inquiry.whatsapp || '',
    services: inquiry.services || [],
    description: inquiry.description,
    budget: inquiry.budget || '',
    referenceLinks: inquiry.referenceLinks || [],
    referenceFiles: inquiry.referenceFiles || [],
    googleDriveUrl: inquiry.googleDriveUrl || '',
    status: inquiry.status || 'unread',
    createdAt: createdAt,
  };

  const supabase = createServerClient();
  let supabaseInserted = false;

  // 1. PRODUCTION: Supabase is PRIMARY and AUTHORITATIVE
  if (supabase && isServerSupabaseConfigured()) {
    try {
      // NOTE: Do NOT chain .select() on insert here.
      // Under Row Level Security (RLS), public users have permission to INSERT into project_inquiries,
      // but do NOT have permission to SELECT. Chaining .select() executes an INSERT ... RETURNING *
      // which triggers PostgreSQL SELECT RLS policy check and fails with permission denied!
      // By supplying the pre-generated UUID and omitting .select(), the insert succeeds cleanly.
      const { error } = await supabase
        .from('project_inquiries')
        .insert({
          id: saved.id,
          name: saved.name,
          contact_method: saved.contactMethod,
          email: saved.email || null,
          whatsapp: saved.whatsapp || null,
          services: saved.services,
          description: saved.description,
          budget: saved.budget || null,
          reference_links: saved.referenceLinks,
          reference_files: saved.referenceFiles,
          google_drive_url: saved.googleDriveUrl || null,
          status: saved.status,
          created_at: saved.createdAt,
        });

      if (error) {
        console.error('[saveInquiry] Supabase insert error:', error.message || error);
        throw new Error(`Database insert failed: ${error.message || 'Unknown database error'}`);
      }
      supabaseInserted = true;
    } catch (e: any) {
      console.error('[saveInquiry] Supabase insert exception:', e?.message || e);
      throw e;
    }
  }

  // 2. LOCAL DEVELOPMENT FALLBACK: Safe local store.json update
  // Local filesystem write errors NEVER abort a valid inquiry in production
  try {
    const store = readLocalStore();
    store.inquiries = store.inquiries || [];
    // Prevent duplicate entries
    if (!store.inquiries.some((i) => i.id === saved.id)) {
      store.inquiries.unshift(saved);
      writeLocalStore(store);
    }
  } catch (fsError: any) {
    if (!supabaseInserted && !isServerSupabaseConfigured()) {
      console.warn('[saveInquiry] Local store fallback write skipped:', fsError?.message || fsError);
    }
  }

  return saved;
}

export async function getInquiries(): Promise<ProjectInquiry[]> {
  const supabase = createServerClient();
  if (supabase && isServerSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('project_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[getInquiries] Supabase select error:', error.message || error);
        // In production/serverless, do NOT fall back to stale store.json if Supabase returned an error
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          return [];
        }
      } else if (data) {
        return data.map((inq: any) => ({
          id: inq.id,
          name: inq.name,
          contactMethod: inq.contact_method || 'Email',
          email: inq.email || '',
          whatsapp: inq.whatsapp || '',
          services: Array.isArray(inq.services) ? inq.services : [],
          description: inq.description || '',
          budget: inq.budget || '',
          referenceLinks: Array.isArray(inq.reference_links) ? inq.reference_links : [],
          referenceFiles: Array.isArray(inq.reference_files) ? inq.reference_files : [],
          googleDriveUrl: inq.google_drive_url || '',
          status: inq.status || 'unread',
          createdAt: inq.created_at || new Date().toISOString(),
        }));
      }
    } catch (e: any) {
      console.error('[getInquiries] Supabase select exception:', e?.message || e);
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        return [];
      }
    }
  }

  // Local development fallback
  const store = readLocalStore();
  return store.inquiries || [];
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<boolean> {
  const supabase = createServerClient();
  if (supabase && isServerSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('project_inquiries')
        .update({ status })
        .eq('id', id);
      if (error) {
        console.error('[updateInquiryStatus] Supabase error:', error.message || error);
      }
    } catch (e: any) {
      console.warn('Supabase update inquiry status error:', e?.message || e);
    }
  }

  try {
    const store = readLocalStore();
    store.inquiries = store.inquiries || [];
    const inq = store.inquiries.find((i) => i.id === id);
    if (inq) {
      inq.status = status;
      writeLocalStore(store);
    }
  } catch (fsError: any) {
    // Non-fatal on serverless read-only filesystem
  }

  return true;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const supabase = createServerClient();
  if (supabase && isServerSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('project_inquiries')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('[deleteInquiry] Supabase error:', error.message || error);
      }
    } catch (e: any) {
      console.warn('Supabase delete inquiry error:', e?.message || e);
    }
  }

  try {
    const store = readLocalStore();
    store.inquiries = store.inquiries || [];
    store.inquiries = store.inquiries.filter((i) => i.id !== id);
    writeLocalStore(store);
  } catch (fsError: any) {
    // Non-fatal on serverless read-only filesystem
  }

  return true;
}

