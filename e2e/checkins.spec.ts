import { test, expect } from '@playwright/test';
import { signUpAndLand } from './helpers';

test.describe('live check-ins', () => {
  test('user can check in, sees count, then check out', async ({ page }) => {
    await signUpAndLand(page);
    await page.goto('/study-spots/1');

    const card = page.getByTestId('checkin-card');
    await expect(card).toBeVisible();

    const button = page.getByTestId('checkin-button');
    const count = page.getByTestId('checkin-count');

    await expect(button).toHaveText(/i'?m here now/i);
    await expect(count).toContainText('0 here now');

    await button.click();
    await expect(button).toHaveText(/check out/i, { timeout: 10_000 });
    await expect(count).toContainText('1 here now', { timeout: 10_000 });

    // Count badge surfaces on the card as well
    await expect(page.getByText(/1 live/i).first()).toBeVisible({ timeout: 5_000 });

    // Check out again
    await button.click();
    await expect(button).toHaveText(/i'?m here now/i, { timeout: 10_000 });
    await expect(count).toContainText('0 here now', { timeout: 10_000 });
  });

  test('checking in somewhere else warns and moves the user', async ({ page }) => {
    await signUpAndLand(page);

    // Check in at spot 1
    await page.goto('/study-spots/1');
    await page.getByTestId('checkin-button').click();
    await expect(page.getByTestId('checkin-button')).toHaveText(/check out/i, {
      timeout: 10_000,
    });

    // Navigate to spot 2 — the warning should appear
    await page.goto('/study-spots/2');
    await expect(
      page.getByText(/you.?re currently checked in at/i),
    ).toBeVisible({ timeout: 10_000 });

    // Clicking check-in there should move the user
    await page.getByTestId('checkin-button').click();
    await expect(page.getByTestId('checkin-button')).toHaveText(/check out/i, {
      timeout: 10_000,
    });

    // And spot 1 should now show 0
    await page.goto('/study-spots/1');
    await expect(page.getByTestId('checkin-count')).toContainText('0 here now', {
      timeout: 10_000,
    });
  });
});
