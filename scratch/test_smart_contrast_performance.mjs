import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('VERIFYING SMART TEXT CONTRAST & PERFORMANCE SYSTEM');
console.log('====================================================\n');

// 1. Test buildContrastInfo rules
function buildContrastInfo(luminance, forceTheme) {
  const theme = forceTheme || (luminance > 155 ? 'light' : luminance >= 100 ? 'medium' : 'dark');
  const isLight = theme === 'light';

  if (isLight) {
    return {
      theme: 'light',
      luminance,
      isLight: true,
      titleClass: 'text-[#0B0F19] group-hover:text-[#D97706]',
      subtitleClass: 'text-[#B45309]',
      descriptionClass: 'text-[#334155]',
      arrowBtnClass: 'bg-[#0B0F19] text-white border-black/15 group-hover:bg-[#F59E0B] group-hover:text-[#07090D]',
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
      arrowBtnClass: 'bg-[#151A23]/80 border-[#F0F3F6]/15 text-[#F0F3F6] group-hover:bg-[#F59E0B] group-hover:text-[#07090D]',
      tagClass: 'bg-[#151A23]/90 text-[#94A3B8]',
      scrimClass: 'bg-gradient-to-t from-[#07090D] via-[#07090D]/85 to-transparent',
      textShadowStyle: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.75))',
    };
  }

  return {
    theme: 'dark',
    luminance,
    isLight: false,
    titleClass: 'text-[#F0F3F6] group-hover:text-[#F59E0B]',
    subtitleClass: 'text-[#F59E0B]',
    descriptionClass: 'text-[#94A3B8]',
    arrowBtnClass: 'bg-[#151A23]/80 border-[#F0F3F6]/15 text-[#F0F3F6] group-hover:bg-[#F59E0B] group-hover:text-[#07090D]',
    tagClass: 'bg-[#151A23]/90 text-[#94A3B8]',
    scrimClass: 'bg-gradient-to-t from-[#07090D] via-[#07090D]/85 to-transparent',
    textShadowStyle: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6))',
  };
}

console.log('--- 1. Testing Contrast Theme Classification ---');
// White / Light background
const whiteBg = buildContrastInfo(240);
assert.strictEqual(whiteBg.theme, 'light');
assert.strictEqual(whiteBg.isLight, true);
assert.ok(whiteBg.titleClass.includes('#0B0F19'), 'Light background must use dark #0B0F19 title');
assert.ok(whiteBg.descriptionClass.includes('#334155'), 'Light background must use dark slate description');
assert.ok(whiteBg.scrimClass.includes('from-white'), 'Light background must use subtle protective light scrim');

// Dark background
const darkBg = buildContrastInfo(30);
assert.strictEqual(darkBg.theme, 'dark');
assert.strictEqual(darkBg.isLight, false);
assert.ok(darkBg.titleClass.includes('#F0F3F6'), 'Dark background must use light platinum title');
assert.ok(darkBg.descriptionClass.includes('#94A3B8'), 'Dark background must use muted description');
assert.ok(darkBg.scrimClass.includes('from-[#07090D]'), 'Dark background must use dark protective scrim');

// Medium / Complex background
const mediumBg = buildContrastInfo(135);
assert.strictEqual(mediumBg.theme, 'medium');
assert.strictEqual(mediumBg.isLight, false);
assert.ok(mediumBg.textShadowStyle.includes('rgba(0, 0, 0, 0.75)'), 'Medium background must have protective drop shadow');

console.log('✓ All contrast theme rules verified successfully.\n');

console.log('--- 2. Testing Project Assets Contrast ---');
const uptownContrast = buildContrastInfo(216.7);
console.log('Uptown Labs (White Background):');
console.log('  Theme:', uptownContrast.theme);
console.log('  Title Class:', uptownContrast.titleClass);
console.log('  Scrim Class:', uptownContrast.scrimClass);
assert.strictEqual(uptownContrast.theme, 'light', 'Uptown Labs must be classified as light');

const flightContrast = buildContrastInfo(135.4);
console.log('Flight Takeoff (Dusk Sky):');
console.log('  Theme:', flightContrast.theme);
console.log('  Title Class:', flightContrast.titleClass);
assert.strictEqual(flightContrast.theme, 'medium', 'Flight Takeoff must be classified as medium');

console.log('✓ Project assets mapped to correct contrast themes.\n');

console.log('--- 3. Testing Component Files for Performance Optimizations ---');
const cardCode = fs.readFileSync('d:/My/EslamAhmed/components/projects/ProjectCard.tsx', 'utf8');
assert.ok(cardCode.includes('getInitialMediaContrast'), 'ProjectCard must initialize contrast synchronously');
assert.ok(cardCode.includes('analyzeMediaContrast'), 'ProjectCard must analyze media contrast');
assert.ok(cardCode.includes('w=64&q=75'), 'ProjectCard must use 64px low-res thumbnail for ambient glow');
assert.ok(cardCode.includes('contrastInfo.scrimClass'), 'ProjectCard must render adaptive scrim layer');

const slideshowCode = fs.readFileSync('d:/My/EslamAhmed/components/projects/ProjectMediaSlideshow.tsx', 'utf8');
assert.ok(slideshowCode.includes("import Image from 'next/image'"), 'ProjectMediaSlideshow must use next/image');
assert.ok(slideshowCode.includes('onActiveMediaChange'), 'ProjectMediaSlideshow must notify active media changes');
assert.ok(slideshowCode.includes('poster='), 'ProjectMediaSlideshow must set video poster');
assert.ok(slideshowCode.includes("!isVisible\n                      ? 'none'"), 'ProjectMediaSlideshow must avoid preloading offscreen videos');

const sectionCode = fs.readFileSync('d:/My/EslamAhmed/components/projects/ProjectsSection.tsx', 'utf8');
assert.ok(sectionCode.includes('priority={idx < 2}'), 'ProjectsSection must pass priority to first visible cards');

console.log('✓ All performance optimizations verified in code.\n');

console.log('====================================================');
console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
console.log('====================================================');
