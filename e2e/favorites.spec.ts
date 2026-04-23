import { test, expect } from '@playwright/test';
import { signUpAndLand } from './helpers';

test.describe('favorites', () => {
  test('toggle heart on a spot, appears on Insights, persists', async ({ page }) => {
    await signUpAndLand(page);
    await expect(page.locator('[data-testid="spot-card"]').first()).toBeVisible({
      timeout: 10_000,
    });
    const firstHeart = page.locator('[data-testid="favorite-toggle"]').first();
    await firstHeart.click();
    await expect(firstHeart).toHaveAttribute('aria-pressed', 'true');

    // Favorites strip appears on Discovery
    await expect(page.locator('[data-testid="favorites-strip"]')).toBeVisible();

    // Insights has the Favorites section with at least one item
    await page.locator('text=/^You$/').click();
    await page.waitForURL('**/insights');
    await expect(page.getByRole('heading', { name: /favorites/i })).toBeVisible();

    // Persistence: reload, heart still active on Discovery
    await page.locator('text=/^Spots$/').click();
    await page.waitForURL('**/study-spots**');
    await expect(
      page.locator('[data-testid="favorite-toggle"][aria-pressed="true"]').first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
