'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, ArrowRight, AlertCircle, MessageSquare, LayoutDashboard } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin';
  const isMessagePortal = redirectTarget.includes('messages');

  const [username, setUsername] = useState('EslamAhmed44');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Authentication failed. Please verify credentials.');
        setPassword('');
      } else {
        window.location.href = redirectTarget;
      }
    } catch (err: any) {
      setError(err?.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/15 mb-4 shadow-xl">
          <span className="text-xl font-bold tracking-tight text-[#F59E0B]">IA.</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0F3F6] tracking-tight flex items-center justify-center gap-2">
          {isMessagePortal ? (
            <>
              <MessageSquare className="w-6 h-6 text-[#F59E0B]" />
              <span>Message Admin Portal</span>
            </>
          ) : (
            <>
              <LayoutDashboard className="w-6 h-6 text-[#F59E0B]" />
              <span>Admin CMS Portal</span>
            </>
          )}
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1.5">
          {isMessagePortal
            ? 'Access Client Messages & Project Inquiries'
            : 'Islam Ahmed — Graphic & Motion Graphic Designer'}
        </p>
      </div>

      {/* Login Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#10141C]/90 backdrop-blur-2xl border border-[#F0F3F6]/10 shadow-[0_24px_50px_rgba(0,0,0,0.8)]">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
              Admin Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full ps-11 pe-4 py-3.5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B] transition-colors"
                placeholder="EslamAhmed44"
              />
              <User className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
              Secure Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full ps-11 pe-4 py-3.5 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 text-sm text-[#F0F3F6] focus:outline-none focus:border-[#F59E0B] transition-colors"
                placeholder="••••••••••••"
              />
              <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-4 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_24px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#F0F3F6]/05 text-center">
          <a
            href="/"
            className="text-xs text-[#94A3B8]/60 hover:text-[#F0F3F6] transition-colors font-mono"
          >
            ← Return to Live Website
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#07090D] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F59E0B]/10 rounded-full blur-[140px] pointer-events-none" />

      <Suspense fallback={<div className="text-xs text-[#94A3B8]">Loading authentication portal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
