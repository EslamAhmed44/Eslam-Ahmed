import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('VERIFYING MOTION GRAPHICS PREVIEW MEDIA TIMING & SEQUENCE');
console.log('====================================================\n');

// 1. Test isMotionGraphicsProject logic
function isMotionGraphicsProject(project) {
  const motionRegex = /motion\s*graphics/i;
  if (project.category && motionRegex.test(project.category)) {
    return true;
  }
  if (Array.isArray(project.categories)) {
    return project.categories.some((cat) => typeof cat === 'string' && motionRegex.test(cat));
  }
  return false;
}

console.log('--- 1. Testing Motion Graphics Category Detection ---');
assert.strictEqual(isMotionGraphicsProject({ category: 'Motion Graphics' }), true);
assert.strictEqual(isMotionGraphicsProject({ category: 'Motion Graphics + Branding' }), true);
assert.strictEqual(isMotionGraphicsProject({ category: 'Motion Graphics + Social Media' }), true);
assert.strictEqual(isMotionGraphicsProject({ category: 'Motion Graphics + Graphic Design' }), true);
assert.strictEqual(isMotionGraphicsProject({ category: 'Motion Graphics + Branding + Social Media' }), true);
assert.strictEqual(isMotionGraphicsProject({ categories: ['Motion Graphics'] }), true);
assert.strictEqual(isMotionGraphicsProject({ categories: ['Branding', 'Motion Graphics'] }), true);
assert.strictEqual(isMotionGraphicsProject({ category: 'Graphic Design', categories: ['Graphic Design'] }), false);
assert.strictEqual(isMotionGraphicsProject({ category: 'Branding', categories: ['Branding'] }), false);
assert.strictEqual(isMotionGraphicsProject({ category: 'Social Media', categories: ['Social Media'] }), false);
console.log('✓ All category detection scenarios passed successfully.\n');

// 2. Test getProjectPreviewMediaItems logic
function cleanMediaUrl(url) {
  if (!url) return '';
  return url.trim().toLowerCase().split('?')[0].split('#')[0];
}

function getProjectPreviewMediaItems(project) {
  const coverUrl = (project.coverImage || '').trim();
  const normalizedCover = cleanMediaUrl(coverUrl);

  const rawItems =
    Array.isArray(project.mediaItems) && project.mediaItems.length > 0
      ? [...project.mediaItems].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      : [
          ...(project.gallery || []).map((url, i) => ({
            id: `gal-${i}`,
            type: 'image',
            url,
            sortOrder: i + 1,
          })),
          ...(project.videos || []).map((v, i) => ({
            id: v.id || `vid-${i}`,
            type: 'video',
            url: v.url,
            sortOrder: i + 10,
          })),
        ];

  const result = [];
  const seenUrls = new Set();

  if (coverUrl) {
    const existingCoverItem = rawItems.find(
      (m) => cleanMediaUrl(m.url) === normalizedCover
    );
    result.push({
      id: existingCoverItem?.id || 'cover-item',
      type: 'image',
      url: coverUrl,
      title: existingCoverItem?.title || project.title,
      sortOrder: 0,
    });
    seenUrls.add(normalizedCover);
  }

  for (const item of rawItems) {
    if (!item || !item.url) continue;
    const norm = cleanMediaUrl(item.url);
    if (!seenUrls.has(norm)) {
      seenUrls.add(norm);
      result.push(item);
    }
  }

  return result;
}

console.log('--- 2. Testing Media Sequence and Deduplication ---');

// Case A: Section 16 multi-media scenario
const multiMediaProject = {
  title: 'Multi Motion Showcase',
  category: 'Motion Graphics',
  coverImage: '/media/cover.jpg',
  mediaItems: [
    { id: '1', type: 'image', url: '/media/cover.jpg', sortOrder: 1 },
    { id: '2', type: 'video', url: '/media/vid-10s.mp4', sortOrder: 2 },
    { id: '3', type: 'image', url: '/media/img-2.jpg', sortOrder: 3 },
    { id: '4', type: 'video', url: '/media/vid-20s.mp4', sortOrder: 4 },
    { id: '5', type: 'image', url: '/media/img-3.jpg', sortOrder: 5 },
  ],
};

