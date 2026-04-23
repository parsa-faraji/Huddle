import { test, expect } from '@playwright/test';

test.describe('404', () => {
  test('unknown route renders 404 page with back link (signed out)', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
    const back = page.getByRole('link', { name: /back to sign in/i });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
});
