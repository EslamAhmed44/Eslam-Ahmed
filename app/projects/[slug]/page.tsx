import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjects } from '@/lib/db/client';
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Layers,
  Play,
  User,
  Video,
} from 'lucide-react';
import { AdaptiveMediaFrame } from '@/components/projects/AdaptiveMediaFrame';
import { SoftwareIcon } from '@/components/ui/SoftwareIcon';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const projects = await getProjects(true);
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: 'Project Not Found' };
  }

  return {
    title: `${project.title} — Islam Ahmed`,
    description: project.description,
    openGraph: {
      images: [project.coverImage],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#07090D] text-[#F0F3F6] pt-12 pb-32">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-[#F59E0B]/08 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Navigation Back */}
        <div className="mb-10">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10141C] border border-[#F0F3F6]/10 text-sm font-medium text-[#94A3B8] hover:text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>
        </div>

        {/* Category & Title Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {(project.categories && project.categories.length > 0 ? project.categories : [project.category]).map(
              (cat, i) => (
                <span
                  key={i}
                  className="px-4 py-1.5 rounded-full bg-[#151A23] border border-[#F59E0B]/30 text-xs font-mono font-semibold text-[#F59E0B] uppercase tracking-wider"
                >
                  {cat}
                </span>
              )
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#F0F3F6] mb-6">
            {project.title}
          </h1>
          <p className="text-lg sm:text-xl text-[#94A3B8] font-light max-w-4xl leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Hero Media Visual / Reel — Auto-Adaptive Frame Preserving 100% of Artwork */}
        <AdaptiveMediaFrame
          coverImage={project.coverImage}
          videoUrl={project.videoUrl}
          title={project.title}
          initialWidth={project.width}
          initialHeight={project.height}
          initialAspectRatio={project.aspectRatio}
          initialOrientation={project.orientation}
          priority
          className="mb-16"
        />

        {/* Google Drive Materials Banner (Prominent Dedicated Access to All Source Files) */}
        {(project.googleDriveMaterialsUrl || project.googleDriveUrl) && (
          <div className="mb-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#10141C] via-[#151A23] to-[#10141C] border border-[#F59E0B]/30 shadow-[0_0_30px_rgba(245,158,11,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
                <span>Project Materials & Assets</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#F0F3F6]">
                Google Drive Project Materials
              </h3>
              <p className="text-sm text-[#94A3B8] max-w-2xl font-light">
                Access full high-resolution exports, source project files, brand assets, and production deliverables.
              </p>
            </div>

            <a
              href={project.googleDriveMaterialsUrl || project.googleDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-sm shadow-[0_0_24px_rgba(245,158,11,0.35)] hover:scale-105 hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all whitespace-nowrap self-start sm:self-center"
            >
              <span>View Project Materials</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Project Meta Information Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/10 mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase mb-1">
              <User className="w-3.5 h-3.5" />
              <span>Client</span>
            </div>
            <div className="text-base font-semibold text-[#F0F3F6]">
              {project.client || 'Creative Initiative'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Year</span>
            </div>
            <div className="text-base font-semibold text-[#F0F3F6]">{project.projectDate}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Disciplines</span>
            </div>
            <div className="text-base font-semibold text-[#F0F3F6] truncate">
              {project.categories && project.categories.length > 0
                ? project.categories.join(' • ')
                : project.category}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase mb-1">
              <Video className="w-3.5 h-3.5" />
              <span>Type</span>
            </div>
            <div className="text-base font-semibold text-[#F0F3F6]">
              {(project.videos && project.videos.length > 0) && (project.gallery && project.gallery.length > 0)
                ? 'Mixed Media Campaign'
                : (project.videos && project.videos.length > 0) || project.videoUrl
                ? 'Motion & Video Reel'
                : 'Key Visuals & Stills'}
            </div>
          </div>
        </div>

        {/* Tools and External Presentation Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20 items-start">
          {/* Software Used */}
          <div className="md:col-span-6 p-8 rounded-3xl bg-[#151A23]/60 border border-[#F0F3F6]/08">
            <h3 className="text-sm font-mono text-[#94A3B8] uppercase tracking-wider mb-4">
              Software Used & Skills
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {project.tools.map((tool, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-sm font-medium text-[#F0F3F6] hover:border-[#F59E0B]/40 transition-colors shadow-sm"
                >
                  <SoftwareIcon name={tool} className="w-4 h-4" />
                  <span>{tool}</span>
                </span>
              ))}
            </div>
          </div>

          {/* External Links */}
          <div className="md:col-span-6 p-8 rounded-3xl bg-[#151A23]/60 border border-[#F0F3F6]/08">
            <h3 className="text-sm font-mono text-[#94A3B8] uppercase tracking-wider mb-4">
              External Case Studies & Media
            </h3>
            <div className="flex flex-wrap gap-3">
              {project.behanceUrl && (
                <a
                  href={project.behanceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10141C] border border-[#F0F3F6]/15 text-sm font-semibold text-[#F0F3F6] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors"
                >
                  <span>Behance Presentation</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
              {project.vimeoUrl && (
                <a
                  href={project.vimeoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10141C] border border-[#F0F3F6]/15 text-sm font-semibold text-[#F0F3F6] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors"
                >
                  <span>Vimeo Showcase</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
              {project.youtubeUrl && (
                <a
                  href={project.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10141C] border border-[#F0F3F6]/15 text-sm font-semibold text-[#F0F3F6] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors"
                >
                  <span>YouTube Video</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
              {(project.googleDriveMaterialsUrl || project.googleDriveUrl) && (
                <a
                  href={project.googleDriveMaterialsUrl || project.googleDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10141C] border border-[#F59E0B]/40 text-sm font-semibold text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#07090D] transition-colors"
                >
                  <span>Google Drive Materials</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-sm font-semibold text-[#07090D] shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all"
                >
                  <span>Live Project</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Videos Showcase (Multiple Videos Support) */}
        {project.videos && project.videos.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F0F3F6]">
                  Campaign Videos & Motion Reels
                </h3>
                <p className="text-sm text-[#94A3B8] mt-1 font-light">
                  {project.videos.length} dynamic motion video{project.videos.length > 1 ? 's' : ''} in this project
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.videos.map((vid, idx) => {
                const isYouTube = vid.url.includes('youtube.com') || vid.url.includes('youtu.be');
                const isVimeo = vid.url.includes('vimeo.com');

                let embedSrc = vid.url;
                if (isYouTube) {
                  const match = vid.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                  if (match && match[1]) embedSrc = `https://www.youtube.com/embed/${match[1]}`;
                } else if (isVimeo) {
                  const match = vid.url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
                  if (match && match[1]) embedSrc = `https://player.vimeo.com/video/${match[1]}`;
                }

                return (
                  <div
                    key={vid.id || idx}
                    className="p-5 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/10 flex flex-col gap-4 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#F0F3F6] truncate">
                        {vid.title || `Motion Video ${idx + 1}`}
                      </span>
                      <span className="text-[11px] font-mono text-[#F59E0B] px-2.5 py-0.5 rounded-full bg-[#151A23]">
                        {isYouTube ? 'YouTube' : isVimeo ? 'Vimeo' : 'Direct MP4'}
                      </span>
                    </div>

                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#07090D] border border-[#F0F3F6]/10">
                      {isYouTube || isVimeo ? (
                        <iframe
                          src={embedSrc}
                          title={vid.title || `Video ${idx + 1}`}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={vid.url}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain rounded-2xl"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Gallery Stills (Multiple Images Support) */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F0F3F6]">
                  Key Visuals & Campaign Stills
                </h3>
                <p className="text-sm text-[#94A3B8] mt-1 font-light">
                  {project.gallery.length} visual asset{project.gallery.length > 1 ? 's' : ''} in this project gallery
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-3xl overflow-hidden bg-[#10141C] border border-[#F0F3F6]/10 shadow-xl transition-all duration-300 hover:border-[#F59E0B]/50"
                >
                  <div className="relative aspect-video sm:aspect-[16/10] overflow-hidden">
                    <Image
                      src={imgUrl}
                      alt={`${project.title} - still ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-4 bg-[#10141C] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#94A3B8]">
                      Still #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <a
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#F59E0B] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Full Resolution</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA to Discuss Project */}
        <div className="p-10 rounded-3xl bg-gradient-to-r from-[#10141C] to-[#151A23] border border-[#F0F3F6]/10 text-center flex flex-col items-center">
          <h3 className="text-3xl font-bold text-[#F0F3F6] mb-3">
            Interested in a similar motion or branding project?
          </h3>
          <p className="text-[#94A3B8] mb-8 max-w-xl">
            Let’s craft a bespoke kinetic narrative tailored to your brand’s commercial goals.
          </p>
          <a
            href="https://wa.me/201092463750"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 transition-all"
          >
            Direct WhatsApp Discussion
          </a>
        </div>
      </div>
    </main>
  );
}
