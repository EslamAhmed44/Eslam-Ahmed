import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/navigation/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { getSiteData } from '@/lib/db/client';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getSiteData(false);
  const { settings } = data;
  const siteTitle = settings.siteTitle || 'Islam Ahmed — Graphic & Motion Graphic Designer';

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      default: siteTitle,
      template: '%s | Islam Ahmed',
    },
    description: settings.siteDescription,
    keywords: settings.seoKeywords?.split(',').map((k) => k.trim()),
    authors: [{ name: settings.designerName || 'Islam Ahmed' }],
    creator: 'Islam Ahmed',
    publisher: 'Islam Ahmed',
    applicationName: 'Islam Ahmed',
    openGraph: {
      title: siteTitle,
      description: settings.siteDescription,
      siteName: 'Islam Ahmed',
      type: 'website',
      images: [
        {
          url: settings.ogImageUrl || '/images/islam-ahmed.jpg',
          width: 1200,
          height: 630,
          alt: 'Islam Ahmed — Graphic & Motion Graphic Designer',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: settings.siteDescription,
      images: [settings.ogImageUrl || '/images/islam-ahmed.jpg'],
      creator: '@IslamAhmed',
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
      className="antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-sans min-h-screen selection:bg-[#F59E0B] selection:text-[#07090D]"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LanguageProvider defaultLang={defaultLang}>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
