import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createServerClient, isServerSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit. Please upload a smaller file or share a Google Drive link.' },
        { status: 400 }
      );
    }

    // Check extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPG, PNG, WEBP, and PDF files are supported.' },
        { status: 400 }
      );
    }

    // Check MIME type
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WEBP, and PDF files are supported.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFilename = `inq-${Date.now()}-${safeBaseName}${ext}`;

    let publicUrl = `/uploads/${uniqueFilename}`;
    let uploadedToCloud = false;

    // 1. PRODUCTION: Upload directly to Supabase Storage in portfolio-media bucket
    const supabase = createServerClient();
    if (supabase && isServerSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.storage
          .from('portfolio-media')
          .upload(`inquiries/${uniqueFilename}`, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true,
          });

        if (error) {
          console.error('Supabase storage upload error:', error.message || error);
        } else if (data) {
          const { data: publicData } = supabase.storage
            .from('portfolio-media')
            .getPublicUrl(`inquiries/${uniqueFilename}`);
          if (publicData?.publicUrl) {
            publicUrl = publicData.publicUrl;
            uploadedToCloud = true;
          }
        }
      } catch (e: any) {
        console.error('Supabase storage upload exception:', e?.message || e);
      }
    }

    // 2. LOCALHOST / FALLBACK: Save locally only if filesystem is writable (development)
    // Never attempt local disk write if running on read-only serverless filesystem (Vercel)
    if (!uploadedToCloud || !process.env.VERCEL) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const localFilePath = path.join(uploadsDir, uniqueFilename);
        fs.writeFileSync(localFilePath, buffer);
      } catch (fsError: any) {
        if (fsError?.code === 'EROFS' || fsError?.message?.includes('read-only')) {
          console.warn('[Upload] Skipped local disk backup on read-only serverless filesystem.');
        } else if (!uploadedToCloud) {
          console.warn('Local file write error:', fsError?.message || fsError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: file.name,
      sizeBytes: file.size,
    });
  } catch (error: any) {
    console.error('Reference file upload error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again or provide a link.' },
      { status: 500 }
    );
  }
}
