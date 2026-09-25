// scratch/test_portfolio_upgrade.mjs
import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('=== STARTING PORTFOLIO & CMS ENHANCEMENT TESTS ===\n');

  // 1. Authenticate with credentials
  console.log('1. Authenticating Admin Session...');
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'EslamAhmed44',
      password: 'Eslam100314',
    }),
  });

  assert.strictEqual(loginRes.status, 200, 'Login response should be 200');
  const loginCookies = loginRes.headers.get('set-cookie');
  assert.ok(loginCookies, 'Should receive session cookies');
  console.log('✔ Admin authentication successful.\n');

  // 2. Fetch Admin Data
  console.log('2. Fetching Admin Data...');
  const dataRes = await fetch(`${BASE_URL}/api/admin/data`, {
    headers: { cookie: loginCookies },
  });
  assert.strictEqual(dataRes.status, 200, 'Data response should be 200');
  const dataJson = await dataRes.json();
  assert.ok(dataJson.data, 'Should have data payload');
  const initialSkillGroups = dataJson.data.skillGroups || [];
  const initialProjects = dataJson.data.projects || [];
  console.log(`✔ Found ${initialSkillGroups.length} skill groups and ${initialProjects.length} projects.`);
  
  // Verify user's Uptown Labs project is present
  const uptownProject = initialProjects.find(p => p.id === 'proj-1790361143478' || p.title.includes('Uptown'));
  assert.ok(uptownProject, 'User project "Uptown Labs" must be preserved');
  console.log(`✔ Preserved real user project: "${uptownProject.title}" with cover: ${uptownProject.coverImage}\n`);

  // 3. Test Skill Group with Custom Software Icon Persistence
  console.log('3. Testing Skills System & Software Icon Persistence...');
  const testSkillGroupId = `test-group-${Date.now()}`;
  const testSkillGroup = {
    id: testSkillGroupId,
    title: 'Visual Effects & 3D Tools',
    titleAr: 'أدوات المؤثرات البصرية والثلاثية الأبعاد',
    sortOrder: 99,
    skills: [
      {
        id: `s-test-1`,
        name: 'Houdini FX',
        nameAr: 'هوديني',
        iconUrl: '/uploads/1790362302091-_____.png',
        level: 90,
        sortOrder: 1,
        enabled: true,
      },
      {
        id: `s-test-2`,
        name: 'Blender 3D',
        nameAr: 'بلندر',
        level: 95,
        sortOrder: 2,
        enabled: true,
      },
    ],
  };

  const saveSkillRes = await fetch(`${BASE_URL}/api/admin/skill-groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: loginCookies,
    },
    body: JSON.stringify(testSkillGroup),
  });
  assert.strictEqual(saveSkillRes.status, 200, 'Save skill group should return 200');
  console.log('✔ Created test skill group with custom software icon.');

  // Re-fetch to verify persistence
  const verifyDataRes = await fetch(`${BASE_URL}/api/admin/data`, {
    headers: { cookie: loginCookies },
  });
  const verifyData = await verifyDataRes.json();
  const foundGroup = verifyData.data.skillGroups.find(g => g.id === testSkillGroupId);
  assert.ok(foundGroup, 'Saved skill group must persist in database');
  assert.strictEqual(foundGroup.skills[0].iconUrl, '/uploads/1790362302091-_____.png', 'Software icon URL must persist');
  console.log('✔ Verified software icon persistence after reload.\n');

  // 4. Test Multi-Media Project Creation & Sequence
  console.log('4. Testing Multi-Media Project Creation & Order...');
  const testProjectId = `test-proj-${Date.now()}`;
  const testProjectPayload = {
    id: testProjectId,
    slug: `test-project-${Date.now()}`,
    title: 'Cinematic Mixed Media Campaign',
    titleAr: 'حملة سينمائية متعددة الوسائط',
    category: 'Motion Graphics',
    categories: ['Motion Graphics', 'Branding'],
    description: 'An advanced multi-media showcase featuring ordered images and videos.',
    descriptionAr: 'مشروع يعرض تسلسل وسائط متعددة من صور وفيديوهات.',
    client: 'Acme Motion Studios',
    projectDate: '2026',
    coverImage: '/uploads/1790361602345-New_logo_2x.png',
    mediaItems: [
      {
        id: 'med-item-1',
        type: 'image',
        url: '/uploads/1790361602345-New_logo_2x.png',
        title: 'Brand Mark Poster',
        sortOrder: 1,
      },
      {
        id: 'med-item-2',
        type: 'video',
        url: 'https://vimeo.com/76979871',
        title: 'Cinematic Teaser Reel',
        sortOrder: 2,
      },
      {
        id: 'med-item-3',
        type: 'image',
        url: '/uploads/1790361631974-UP_V1.1_copy.jpg',
        title: 'Key Visual Composition',
        sortOrder: 3,
      },
    ],
    tools: ['Adobe After Effects', 'Cinema 4D', 'Photoshop'],
    featured: true,
    sortOrder: 999,
    status: 'published',
  };

  const saveProjRes = await fetch(`${BASE_URL}/api/admin/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: loginCookies,
    },
    body: JSON.stringify(testProjectPayload),
  });
  assert.strictEqual(saveProjRes.status, 200, 'Save project should return 200');
  console.log('✔ Saved multi-media project with 3 ordered items (Image -> Video -> Image).');

  // Re-fetch project to verify multi-media persistence
  const verifyProjRes = await fetch(`${BASE_URL}/api/admin/data`, {
    headers: { cookie: loginCookies },
  });
  const verifyProjData = await verifyProjRes.json();
  const savedProj = verifyProjData.data.projects.find(p => p.id === testProjectId);
  assert.ok(savedProj, 'Saved project must persist');
  assert.ok(savedProj.mediaItems && savedProj.mediaItems.length === 3, 'Must have 3 mediaItems in sequence');
  assert.strictEqual(savedProj.mediaItems[0].type, 'image');
  assert.strictEqual(savedProj.mediaItems[1].type, 'video');
  assert.strictEqual(savedProj.mediaItems[2].type, 'image');
  console.log('✔ Multi-media sequence persisted correctly:');
  savedProj.mediaItems.forEach(m => console.log(`   - #${m.sortOrder} [${m.type.toUpperCase()}] ${m.title} (${m.url})`));

  // 5. Clean up test records
  console.log('\n5. Cleaning up test records (preserving real user data)...');
  await fetch(`${BASE_URL}/api/admin/skill-groups?id=${testSkillGroupId}`, {
    method: 'DELETE',
    headers: { cookie: loginCookies },
  });
  await fetch(`${BASE_URL}/api/admin/projects?id=${testProjectId}`, {
    method: 'DELETE',
    headers: { cookie: loginCookies },
  });
  console.log('✔ Cleaned up test records.');

  console.log('\n=== ALL END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
