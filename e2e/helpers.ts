import { Page, expect } from '@playwright/test';

export function uniqueEmail(): string {
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `pw-test-${stamp}@huddle-e2e.test`;
}

export const TEST_PASSWORD = 'pw-test-12345';

/**
 * Sign a fresh user up and land them on /study-spots.
 * Returns the email used so the test can identify the account if needed.
 */
export async function signUpAndLand(page: Page): Promise<string> {
  const email = uniqueEmail();
  await page.goto('/signup');
  await page.locator('input[name="name"]').fill('PW Test User');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.locator('input[name="confirm"]').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /create account|creating/i }).click();
  await page.waitForURL('**/study-spots**', { timeout: 15_000 });
  await expect(page.getByText('Find a study spot!')).toBeVisible();
  return email;
}
