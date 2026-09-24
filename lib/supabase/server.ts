import { createClient } from '@supabase/supabase-js';

export const isServerSupabaseConfigured = (): boolean => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return Boolean(
    supabaseUrl &&
    supabaseServiceKey &&
    !supabaseUrl.includes('your-supabase-url') &&
    supabaseUrl.startsWith('https://')
  );
};

export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!isServerSupabaseConfigured()) {
    return null;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
    console.warn(
      '[Supabase Server] WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined in production. Admin SELECT/UPDATE/DELETE queries on RLS tables will be evaluated under the anon role.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
