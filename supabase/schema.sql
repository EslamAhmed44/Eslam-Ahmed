-- ========================================================
-- ISLAM AHMED PORTFOLIO — SUPABASE POSTGRESQL SCHEMA
-- Complete schema with RLS, Storage policies & Initial Seed
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Site Settings (Singleton table)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_title TEXT NOT NULL,
    site_description TEXT NOT NULL,
    designer_name TEXT NOT NULL,
    designer_name_ar TEXT NOT NULL,
    hero_headline TEXT NOT NULL,
    hero_headline_ar TEXT NOT NULL,
    rotating_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
    rotating_roles_ar JSONB NOT NULL DEFAULT '[]'::jsonb,
    short_bio TEXT NOT NULL,
    short_bio_ar TEXT NOT NULL,
    long_bio TEXT NOT NULL,
    long_bio_ar TEXT NOT NULL,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    contact_email TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    whatsapp_url TEXT NOT NULL,
    linkedin_url TEXT NOT NULL,
    cv_url TEXT NOT NULL,
    custom_cursor_enabled BOOLEAN DEFAULT true,
    default_language TEXT DEFAULT 'en',
    seo_keywords TEXT,
    og_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_ar TEXT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    description_ar TEXT,
    client TEXT,
    project_date TEXT,
    cover_image TEXT NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    youtube_url TEXT,
    vimeo_url TEXT,
    google_drive_url TEXT,
    behance_url TEXT,
    tools JSONB DEFAULT '[]'::jsonb,
    project_url TEXT,
    featured BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]'::jsonb,
    sort_order INT DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Experiences Table
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    title_ar TEXT,
    company TEXT NOT NULL,
    company_ar TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_present BOOLEAN DEFAULT false,
    description TEXT NOT NULL,
    description_ar TEXT,
    sort_order INT DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Skill Groups & Skills
CREATE TABLE IF NOT EXISTS public.skill_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.skill_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INT DEFAULT 100,
    sort_order INT DEFAULT 0
);

-- 5. Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'hidden'))
);

-- 6. Testimonials Table (Client Feedback Screenshots)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screenshot_url TEXT,
    photo_url TEXT,
    client_name TEXT DEFAULT '',
    project_name TEXT DEFAULT '',
    feedback_type TEXT DEFAULT 'WhatsApp',
    caption TEXT DEFAULT '',
    caption_ar TEXT DEFAULT '',
    date TEXT DEFAULT '',
    position TEXT DEFAULT '',
    company TEXT DEFAULT '',
    quote TEXT DEFAULT '',
    quote_ar TEXT DEFAULT '',
    sort_order INT DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'hidden')),
    width INT,
    height INT,
    aspect_ratio NUMERIC(6,4),
    orientation TEXT DEFAULT 'portrait'
);

-- 7. Social Links Table
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- 8. Media Files Table
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size_bytes BIGINT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Public can read published items
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published experiences" ON public.experiences FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view skill groups" ON public.skill_groups FOR SELECT USING (true);
CREATE POLICY "Public can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public can view published services" ON public.services FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published testimonials" ON public.testimonials FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view active social links" ON public.social_links FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view media" ON public.media_files FOR SELECT USING (true);

-- Authenticated admin has full access
CREATE POLICY "Admin full access site_settings" ON public.site_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access projects" ON public.projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access experiences" ON public.experiences FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access skill_groups" ON public.skill_groups FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access skills" ON public.skills FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access services" ON public.services FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access testimonials" ON public.testimonials FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access social_links" ON public.social_links FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access media_files" ON public.media_files FOR ALL TO authenticated USING (true);

-- ========================================================
-- STORAGE BUCKET CONFIGURATION
-- ========================================================
-- Insert storage bucket for media if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access to bucket
CREATE POLICY "Public Read Portfolio Media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'portfolio-media');

-- Authenticated Admin write access to bucket
CREATE POLICY "Admin Upload Portfolio Media" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'portfolio-media');

CREATE POLICY "Admin Update Portfolio Media" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admin Delete Portfolio Media" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'portfolio-media');
