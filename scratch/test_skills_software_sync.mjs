import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('=== STARTING ADMIN <-> LIVE SKILLS/SOFTWARE SYNC VERIFICATION ===\n');

  // Step 0. Admin Login
  console.log('--- Step 0: Admin Authentication ---');
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'EslamAhmed44', password: 'Eslam100314' }),
  });

  if (!loginRes.ok) {
    throw new Error(`Admin login failed: ${loginRes.status}`);
  }

  const setCookie = loginRes.headers.get('set-cookie');
  const cookieHeader = setCookie ? setCookie.split(';')[0] : '';
  console.log('Admin session authenticated successfully. Cookie obtained.\n');

  // Helper fetch with JSON and Auth
  async function fetchJson(url, options = {}) {
    const headers = {
      ...(options.headers || {}),
      Cookie: cookieHeader,
    };
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    try {
      return { ok: res.ok, status: res.status, data: JSON.parse(text) };
    } catch {
      return { ok: res.ok, status: res.status, raw: text };
    }
  }

  // 1. Initial Data Inspection
  console.log('--- Step 1: Inspect Canonical Data ---');
  const initial = await fetchJson(`${BASE_URL}/api/admin/data`);
  if (!initial.ok || !initial.data?.success) {
    throw new Error(`Failed to fetch admin data: ${initial.status}`);
  }

  const { projects, skillGroups } = initial.data.data;
  console.log(`Loaded ${projects.length} projects, ${skillGroups.length} skill groups.`);
  
  const swGroup = skillGroups.find(g => g.id === 'group-5' || /software/i.test(g.title));
  if (!swGroup) {
    throw new Error('Software proficiency group not found!');
  }
  console.log(`Found Software Group: "${swGroup.title}" with ${swGroup.skills.length} skills.`);
  swGroup.skills.forEach(s => console.log(`  - [${s.id}] ${s.name} (${s.iconUrl || 'no icon'})`));

  const targetProject = projects[0];
  console.log(`Target testing project: "${targetProject.title}" (slug: ${targetProject.slug}, id: ${targetProject.id})\n`);

  // Backup current state of target project and group-5 skills
  const origTools = [...(targetProject.tools || [])];
  const origSkillIds = [...(targetProject.skillIds || [])];
  const origSwSkills = [...swGroup.skills];

  try {
    // -------------------------------------------------------------
    // TEST 1: Admin Selects Photoshop + Illustrator -> Save -> Refresh -> Live Page
    // -------------------------------------------------------------
    console.log('--- TEST 1: Select Photoshop + Illustrator -> Verify Live Site ---');
    const psSkill = swGroup.skills.find(s => /photoshop/i.test(s.name));
    const aiSkill = swGroup.skills.find(s => /illustrator/i.test(s.name));
    if (!psSkill || !aiSkill) throw new Error('Photoshop or Illustrator not found in canonical skills');

    const updatePayload1 = {
      ...targetProject,
      tools: [psSkill.name, aiSkill.name],
      softwareUsed: [psSkill.name, aiSkill.name],
      skillIds: [psSkill.id, aiSkill.id],
    };

    const saveRes1 = await fetchJson(`${BASE_URL}/api/admin/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload1),
    });
    if (!saveRes1.ok) throw new Error(`Save project failed: ${saveRes1.status}`);
    console.log('Saved project with Photoshop & Illustrator.');

    // Refresh Admin check
    const refreshedAdmin1 = await fetchJson(`${BASE_URL}/api/admin/data`);
    const refreshedProj1 = refreshedAdmin1.data.data.projects.find(p => p.id === targetProject.id);
    console.log('Admin Refreshed Project Tools:', refreshedProj1.tools);
    console.log('Admin Refreshed Project SkillIds:', refreshedProj1.skillIds);
    console.log('Admin Refreshed ResolvedTools:', refreshedProj1.resolvedTools?.map(r => `${r.name} (${r.iconUrl})`));

    if (!refreshedProj1.skillIds?.includes(psSkill.id) || !refreshedProj1.skillIds?.includes(aiSkill.id)) {
      throw new Error('TEST 1 FAILED: SkillIds missing in Admin data after save');
    }

    // Live HTML check
    const livePageRes1 = await fetch(`${BASE_URL}/projects/${targetProject.slug}`);
    if (!livePageRes1.ok) throw new Error(`Live page returned ${livePageRes1.status}`);
    const liveHtml1 = await livePageRes1.text();

    const hasPsText = liveHtml1.includes('Photoshop');
    const hasAiText = liveHtml1.includes('Illustrator');
    const hasPsIcon = liveHtml1.includes('/icons/software/photoshop.svg');
    const hasAiIcon = liveHtml1.includes('/icons/software/illustrator.svg');

    console.log(`Live Page check:
      Photoshop text rendered: ${hasPsText}
      Illustrator text rendered: ${hasAiText}
      Photoshop SVG icon rendered: ${hasPsIcon}
      Illustrator SVG icon rendered: ${hasAiIcon}`);

    if (!hasPsText || !hasAiText || !hasPsIcon || !hasAiIcon) {
      throw new Error('TEST 1 FAILED: Live page did not render canonical Photoshop/Illustrator with icons');
    }
    console.log('>>> TEST 1 PASSED: Photoshop + Illustrator synchronized perfectly!\n');

    // -------------------------------------------------------------
    // TEST 2: Add Custom Software/Tool -> Assign to Project -> Verify Live
    // -------------------------------------------------------------
    console.log('--- TEST 2: Add Custom Software Tool -> Assign -> Verify Live ---');
    const customToolId = `s-custom-test-${Date.now()}`;
    const customTool = {
      id: customToolId,
      name: 'Unreal Engine 5',
      nameAr: 'أنريل إنجين 5',
      iconUrl: '/icons/software/unreal-engine.svg',
      enabled: true,
      sortOrder: swGroup.skills.length + 1,
    };

    const updatedGroup2 = {
      ...swGroup,
      skills: [...swGroup.skills, customTool],
    };

    const groupSaveRes2 = await fetchJson(`${BASE_URL}/api/admin/skill-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedGroup2),
    });
    if (!groupSaveRes2.ok) throw new Error(`Failed to save custom tool in skill group: ${groupSaveRes2.status}`);
    console.log('Added custom tool "Unreal Engine 5" to canonical skill group.');

    const updatePayload2 = {
      ...targetProject,
      tools: [psSkill.name, aiSkill.name, customTool.name],
      softwareUsed: [psSkill.name, aiSkill.name, customTool.name],
      skillIds: [psSkill.id, aiSkill.id, customTool.id],
    };

    const saveRes2 = await fetchJson(`${BASE_URL}/api/admin/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload2),
    });
    if (!saveRes2.ok) throw new Error(`Failed to save project with custom tool: ${saveRes2.status}`);

    // Live HTML check for Custom Tool
    const livePageRes2 = await fetch(`${BASE_URL}/projects/${targetProject.slug}`);
    const liveHtml2 = await livePageRes2.text();

    const hasCustomText = liveHtml2.includes('Unreal Engine 5');
    const hasCustomIcon = liveHtml2.includes('/icons/software/unreal-engine.svg');

    console.log(`Live Page check:
      Unreal Engine 5 text rendered: ${hasCustomText}
      Unreal Engine 5 icon rendered: ${hasCustomIcon}`);

    if (!hasCustomText || !hasCustomIcon) {
      throw new Error('TEST 2 FAILED: Live page did not render custom tool name or icon');
    }
    console.log('>>> TEST 2 PASSED: Custom software synchronized to Live successfully!\n');

    // -------------------------------------------------------------
    // TEST 3: Change Photoshop Icon -> Verify Live Reflects New Icon
    // -------------------------------------------------------------
    console.log('--- TEST 3: Update Photoshop Icon in Canonical Database -> Verify Live ---');
    const modifiedSkills = swGroup.skills.map(s => {
      if (s.id === psSkill.id) {
        return { ...s, iconUrl: '/icons/software/photoshop-updated-test.svg' };
      }
      return s;
    });

    const updatedGroup3 = {
      ...swGroup,
      skills: [...modifiedSkills, customTool],
    };

    await fetchJson(`${BASE_URL}/api/admin/skill-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedGroup3),
    });
    console.log('Updated Photoshop icon URL in canonical skills.');

    const livePageRes3 = await fetch(`${BASE_URL}/projects/${targetProject.slug}`);
    const liveHtml3 = await livePageRes3.text();
    const hasNewIcon = liveHtml3.includes('/icons/software/photoshop-updated-test.svg');

    console.log(`Live Page check:
      Photoshop updated icon rendered: ${hasNewIcon}`);

    if (!hasNewIcon) {
      throw new Error('TEST 3 FAILED: Live site did not reflect updated icon URL');
    }
    console.log('>>> TEST 3 PASSED: Dynamic icon update synchronized instantly!\n');

    // -------------------------------------------------------------
    // TEST 4: Remove Software from Project -> Verify Live
    // -------------------------------------------------------------
    console.log('--- TEST 4: Remove Custom Tool from Project -> Verify Live ---');
    const updatePayload4 = {
      ...targetProject,
      tools: [psSkill.name, aiSkill.name],
      softwareUsed: [psSkill.name, aiSkill.name],
      skillIds: [psSkill.id, aiSkill.id],
    };

    await fetchJson(`${BASE_URL}/api/admin/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload4),
    });

    const livePageRes4 = await fetch(`${BASE_URL}/projects/${targetProject.slug}`);
    const liveHtml4 = await livePageRes4.text();
    const hasCustomText4 = liveHtml4.includes('Unreal Engine 5');

    console.log(`Live Page check:
      Unreal Engine 5 present: ${hasCustomText4}`);

    if (hasCustomText4) {
      throw new Error('TEST 4 FAILED: Custom tool was not removed from live project page');
    }
    console.log('>>> TEST 4 PASSED: Deselection synchronized to Live properly!\n');

    // -------------------------------------------------------------
    // TEST 5: Add Blender and Figma to project
    // -------------------------------------------------------------
    console.log('--- TEST 5: Select Blender and Figma -> Verify Live ---');
    const blenderSkill = swGroup.skills.find(s => /blender/i.test(s.name));
    const figmaSkill = swGroup.skills.find(s => /figma/i.test(s.name));

    const updatePayload5 = {
      ...targetProject,
      tools: [psSkill.name, aiSkill.name, blenderSkill.name, figmaSkill.name],
      softwareUsed: [psSkill.name, aiSkill.name, blenderSkill.name, figmaSkill.name],
      skillIds: [psSkill.id, aiSkill.id, blenderSkill.id, figmaSkill.id],
    };

    await fetchJson(`${BASE_URL}/api/admin/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload5),
    });

    const livePageRes5 = await fetch(`${BASE_URL}/projects/${targetProject.slug}`);
    const liveHtml5 = await livePageRes5.text();

    const hasBlenderText = liveHtml5.includes('Blender');
    const hasBlenderIcon = liveHtml5.includes('/icons/software/blender.svg');
    const hasFigmaText = liveHtml5.includes('Figma');
    const hasFigmaIcon = liveHtml5.includes('/icons/software/figma.svg');

    console.log(`Live Page check:
      Blender text: ${hasBlenderText}, icon: ${hasBlenderIcon}
      Figma text: ${hasFigmaText}, icon: ${hasFigmaIcon}`);

    if (!hasBlenderText || !hasBlenderIcon || !hasFigmaText || !hasFigmaIcon) {
      throw new Error('TEST 5 FAILED: Blender and Figma not rendered on live page');
    }
    console.log('>>> TEST 5 PASSED: Multi-tool selection with icons confirmed!\n');

  } finally {
    // CLEANUP / RESTORE CANONICAL STATE
    console.log('--- Restoring original canonical project & skills data ---');
    // Restore group-5 skills
    await fetchJson(`${BASE_URL}/api/admin/skill-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...swGroup,
        skills: origSwSkills,
      }),
    });

    // Restore target project
    await fetchJson(`${BASE_URL}/api/admin/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...targetProject,
        tools: origTools,
        softwareUsed: origTools,
        skillIds: origSkillIds,
      }),
    });
    console.log('Cleanup complete.\n');
  }

  console.log('=============================================================');
  console.log('ALL SYNCHRONIZATION TESTS PASSED SUCCESSFULLY (100%)');
  console.log('=============================================================');
}

runTests().catch(err => {
  console.error('\n*** TEST FAILED ***\n', err);
  process.exit(1);
});
