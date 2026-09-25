// scratch/create_software_icons.mjs
import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'public', 'icons', 'software');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const icons = {
  'photoshop.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#001E36" />
  <path d="M6 7.5H10.5C12.4 7.5 13.5 8.5 13.5 10.2C13.5 11.9 12.3 12.9 10.5 12.9H8.2V16.5H6V7.5ZM8.2 11.2H10.3C11.1 11.2 11.5 10.8 11.5 10.2C11.5 9.6 11.1 9.2 10.3 9.2H8.2V11.2Z" fill="#31A8FF" />
  <path d="M14.2 14.8C14.7 15.3 15.5 15.6 16.4 15.6C17.3 15.6 17.8 15.2 17.8 14.6C17.8 14.1 17.4 13.7 16.2 13.4C14.5 12.9 13.7 12.2 13.7 10.8C13.7 9.4 14.9 8.3 16.6 8.3C17.6 8.3 18.5 8.6 19.1 9.1L18.4 10.4C17.9 10 17.3 9.8 16.6 9.8C15.8 9.8 15.3 10.2 15.3 10.7C15.3 11.2 15.7 11.5 16.9 11.8C18.6 12.3 19.4 13 19.4 14.5C19.4 16 18.2 17.1 16.3 17.1C15.1 17.1 14.1 16.6 13.4 16L14.2 14.8Z" fill="#31A8FF" />
</svg>`,

  'illustrator.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#330000" />
  <path d="M10.2 14.2H6.8L6.1 16.5H4L8 6.5H9L13 16.5H10.9L10.2 14.2ZM7.3 12.6H9.7L8.5 8.8L7.3 12.6Z" fill="#FF9A00" />
  <path d="M15 7.5H17V9.5H15V7.5ZM15 10.5H17V16.5H15V10.5Z" fill="#FF9A00" />
</svg>`,

  'after-effects.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#00005B" />
  <path d="M10.2 14.2H6.8L6.1 16.5H4L8 6.5H9L13 16.5H10.9L10.2 14.2ZM7.3 12.6H9.7L8.5 8.8L7.3 12.6Z" fill="#9999FF" />
  <path d="M19.5 13.8C19.5 15.6 18.2 16.8 16.2 16.8C14.2 16.8 13 15.4 13 13.6C13 11.7 14.3 10.3 16.3 10.3C18.4 10.3 19.5 11.8 19.5 13.8ZM14.9 13.4H17.7C17.7 12.2 17.1 11.5 16.2 11.5C15.4 11.5 14.9 12.2 14.9 13.4Z" fill="#9999FF" />
</svg>`,

  'premiere-pro.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#00005B" />
  <path d="M5.5 7.5H10C11.9 7.5 13 8.5 13 10.2C13 11.9 11.9 12.9 10 12.9H7.7V16.5H5.5V7.5ZM7.7 11.2H9.8C10.6 11.2 11 10.8 11 10.2C11 9.6 10.6 9.2 9.8 9.2H7.7V11.2Z" fill="#EA77FF" />
  <path d="M14.5 10.5H16.4V11.6C16.8 10.8 17.6 10.3 18.7 10.4V12.4C18.4 12.3 18 12.3 17.6 12.4C16.9 12.6 16.4 13.3 16.4 14.2V16.5H14.5V10.5Z" fill="#EA77FF" />
</svg>`,

  'indesign.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#49021F" />
  <path d="M6 7.5H8.2V16.5H6V7.5Z" fill="#FF3366" />
  <path d="M15.5 7.5H17.5V16.5H15.6V15.2C15 16.2 14 16.8 12.8 16.8C10.8 16.8 9.5 15.2 9.5 13.5C9.5 11.8 10.8 10.2 12.8 10.2C13.9 10.2 14.9 10.8 15.5 11.7V7.5ZM11.6 13.5C11.6 14.5 12.3 15.3 13.4 15.3C14.5 15.3 15.5 14.5 15.5 13.5C15.5 12.5 14.5 11.7 13.4 11.7C12.3 11.7 11.6 12.5 11.6 13.5Z" fill="#FF3366" />
</svg>`,

  'lightroom.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#001E36" />
  <path d="M6 7.5H8.2V14.5H12V16.5H6V7.5Z" fill="#31A8FF" />
  <path d="M13.5 10.5H15.4V11.6C15.8 10.8 16.6 10.3 17.7 10.4V12.4C17.4 12.3 17 12.3 16.6 12.4C15.9 12.6 15.4 13.3 15.4 14.2V16.5H13.5V10.5Z" fill="#31A8FF" />
</svg>`,

  'audition.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#001E36" />
  <text x="12" y="16.5" fill="#00E5FF" font-size="11" font-weight="900" text-anchor="middle" font-family="monospace">Au</text>
</svg>`,

  'blender.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#EA7600" />
  <circle cx="12" cy="13" r="4.5" fill="#265787" />
  <circle cx="12" cy="13" r="2.2" fill="#FFFFFF" />
  <path d="M12 4L14 8H10L12 4Z" fill="#FFFFFF" />
</svg>`,

  'cinema4d.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#001844" />
  <path d="M7 8H17V10H10V14H15V16H7V8Z" fill="#00D2FF" />
</svg>`,

  'davinci-resolve.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#151A23" />
  <circle cx="8" cy="8" r="3.2" fill="#E02424" />
  <circle cx="16" cy="8" r="3.2" fill="#3F83F8" />
  <circle cx="12" cy="16" r="3.2" fill="#0E9F6E" />
</svg>`,

  'figma.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#1E1E1E" />
  <path d="M8.5 18C9.88 18 11 16.88 11 15.5V13H8.5C7.12 13 6 14.12 6 15.5C6 16.88 7.12 18 8.5 18Z" fill="#0ACF83" />
  <path d="M6 10.5C6 9.12 7.12 8 8.5 8H11V13H8.5C7.12 13 6 11.88 6 10.5Z" fill="#A259FF" />
  <path d="M6 5.5C6 4.12 7.12 3 8.5 3H11V8H8.5C7.12 8 6 6.88 6 5.5Z" fill="#F24E1E" />
  <path d="M11 3H13.5C14.88 3 16 4.12 16 5.5C16 6.88 14.88 8 13.5 8H11V3Z" fill="#FF7262" />
  <path d="M16 10.5C16 11.88 14.88 13 13.5 13C12.12 13 11 11.88 11 10.5C11 9.12 12.12 8 13.5 8C14.88 8 16 9.12 16 10.5Z" fill="#1ABCFE" />
</svg>`,

  'canva.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#00C4CC" />
  <path d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4ZM15.8 14.6C15.1 15.3 14 15.8 12.7 15.8C10.5 15.8 9 14.3 9 12C9 9.7 10.5 8.2 12.7 8.2C13.9 8.2 14.9 8.7 15.6 9.4L14.4 10.6C14 10.1 13.4 9.8 12.7 9.8C11.4 9.8 10.6 10.7 10.6 12C10.6 13.3 11.4 14.2 12.7 14.2C13.5 14.2 14.1 13.9 14.6 13.4L15.8 14.6Z" fill="#FFFFFF" />
</svg>`,

  '3ds-max.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#135252" />
  <text x="12" y="16" fill="#31D2F2" font-size="10" font-weight="900" text-anchor="middle" font-family="monospace">3DS</text>
</svg>`,

  'maya.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#0F3847" />
  <text x="12" y="16" fill="#20B2AA" font-size="11" font-weight="900" text-anchor="middle" font-family="monospace">M</text>
</svg>`,

  'unreal-engine.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#0E1118" />
  <circle cx="12" cy="12" r="8" stroke="#FFFFFF" stroke-width="1.8" />
  <text x="12" y="16" fill="#FFFFFF" font-size="11" font-weight="900" text-anchor="middle" font-family="sans-serif">U</text>
</svg>`,

  'unity.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#222C37" />
  <path d="M12 5L17 8V14L12 17L7 14V8L12 5Z" stroke="#FFFFFF" stroke-width="2" fill="none" />
</svg>`,

  'procreate.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#151A23" />
  <circle cx="9" cy="9" r="3.2" fill="#FF5E3A" />
  <circle cx="15" cy="15" r="4.2" fill="#FF2A68" />
</svg>`,

  'capcut.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#000000" />
  <path d="M7 8L12 12L7 16V8Z" fill="#FFFFFF" />
  <path d="M17 8L12 12L17 16V8Z" fill="#00F0FF" />
</svg>`,

  'brand-identity.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#2A1B00" stroke="#F59E0B" stroke-width="1.2" />
  <path d="M12 4L14.2 9.8L20 12L14.2 14.2L12 20L9.8 14.2L4 12L9.8 9.8L12 4Z" fill="#F59E0B" />
</svg>`,
};

for (const [filename, content] of Object.entries(icons)) {
  fs.writeFileSync(path.join(targetDir, filename), content.trim(), 'utf-8');
}

console.log(`Created ${Object.keys(icons).length} software icon files in ${targetDir}`);
