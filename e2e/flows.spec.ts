import { test, expect } from '@playwright/test';
import { signUpAndLand } from './helpers';

test.describe('core flows', () => {
  test('join → leave cycle on a spot', async ({ page }) => {
    await signUpAndLand(page);
    // Open Doe Library info via direct URL (seeded id=1)
    await page.goto('/study-spots/1');
    const joinBtn = page.getByRole('button', { name: /^join$/i });
    await expect(joinBtn).toBeVisible();
    await joinBtn.click();
    // Post-join modal appears
    await expect(page.getByText(/you're in doe library/i)).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /^close$/i }).click();
    // Button should now show "Leave"
    await expect(page.getByRole('button', { name: /^leave$/i })).toBeVisible();
    await page.getByRole('button', { name: /^leave$/i }).click();
    // Back to Join
    await expect(page.getByRole('button', { name: /^join$/i })).toBeVisible({ timeout: 10_000 });
  });

  test('rating a spot records a session', async ({ page }) => {
    await signUpAndLand(page);
    await page.goto('/study-spots/1');

    await page.getByRole('button', { name: /^rate$/i }).click();
    await page.waitForURL('**/study-spots/log/1');

    // Page 1: click "3" for productivity, comfort, location and "Yes" for recommend
    for (const field of ['Productivity', 'Comfort', 'Location']) {
      await page.getByText(field, { exact: true }).first().waitFor();
    }
    // Select 3 for all numeric axes
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '3', exact: true }).nth(i).click();
    }
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await page.getByRole('button', { name: /^next$/i }).click();

    // Page 2: overall rating + dropdowns
    await page.getByRole('button', { name: '4', exact: true }).first().click();
    await page.locator('select[name="noiseLevel"]').selectOption('Silent');
    await page.locator('select[name="seating"]').selectOption('Plenty');
    await page.locator('select[name="outlets"]').selectOption('Yes');
    await page.locator('select[name="wifi"]').selectOption('Strong');
    await page.locator('select[name="lighting"]').selectOption('Bright');
    await page.locator('select[name="crowded"]').selectOption('Low');

    await page.getByRole('button', { name: /^submit$/i }).click();
    await expect(page.getByText(/thank you for rating/i)).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /^close$/i }).click();
    await page.waitForURL('**/study-spots/');

    // Session should show up in Insights (Firestore + the orderBy → fallback
    // listener can lag a beat on fresh accounts, so give it room).
    await page.goto('/insights');
    await expect(page.getByText(/study spots rated/i)).toBeVisible();
    await expect(page.getByText('Doe Library').first()).toBeVisible({ timeout: 20_000 });
  });

  test('preferences save → recommended strip appears', async ({ page }) => {
    await signUpAndLand(page);
    // Navigate directly to /profile rather than via the BottomNav — tapping
    // the nav "Me" label has proved flaky because clicks sometimes land on
    // the span rather than the parent div that owns the navigate handler.
    await page.goto('/profile');
    await expect(page.locator('select[name="noiseLevel"]')).toBeVisible({ timeout: 10_000 });

    await page.locator('select[name="noiseLevel"]').selectOption('Silent');
    await page.locator('select[name="lighting"]').selectOption('Bright');
    await page.locator('select[name="crowded"]').selectOption('Low');
    await page.getByRole('button', { name: /save preferences/i }).click();

    // Wait for the inline status confirmation that the write landed.
    await expect(page.getByText(/preferences saved/i)).toBeVisible({ timeout: 15_000 });

    // Reload /profile: if the write persisted to Firestore, the form should
    // repopulate from the userDoc subscription after React + auth rehydrate.
    await page.goto('/profile');
    await expect(page.locator('select[name="noiseLevel"]')).toHaveValue('Silent', {
      timeout: 15_000,
    });

    // Discovery should surface a "Recommended for you" strip with prefs set.
    await page.goto('/study-spots');
    await expect(page.getByText(/recommended for you/i)).toBeVisible({ timeout: 15_000 });
  });

  test('group create requires fields and then succeeds', async ({ page }) => {
    await signUpAndLand(page);
    await page.goto('/study-groups/create');

    // Empty submit blocked
    await page.getByRole('button', { name: /^confirm$/i }).click();
    await expect(page.getByText(/fill in all required fields/i)).toBeVisible();

    // Fill required fields
    await page.locator('input[name="name"]').fill('PW Test Group');
    await page.locator('input[name="course"]').fill('CS 101');
    await page.locator('input[name="description"]').fill('E2E test');
    await page.locator('input[name="location"]').fill('Doe Library');
    await page.locator('input[name="availability"]').fill('Evenings');
    await page.locator('input[name="meetingTime"]').fill('Fridays 5pm');

    await page.getByRole('button', { name: /^confirm$/i }).click();
    await expect(page.getByText(/has been created/i)).toBeVisible({ timeout: 15_000 });
  });
});
