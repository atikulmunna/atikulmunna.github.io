const { spawn } = require('child_process');
const http = require('http');
const { chromium } = require('@playwright/test');

const PORT = 4273;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const THRESHOLDS = {
  loadMs: 3000,
  fcpMs: 2500,
  cls: 0.1
};

function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const ping = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve();
        } else if (Date.now() - start > timeoutMs) {
          reject(new Error('Server did not become ready in time.'));
        } else {
          setTimeout(ping, 250);
        }
      });

      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Server did not become ready in time.'));
        } else {
          setTimeout(ping, 250);
        }
      });
    };

    ping();
  });
}

async function collectMetrics(page, url) {
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    return {
      loadMs: nav ? nav.domContentLoadedEventEnd : 0,
      fcpMs: fcp ? fcp.startTime : 0,
      cls: window.__cls || 0
    };
  });
}

async function runAudit() {
  const server =
    process.platform === 'win32'
      ? spawn('cmd.exe', ['/d', '/s', '/c', `npx http-server . -p ${PORT} -c-1 -s`], {
          stdio: 'ignore'
        })
      : spawn('npx', ['http-server', '.', '-p', String(PORT), '-c-1', '-s'], {
          stdio: 'ignore'
        });

  try {
    await waitForServer(BASE_URL);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__cls += entry.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    // Warm-up run, then measure steady-state across multiple navigations.
    await collectMetrics(page, BASE_URL);

    const runs = [];
    for (let i = 0; i < 3; i += 1) {
      runs.push(await collectMetrics(page, BASE_URL));
    }

    const metrics = {
      loadMs: runs.reduce((sum, r) => sum + r.loadMs, 0) / runs.length,
      fcpMs: runs.reduce((sum, r) => sum + r.fcpMs, 0) / runs.length,
      cls: Math.max(...runs.map((r) => r.cls))
    };

    await browser.close();

    console.log(`Performance metrics: load=${metrics.loadMs.toFixed(0)}ms, fcp=${metrics.fcpMs.toFixed(0)}ms, cls=${metrics.cls.toFixed(3)}`);

    const failures = [];
    if (metrics.loadMs > THRESHOLDS.loadMs) failures.push(`Load time ${metrics.loadMs.toFixed(0)}ms > ${THRESHOLDS.loadMs}ms`);
    if (metrics.fcpMs > THRESHOLDS.fcpMs) failures.push(`FCP ${metrics.fcpMs.toFixed(0)}ms > ${THRESHOLDS.fcpMs}ms`);
    if (metrics.cls > THRESHOLDS.cls) failures.push(`CLS ${metrics.cls.toFixed(3)} > ${THRESHOLDS.cls}`);

    if (failures.length) {
      failures.forEach((f) => console.error(f));
      process.exitCode = 1;
    }
  } finally {
    server.kill();
  }
}

runAudit().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
