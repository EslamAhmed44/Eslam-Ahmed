import type { Metadata } from 'next';
import { Manrope, IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/navigation/LanguageContext';
import { getSiteData } from '@/lib/db/client';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const data = await getSiteData(false);
  const { settings } = data;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: settings.siteTitle,
    description: settings.siteDescription,
    keywords: settings.seoKeywords?.split(',').map((k) => k.trim()),
    authors: [{ name: settings.designerName }],
    openGraph: {
      title: settings.siteTitle,
      description: settings.siteDescription,
      images: [
        {
          url: settings.ogImageUrl || '/images/islam-ahmed.jpg',
          width: 1200,
          height: 630,
          alt: settings.designerName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.siteTitle,
      description: settings.siteDescription,
      images: [settings.ogImageUrl || '/images/islam-ahmed.jpg'],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getSiteData(false);
  const defaultLang = data.settings.defaultLanguage || 'en';

  return (
    <html
      lang={defaultLang}
      dir={defaultLang === 'ar' ? 'rtl' : 'ltr'}
      className={`${manrope.variable} ${arabic.variable} antialiased`}
    >
      <body className="font-sans bg-[#07090D] text-[#F0F3F6] min-h-screen selection:bg-[#F59E0B] selection:text-[#07090D]">
        <LanguageProvider defaultLang={defaultLang}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
