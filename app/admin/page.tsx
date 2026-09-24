import React from 'react';
import Link from 'next/link';
import { getSiteData } from '@/lib/db/client';
import { isServerSupabaseConfigured } from '@/lib/supabase/server';
import {
  FolderKanban,
  Briefcase,
  Layers,
  Wand2,
  MessageSquareQuote,
  Image as ImageIcon,
  Plus,
  ArrowUpRight,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const data = await getSiteData(true);
  const isSupabaseActive = isServerSupabaseConfigured();

  const metrics = [
    {
      title: 'Projects',
      count: data.projects.length,
      published: data.projects.filter((p) => p.status === 'published').length,
      href: '/admin/projects',
      icon: FolderKanban,
    },
    {
      title: 'Experience Timeline',
      count: data.experiences.length,
      published: data.experiences.filter((e) => e.status === 'published').length,
      href: '/admin/experience',
      icon: Briefcase,
    },
    {
      title: 'Skill Groups',
      count: data.skillGroups.length,
      published: data.skillGroups.reduce((acc, g) => acc + g.skills.length, 0),
      href: '/admin/skills',
      icon: Layers,
    },
    {
      title: 'Services',
      count: data.services.length,
      published: data.services.filter((s) => s.status === 'published').length,
      href: '/admin/services',
      icon: Wand2,
    },
    {
      title: 'Client Feedback',
      count: data.testimonials.length,
      published: data.testimonials.filter((t) => t.status === 'published').length,
      href: '/admin/testimonials',
      icon: MessageSquareQuote,
    },
    {
      title: 'Media Assets',
      count: data.media.length,
      published: data.media.length,
      href: '/admin/media',
      icon: ImageIcon,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#10141C] via-[#151A23] to-[#10141C] border border-[#F0F3F6]/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F0F3F6]">
              Welcome back, Islam
            </h1>

            {/* Database Engine Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#07090D] border border-[#F0F3F6]/10 text-xs font-mono">
              <Database className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[#94A3B8]">Backend:</span>
              <span className="text-[#F59E0B] font-semibold">
                {isSupabaseActive ? 'Supabase PostgreSQL' : 'Local File Store (Active)'}
              </span>
            </div>
          </div>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl font-light">
            Manage your personal motion graphics portfolio, projects, hero narrative, services, and media assets in real time. Changes take effect on the live website immediately.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Link
              key={idx}
              href={m.href}
              className="p-6 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 hover:border-[#F59E0B]/40 hover:bg-[#151A23] transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 flex items-center justify-center text-[#F59E0B] group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>

              <div>
                <div className="text-3xl font-extrabold text-[#F0F3F6] mb-1">
                  {m.count}
                </div>
                <div className="text-sm font-semibold text-[#94A3B8] group-hover:text-[#F0F3F6] transition-colors">
                  {m.title}
                </div>
                <div className="text-xs font-mono text-[#94A3B8]/60 mt-2">
                  {m.published} active / published
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Launch & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Projects */}
        <div className="lg:col-span-8 p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#F0F3F6]">Recent Projects</h2>
            <Link
              href="/admin/projects"
              className="text-xs font-semibold text-[#F59E0B] hover:underline"
            >
              Manage All ({data.projects.length})
            </Link>
          </div>

          <div className="space-y-3">
            {data.projects.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#151A23]/60 border border-[#F0F3F6]/05 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#F0F3F6]">{p.title}</h3>
                  <p className="text-xs text-[#94A3B8]">{p.category} • {p.client || 'Creative'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold ${
                      p.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {p.status}
                  </span>
                  <Link
                    href={`/projects/${p.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-[#10141C] text-[#94A3B8] hover:text-[#F0F3F6]"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 p-8 rounded-3xl bg-[#10141C] border border-[#F0F3F6]/08 space-y-4">
          <h2 className="text-xl font-bold text-[#F0F3F6] mb-4">Quick Actions</h2>

          <Link
            href="/admin/projects"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 hover:text-[#F59E0B] flex items-center justify-between transition-colors"
          >
            <span>+ Add New Project</span>
            <Plus className="w-4 h-4" />
          </Link>

          <Link
            href="/admin/media"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 hover:text-[#F59E0B] flex items-center justify-between transition-colors"
          >
            <span>Upload Media / Video</span>
            <ImageIcon className="w-4 h-4" />
          </Link>

          <Link
            href="/admin/hero"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 hover:text-[#F59E0B] flex items-center justify-between transition-colors"
          >
            <span>Update Hero Titles</span>
            <Sparkles className="w-4 h-4" />
          </Link>

          <Link
            href="/admin/settings"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 hover:text-[#F59E0B] flex items-center justify-between transition-colors"
          >
            <span>SEO & CV Settings</span>
            <CheckCircle2 className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
