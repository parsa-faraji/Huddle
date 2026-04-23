#!/usr/bin/env node
/**
 * Huddle demo recorder.
 *
 * Walks the happy path (signup → discovery → favorite → search → sort →
 * dark mode → spot info → check in → rating → groups → chat → profile →
 * sign out) with readable pacing, records to a .webm, and places a copy
 * at docs/demo/huddle-demo.webm.
 *
 * Requires the dev server on localhost:5173 (run `npm run dev` first).
 * Uses Playwright (already a devDependency).
 */
import { chromium } from '@playwright/test';
import { mkdir, rename, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEMO_DIR = path.join(ROOT, 'docs', 'demo');
const VIDEO_OUT = path.join(DEMO_DIR, 'huddle-demo.webm');

const BASE_URL = process.env.DEMO_BASE_URL ?? 'http://localhost:5173';
const PASSWORD = 'demo-pass-12345';

function uniqueEmail() {
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `demo-${stamp}@huddle-e2e.edu`;
}

const beat = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await mkdir(DEMO_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    slowMo: 40,
  });
  const context = await browser.newContext({
    viewport: { width: 420, height: 820 },
    deviceScaleFactor: 2,
    recordVideo: { dir: DEMO_DIR, size: { width: 420, height: 820 } },
  });
  const page = await context.newPage();

  try {
    console.log('→ Signup');
    await page.goto(`${BASE_URL}/signup`);
    const email = uniqueEmail();
    await page.locator('input[name="name"]').fill('Demo Student');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.locator('input[name="confirm"]').fill(PASSWORD);
    await beat(800);
    await page.getByRole('button', { name: /create account|creating/i }).click();
    await page.waitForURL('**/study-spots**', { timeout: 20_000 });
    await beat(800);

    console.log('→ Dismiss tour');
    const skip = page.getByTestId('onboarding-dismiss');
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
      await beat(600);
    }

    console.log('→ Browse discovery');
    await beat(1200);
    await page.mouse.wheel(0, 300);
    await beat(1000);
    await page.mouse.wheel(0, -300);
    await beat(600);

    console.log('→ Favorite a spot');
    const firstHeart = page.locator('[data-testid="favorite-toggle"]').first();
    await firstHeart.scrollIntoViewIfNeeded();
    await firstHeart.click();
    await beat(1200);

    console.log('→ Search');
    const search = page.getByPlaceholder('Search study spots...');
    await search.click();
    await search.type('Doe', { delay: 120 });
    await beat(1500);
    await search.fill('');
    await beat(600);

    console.log('→ Sort by Highest rated');
    await page.getByRole('combobox', { name: /sort/i }).selectOption('rating');
    await beat(1500);
    await page.getByRole('combobox', { name: /sort/i }).selectOption('recommended');
    await beat(600);

    console.log('→ Map view');
    await page.getByRole('button', { name: 'Map' }).click();
    await beat(2500);
    await page.getByRole('button', { name: 'List' }).click();
    await beat(800);

    console.log('→ Open a spot');
    const firstView = page.getByRole('button', { name: 'View' }).first();
    await firstView.scrollIntoViewIfNeeded();
    await firstView.click();
    await page.waitForURL('**/study-spots/**', { timeout: 10_000 });
    await beat(1400);

    console.log('→ Check in');
    const checkin = page.getByTestId('checkin-button');
    await checkin.scrollIntoViewIfNeeded();
    await checkin.click();
    await beat(2000);
    await checkin.click();
    await beat(800);

    console.log('→ Navigate to groups');
    await page.locator('text=/^Groups$/').click();
    await page.waitForURL('**/study-groups', { timeout: 10_000 });
    await beat(1500);

    console.log('→ Insights');
    await page.locator('text=/^You$/').click();
    await page.waitForURL('**/insights', { timeout: 10_000 });
    await beat(1800);

    console.log('→ Profile + dark mode');
    await page.locator('text=/^Me$/').click();
    await page.waitForURL('**/profile', { timeout: 10_000 });
    await beat(900);
    await page.getByRole('radio', { name: /^dark$/i }).click();
    await beat(1500);
    await page.getByRole('radio', { name: /^light$/i }).click();
    await beat(900);

    console.log('→ Sign out');
    await page.getByRole('button', { name: /sign out/i }).click();
    await page.waitForURL('**/', { timeout: 10_000 });
    await beat(1200);

    console.log('✓ Demo complete');
  } catch (err) {
    console.error('✗ Demo failed:', err?.message ?? err);
    throw err;
  } finally {
    await context.close();
    await browser.close();
  }

  // Find the .webm Playwright just wrote and rename to a stable path.
  const files = (await readdir(DEMO_DIR))
    .filter((f) => f.endsWith('.webm'))
    .map((f) => path.join(DEMO_DIR, f));
  let chosen = null;
  let chosenMtime = 0;
  for (const f of files) {
    const s = await stat(f);
    if (s.mtimeMs > chosenMtime) {
      chosenMtime = s.mtimeMs;
      chosen = f;
    }
  }
  if (chosen) {
    await rename(chosen, VIDEO_OUT);
    console.log(`✓ Saved ${path.relative(ROOT, VIDEO_OUT)}`);
  } else {
    console.warn('No video file was written — check recordVideo output.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
