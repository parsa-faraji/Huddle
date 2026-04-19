import { test, expect } from '@playwright/test';
import { signUpAndLand, TEST_PASSWORD } from './helpers';

test.describe('auth', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByPlaceholder('Type your email')).toBeVisible();
    await expect(page.getByPlaceholder('Type password')).toBeVisible();
  });

  test('navigates to signup and back', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Create an account').click();
    await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
    await page.getByText('Sign in', { exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('login form validation blocks empty submit', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/fill in all fields/i)).toBeVisible();
  });

  test('signup form validation blocks mismatched passwords', async ({ page }) => {
    await page.goto('/signup');
    await page.locator('input[name="name"]').fill('Mismatch');
    await page.locator('input[name="email"]').fill('mismatch@example.com');
    await page.locator('input[name="password"]').fill('aaaaaa');
    await page.locator('input[name="confirm"]').fill('bbbbbb');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/passwords don't match/i)).toBeVisible();
  });

  test('protected route redirects to login when signed out', async ({ page }) => {
    await page.goto('/study-spots');
    await page.waitForURL('**/');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('signup creates account and lands on discovery', async ({ page }) => {
    await signUpAndLand(page);
    // Should be on /study-spots with data-loaded state.
    await expect(page).toHaveURL(/\/study-spots/);
  });

  test('sign out returns to login', async ({ page }) => {
    await signUpAndLand(page);
    // "Me" is a span in the bottom nav; click navigates to /profile.
    await page.locator('text=/^Me$/').click();
    await page.waitForURL('**/profile');
    await page.getByRole('button', { name: /sign out/i }).click();
    await page.waitForURL('**/');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  // Re-login using the account we just created
  test('login with bad credentials shows friendly error', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Type your email').fill('nobody-real@example.com');
    await page.getByPlaceholder('Type password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(
      page.locator('text=/incorrect|invalid|Something went wrong/i').first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
