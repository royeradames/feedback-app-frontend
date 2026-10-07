import { test, expect, type Page } from '@playwright/test';
const storageKey = 'royer-feedback-demo:v1';

// Saving waits for the cross-tab Web Lock, so holding it from another tab keeps
// a save pending for as long as the test needs.
async function holdSaveLock(page: Page) {
  await page.goto('/roadmap');
  await page.evaluate(
    (key) =>
      new Promise<void>((held) => {
        void navigator.locks.request(
          key,
          () =>
            new Promise<void>((release) => {
              (window as unknown as { release: () => void }).release = release;
              held();
            }),
        );
      }),
    storageKey,
  );
  return () =>
    page.evaluate(() =>
      (window as unknown as { release: () => void }).release(),
    );
}

test('a pending vote keeps controls focusable and busy, and blocks a second action', async ({
  context,
  page,
}) => {
  await page.goto('/');
  const vote = page.getByRole('button', {
    name: /^Upvote Add tags for solutions \(\d+ votes\)$/,
  });
  const load = page.getByRole('button', { name: 'Load saved data' });
  await expect(vote).toContainText('112');
  const release = await holdSaveLock(await context.newPage());
  let dialogs = 0;
  page.on('dialog', (dialog) => {
    dialogs++;
    void dialog.dismiss();
  });
  await vote.click();
  await expect(vote).toHaveAttribute('aria-busy', 'true');
  await expect(vote).toBeEnabled();
  await expect(vote).toBeFocused();
  await expect(load).toBeEnabled();
  await expect(load).toHaveAttribute('aria-busy', 'true');
  // Re-entry is blocked: a second vote does not toggle, and Load saved data
  // does not even ask.
  await vote.click();
  await expect(vote).toBeFocused();
  await load.click();
  await expect(load).toBeFocused();
  expect(dialogs).toBe(0);
  await release();
  await expect(vote).not.toHaveAttribute('aria-busy', 'true');
  await expect(load).not.toHaveAttribute('aria-busy', 'true');
  await expect(vote).toContainText('113');
  await expect(vote).toHaveAttribute('aria-pressed', 'true');
  // Focus stays where the person left it when the save settles.
  await expect(load).toBeFocused();
});

test('a pending feedback save keeps the form usable, busy and single-submit', async ({
  context,
  page,
}) => {
  await page.goto('/feedback/seed-01/edit');
  await page.getByLabel('Feedback title').fill('Saved once while busy');
  const release = await holdSaveLock(await context.newPage());
  const save = page.getByRole('button', { name: /Save changes|Saving…/ });
  await save.click();
  await expect(save).toHaveText('Saving…');
  await expect(save).toHaveAttribute('aria-busy', 'true');
  await expect(save).toBeEnabled();
  await expect(save).toBeFocused();
  await expect(page.getByLabel('Feedback title')).toBeEnabled();
  await save.click();
  await expect(save).toBeFocused();
  await release();
  await expect(page).toHaveURL(/\/feedback\/seed-01$/);
  await expect(
    page.getByRole('heading', { name: 'Saved once while busy', exact: true }),
  ).toBeVisible();
});
