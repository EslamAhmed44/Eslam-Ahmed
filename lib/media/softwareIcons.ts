// lib/media/softwareIcons.ts

const SOFTWARE_ICON_MAP: Record<string, string> = {
  photoshop: '/icons/software/photoshop.svg',
  ps: '/icons/software/photoshop.svg',
  illustrator: '/icons/software/illustrator.svg',
  ai: '/icons/software/illustrator.svg',
  'after effects': '/icons/software/after-effects.svg',
  ae: '/icons/software/after-effects.svg',
  premiere: '/icons/software/premiere-pro.svg',
  'premiere pro': '/icons/software/premiere-pro.svg',
  pr: '/icons/software/premiere-pro.svg',
  indesign: '/icons/software/indesign.svg',
  id: '/icons/software/indesign.svg',
  lightroom: '/icons/software/lightroom.svg',
  lr: '/icons/software/lightroom.svg',
  audition: '/icons/software/audition.svg',
  au: '/icons/software/audition.svg',
  blender: '/icons/software/blender.svg',
  'cinema 4d': '/icons/software/cinema4d.svg',
  c4d: '/icons/software/cinema4d.svg',
  davinci: '/icons/software/davinci-resolve.svg',
  'davinci resolve': '/icons/software/davinci-resolve.svg',
  resolve: '/icons/software/davinci-resolve.svg',
  figma: '/icons/software/figma.svg',
  canva: '/icons/software/canva.svg',
  '3ds max': '/icons/software/3ds-max.svg',
  '3ds': '/icons/software/3ds-max.svg',
  max: '/icons/software/3ds-max.svg',
  maya: '/icons/software/maya.svg',
  'unreal engine': '/icons/software/unreal-engine.svg',
  unreal: '/icons/software/unreal-engine.svg',
  unity: '/icons/software/unity.svg',
  procreate: '/icons/software/procreate.svg',
  capcut: '/icons/software/capcut.svg',
  'brand identity': '/icons/software/brand-identity.svg',
  branding: '/icons/software/brand-identity.svg',
};

export function getDefaultSoftwareIconUrl(name?: string): string | undefined {
  if (!name) return undefined;
  const clean = name.toLowerCase().trim();

  // Exact match
  if (SOFTWARE_ICON_MAP[clean]) {
    return SOFTWARE_ICON_MAP[clean];
  }

  // Substring match
  for (const [key, url] of Object.entries(SOFTWARE_ICON_MAP)) {
    if (clean.includes(key)) {
      return url;
    }
  }

  return undefined;
}