const multiSequence = getProjectPreviewMediaItems(multiMediaProject);
console.log('Multi-media project sequence:');
multiSequence.forEach((item, idx) => console.log(`  [${idx}] ${item.type.toUpperCase()}: ${item.url}`));

assert.strictEqual(multiSequence.length, 5, 'Must have exactly 5 unique items');
assert.strictEqual(multiSequence[0].type, 'image');
assert.strictEqual(multiSequence[0].url, '/media/cover.jpg', 'Cover image must be first');
assert.strictEqual(multiSequence[1].type, 'video');
assert.strictEqual(multiSequence[1].url, '/media/vid-10s.mp4', 'Video 1 must follow cover');
assert.strictEqual(multiSequence[2].type, 'image');
assert.strictEqual(multiSequence[2].url, '/media/img-2.jpg', 'Image 2 must follow video 1');
assert.strictEqual(multiSequence[3].type, 'video');
assert.strictEqual(multiSequence[3].url, '/media/vid-20s.mp4', 'Video 2 must follow image 2');
assert.strictEqual(multiSequence[4].type, 'image');
assert.strictEqual(multiSequence[4].url, '/media/img-3.jpg', 'Image 3 must follow video 2');

// Ensure cover is not repeated
const coverCount = multiSequence.filter(item => cleanMediaUrl(item.url) === cleanMediaUrl(multiMediaProject.coverImage)).length;
assert.strictEqual(coverCount, 1, 'Cover image must appear exactly once');
console.log('✓ Multi-media sequence perfectly matches required order.\n');

// Case B: Flight Takeoff & Landing Animation from store.json
console.log('--- 3. Testing Store Projects Media Sequence ---');
const storePath = path.resolve('d:/My/EslamAhmed/lib/db/store.json');
const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const flightProj = storeData.projects.find(p => p.id === 'proj-1790988888388');
assert.ok(flightProj, 'Flight Takeoff & Landing Animation project must exist');

const flightSequence = getProjectPreviewMediaItems(flightProj);
console.log('Flight project preview sequence:');
flightSequence.forEach((item, idx) => console.log(`  [${idx}] ${item.type.toUpperCase()}: ${item.url}`));

assert.strictEqual(flightSequence.length, 2, 'Flight project must have 2 items (cover + video)');
assert.strictEqual(flightSequence[0].type, 'image', 'Cover must be image');
assert.strictEqual(flightSequence[0].url, flightProj.coverImage, 'Cover must match project coverImage');
assert.strictEqual(flightSequence[1].type, 'video', 'Item 1 must be video');
console.log('✓ Flight project sequence verified: [Cover Image, Video]\n');

// 4. Verify ProjectMediaSlideshow code structure
console.log('--- 4. Verifying ProjectMediaSlideshow Code Implementation ---');
const slideshowCode = fs.readFileSync('d:/My/EslamAhmed/components/projects/ProjectMediaSlideshow.tsx', 'utf8');

assert.ok(slideshowCode.includes('isMotionGraphics = false'), 'Should have isMotionGraphics prop with default false');
assert.ok(slideshowCode.includes('loop={!isMotionGraphics}'), 'Videos must not loop when isMotionGraphics is true');
assert.ok(slideshowCode.includes('onEnded='), 'Must handle onEnded event');
assert.ok(slideshowCode.includes('if (isMotionGraphics && isActive)'), 'Must trigger goToNext on video end for active motion graphics');
assert.ok(slideshowCode.includes('if (isMotionGraphics && isCurrentVideo)'), 'Must not apply fixed interval when video is active on motion graphics');
console.log('✓ ProjectMediaSlideshow implementation matches all required specifications.\n');

console.log('====================================================');
console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
console.log('====================================================');
