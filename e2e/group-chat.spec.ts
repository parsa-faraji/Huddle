import { test, expect } from '@playwright/test';
import { signUpAndLand } from './helpers';

test.describe('group chat', () => {
  test('non-member sees gate; member can send + see their message', async ({ page }) => {
    await signUpAndLand(page);

    // Seeded group id=1 has no owner, so a fresh user isn't a member yet.
    await page.goto('/study-groups/1');

    // Before joining: chat panel is hidden, gate text shows.
    await expect(page.getByTestId('group-chat')).toHaveCount(0);
    await expect(page.getByText(/join this group to see messages/i)).toBeVisible({
      timeout: 10_000,
    });

    // Join the group.
    await page.getByRole('button', { name: /^join$/i }).click();
    // CreateModal / JoinModal dismissal — close it if it appears.
    const closeBtn = page.getByRole('button', { name: /^close$/i });
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    }

    // After joining: the chat panel renders.
    await expect(page.getByTestId('group-chat')).toBeVisible({ timeout: 15_000 });

    // Send a message and see it echoed back from Firestore.
    const message = `Hello at ${Date.now()}`;
    await page.getByTestId('group-chat-input').fill(message);
    await page.getByTestId('group-chat-send').click();
    await expect(page.getByTestId('group-chat-messages')).toContainText(message, {
      timeout: 10_000,
    });
  });
});
