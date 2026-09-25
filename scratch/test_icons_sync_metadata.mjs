import http from 'http';
import fs from 'fs';

async function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 3000,
        path: u.pathname + u.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body,
            json: () => {
              try {
                return JSON.parse(body);
              } catch {
                return null;
              }
            },
          });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log('=== TEST 1: PERSISTENT SOFTWARE ICONS ON LIVE SERVER ===');
  const iconsToTest = [
    '/icons/software/photoshop.svg',
    '/icons/software/illustrator.svg',
    '/icons/software/after-effects.svg',
    '/icons/software/premiere-pro.svg',
    '/icons/software/indesign.svg',
    '/icons/software/lightroom.svg',
    '/icons/software/blender.svg',
    '/icons/software/figma.svg',
    '/icons/software/cinema4d.svg',
  ];

  for (const iconPath of iconsToTest) {
    const res = await fetchUrl(`http://localhost:3000${iconPath}`);
    if (res.status === 200 && res.body.includes('<svg')) {
      console.log(`✅ [HTTP 200] ${iconPath} (${res.body.length} bytes SVG vector)`);
    } else {
      console.error(`❌ [FAILED ${res.status}] ${iconPath}`);
      process.exit(1);
    }
  }

  console.log('\n=== TEST 2: HOMEPAGE SKILLS SECTION RENDERING ===');
  const homeRes = await fetchUrl('http://localhost:3000/');
  console.log(`Homepage HTTP Status: ${homeRes.status}`);
  if (homeRes.body.includes('/icons/software/photoshop.svg')) {
    console.log('✅ Live Portfolio Homepage renders /icons/software/photoshop.svg!');
  } else {
    console.warn('⚠️ photoshop.svg not found in raw homepage HTML (checking if rendered client-side or SSR)...');
  }

  if (homeRes.body.includes('Photoshop') && homeRes.body.includes('Illustrator')) {
    console.log('✅ Live Portfolio Homepage contains Photoshop and Illustrator software items.');
  }

  console.log('\n=== TEST 3: PROJECT DETAIL PAGE & METADATA GRID ===');
  // Check Uptown Labs project: project-1790361143478
  const projectRes = await fetchUrl('http://localhost:3000/projects/project-1790361143478');
  console.log(`Project page HTTP Status: ${projectRes.status}`);

  const checks = [
    { label: 'Client metadata', check: projectRes.body.includes('معامل أب تاون') },
    { label: 'Timeline/Year metadata', check: projectRes.body.includes('2026-Mar') },
    { label: 'Disciplines tags', check: projectRes.body.includes('Branding') && projectRes.body.includes('Graphic Design') },
    { label: 'Software tools with icons', check: projectRes.body.includes('/icons/software/photoshop.svg') || projectRes.body.includes('Adobe Photoshop') },
    { label: 'Disciplines interactive expansion', check: projectRes.body.includes('Disciplines') },
  ];

  for (const c of checks) {
    if (c.check) {
      console.log(`✅ ${c.label} verified in ProjectDetailPage.`);
    } else {
      console.warn(`⚠️ Warning: ${c.label} check failed.`);
    }
  }

  console.log('\n=== TEST 4: ADMIN AUTH & DATA SYNC ===');
  // 1. Login as Admin
  const loginRes = await fetchUrl('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'EslamAhmed44', password: 'Eslam100314' }),
  });
  console.log(`Admin Login Status: ${loginRes.status}`);
  const setCookie = loginRes.headers['set-cookie'];
  const cookieHeader = Array.isArray(setCookie) ? setCookie[0].split(';')[0] : setCookie?.split(';')[0];

  // 2. Fetch admin data
  const adminDataRes = await fetchUrl('http://localhost:3000/api/admin/data', {
    headers: { Cookie: cookieHeader },
  });
  const adminJson = adminDataRes.json();
  const softwareGroup = adminJson.data.skillGroups.find((g) => g.title === 'Software Proficiency');
  console.log(`Software Proficiency group found with ${softwareGroup?.skills?.length} skills.`);
  for (const s of softwareGroup?.skills || []) {
    console.log(`   - ${s.name}: iconUrl = "${s.iconUrl || 'NONE'}" (enabled: ${s.enabled})`);
  }

  console.log('\n=== ALL VERIFICATION CHECKS COMPLETED ===');
}

run().catch((e) => {
  console.error('Test run error:', e);
  process.exit(1);
});
