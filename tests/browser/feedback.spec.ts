import { test, expect } from '@playwright/test';
const storageKey = 'royer-feedback-demo:v1';
test('board filters, all four sorts and native keyboard selection', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('Showing 6', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'bug', exact: true }).click();
  await expect(page.locator('.feedback-list article')).toHaveCount(1);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByLabel('Sort by').selectOption('votes-asc');
  await expect(page.locator('.feedback-list article').first()).toHaveAttribute(
    'data-feedback-id',
    'seed-06',
  );
  await page.getByLabel('Sort by').selectOption('comments-desc');
  await expect(page.locator('.feedback-list article').first()).toHaveAttribute(
    'data-feedback-id',
    'seed-02',
  );
  await page.getByLabel('Sort by').selectOption('comments-asc');
  await expect(page.locator('.feedback-list article').first()).toHaveAttribute(
    'data-feedback-id',
    'seed-06',
  );
  await page.getByLabel('Sort by').selectOption('votes-desc');
  await expect(page.locator('.feedback-list article').first()).toHaveAttribute(
    'data-feedback-id',
    'seed-01',
  );
  await page.getByRole('button', { name: 'UI', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('heading', { name: 'No suggestions in this category' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Show all categories' }).click();
  await expect(page.locator('.feedback-list article')).toHaveCount(6);
});
test('one demo actor vote persists, toggles once and leaves sample totals intact', async ({
  page,
}) => {
  await page.goto('/');
  const vote = page.getByRole('button', {
    name: /^Upvote Add tags for solutions \(\d+ votes\)$/,
    exact: true,
  });
  await expect(vote).toBeEnabled();
  await expect(vote).toHaveAccessibleName(
    'Upvote Add tags for solutions (112 votes)',
  );
  await vote.click();
  await expect(vote).toHaveAttribute('aria-pressed', 'true');
  await expect(vote).toContainText('113');
  await expect(vote).toHaveAccessibleName(
    'Upvote Add tags for solutions (113 votes)',
  );
  await expect(page.getByRole('status').first()).toContainText(
    'Saved in this browser',
  );
  await page.reload();
  await expect(vote).toContainText('113');
  await expect(vote).toHaveAccessibleName(
    'Upvote Add tags for solutions (113 votes)',
  );
  await vote.click();
  await expect(vote).toContainText('112');
  await expect(vote).toHaveAccessibleName(
    'Upvote Add tags for solutions (112 votes)',
  );
});
test('validated CRUD, cancel, local reload and roadmap status', async ({
  page,
}) => {
  await page.goto('/feedback/new');
  await page.getByRole('button', { name: 'Add feedback', exact: true }).click();
  await expect(page.getByText('Enter a title.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Feedback title')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await page.getByLabel('Feedback title').fill('Keyboard-friendly idea');
  await page
    .getByLabel('Feedback detail')
    .fill('A meaningful local suggestion');
  await page.getByRole('button', { name: 'Add feedback', exact: true }).click();
  await expect(page).toHaveURL(/\/feedback\/local-/);
  const url = page.url();
  await expect(page.getByText('Demo participant · suggestion')).toBeVisible();
  await page.getByRole('link', { name: 'Edit feedback', exact: true }).click();
  await page.getByLabel('Feedback title').fill('Do not save this');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Keyboard-friendly idea', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Edit feedback', exact: true }).click();
  await page.getByLabel('Status', { exact: true }).selectOption('planned');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page).toHaveURL(url);
  await expect(page.getByText('Demo participant · planned')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Demo participant · planned')).toBeVisible();
  await page.goto('/roadmap');
  await expect(
    page.getByRole('link', { name: 'Keyboard-friendly idea', exact: true }),
  ).toBeVisible();
  await page.goto(url);
  await page.getByText('Delete this demo feedback', { exact: true }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page
    .getByRole('button', { name: 'Delete feedback', exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto(url);
  await expect(
    page.getByRole('heading', {
      name: 'Feedback is unavailable in this browser',
    }),
  ).toBeVisible();
});
test('comments and stable replies survive reload; cancel reply does not post', async ({
  page,
}) => {
  await page.goto('/feedback/seed-01');
  await page.getByRole('button', { name: 'Post comment', exact: true }).click();
  await expect(
    page.getByText('Write a comment.', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Comment', { exact: true }).fill('A local comment');
  await page.getByRole('button', { name: 'Post comment', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: '3 comments and replies' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Reply to Suzanne Chang', exact: true })
    .click();
  await page.getByLabel('Reply', { exact: true }).fill('A local reply');
  await page.getByRole('button', { name: 'Cancel reply' }).click();
  await expect(page.getByText('A local reply', { exact: true })).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Reply to Suzanne Chang', exact: true })
    .click();
  await page.getByLabel('Reply', { exact: true }).fill('A local reply');
  await page.getByRole('button', { name: 'Post reply' }).click();
  await expect(page.getByText('A local reply', { exact: false })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '4 comments and replies' }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText('A local reply', { exact: false })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '4 comments and replies' }),
  ).toBeVisible();
});
test('malformed storage is preserved, and storage denial produces an honest memory-only result', async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(
    (key) => localStorage.setItem(key, '{broken'),
    storageKey,
  );
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('malformed');
  await expect(
    page.getByRole('button', {
      name: /^Upvote Add tags for solutions \(\d+ votes\)$/,
    }),
  ).toBeDisabled();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe('{broken');
  await context.close();
  const denied = await browser.newContext();
  await denied.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('Denied', 'QuotaExceededError');
    };
  });
  const second = await denied.newPage();
  await second.goto('/');
  await second
    .getByRole('button', {
      name: /^Upvote Add tags for solutions \(\d+ votes\)$/,
    })
    .click();
  await expect(second.getByRole('status')).toContainText('Saving failed');
  await expect(
    second.getByRole('button', {
      name: /^Upvote Add tags for solutions \(\d+ votes\)$/,
    }),
  ).toContainText('113');
  await denied.close();
});
test('stale tabs cannot overwrite a newer save and reload discards an open draft only after confirmation', async ({
  context,
  page,
}) => {
  await page.goto('/feedback/seed-01/edit');
  const other = await context.newPage();
  await other.goto('/');
  await page.getByLabel('Feedback title').fill('Preserve this draft');
  await other
    .getByRole('button', {
      name: /^Upvote Add tags for solutions \(\d+ votes\)$/,
    })
    .click();
  await expect(page.getByRole('status').first()).toContainText('another tab');
  await expect(page.getByLabel('Feedback title')).toHaveValue(
    'Preserve this draft',
  );
  await expect(
    page.getByRole('button', { name: 'Save changes' }),
  ).toBeDisabled();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Load saved data' }).click();
  await expect(page.getByLabel('Feedback title')).toHaveValue(
    'Preserve this draft',
  );
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Load saved data' }).click();
  await expect(page.getByLabel('Feedback title')).toHaveValue(
    'Add tags for solutions',
  );
  await other.close();
});
test('malformed and unknown seed routes 404, valid missing local IDs explain browser scope', async ({
  page,
}) => {
  expect((await page.goto('/feedback/seed-99'))?.status()).toBe(404);
  expect((await page.goto('/feedback/not-a-record'))?.status()).toBe(404);
  await page.goto('/feedback/local-00000000-0000-4000-8000-000000000001');
  await expect(
    page.getByRole('heading', {
      name: 'Feedback is unavailable in this browser',
    }),
  ).toBeVisible();
});
test('native layout, focus and 16px floor hold at representative widths; opt-in shortcuts ignore typing', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [400, 641, 768, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/roadmap');
    await expect(
      page.getByRole('heading', { name: 'Roadmap', exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await page
        .locator('body')
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
    ).toBeGreaterThanOrEqual(16);
  }
  await page.goto('/');
  await page.keyboard.press('n');
  await expect(page).toHaveURL(/\/$/);
  await page.getByText('Keyboard help', { exact: true }).click();
  await page.getByLabel('Enable letter shortcuts for this visit').check();
  await page.locator('main').click();
  await page.keyboard.press('n');
  await expect(page).toHaveURL(/\/feedback\/new$/);
  await page.getByLabel('Feedback title').fill('b r n ?');
  await expect(page).toHaveURL(/\/feedback\/new$/);
  expect(errors).toEqual([]);
});
test('no JavaScript keeps sample readable and all mutation controls disabled', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/feedback/new');
  // Playwright's text engine skips <noscript>; match the rendered paragraph by role.
  await expect(
    page.getByRole('paragraph').filter({ hasText: 'JavaScript is required' }),
  ).toBeVisible();
  await expect(page.getByLabel('Feedback title')).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Add feedback', exact: true }),
  ).toBeDisabled();
  await context.close();
});

