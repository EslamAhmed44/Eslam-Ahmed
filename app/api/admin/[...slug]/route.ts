import { NextRequest, NextResponse } from 'next/server';
import {
  checkAdminSession,
  createAdminSession,
  destroyAdminSession,
  verifyAdminCredentials,
} from '@/lib/auth/session';
import {
  deleteExperience,
  deleteMediaFile,
  deleteProject,
  deleteService,
  deleteSkillGroup,
  deleteSocialLink,
  deleteTestimonial,
  deleteCategory,
  deleteContactChannel,
  getSiteData,
  reorderProjects,
  saveExperience,
  saveProject,
  saveService,
  saveSkillGroup,
  saveSocialLink,
  saveTestimonial,
  saveCategory,
  saveContactChannel,
  updateSettings,
} from '@/lib/db/client';
import { revalidatePath } from 'next/cache';

function revalidateLiveSite(projectSlug?: string) {
  try {
    revalidatePath('/', 'page');
    revalidatePath('/projects/[slug]', 'page');
    revalidatePath('/admin', 'layout');
    if (projectSlug) {
      revalidatePath(`/projects/${projectSlug}`, 'page');
    }
  } catch (err) {
    console.warn('[Cache] Live site revalidation warning:', err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const action = slug.join('/');

  // 1. LOGIN (unprotected)
  if (action === 'login') {
    try {
      const body = await req.json();
      const identifier = body.username || body.email || '';
      const { password } = body;
      const isValid = await verifyAdminCredentials(identifier, password);

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
      }

      await createAdminSession(identifier);
      return NextResponse.json({ success: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Login failed' }, { status: 500 });
    }
  }

  // 2. LOGOUT
  if (action === 'logout') {
    await destroyAdminSession();
    const res = NextResponse.json({ success: true });
    res.cookies.set('eslam_admin_session', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
    });
    return res;
  }

  // All subsequent routes require Admin authentication
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    switch (action) {
      case 'settings': {
        const updated = await updateSettings(body);
        revalidateLiveSite();
        return NextResponse.json({ success: true, settings: updated });
      }

      case 'projects': {
        const saved = await saveProject(body);
        revalidateLiveSite(saved.slug);
        return NextResponse.json({ success: true, project: saved });
      }

      case 'projects/reorder': {
        await reorderProjects(body.ids || []);
        revalidateLiveSite();
        return NextResponse.json({ success: true });
      }

      case 'experience': {
        const saved = await saveExperience(body);
        revalidateLiveSite();
        return NextResponse.json({ success: true, experience: saved });
      }

      case 'skill-groups': {
        const saved = await saveSkillGroup(body);
        revalidateLiveSite();
        return NextResponse.json({ success: true, skillGroup: saved });
      }

      case 'services': {
        const saved = await saveService(body);
        revalidateLiveSite();
        return NextResponse.json({ success: true, service: saved });
      }

      case 'testimonials': {
        const saved = await saveTestimonial(body);
        revalidateLiveSite();
        return NextResponse.json({ success: true, testimonial: saved });
      }

      case 'social-links': {
        const saved = await saveSocialLink(body);
        revalidateLiveSite();
        return NextResponse.json({ success: true, socialLink: saved });
      }

      case 'categories': {
        const updated = await saveCategory(body.category || body.name || '');
        revalidateLiveSite();
        return NextResponse.json({ success: true, categories: updated });
      }

      case 'contact-channels': {
        const saved = await saveContactChannel(body);
        revalidateLiveSite();
        return NextResponse.json({ success: true, contactChannel: saved });
      }

      default:
        return NextResponse.json({ error: `Unknown action ${action}` }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Admin POST error on /${action}:`, error);
    return NextResponse.json({ error: error?.message || 'Operation failed' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const action = slug.join('/');

  if (action === 'data') {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await getSiteData(true);
    return NextResponse.json({ success: true, data });
  }

  if (action === 'check-session') {
    const isAdmin = await checkAdminSession();
    return NextResponse.json({ authenticated: isAdmin });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const action = slug.join('/');
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    switch (action) {
      case 'projects':
        await deleteProject(id);
        break;

      case 'experience':
        await deleteExperience(id);
        break;

      case 'skill-groups':
        await deleteSkillGroup(id);
        break;

      case 'services':
        await deleteService(id);
        break;

      case 'testimonials':
        await deleteTestimonial(id);
        break;

      case 'social-links':
        await deleteSocialLink(id);
        break;

      case 'media':
        await deleteMediaFile(id);
        break;

      case 'categories':
        await deleteCategory(id);
        break;

      case 'contact-channels':
        await deleteContactChannel(id);
        break;

      default:
        return NextResponse.json({ error: `Unknown delete action ${action}` }, { status: 404 });
    }

    revalidateLiveSite();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Admin DELETE error on /${action}:`, error);
    return NextResponse.json({ error: error?.message || 'Delete failed' }, { status: 500 });
  }
}
