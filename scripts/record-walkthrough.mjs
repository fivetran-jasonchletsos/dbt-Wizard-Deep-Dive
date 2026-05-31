// Records a ~90s walkthrough of the live dbt Wizard Deep Dive demo.
// Output: public/video/demo.mp4
//
// Usage: node scripts/record-walkthrough.mjs [--local]
//   --local  records against http://localhost:4173 (vite preview) instead of prod
//
// Requirements: playwright, ffmpeg on PATH. The app uses HashRouter, so segment
// paths are hash routes (e.g. '/#/p/overview').

import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const outFile = resolve(repoRoot, 'public/video/demo.mp4');

const useLocal = process.argv.includes('--local');
const base = useLocal
  ? 'http://localhost:4173/dbt-Wizard-Deep-Dive'
  : 'https://fivetran-jasonchletsos.github.io/dbt-Wizard-Deep-Dive';

const VIEWPORT = { width: 1440, height: 900 };

// Representative tour: thesis -> HOL map -> a scenario -> the architecture story
// -> the tool layer -> validation. Keeps the reel near 90s and self-explanatory.
const SEGMENTS = [
  { path: '/#/',                       dwellMs: 6000, scrollMs: 7000 },
  { path: '/#/p/overview',             dwellMs: 6000, scrollMs: 8000 },
  { path: '/#/p/hol-functionality-map', dwellMs: 6000, scrollMs: 8000 },
  { path: '/#/p/scenario-onboarding',  dwellMs: 6000, scrollMs: 8000 },
  { path: '/#/p/agent-architecture',   dwellMs: 6000, scrollMs: 8000 },
  { path: '/#/p/mcp-tool-reference',   dwellMs: 6000, scrollMs: 8000 },
  { path: '/#/p/validation-pipeline',  dwellMs: 6000, scrollMs: 8000 },
];

async function recordSegments() {
  const workDir = mkdtempSync(join(tmpdir(), 'dwdd-record-'));
  console.log('[record] work dir:', workDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: workDir, size: VIEWPORT },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // First load: full navigation so the SPA bundle boots.
  await page.goto(`${base}/#/`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(1500);

  for (const seg of SEGMENTS) {
    const url = `${base}${seg.path}`;
    console.log('[record] ->', url);
    // Hash navigations are same-document; set the location and let HashRouter render.
    await page.evaluate((u) => { window.location.href = u; }, url);
    await page.waitForTimeout(1500);
    // Snap to top so each segment starts at the headline.
    await page.evaluate(() => window.scrollTo(0, 0));

    const h1 = await page.locator('h1').first().textContent().catch(() => '');
    console.log('[record]   caption:', (h1 || '').trim().replace(/\s+/g, ' ').slice(0, 120));

    await page.waitForTimeout(seg.dwellMs);

    await page.evaluate((ms) => new Promise((res) => {
      const start = performance.now();
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      function tick(now) {
        const t = Math.min(1, (now - start) / ms);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        window.scrollTo(0, max * eased);
        if (t < 1) requestAnimationFrame(tick);
        else res();
      }
      requestAnimationFrame(tick);
    }), seg.scrollMs);

    await page.waitForTimeout(800);
  }

  await context.close();
  await browser.close();

  const webms = readdirSync(workDir).filter((f) => f.endsWith('.webm')).map((f) => join(workDir, f));
  if (webms.length === 0) throw new Error('no .webm produced');
  const inputWebm = webms[0];
  console.log('[record] captured:', inputWebm);

  mkdirSync(dirname(outFile), { recursive: true });
  if (existsSync(outFile)) rmSync(outFile);

  const cmd = [
    'ffmpeg', '-y',
    '-i', `"${inputWebm}"`,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'high',
    '-preset', 'medium',
    '-crf', '22',
    '-movflags', '+faststart',
    '-an',
    `"${outFile}"`,
  ].join(' ');
  console.log('[ffmpeg]', cmd);
  execSync(cmd, { stdio: 'inherit' });

  console.log('[done] wrote', outFile);
  rmSync(workDir, { recursive: true, force: true });
}

recordSegments().catch((err) => {
  console.error(err);
  process.exit(1);
});
