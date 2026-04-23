import { test, expect } from '@playwright/test';
import { signUpAndLand } from './helpers';

test.describe('theme', () => {
  test('dark toggle sets .dark class and persists on reload', async ({ page }) => {
    await signUpAndLand(page);
    // Navigate to Profile where the toggle lives.
    await page.locator('text=/^Me$/').click();
    await page.waitForURL('**/profile');

    const html = page.locator('html');
    const darkRadio = page.getByRole('radio', { name: /^dark$/i });
    await darkRadio.click();
    await expect(html).toHaveClass(/\bdark\b/);

    await page.reload();
    // After reload, the radio should still indicate dark and html should keep the class
    await expect(html).toHaveClass(/\bdark\b/);

    await page.getByRole('radio', { name: /^light$/i }).click();
    await expect(html).not.toHaveClass(/\bdark\b/);
  });
});