test('compare-and-save rejects a stale tab even when its storage event is missed', async ({
  context,
  page,
}) => {
  await page.addInitScript(() =>
    window.addEventListener('storage', (event) =>
      event.stopImmediatePropagation(),
    ),
  );
  await page.goto('/feedback/seed-01/edit');
  await page
    .getByLabel('Feedback title')
    .fill('Stale title must not overwrite');
  const other = await context.newPage();
  await other.goto('/');
  await other
    .getByRole('button', {
      name: /^Upvote Add tags for solutions \(\d+ votes\)$/,
    })
    .click();
  await expect(other.getByRole('status').first()).toContainText(
    'Saved in this browser',
  );
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status').first()).toContainText(
    'Another tab changed',
  );
  await other.reload();
  await expect(
    other.getByRole('link', { name: 'Add tags for solutions', exact: true }),
  ).toBeVisible();
  await expect(
    other.getByRole('button', {
      name: /^Upvote Add tags for solutions \(\d+ votes\)$/,
    }),
  ).toContainText('113');
  await other.close();
});

test('a valid 100-character unbroken title wraps on board, detail and roadmap', async ({
  page,
}) => {
  const title = 'W'.repeat(100);
  await page.goto('/feedback/new');
  await page.getByLabel('Feedback title').fill(title);
  await page
    .getByLabel('Feedback detail')
    .fill('A valid long-title layout case.');
  await page.getByRole('button', { name: 'Add feedback', exact: true }).click();
  await expect(page).toHaveURL(/\/feedback\/local-/);
  const detailUrl = page.url();
  async function checkTitle() {
    const link = page.getByRole('link', { name: title, exact: true });
    await expect(link).toBeVisible();
    expect(await link.textContent()).toBe(title);
    const geometry = await link.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const card = element.closest('article');
      const parent = card?.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        width: innerWidth,
        cardLeft: parent?.left ?? -1,
        cardRight: parent?.right ?? -1,
        contentFits: element.scrollWidth <= element.clientWidth + 1,
        documentFits: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(geometry.cardLeft);
    expect(geometry.right).toBeLessThanOrEqual(geometry.cardRight + 1);
    expect(geometry.right).toBeLessThanOrEqual(geometry.width);
    expect(geometry.contentFits).toBe(true);
    expect(geometry.documentFits).toBe(true);
  }
  for (const width of [400, 641, 768, 1100]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await checkTitle();
    await page.goto(detailUrl);
    await checkTitle();
  }
  await page.getByRole('link', { name: 'Edit feedback', exact: true }).click();
  await page.getByLabel('Status', { exact: true }).selectOption('planned');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page).toHaveURL(detailUrl);
  for (const width of [400, 641, 768, 1100]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/roadmap');
    await checkTitle();
  }
});
