'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  User,
  Briefcase,
  Layers,
  Wand2,
  FolderKanban,
  MessageSquareQuote,
  Image as ImageIcon,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, render plain without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/hero', label: 'Hero Content', icon: Sparkles },
    { href: '/admin/about', label: 'About & Stats', icon: User },
    { href: '/admin/projects', label: 'Projects Manager', icon: FolderKanban },
    { href: '/admin/experience', label: 'Experience Timeline', icon: Briefcase },
    { href: '/admin/skills', label: 'Skills & Stack', icon: Layers },
    { href: '/admin/services', label: 'Services', icon: Wand2 },
    { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
    { href: '/admin/settings', label: 'Site Settings & SEO', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-[#F0F3F6] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#10141C] border-e border-[#F0F3F6]/08 p-6 fixed inset-y-0 z-30 justify-between">
        <div>
          {/* Brand Mark */}
          <div className="flex items-center gap-3 px-3 py-4 mb-8 border-b border-[#F0F3F6]/08">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#151A23] border border-[#F0F3F6]/15 text-sm font-bold text-[#F59E0B]">
              IA.
            </span>
            <div>
              <div className="text-sm font-bold text-[#F0F3F6]">CMS Dashboard</div>
              <div className="text-[11px] font-mono text-[#94A3B8]">Islam Ahmed</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5" aria-label="Admin Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'text-[#94A3B8] hover:text-[#F0F3F6] hover:bg-[#151A23]'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-[#F0F3F6]/08 flex flex-col gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#F59E0B]" />
              <span>Live Website</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-start"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ms-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-[#07090D]/85 backdrop-blur-xl border-b border-[#F0F3F6]/08 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#151A23] border border-[#F0F3F6]/10 text-[#F0F3F6]"
              aria-label="Toggle mobile admin menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Content Management Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#151A23] border border-[#F0F3F6]/10 text-xs font-semibold text-[#F0F3F6] hover:border-[#F59E0B]/50 transition-colors"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3 h-3 text-[#F59E0B]" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-[#07090D]/95 backdrop-blur-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-[#F59E0B]">IA. CMS</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl bg-[#151A23] text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D]'
                      : 'text-[#94A3B8] hover:bg-[#151A23]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
