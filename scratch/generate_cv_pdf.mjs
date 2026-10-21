import fs from 'fs';
import path from 'path';

// Generate a valid, clean, well-typeset PDF for Islam Ahmed's CV
function generateCvPdf() {
  const content = `
q
0.03 0.05 0.08 rg
0 0 595.28 841.89 re
f
Q

q
0.06 0.08 0.11 rg
24 24 547.28 793.89 re
f
Q

q
0.96 0.62 0.07 RG
1.5 w
24 24 547.28 793.89 re
S
Q

BT
/F2 26 Tf
0.96 0.62 0.07 rg
50 770 Td
(ISLAM AHMED) Tj
ET

BT
/F1 12 Tf
0.94 0.95 0.96 rg
50 748 Td
(Senior Graphic & Motion Graphic Designer) Tj
ET

BT
/F1 9 Tf
0.58 0.64 0.72 rg
50 730 Td
(Cairo, Egypt  |  +20 109 246 3750  |  smsma4140@gmail.com  |  linkedin.com/in/eslam-ahmed) Tj
ET

q
0.96 0.62 0.07 RG
0.8 w
50 716 m 545 716 l S
Q

BT
/F2 13 Tf
0.96 0.62 0.07 rg
50 694 Td
(PROFESSIONAL SUMMARY) Tj
ET

BT
/F1 9.5 Tf
0.85 0.88 0.92 rg
50 676 Td
(Multidisciplinary creative visual engineer specializing in cinematic motion graphics, kinetic typography,) Tj
0 -14 Td
(and luxury brand identities. Dedicated to orchestrating dynamic visuals that blur the boundary between) Tj
0 -14 Td
(graphic clarity and cinematic emotion to drive deep audience engagement and brand authority.) Tj
ET

BT
/F2 13 Tf
0.96 0.62 0.07 rg
50 622 Td
(SOFTWARE PROFICIENCY & CORE TOOLS) Tj
ET

BT
/F1 9 Tf
0.85 0.88 0.92 rg
50 604 Td
(  - Motion Graphics & Video: Adobe After Effects, Premiere Pro, DaVinci Resolve) Tj
0 -14 Td
(  - 3D & Visual Storytelling: Cinema 4D, Blender) Tj
0 -14 Td
(  - Graphic Design & Brand Identity: Adobe Photoshop, Illustrator, InDesign, Figma, Canva) Tj
ET

BT
/F2 13 Tf
0.96 0.62 0.07 rg
50 546 Td
(SELECTED COMMERCIAL PROJECTS) Tj
ET

BT
/F2 10.5 Tf
0.94 0.95 0.96 rg
50 528 Td
(Uptown Labs (Maamel Uptown) - Comprehensive Visual Identity & Social Presence) Tj
ET
BT
/F1 8.5 Tf
0.58 0.64 0.72 rg
50 514 Td
(Role: Lead Brand & Motion Designer  |  March 2026) Tj
ET
BT
/F1 9 Tf
0.82 0.85 0.90 rg
50 500 Td
(  - Engineered the full visual identity adhering to Canadian quality standards in healthcare.) Tj
0 -13 Td
(  - Created modern typography, corporate color palette, Facebook campaign branding, and reports.) Tj
ET

BT
/F2 10.5 Tf
0.94 0.95 0.96 rg
50 464 Td
(Dr. Hazem Mahmoud Clinic - Gastroenterology Awareness Campaign) Tj
ET
BT
/F1 8.5 Tf
0.58 0.64 0.72 rg
50 450 Td
(Role: Creative Designer  |  February 2026) Tj
ET
BT
/F1 9 Tf
0.82 0.85 0.90 rg
50 436 Td
(  - Formulated patient-centered digital health campaigns and educational social media carousels.) Tj
0 -13 Td
(  - Elevated patient trust and engagement through clean medical aesthetics and clear layouts.) Tj
ET

BT
/F2 13 Tf
0.96 0.62 0.07 rg
50 394 Td
(CORE COMPETENCIES) Tj
ET

BT
/F1 9 Tf
0.85 0.88 0.92 rg
50 376 Td
(  - Cinematic Motion Graphics & Kinetic Typography) Tj
0 -14 Td
(  - Brand Identity Development, Color Architecture & Design Systems) Tj
0 -14 Td
(  - Social Media Advertising & Promotional Video Campaigns) Tj
0 -14 Td
(  - Cross-platform Visual Consistency & High-Resolution Asset Production) Tj
ET

BT
/F2 13 Tf
0.96 0.62 0.07 rg
50 304 Td
(LANGUAGES) Tj
ET

BT
/F1 9 Tf
0.85 0.88 0.92 rg
50 286 Td
(  - Arabic: Native) Tj
0 -14 Td
(  - English: Professional Working Proficiency) Tj
ET

q
0.96 0.62 0.07 RG
0.5 w
50 110 m 545 110 l S
Q

BT
/F1 8 Tf
0.58 0.64 0.72 rg
50 90 Td
(Interactive Portfolio: http://localhost:3000  |  Verified Curriculum Vitae - Islam Ahmed) Tj
ET
`;

  const stream = Buffer.from(content.trim(), 'utf-8');
  const streamLength = stream.length;

  const objects = [];
  
  // 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  
  // 2: Pages
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  
  // 3: Page
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n'
  );

  // 4: Contents Stream
  objects.push(
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${content.trim()}\nendstream\nendobj\n`
  );

  // 5: Font F1 (Helvetica)
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  // 6: Font F2 (Helvetica-Bold)
  objects.push('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');

  // Construct PDF buffer
  let pdf = '%PDF-1.4\n';
  const offsets = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, 'utf-8'));
    pdf += objects[i];
  }

  const startXref = Buffer.byteLength(pdf, 'utf-8');
  pdf += 'xref\n';
  pdf += `0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 0; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += 'trailer\n';
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += 'startxref\n';
  pdf += `${startXref}\n`;
  pdf += '%%EOF\n';

  const targetPath = path.join(process.cwd(), 'public', 'cv', 'Islam_Ahmed_CV.pdf');
  fs.writeFileSync(targetPath, pdf, 'utf-8');
  console.log(`Generated CV PDF successfully at ${targetPath} (${Buffer.byteLength(pdf, 'utf-8')} bytes)`);
}

generateCvPdf();
