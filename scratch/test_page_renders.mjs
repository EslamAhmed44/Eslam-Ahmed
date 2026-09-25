// scratch/test_page_renders.mjs
import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

async function testPageRenders() {
  console.log('Testing page routes and SSR outputs...\n');

  // 1. Home Page
  const homeRes = await fetch(`${BASE_URL}/`);
  assert.strictEqual(homeRes.status, 200);
  const homeHtml = await homeRes.text();
  assert.ok(homeHtml.includes('Islam Ahmed') || homeHtml.includes('Motion'), 'Home page renders designer name');
  console.log('✔ Home page (/) renders 200 OK.');

  // 2. Individual Project Slug (Uptown Labs)
  const slugRes = await fetch(`${BASE_URL}/projects/project-1790361143478`);
  assert.strictEqual(slugRes.status, 200);
  const slugHtml = await slugRes.text();
  assert.ok(slugHtml.includes('Uptown Labs'), 'Project slug page renders project title');
  console.log('✔ Project detail page (/projects/project-1790361143478) renders 200 OK.');

  // 3. Admin Authentication
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'EslamAhmed44',
      password: 'Eslam100314',
    }),
  });
  const cookies = loginRes.headers.get('set-cookie');
  assert.ok(cookies);

  // 4. Admin Dashboard
  const adminRes = await fetch(`${BASE_URL}/admin`, { headers: { cookie: cookies } });
  assert.strictEqual(adminRes.status, 200);
  console.log('✔ Admin dashboard (/admin) renders 200 OK.');

  // 5. Admin Projects
  const adminProjectsRes = await fetch(`${BASE_URL}/admin/projects`, { headers: { cookie: cookies } });
  assert.strictEqual(adminProjectsRes.status, 200);
  console.log('✔ Admin projects (/admin/projects) renders 200 OK.');

  // 6. Admin Skills
  const adminSkillsRes = await fetch(`${BASE_URL}/admin/skills`, { headers: { cookie: cookies } });
  assert.strictEqual(adminSkillsRes.status, 200);
  console.log('✔ Admin skills (/admin/skills) renders 200 OK.');

  console.log('\nAll SSR and API routes verified with 100% success!');
}

testPageRenders().catch(err => {
  console.error('Render test failed:', err);
  process.exit(1);
});
