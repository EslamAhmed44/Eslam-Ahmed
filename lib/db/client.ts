import fs from 'fs';
import path from 'path';
import {
  AppData,
  Experience,
  MediaFile,
  Project,
  ServiceItem,
  SiteSettings,
  SkillGroup,
  SocialLink,
  Testimonial,
} from '@/lib/types';
import { createServerClient, isServerSupabaseConfigured } from '@/lib/supabase/server';

const storeFilePath = path.join(process.cwd(), 'lib', 'db', 'store.json');

// Read JSON store safely
export function readLocalStore(): AppData {
  try {
    if (!fs.existsSync(storeFilePath)) {
      throw new Error(`Store file not found at ${storeFilePath}`);
    }
    const raw = fs.readFileSync(storeFilePath, 'utf-8');
    return JSON.parse(raw) as AppData;
  } catch (error) {
    console.error('Failed to read local store:', error);
    throw error;
  }
}

// Write JSON store safely
export function writeLocalStore(data: AppData): void {
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write local store:', error);
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
            customCursorEnabled: settingsData.custom_cursor_enabled ?? true,
            defaultLanguage: settingsData.default_language || 'en',
            seoKeywords: settingsData.seo_keywords || '',
            ogImageUrl: settingsData.og_image_url || '',
          },
          projects: (projectsData || []).map((p: any) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            titleAr: p.title_ar,
            category: p.category,
            description: p.description,
            descriptionAr: p.description_ar,
            client: p.client || '',
            projectDate: p.project_date || '',
            coverImage: p.cover_image,
            gallery: p.gallery || [],
            videoUrl: p.video_url || '',
            youtubeUrl: p.youtube_url || '',
            vimeoUrl: p.vimeo_url || '',
            googleDriveUrl: p.google_drive_url || '',
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
          })),
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
          testimonials: (testimonialsData || []).map((t: any) => ({
            id: t.id,
            clientName: t.client_name,
            position: t.position,
            company: t.company,
            photoUrl: t.photo_url || '',
            quote: t.quote,
            quoteAr: t.quote_ar,
            sortOrder: t.sort_order || 0,
            status: t.status || 'published',
          })),
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
        };

        if (!includeDrafts) {
          appData.projects = appData.projects.filter((p) => p.status === 'published');
          appData.experiences = appData.experiences.filter((e) => e.status === 'published');
          appData.services = appData.services.filter((s) => s.status === 'published');
          appData.testimonials = appData.testimonials.filter((t) => t.status === 'published');
          appData.socialLinks = appData.socialLinks.filter((s) => s.isActive);
        }

        return appData;
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local store:', err);
    }
  }

  // Fallback to local store
  const data = readLocalStore();
  if (includeDrafts) {
    return data;
  }

  return {
    ...data,
    projects: data.projects.filter((p) => p.status === 'published'),
    experiences: data.experiences.filter((e) => e.status === 'published'),
    services: data.services.filter((s) => s.status === 'published'),
    testimonials: data.testimonials.filter((t) => t.status === 'published'),
    socialLinks: data.socialLinks.filter((s) => s.isActive),
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

  let savedProject: Project;
  const existingIndex = store.projects.findIndex((p) => p.id === project.id);

  if (existingIndex >= 0) {
    savedProject = {
      ...store.projects[existingIndex],
      ...project,
      updatedAt: now,
    } as Project;
    store.projects[existingIndex] = savedProject;
  } else {
    savedProject = {
      id: project.id || `proj-${Date.now()}`,
      slug: project.slug || `project-${Date.now()}`,
      title: project.title || 'Untitled Project',
      titleAr: project.titleAr || '',
      category: project.category || 'Motion Graphics',
      description: project.description || '',
      descriptionAr: project.descriptionAr || '',
      client: project.client || '',
      projectDate: project.projectDate || new Date().getFullYear().toString(),
      coverImage: project.coverImage || '/images/projects/project-lumina-motion.jpg',
      gallery: project.gallery || [],
      videoUrl: project.videoUrl || '',
      youtubeUrl: project.youtubeUrl || '',
      vimeoUrl: project.vimeoUrl || '',
      googleDriveUrl: project.googleDriveUrl || '',
      behanceUrl: project.behanceUrl || '',
      tools: project.tools || [],
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
    };
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
        description: savedProject.description,
        description_ar: savedProject.descriptionAr,
        client: savedProject.client,
        project_date: savedProject.projectDate,
        cover_image: savedProject.coverImage,
        gallery: savedProject.gallery,
        video_url: savedProject.videoUrl,
        youtube_url: savedProject.youtubeUrl,
        vimeo_url: savedProject.vimeoUrl,
        google_drive_url: savedProject.googleDriveUrl,
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

  if (idx >= 0) {
    saved = { ...store.testimonials[idx], ...testimonial } as Testimonial;
    store.testimonials[idx] = saved;
  } else {
    saved = {
      id: testimonial.id || `t-${Date.now()}`,
      clientName: testimonial.clientName || '',
      position: testimonial.position || '',
      company: testimonial.company || '',
      photoUrl: testimonial.photoUrl || '',
      quote: testimonial.quote || '',
      quoteAr: testimonial.quoteAr || '',
      sortOrder: testimonial.sortOrder ?? store.testimonials.length + 1,
      status: testimonial.status || 'published',
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
