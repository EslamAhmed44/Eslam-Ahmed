/**
 * Smart Media Text Contrast System
 * Analyzes the visual brightness of the lower region of project media (where titles and descriptions sit)
 * and determines the optimal text contrast theme, colors, and subtle readability support.
 */

export type ContrastTheme = 'light' | 'dark' | 'medium';

export interface MediaContrastInfo {
  theme: ContrastTheme;
  luminance: number; // 0 (pure black) to 255 (pure white)
  isLight: boolean;
  // Dynamic CSS classes for high readability
  titleClass: string;
  subtitleClass: string;
  descriptionClass: string;
  arrowBtnClass: string;
  tagClass: string;
  scrimClass: string;
  textShadowStyle?: string;
}

// In-memory cache for ultra-fast instant lookups with zero recalculation overhead
const contrastCache = new Map<string, MediaContrastInfo>();

// Seed cache with pre-analyzed values for known project assets to guarantee fast first paint without flickering
const KNOWN_CONTRAST_SEEDS: Record<string, { lum: number; theme: ContrastTheme }> = {
  // Uptown Labs (White background logo & stationery)
  '/uploads/1790361602345-New_logo_2x.png': { lum: 216.7, theme: 'light' },
  '/uploads/1790361631974-UP_V1.1_copy.jpg': { lum: 206.0, theme: 'light' },
  // Dr. Hazem Mahmoud Clinic (Light medical campaign artwork)
  '/uploads/1790372687533-F1.png': { lum: 175.1, theme: 'light' },
  '/uploads/1790372687694-F2.png': { lum: 211.7, theme: 'light' },
  // Flight Takeoff & Landing Animation (Medium dusk motion graphics sky)
  '/uploads/1790989064535-Flight_Takeoff___Landing_Animation.png': { lum: 135.4, theme: 'medium' },
  '/uploads/1790989072843-Flight_Takeoff___Landing_Animation.mp4': { lum: 135.4, theme: 'medium' },
};

export function buildContrastInfo(luminance: number, forceTheme?: ContrastTheme): MediaContrastInfo {
  // Determine theme based on lower region luminance threshold
  const theme: ContrastTheme =
    forceTheme || (luminance > 155 ? 'light' : luminance >= 100 ? 'medium' : 'dark');
  const isLight = theme === 'light';

  if (isLight) {
    return {
      theme: 'light',
      luminance,
      isLight: true,
      titleClass: 'text-[#0B0F19] group-hover:text-[#D97706]',
      subtitleClass: 'text-[#B45309]',
      descriptionClass: 'text-[#334155]',
      arrowBtnClass:
        'bg-[#0B0F19] text-white border-black/15 group-hover:bg-[#F59E0B] group-hover:text-[#07090D]',
      tagClass: 'bg-black/5 text-[#1E293B] border border-black/10',
      scrimClass: 'bg-gradient-to-t from-white/95 via-white/80 to-transparent',
      textShadowStyle: 'drop-shadow(0 1px 2px rgba(255, 255, 255, 0.9))',
    };
  }

  if (theme === 'medium') {
    return {
      theme: 'medium',
      luminance,
      isLight: false,
      titleClass: 'text-[#F0F3F6] group-hover:text-[#F59E0B]',
      subtitleClass: 'text-[#F59E0B]',
      descriptionClass: 'text-[#CBD5E1]',
      arrowBtnClass:
        'bg-[#151A23]/80 border-[#F0F3F6]/15 text-[#F0F3F6] group-hover:bg-[#F59E0B] group-hover:text-[#07090D]',
      tagClass: 'bg-[#151A23]/90 text-[#94A3B8]',
      scrimClass: 'bg-gradient-to-t from-[#07090D] via-[#07090D]/85 to-transparent',
      textShadowStyle: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.75))',
    };
  }

  // Dark background (default)
  return {
    theme: 'dark',
    luminance,
    isLight: false,
    titleClass: 'text-[#F0F3F6] group-hover:text-[#F59E0B]',
    subtitleClass: 'text-[#F59E0B]',
    descriptionClass: 'text-[#94A3B8]',
    arrowBtnClass:
      'bg-[#151A23]/80 border-[#F0F3F6]/15 text-[#F0F3F6] group-hover:bg-[#F59E0B] group-hover:text-[#07090D]',
    tagClass: 'bg-[#151A23]/90 text-[#94A3B8]',
    scrimClass: 'bg-gradient-to-t from-[#07090D] via-[#07090D]/85 to-transparent',
    textShadowStyle: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6))',
  };
}

// Seed the in-memory cache
for (const [url, seed] of Object.entries(KNOWN_CONTRAST_SEEDS)) {
  contrastCache.set(url, buildContrastInfo(seed.lum, seed.theme));
}

/**
 * Returns initial contrast synchronously if cached or seeded, avoiding any layout or color flash
 */
export function getInitialMediaContrast(url?: string): MediaContrastInfo {
  if (!url) return buildContrastInfo(30, 'dark');
  const cleanUrl = url.trim().split('?')[0].split('#')[0];
  const cached = contrastCache.get(cleanUrl) || contrastCache.get(url);
  if (cached) return cached;
  // Default to dark theme while computing
  return buildContrastInfo(30, 'dark');
}

/**
 * Asynchronously samples the lower 40% area of an image or video poster in an offscreen 32x32 canvas.
 * Results are cached so transitions and re-renders are instantaneous.
 */
export function analyzeMediaContrast(
  url: string,
  onResult: (info: MediaContrastInfo) => void
): void {
  if (!url || typeof window === 'undefined') return;

  const cleanUrl = url.trim().split('?')[0].split('#')[0];
  const cached = contrastCache.get(cleanUrl) || contrastCache.get(url);
  if (cached) {
    onResult(cached);
    return;
  }

  // Skip direct video files if no poster; use video representative theme
  if (/\.(mp4|webm|mov|ogg)$/i.test(cleanUrl)) {
    const fallback = buildContrastInfo(90, 'medium');
    contrastCache.set(cleanUrl, fallback);
    onResult(fallback);
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Extract the lower 40% of the image (the area behind the text footnote)
      const naturalHeight = img.naturalHeight || img.height || 100;
      const naturalWidth = img.naturalWidth || img.width || 100;
      const startY = Math.floor(naturalHeight * 0.60);
      const sampleHeight = naturalHeight - startY;

      ctx.drawImage(img, 0, startY, naturalWidth, sampleHeight, 0, 0, 32, 32);
      const imgData = ctx.getImageData(0, 0, 32, 32).data;

      let totalLuminance = 0;
      let count = 0;

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3] / 255;

        // Composite onto card background #10141C (r:16, g:20, b:28)
        const compR = r * a + 16 * (1 - a);
        const compG = g * a + 20 * (1 - a);
        const compB = b * a + 28 * (1 - a);

        // ITU-R BT.601 perceptual luminance
        const lum = 0.299 * compR + 0.587 * compG + 0.114 * compB;
        totalLuminance += lum;
        count++;
      }

      const avgLuminance = count > 0 ? totalLuminance / count : 30;
      const result = buildContrastInfo(avgLuminance);
      contrastCache.set(cleanUrl, result);
      contrastCache.set(url, result);
      onResult(result);
    } catch {
      // If tainted by CORS, fallback to safe dark theme
      const fallback = buildContrastInfo(30, 'dark');
      onResult(fallback);
    }
  };

  img.onerror = () => {
    const fallback = buildContrastInfo(30, 'dark');
    onResult(fallback);
  };
}
