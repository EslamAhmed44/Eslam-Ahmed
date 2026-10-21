import React from 'react';
import { Metadata } from 'next';
import { getSiteData } from '@/lib/db/client';
import { CvViewer } from '@/components/cv/CvViewer';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteData();
  const name = settings.designerName || 'Islam Ahmed';

  return {
    title: `Curriculum Vitae — ${name}`,
    description: `Official Curriculum Vitae of ${name}, Graphic & Motion Graphic Designer. View credentials, experience, and creative competencies.`,
    openGraph: {
      title: `Curriculum Vitae — ${name}`,
      description: `Official Curriculum Vitae of ${name}.`,
    },
  };
}

export default async function CvPage() {
  const { settings } = await getSiteData();

  const effectiveCvUrl = settings.cvUrl || '/cv/Islam_Ahmed_CV.pdf';
  const designerName = settings.designerName || 'Islam Ahmed';

  return (
    <CvViewer
      cvUrl={effectiveCvUrl}
      designerName={designerName}
    />
  );
}
