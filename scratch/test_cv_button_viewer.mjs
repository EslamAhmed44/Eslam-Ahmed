const BASE_URL = 'http://localhost:3000';

async function testCvFlow() {
  console.log('=== CV BUTTON & WEB PDF VIEWER VERIFICATION ===\n');

  // 1. Homepage Verification
  console.log('--- 1. Testing Homepage Navbar ---');
  const homeRes = await fetch(`${BASE_URL}/`);
  if (!homeRes.ok) {
    throw new Error(`Homepage returned HTTP ${homeRes.status}`);
  }
  const homeHtml = await homeRes.text();

  const hasViewCv = homeHtml.includes('View CV') || homeHtml.includes('عرض السيرة الذاتية');
  const hasDownloadCvInNavbar = homeHtml.includes('download="') || homeHtml.includes('download>');
  const linksToCvRoute = homeHtml.includes('href="/cv"');
  const hasPrivacyTerms =
    homeHtml.includes('Privacy &amp; Terms') ||
    homeHtml.includes('Privacy & Terms') ||
    homeHtml.includes('الخصوصية والشروط');

  console.log(`- Button displays "View CV": ${hasViewCv}`);
  console.log(`- Automatic download attribute removed from navbar: ${!hasDownloadCvInNavbar}`);
  console.log(`- Links to dedicated "/cv" page: ${linksToCvRoute}`);
  console.log(`- Privacy & Terms button intact: ${hasPrivacyTerms}`);

  if (!hasViewCv || hasDownloadCvInNavbar || !linksToCvRoute || !hasPrivacyTerms) {
    throw new Error('Homepage Navbar verification failed!');
  }
  console.log('>>> Homepage Navbar: PASSED (100%)\n');

  // 2. /cv Viewer Page Verification
  console.log('--- 2. Testing Dedicated /cv Viewer Route ---');
  const cvRes = await fetch(`${BASE_URL}/cv`);
  if (!cvRes.ok) {
    throw new Error(`/cv returned HTTP ${cvRes.status}`);
  }
  const cvHtml = await cvRes.text();

  const hasCvTitle = cvHtml.includes('Curriculum Vitae') || cvHtml.includes('Islam Ahmed');
  const hasBackToPortfolio = cvHtml.includes('Back to Portfolio') || cvHtml.includes('العودة للموقع');
  const hasPdfEmbed = cvHtml.includes('/cv/Islam_Ahmed_CV.pdf');
  const hasSecondaryDownload = cvHtml.includes('download="Islam_Ahmed_CV.pdf"');
  const hasZoomControls = cvHtml.includes('Zoom') || cvHtml.includes('100%');

  console.log(`- Document header rendered: ${hasCvTitle}`);
  console.log(`- Back to Portfolio link: ${hasBackToPortfolio}`);
  console.log(`- Real PDF embedded (iframe/object): ${hasPdfEmbed}`);
  console.log(`- Secondary explicit Download button inside viewer: ${hasSecondaryDownload}`);
  console.log(`- Zoom controls present: ${hasZoomControls}`);

  if (!hasCvTitle || !hasBackToPortfolio || !hasPdfEmbed || !hasSecondaryDownload) {
    throw new Error('/cv Viewer route verification failed!');
  }
  console.log('>>> /cv Viewer Route: PASSED (100%)\n');

  // 3. Static PDF Asset Verification
  console.log('--- 3. Testing PDF Asset Access ---');
  const pdfRes = await fetch(`${BASE_URL}/cv/Islam_Ahmed_CV.pdf`);
  if (!pdfRes.ok) {
    throw new Error(`PDF asset returned HTTP ${pdfRes.status}`);
  }
  const contentType = pdfRes.headers.get('content-type');
  const buffer = await pdfRes.arrayBuffer();
  console.log(`- PDF HTTP Status: ${pdfRes.status}`);
  console.log(`- Content-Type: ${contentType}`);
  console.log(`- File Size: ${buffer.byteLength} bytes`);

  if (!contentType?.includes('application/pdf')) {
    throw new Error('PDF asset Content-Type is not application/pdf!');
  }
  console.log('>>> PDF Asset: PASSED (100%)\n');

  console.log('====================================================');
  console.log('ALL CV BUTTON & VIEWER TESTS PASSED SUCCESSFULLY (100%)');
  console.log('====================================================');
}

testCvFlow().catch((err) => {
  console.error('\n*** TEST FAILED ***\n', err);
  process.exit(1);
});
