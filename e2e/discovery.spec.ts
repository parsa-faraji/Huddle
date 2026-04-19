import { test, expect } from '@playwright/test';
import { signUpAndLand } from './helpers';

test.describe('spot discovery', () => {
  test.beforeEach(async ({ page }) => {
    await signUpAndLand(page);
  });

  test('live Firestore spots render', async ({ page }) => {
    await expect(page.getByText('Doe Library', { exact: false })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText('MLK Student Union')).toBeVisible();
    await expect(page.getByText('Cafe Strada')).toBeVisible();
  });

  test('search narrows results', async ({ page }) => {
    await page.getByPlaceholder('Search study spots...').fill('doe');
    await expect(page.getByText('Doe Library')).toBeVisible();
    await expect(page.getByText('MLK Student Union')).toHaveCount(0);
  });

  test('filter chips toggle', async ({ page }) => {
    // Quiet chip should filter to Silent-noise spots (Doe)
    const quiet = page.getByRole('button', { name: 'Quiet', exact: true });
    await quiet.click();
    await expect(quiet).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Doe Library')).toBeVisible();
    await expect(page.getByText('Cafe Strada')).toHaveCount(0);

    // Turn it off
    await quiet.click();
    await expect(quiet).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByText('Cafe Strada')).toBeVisible();
  });

  test('map view renders with Leaflet tiles + markers', async ({ page }) => {
    await page.getByRole('button', { name: 'Map', exact: true }).click();
    // Leaflet container appears
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
    // Leaflet renders marker images
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(3, { timeout: 10_000 });
  });

  test('clicking a spot card navigates to spot info', async ({ page }) => {
    await page
      .getByText('Doe Library')
      .first()
      .locator('xpath=ancestor::*[contains(@class,"rounded-3xl")][1]')
      .getByRole('button', { name: /view/i })
      .click();
    await page.waitForURL('**/study-spots/1');
    await expect(page.getByRole('button', { name: /^join$/i })).toBeVisible();
  });
});
