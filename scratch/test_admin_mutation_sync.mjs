import http from 'http';

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
  console.log('=== ADMIN ↔ LIVE SYNCHRONIZATION MUTATION TEST ===');

  // 1. Login
  const loginRes = await fetchUrl('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'EslamAhmed44', password: 'Eslam100314' }),
  });
  if (loginRes.status !== 200) {
    throw new Error('Admin login failed: ' + loginRes.body);
  }
  const setCookie = loginRes.headers['set-cookie'];
  const cookieHeader = Array.isArray(setCookie) ? setCookie[0].split(';')[0] : setCookie?.split(';')[0];
  console.log('✅ Admin session authenticated successfully.');

  // 2. Fetch current skill groups
  const dataRes = await fetchUrl('http://localhost:3000/api/admin/data', {
    headers: { Cookie: cookieHeader },
  });
  const currentGroups = dataRes.json().data.skillGroups;
  const softGroup = currentGroups.find((g) => g.title === 'Software Proficiency');
  if (!softGroup) {
    throw new Error('Software Proficiency group not found');
  }
  const originalSkills = [...softGroup.skills];
  console.log(`Original skills count in Software Proficiency: ${originalSkills.length}`);

  // 3. Add a new software tool "Cinema 4D" via Admin API
  const testSkill = {
    id: `s-test-${Date.now()}`,
    name: 'Cinema 4D',
    iconUrl: '/icons/software/cinema4d.svg',
    sortOrder: originalSkills.length + 1,
    enabled: true,
  };

  const updatedGroup = {
    ...softGroup,
    skills: [...originalSkills, testSkill],
  };

  console.log('Saving updated skill group with new skill Cinema 4D...');
  const saveRes = await fetchUrl('http://localhost:3000/api/admin/skill-groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify(updatedGroup),
  });

  if (saveRes.status !== 200) {
    throw new Error('Failed to save skill group: ' + saveRes.body);
  }
  console.log('✅ Admin API returned success: true.');

  // 4. Verify in Admin Data
  const verifyAdminRes = await fetchUrl('http://localhost:3000/api/admin/data', {
    headers: { Cookie: cookieHeader },
  });
  const verifyGroups = verifyAdminRes.json().data.skillGroups;
  const verifySoft = verifyGroups.find((g) => g.title === 'Software Proficiency');
  const foundInAdmin = verifySoft.skills.find((s) => s.id === testSkill.id);
  if (!foundInAdmin || foundInAdmin.iconUrl !== '/icons/software/cinema4d.svg') {
    throw new Error('Test skill not found or icon missing in Admin Data!');
  }
  console.log('✅ Verified in Admin Data: Cinema 4D present with persistent iconUrl: /icons/software/cinema4d.svg');

  // 5. Verify on Live Portfolio Homepage
  const liveHomeRes = await fetchUrl('http://localhost:3000/');
  if (liveHomeRes.body.includes('Cinema 4D') && liveHomeRes.body.includes('/icons/software/cinema4d.svg')) {
    console.log('✅ Live Portfolio Homepage immediately displays new skill "Cinema 4D" and its persistent icon!');
  } else {
    throw new Error('New skill did not synchronize to Live Homepage!');
  }

  // 6. Test Visibility Toggle (disable Cinema 4D)
  console.log('Testing visibility toggle (setting Cinema 4D enabled = false)...');
  const disabledGroup = {
    ...softGroup,
    skills: [...originalSkills, { ...testSkill, enabled: false }],
  };
  await fetchUrl('http://localhost:3000/api/admin/skill-groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify(disabledGroup),
  });

  const liveHomeAfterDisable = await fetchUrl('http://localhost:3000/');
  if (!liveHomeAfterDisable.body.includes('Cinema 4D')) {
    console.log('✅ Disabled skill is cleanly filtered out from Live Portfolio Homepage!');
  } else {
    throw new Error('Disabled skill still appeared on Live Homepage!');
  }

  // 7. Clean up: Revert to exact original skills
  console.log('Reverting skill group to original state...');
  const revertGroup = {
    ...softGroup,
    skills: originalSkills,
  };
  await fetchUrl('http://localhost:3000/api/admin/skill-groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify(revertGroup),
  });

  const finalCheckRes = await fetchUrl('http://localhost:3000/api/admin/data', {
    headers: { Cookie: cookieHeader },
  });
  const finalSkills = finalCheckRes.json().data.skillGroups.find((g) => g.title === 'Software Proficiency').skills;
  if (finalSkills.length === originalSkills.length) {
    console.log(`✅ Cleanly reverted: Software Proficiency has exactly ${finalSkills.length} original skills.`);
  }

  console.log('\n🎉 ALL ADMIN ↔ LIVE SYNCHRONIZATION TESTS PASSED PERFECTLY!');
}

run().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
