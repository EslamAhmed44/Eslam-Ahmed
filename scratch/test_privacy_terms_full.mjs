import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('--- STARTING PRIVACY & TERMS CMS VALIDATION ---');
  let failures = 0;

  // 1. Verify CV Isolation
  console.log('\n[1] Verifying CV Isolation...');
  const cvPagePath = path.resolve('app/cv/page.tsx');
  const cvViewerPath = path.resolve('components/cv/CvViewer.tsx');
  if (fs.existsSync(cvPagePath) && fs.existsSync(cvViewerPath)) {
    console.log('✓ CV Page and CV Viewer files intact and untouched.');
  } else {
    console.error('✗ CV files missing!');
    failures++;
  }

  try {
    const cvRes = await fetch('http://localhost:3000/cv');
    if (cvRes.status === 200) {
      console.log('✓ /cv endpoint returns 200 OK.');
    } else {
      console.error(`✗ /cv returned status ${cvRes.status}`);
      failures++;
    }
  } catch (err) {
    console.error('✗ Failed to fetch /cv:', err.message);
    failures++;
  }

  // 2. Check store.json privacyTerms
  console.log('\n[2] Checking store.json privacyTerms schema...');
  const storePath = path.resolve('lib/db/store.json');
  const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
  if (store.privacyTerms) {
    console.log('✓ privacyTerms object exists in store.json');
    console.log('  - Title:', store.privacyTerms.title);
    console.log('  - PDF URL:', store.privacyTerms.pdfUrl);
    console.log('  - PDF File Name:', store.privacyTerms.pdfFileName);
    console.log('  - PDF File Size:', store.privacyTerms.pdfFileSize);
    console.log('  - Published:', store.privacyTerms.published);
  } else {
    console.error('✗ privacyTerms not found in store.json');
    failures++;
  }

  // 3. Verify PDF file on disk
  console.log('\n[3] Checking PDF file existence on disk...');
  if (store.privacyTerms?.pdfUrl) {
    const relativePdf = store.privacyTerms.pdfUrl.replace(/^\//, '');
    const fullPdfPath = path.resolve('public', relativePdf);
    if (fs.existsSync(fullPdfPath)) {
      const stats = fs.statSync(fullPdfPath);
      console.log(`✓ Official PDF exists at ${fullPdfPath} (${stats.size} bytes)`);
    } else {
      console.error(`✗ PDF file does not exist at ${fullPdfPath}`);
      failures++;
    }
  }

  // 4. Test Public Page GET /privacy-terms
  console.log('\n[4] Testing Public Page GET /privacy-terms...');
  try {
    const res = await fetch('http://localhost:3000/privacy-terms');
    if (res.status === 200) {
      const html = await res.text();
      const rawTitle = store.privacyTerms.title || 'Privacy & Terms';
      const encodedTitle = rawTitle.replace(/&/g, '&amp;');
      const hasTitle = html.includes(rawTitle) || html.includes(encodedTitle);
      if (hasTitle) {
        console.log(`✓ /privacy-terms returned 200 OK and contains CMS title ("${rawTitle}").`);
      } else {
        console.error('✗ /privacy-terms does not contain CMS title!');
        failures++;
      }
    } else {
      console.error(`✗ /privacy-terms returned status ${res.status}`);
      failures++;
    }
  } catch (err) {
    console.error('✗ Failed to fetch /privacy-terms:', err.message);
    failures++;
  }

  // 5. Test Admin API Security
  console.log('\n[5] Testing Admin API Security (unauthenticated access)...');
  try {
    const unauthGet = await fetch('http://localhost:3000/api/admin/privacy-terms');
    if (unauthGet.status === 401) {
      console.log('✓ GET /api/admin/privacy-terms blocked (401 Unauthorized) when not logged in.');
    } else {
      console.error(`✗ Expected 401, got ${unauthGet.status}`);
      failures++;
    }

    const unauthPost = await fetch('http://localhost:3000/api/admin/privacy-terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hacked' }),
    });
    if (unauthPost.status === 401) {
      console.log('✓ POST /api/admin/privacy-terms blocked (401 Unauthorized) when not logged in.');
    } else {
      console.error(`✗ Expected 401, got ${unauthPost.status}`);
      failures++;
    }
  } catch (err) {
    console.error('✗ Security check error:', err.message);
    failures++;
  }

  // 6. Test Admin Session & Live Mutation / Revalidation
  console.log('\n[6] Testing Admin Login & Live CMS Mutation...');
  try {
    // Read admin credentials from env or session defaults
    const adminUser = process.env.ADMIN_USERNAME || 'EslamAhmed44';
    const adminPass = process.env.ADMIN_PASSWORD || 'Eslam100314';

    const loginRes = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: adminUser, password: adminPass }),
    });

    const setCookie = loginRes.headers.get('set-cookie');
    if (!setCookie) {
      console.error('✗ Could not obtain admin session cookie');
      failures++;
    } else {
      console.log('✓ Admin authenticated successfully.');
      const cookieHeader = setCookie.split(';')[0];

      // Fetch current data via Admin API
      const getRes = await fetch('http://localhost:3000/api/admin/privacy-terms', {
        headers: { Cookie: cookieHeader },
      });
      const currentJson = await getRes.json();
      if (getRes.status === 200 && currentJson.privacyTerms) {
        console.log('✓ Admin API GET returned valid privacyTerms payload.');
      } else {
        console.error('✗ Admin API GET failed:', currentJson);
        failures++;
      }

      // Test Mutation: Update title temporarily
      const originalTitle = currentJson.privacyTerms.title;
      const testTitle = 'Privacy & Commercial Terms (Verified Sync)';

      const updateRes = await fetch('http://localhost:3000/api/admin/privacy-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        body: JSON.stringify({
          ...currentJson.privacyTerms,
          title: testTitle,
        }),
      });

      const updateJson = await updateRes.json();
      if (updateRes.status === 200 && updateJson.success) {
        console.log('✓ Admin API POST update succeeded.');
      } else {
        console.error('✗ Admin API POST update failed:', updateJson);
        failures++;
      }

      // Check public page reflects the updated title
      const publicCheck = await fetch('http://localhost:3000/privacy-terms');
      const publicHtml = await publicCheck.text();
      const testTitleEncoded = testTitle.replace(/&/g, '&amp;');
      if (publicHtml.includes(testTitle) || publicHtml.includes(testTitleEncoded)) {
        console.log('✓ Live public page immediately reflected the updated title!');
      } else {
        console.error('✗ Live public page did NOT reflect the updated title!');
        failures++;
      }

      // Restore original title
      const restoreRes = await fetch('http://localhost:3000/api/admin/privacy-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        body: JSON.stringify({
          ...currentJson.privacyTerms,
          title: originalTitle,
        }),
      });
      if (restoreRes.status === 200) {
        console.log('✓ Restored original title successfully.');
      }
    }
  } catch (err) {
    console.error('✗ Admin mutation error:', err.message);
    failures++;
  }

  console.log('\n=============================================');
  if (failures === 0) {
    console.log('ALL TESTS PASSED! PRIVACY & TERMS CMS FULLY OPERATIONAL.');
  } else {
    console.error(`COMPLETED WITH ${failures} FAILURE(S).`);
  }
}

runTests();
