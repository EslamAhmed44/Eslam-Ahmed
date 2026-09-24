#!/usr/bin/env node

/**
 * Robust Local Development Server Launcher for Islam Ahmed Portfolio
 * Handles port conflicts, stale orphaned processes, .next cache cleaning,
 * and reliable localhost:3000 binding across Antigravity IDE restarts.
 */

const { spawn, execSync } = require('child_process');
const http = require('http');
const net = require('net');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const isClean = args.includes('--clean') || args.includes('-c');
const portArgIdx = args.findIndex((a) => a === '-p' || a === '--port');
const PORT = portArgIdx !== -1 && args[portArgIdx + 1] ? parseInt(args[portArgIdx + 1], 10) : parseInt(process.env.PORT || '3000', 10);
const HOSTNAME = '0.0.0.0'; // Binds to all interfaces so localhost, 127.0.0.1, and ::1 all work seamlessly

console.log('\n============================================================');
console.log(' ISLAM AHMED PORTFOLIO — STARTING LOCAL DEVELOPMENT');
console.log(` Mode:    ${isClean ? 'Clean Recovery (--clean)' : 'Standard Development'}`);
console.log(` Target:  http://localhost:${PORT}`);
console.log('============================================================\n');

/**
 * Check if a port is currently open and accepting connections
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    tester.once('listening', () => {
      tester.close(() => resolve(false));
    });
    tester.listen(port, HOSTNAME);
  });
}

/**
 * Check if an HTTP server on the port is already responding healthy
 */
function checkServerHealth(port, timeoutMs = 1200) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        host: '127.0.0.1',
        port,
        path: '/',
        timeout: timeoutMs,
      },
      (res) => {
        resolve(res.statusCode && res.statusCode >= 200 && res.statusCode < 500);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Find PIDs listening on the specified port
 */
function getPidsOnPort(port) {
  const pids = new Set();
  try {
    if (process.platform === 'win32') {
      const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes(`:${port}`) && line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parseInt(parts[parts.length - 1], 10);
          if (pid && pid !== process.pid) {
            pids.add(pid);
          }
        }
      }
    } else {
      const output = execSync(`lsof -ti :${port}`, { encoding: 'utf8' });
      output
        .trim()
        .split('\n')
        .forEach((line) => {
          const pid = parseInt(line.trim(), 10);
          if (pid && pid !== process.pid) pids.add(pid);
        });
    }
  } catch {
    // Port not in use or command returned non-zero
  }
  return Array.from(pids);
}

/**
 * Safely kill a process by PID
 */
function killPid(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
    } else {
      process.kill(pid, 'SIGKILL');
    }
  } catch {
    // Already exited
  }
}

/**
 * Wait until port is free
 */
async function waitForPortFree(port, maxWaitMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const inUse = await isPortInUse(port);
    if (!inUse) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

/**
 * Poll until the dev server is ready and responsive
 */
async function monitorReadiness(port, maxWaitMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const isHealthy = await checkServerHealth(port, 800);
    if (isHealthy) {
      console.log('\n============================================================');
      console.log(' \x1b[32m✔ LOCALHOST DEVELOPMENT SERVER IS READY & ACTIVE\x1b[0m');
      console.log(` • Portfolio Homepage: \x1b[36mhttp://localhost:${port}\x1b[0m`);
      console.log(` • Admin Dashboard:    \x1b[36mhttp://localhost:${port}/admin\x1b[0m`);
      console.log(` • Projects Section:   \x1b[36mhttp://localhost:${port}/#projects\x1b[0m`);
      console.log('============================================================\n');
      return true;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

async function main() {
  const inUse = await isPortInUse(PORT);

  if (inUse) {
    const pids = getPidsOnPort(PORT);
    console.log(`[dev] Port ${PORT} is occupied by process (PID: ${pids.join(', ') || 'unknown'}).`);

    if (isClean) {
      console.log(`[dev] Clean mode: terminating existing process on port ${PORT}...`);
      pids.forEach(killPid);
      await waitForPortFree(PORT);
    } else {
      // Check if it's already responsive and healthy
      const isHealthy = await checkServerHealth(PORT);
      if (isHealthy) {
        console.log(`[dev] Server is already running and healthy on http://localhost:${PORT}!`);
        console.log('[dev] Terminating previous process to ensure fresh, in-terminal live session...');
        pids.forEach(killPid);
        await waitForPortFree(PORT);
      } else {
        console.log(`[dev] Port ${PORT} was held by an unresponsive/stale process. Releasing port...`);
        pids.forEach(killPid);
        await waitForPortFree(PORT);
      }
    }
  }

  // Handle Clean Recovery (.next cache removal only)
  if (isClean) {
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      console.log('[dev] Safely clearing .next temporary cache and build artifacts...');
      try {
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log('[dev] ✔ .next cache cleared successfully.');
      } catch (err) {
        console.warn('[dev] Note: could not remove some cache files:', err.message);
      }
    }
  }

  // Resolve Next.js binary
  let nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  if (!fs.existsSync(nextBin)) {
    try {
      nextBin = require.resolve('next/dist/bin/next');
    } catch {
      nextBin = 'next';
    }
  }

  console.log(`[dev] Launching Next.js Turbopack on http://localhost:${PORT}...\n`);

  // Spawn Next.js
  const devProcess = spawn(
    process.execPath,
    [nextBin, 'dev', '-p', String(PORT), '-H', HOSTNAME],
    {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: String(PORT),
      },
    }
  );

  // Background readiness notification
  monitorReadiness(PORT).catch(() => {});

  // Clean shutdown handlers
  const cleanup = () => {
    if (!devProcess.killed) {
      devProcess.kill('SIGINT');
      setTimeout(() => {
        try {
          devProcess.kill('SIGTERM');
        } catch {}
      }, 500);
    }
  };

  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });

  devProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error('[dev] Startup error:', err);
  process.exit(1);
});
