import { test, expect } from '@playwright/test';
import { signUpAndLand, TEST_PASSWORD } from './helpers';

test.describe('student signup gate', () => {
  test('blocks non-.edu emails on signup', async ({ page }) => {
    await page.goto('/signup');
    await page.locator('input[name="name"]').fill('Non Student');
    await page.locator('input[name="email"]').fill(`not-a-student-${Date.now()}@gmail.com`);
    await page.locator('input[name="password"]').fill(TEST_PASSWORD);
    await page.locator('input[name="confirm"]').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /create account|creating/i }).click();

    await expect(page.getByText(/limited to students/i)).toBeVisible({ timeout: 5_000 });
    // URL stays on signup — did not navigate to the app.
    await expect(page).toHaveURL(/\/signup/);
  });

  test('verified student badge appears on profile after .edu signup', async ({ page }) => {
    await signUpAndLand(page);
    await page.goto('/profile');
    await expect(page.getByTestId('student-badge')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('student-badge')).toContainText(/verified student/i);
  });
});
