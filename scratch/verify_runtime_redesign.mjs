import http from 'http';
import { spawn } from 'child_process';

async function checkUrl(port, path) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  const PORT = 3009;
  console.log('Starting next server on port', PORT);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: 'pipe',
    shell: true,
  });

  server.stdout.on('data', d => process.stdout.write(d));
  server.stderr.on('data', d => process.stderr.write(d));

  // Wait for server to be ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await checkUrl(PORT, '/');
      if (res.statusCode === 200) {
        ready = true;
        break;
      }
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (!ready) {
    console.error('Server failed to start in time');
    server.kill();
    process.exit(1);
  }

  console.log('--- Testing Homepage / ---');
  const home = await checkUrl(PORT, '/');
  console.log('Status:', home.statusCode);
  console.log('Has Islam Ahmed:', home.body.includes('Islam Ahmed'));
  console.log('Has Press Start:', home.body.includes('PRESS START'));
  console.log('Has View My Work:', home.body.includes('View My Work'));
  console.log('Has WhatsApp exact URL:', home.body.includes('phone=201092463750'));
  console.log('Has Gravity in Motion:', home.body.includes('GRAVITY IN MOTION'));
  console.log('Has Workflow:', home.body.includes('01 — Brief'));

  console.log('\n--- Testing CV /cv ---');
  const cv = await checkUrl(PORT, '/cv');
  console.log('Status:', cv.statusCode);

  console.log('\n--- Testing Privacy Terms /privacy-terms ---');
  const pt = await checkUrl(PORT, '/privacy-terms');
  console.log('Status:', pt.statusCode);

  console.log('\n--- Testing Project Detail /projects/dr-hazem-gastroenterology-campaign ---');
  const proj = await checkUrl(PORT, '/projects/dr-hazem-gastroenterology-campaign');
  console.log('Status:', proj.statusCode);

  console.log('\n--- Testing Admin Login /admin/login ---');
  const login = await checkUrl(PORT, '/admin/login');
  console.log('Status:', login.statusCode);

  server.kill('SIGINT');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

