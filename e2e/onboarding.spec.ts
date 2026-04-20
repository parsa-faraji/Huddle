import { test, expect } from '@playwright/test';
import { signUpAndLand, TEST_PASSWORD, uniqueEmail } from './helpers';

test.describe('onboarding tour', () => {
  test('shows on first visit, stays dismissed across reload', async ({ page }) => {
    // Don't use signUpAndLand (it auto-dismisses the tour); do the signup
    // inline so we can assert the tour appears on first visit.
    const email = uniqueEmail();
    await page.goto('/signup');
    await page.locator('input[name="name"]').fill('PW Test User');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(TEST_PASSWORD);
    await page.locator('input[name="confirm"]').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /create account|creating/i }).click();
    await page.waitForURL('**/study-spots**', { timeout: 15_000 });

    await expect(page.getByTestId('onboarding-banner')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('onboarding-dismiss').click();
    await expect(page.getByTestId('onboarding-banner')).toHaveCount(0);

    // Reload — still dismissed.
    await page.reload();
    await expect(page.getByText(/find a study spot/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('onboarding-banner')).toHaveCount(0);

    // Re-open via the help button.
    await page.getByRole('button', { name: /how huddle works/i }).click();
    await expect(page.getByTestId('onboarding-banner')).toBeVisible({ timeout: 5_000 });

    // Suppress the unused signUpAndLand import warning for consumers that rely
    // on the helper elsewhere.
    void signUpAndLand;
  });
});
