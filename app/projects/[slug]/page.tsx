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
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#151A23] border border-[#F59E0B]/30 text-xs font-mono font-semibold text-[#F59E0B] uppercase tracking-wider mb-4">
            {project.category}
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
              <span>Discipline</span>
            </div>
            <div className="text-base font-semibold text-[#F0F3F6]">{project.category}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase mb-1">
              <Video className="w-3.5 h-3.5" />
              <span>Type</span>
            </div>
            <div className="text-base font-semibold text-[#F0F3F6]">
              {project.videoUrl ? 'Motion Reel' : 'Key Visuals'}
            </div>
          </div>
        </div>

        {/* Tools and External Presentation Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 items-start">
          {/* Software Used */}
          <div className="md:col-span-6 p-8 rounded-3xl bg-[#151A23]/60 border border-[#F0F3F6]/08">
            <h3 className="text-sm font-mono text-[#94A3B8] uppercase tracking-wider mb-4">
              Software & Workflow Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-sm font-medium text-[#F0F3F6]"
                >
                  {tool}
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
              {project.googleDriveUrl && (
                <a
                  href={project.googleDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#10141C] border border-[#F0F3F6]/15 text-sm font-semibold text-[#F0F3F6] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors"
                >
                  <span>Drive Assets</span>
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

        {/* Gallery Stills */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="mb-20">
            <h3 className="text-2xl font-bold tracking-tight text-[#F0F3F6] mb-8">
              Key Visuals & Stills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-3xl overflow-hidden bg-[#10141C] border border-[#F0F3F6]/10"
                >
                  <Image
                    src={imgUrl}
                    alt={`${project.title} - still ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
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
