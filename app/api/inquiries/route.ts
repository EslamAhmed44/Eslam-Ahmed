import { NextRequest, NextResponse } from 'next/server';
import { saveInquiry, getInquiries, updateInquiryStatus, deleteInquiry } from '@/lib/db/client';
import { checkAdminSession } from '@/lib/auth/session';
import { PreferredContactMethod } from '@/lib/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{6,25}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      contactMethod = 'Email',
      email,
      whatsapp,
      services = [],
      description,
      budget,
      referenceLinks = [],
      referenceFiles = [],
      googleDriveUrl,
    } = body;

    // Validate Name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter your name.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const validContactMethod: PreferredContactMethod =
      contactMethod === 'WhatsApp' ? 'WhatsApp' : contactMethod === 'Both' ? 'Both' : 'Email';

    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedWhatsapp = typeof whatsapp === 'string' ? whatsapp.trim() : '';

    // Validate Contact Method
    if (validContactMethod === 'Email') {
      if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
        return NextResponse.json(
          { error: 'Please provide a valid email address.' },
          { status: 400 }
        );
      }
    } else if (validContactMethod === 'WhatsApp') {
      if (!trimmedWhatsapp || !PHONE_REGEX.test(trimmedWhatsapp)) {
        return NextResponse.json(
          { error: 'Please provide a valid WhatsApp number.' },
          { status: 400 }
        );
      }
    } else if (validContactMethod === 'Both') {
      if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
        return NextResponse.json(
          { error: 'Please provide a valid email address.' },
          { status: 400 }
        );
      }
      if (!trimmedWhatsapp || !PHONE_REGEX.test(trimmedWhatsapp)) {
        return NextResponse.json(
          { error: 'Please provide a valid WhatsApp number.' },
          { status: 400 }
        );
      }
    }

    // Ensure at least one usable contact method
    if (!trimmedEmail && !trimmedWhatsapp) {
      return NextResponse.json(
        { error: 'Please provide an email address or WhatsApp number so I can contact you.' },
        { status: 400 }
      );
    }

    // Validate Project Description
    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please tell me a little about your project (at least a few words).' },
        { status: 400 }
      );
    }

    // Validate URLs in reference links if any
    const validLinks: string[] = [];
    if (Array.isArray(referenceLinks)) {
      for (const link of referenceLinks) {
        if (typeof link === 'string' && link.trim()) {
          const l = link.trim();
          try {
            const parsed = new URL(l.startsWith('http://') || l.startsWith('https://') ? l : `https://${l}`);
            validLinks.push(parsed.toString());
          } catch {
            // skip invalid link or allow if looks reasonable
          }
        }
      }
    }

    // Validate Google Drive URL if provided
    let validDriveUrl = '';
    if (typeof googleDriveUrl === 'string' && googleDriveUrl.trim()) {
      const g = googleDriveUrl.trim();
      try {
        const parsed = new URL(g.startsWith('http://') || g.startsWith('https://') ? g : `https://${g}`);
        validDriveUrl = parsed.toString();
      } catch {
        validDriveUrl = g;
      }
    }

    const saved = await saveInquiry({
      name: trimmedName,
      contactMethod: validContactMethod,
      email: trimmedEmail,
      whatsapp: trimmedWhatsapp,
      services: Array.isArray(services) ? services : [],
      description: description.trim(),
      budget: typeof budget === 'string' ? budget.trim() : undefined,
      referenceLinks: validLinks,
      referenceFiles: Array.isArray(referenceFiles) ? referenceFiles : [],
      googleDriveUrl: validDriveUrl || undefined,
      status: 'unread',
    });

    return NextResponse.json({
      success: true,
      inquiryId: saved.id,
      message: 'Project inquiry submitted successfully',
    });
  } catch (error: any) {
    console.error('Project inquiry submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while sending your inquiry. Please try again.' },
      { status: 500 }
    );
  }
}

// GET: Admin only - public users are forbidden from viewing inquiries
export async function GET() {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inquiries = await getInquiries();
    return NextResponse.json({ success: true, inquiries });
  } catch (error: any) {
    console.error('Fetch inquiries error:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

// PATCH: Admin only - update status
export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    await updateInquiryStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update inquiry error:', error);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

// DELETE: Admin only - delete inquiry
export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await deleteInquiry(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete inquiry error:', error);
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
