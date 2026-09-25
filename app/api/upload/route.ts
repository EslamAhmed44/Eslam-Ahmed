import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { saveMediaFile } from '@/lib/db/client';
import { createServerClient, isServerSupabaseConfigured } from '@/lib/supabase/server';
import { checkAdminSession } from '@/lib/auth/session';
import { detectImageDimensionsFromBuffer } from '@/lib/media/dimensions';

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `${Date.now()}-${safeName}`;

    // Determine type
    let fileType: 'image' | 'video' | 'pdf' | 'other' = 'other';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type === 'application/pdf' || safeName.endsWith('.pdf')) fileType = 'pdf';

    let publicUrl = `/uploads/${uniqueFilename}`;

    // Check if Supabase storage is active
    const supabase = createServerClient();
    if (supabase && isServerSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.storage
          .from('portfolio-media')
          .upload(uniqueFilename, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from('portfolio-media')
            .getPublicUrl(uniqueFilename);
          if (publicData?.publicUrl) {
            publicUrl = publicData.publicUrl;
          }
        }
      } catch (e) {
        console.warn('Supabase storage upload failed, saving locally:', e);
      }
    }

    // Ensure local copy in public/uploads for fallback reliability when filesystem is writable
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, uniqueFilename);
      fs.writeFileSync(localFilePath, buffer);
    } catch (fsErr: any) {
      console.warn('[Upload] Local filesystem write bypassed (read-only environment):', fsErr?.message);
    }

    // Save to media repository
    const mediaEntry = await saveMediaFile({
      name: file.name,
      url: publicUrl,
      type: fileType,
      sizeBytes: file.size,
    });

    // Auto-detect dimensions from buffer if image
    const dimensions = fileType === 'image' ? detectImageDimensionsFromBuffer(buffer) : null;

    return NextResponse.json({
      success: true,
      media: {
        ...mediaEntry,
        ...(dimensions || {}),
      },
      dimensions,
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
