import { checkAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getInquiries } from '@/lib/db/client';
import { MessagePortalClient } from './MessagePortalClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function MessagePortalPage() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    redirect('/admin/login?redirect=/admin/messages');
  }

  const initialInquiries = await getInquiries();

  return <MessagePortalClient initialInquiries={initialInquiries} />;
}
