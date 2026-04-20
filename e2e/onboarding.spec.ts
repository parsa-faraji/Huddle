import { test, expect } from '@playwright/test';
import { signUpAndLand } from './helpers';

test.describe('onboarding banner', () => {
  test('shows on first visit, stays dismissed after clicking Got it', async ({ page }) => {
    await signUpAndLand(page);

    await expect(page.getByTestId('onboarding-banner')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('onboarding-dismiss').click();
    await expect(page.getByTestId('onboarding-banner')).toHaveCount(0);

    // Reload — still dismissed.
    await page.reload();
    await expect(page.getByText(/find a study spot/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('onboarding-banner')).toHaveCount(0);
  });
});
