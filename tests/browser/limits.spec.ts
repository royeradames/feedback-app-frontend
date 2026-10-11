import { test, expect, type Page } from '@playwright/test';
import { ready } from './helpers';
import { board } from '../fixtures/library';

// The demo's caps (100 requests, 500 comments) at 1, 6, 30 and 100 synthetic requests.
const storageKey = 'royer-feedback-demo:v1';
const feedbackLimit =
  'This demo holds 100 feedback requests, the most it can. Delete one before adding another.';
const commentLimit =
  'This demo holds 500 comments, the most it can. Delete a feedback request that has comments, then try again.';

async function seed(page: Page, count: number, comments = 0) {
  const document = {
    version: 1,
    revision: '33333333-3333-4333-8333-333333333333',
    snapshot: board(count, comments),
  };
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem(key, value);
    },
    { key: storageKey, value: JSON.stringify(document) },
  );
}
// No raw validation output (zod's JSON issue list) ever reaches the page.
async function noRawError(page: Page) {
  await expect(page.locator('body')).not.toContainText(/too_big|"code"|ZodError|"path"/);
}

for (const count of [1, 6, 30]) {
  test(`${count} requests: Add Feedback saves a new request with no limit note`, async ({ page }) => {
    await seed(page, count);
    await page.goto('/feedback/new');
    await ready(page);
    await expect(page.getByText(feedbackLimit)).toHaveCount(0);
    await page.getByLabel('Feedback Title').fill('One more');
    await page.getByLabel('Feedback Detail').fill('Another request');
    await page.getByRole('button', { name: 'Add Feedback' }).click();
    await expect(page).toHaveURL(/\/feedback\/local-/);
  });
}

test('100 requests: the limit is stated before the form, and Add Feedback is refused in plain words', async ({ page }) => {
  await seed(page, 100);
  await page.goto('/feedback/new');
  await ready(page);
  const note = page.getByText(feedbackLimit, { exact: true });
  await expect(note).toBeVisible();
  await page.getByLabel('Feedback Title').fill('One more');
  await page.getByLabel('Feedback Detail').fill('Another request');
  // Submit by keyboard.
  await page.getByRole('button', { name: 'Add Feedback' }).focus();
  await page.keyboard.press('Enter');
  await expect(note).toBeFocused();
  await expect(page).toHaveURL(/\/feedback\/new$/);
  await expect(page.getByLabel('Feedback Title')).toHaveValue('One more');
  await noRawError(page);
});

test('500 comments: the limit is stated at Add Comment, and posting is refused in plain words', async ({ page }) => {
  await seed(page, 100, 500);
  const target = board(100).feedback[1]!.id;
  await page.goto('/feedback/' + target);
  await ready(page);
  const form = page.locator('form.comment-form').first();
  await expect(form.getByText(commentLimit, { exact: true }).first()).toBeVisible();
  const box = form.getByRole('textbox');
  await box.fill('Hello');
  await form.getByRole('button', { name: 'Post Comment' }).click();
  await expect(box).toBeFocused();
  await expect(box).toHaveValue('Hello');
  await expect(box).toHaveAttribute('aria-invalid', 'true');
  await noRawError(page);
});

test('at 375px the limit note fits with no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await seed(page, 100);
  await page.goto('/feedback/new');
  await ready(page);
  await expect(page.getByText(feedbackLimit, { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375);
});
