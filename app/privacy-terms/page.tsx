import React from 'react';
import { Metadata } from 'next';
import { getSiteData, getPrivacyTerms } from '@/lib/db/client';
import { PrivacyTermsViewer } from '@/components/legal/PrivacyTermsViewer';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const [siteData, terms] = await Promise.all([getSiteData(), getPrivacyTerms()]);
  const name = siteData.settings.designerName || 'Islam Ahmed';
  const title = terms.title || 'Privacy & Terms';

  return {
    title: `${title} — ${name}`,
    description: `Official Digital Design & Motion Graphics Services Agreement, Commercial Terms, and Privacy Policy for ${name}.`,
    openGraph: {
      title: `${title} — ${name}`,
      description: `Official Digital Design & Motion Graphics Services Agreement, Commercial Terms, and Privacy Policy for ${name}.`,
    },
  };
}

export default async function PrivacyTermsPage() {
  const [siteData, privacyTerms] = await Promise.all([getSiteData(), getPrivacyTerms()]);
  const { settings } = siteData;

  return (
    <PrivacyTermsViewer
      designerName={settings.designerName || 'Islam Ahmed'}
      designerNameAr={settings.designerNameAr || 'إسلام أحمد'}
      privacyTermsUrl={settings.privacyTermsUrl}
      privacyTerms={privacyTerms}
    />
  );
}
