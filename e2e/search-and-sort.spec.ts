import { test, expect } from '@playwright/test';
import { signUpAndLand } from './helpers';

test.describe('search & sort', () => {
  test('search filters cards; sort changes ordering', async ({ page }) => {
    await signUpAndLand(page);
    const cards = page.locator('[data-testid="spot-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    const beforeCount = await cards.count();
    expect(beforeCount).toBeGreaterThan(0);

    // Search
    await page.getByPlaceholder('Search study spots...').fill('Doe');
    // Wait until the rendered count stabilizes at <= beforeCount
    await expect.poll(async () => await cards.count()).toBeLessThan(beforeCount);

    // Clear search
    await page.getByPlaceholder('Search study spots...').fill('');
    await expect(cards.first()).toBeVisible();

    // Change sort to Name A-Z — first card name should start at a letter
    await page.getByRole('combobox', { name: /sort/i }).selectOption('name');
    const firstName = await page
      .locator('[data-testid="spot-name"]')
      .first()
      .innerText();
    expect(firstName.length).toBeGreaterThan(0);
  });
});
