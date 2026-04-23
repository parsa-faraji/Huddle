import { test, expect } from '@playwright/test';
import { signUpAndLand } from './helpers';

const ROUTES = [
  { path: '/study-spots', name: 'Discovery' },
  { path: '/study-groups', name: 'Groups' },
  { path: '/insights', name: 'Insights' },
  { path: '/profile', name: 'Profile' },
];

test.describe('a11y smoke', () => {
  test('each primary route has h1 and labeled primary nav', async ({ page }) => {
    await signUpAndLand(page);
    for (const r of ROUTES) {
      await page.goto(r.path);
      // At least one h1 (Huddle header) — checking presence, not exact count,
      // since some pages may have additional h1 structural landmarks later.
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(
        page.getByRole('navigation', { name: /primary/i }),
      ).toBeVisible();
    }
  });
});
