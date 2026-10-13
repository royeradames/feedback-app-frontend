import { test, expect, type Page } from '@playwright/test';
import { ready } from './helpers';

// Frontend Mentor solution report, October 13, 2026: the phone menu let Tab
// escape, roadmap tab panels were named by their heading instead of their tab,
// a page change left focus behind, and two invalid inputs had no test.

async function focusInsideMenu(page: Page) {
  return page.evaluate(() =>
    Boolean(
      document.activeElement?.closest('#board-menu') ||
        document.activeElement?.classList.contains('menu-toggle'),
    ),
  );
}

test('the phone menu keeps Tab and Shift+Tab inside the menu while it is open', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await ready(page);
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('button', { name: 'All', exact: true })).toBeFocused();
  // More presses than the menu has stops, so a leak would show.
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    expect(await focusInsideMenu(page), `Tab press ${i + 1}`).toBe(true);
  }
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await focusInsideMenu(page), `Shift+Tab press ${i + 1}`).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused();
});

test('closing the phone menu from the backdrop returns focus to the menu button', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await ready(page);
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.locator('.menu-backdrop').click({ position: { x: 20, y: 700 } });
  await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused();
});

test('a malformed fragment does not break focus after a page change', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/feedback/seed-01#%');
  await ready(page);
  await page.getByRole('link', { name: /Go Back/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/feedback\/seed-01#%$/);
  await expect(page.getByRole('heading', { level: 1, name: /^Feedback: / })).toBeFocused();
  expect(errors).toEqual([]);
});

test('on a phone each roadmap tab panel is named by its tab', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/roadmap');
  await ready(page);
  for (const status of ['planned', 'in-progress', 'live']) {
    await expect(page.locator('#lane-' + status)).toHaveAttribute(
      'aria-labelledby',
      'tab-' + status,
    );
  }
  const tab = page.getByRole('tab', { name: /^In-Progress/ });
  await expect(page.getByRole('tabpanel', { name: (await tab.textContent())! })).toBeVisible();
});

test('a page change moves focus to the new page heading', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.getByRole('link', { name: 'View', exact: true }).click();
  await expect(page).toHaveURL(/\/roadmap$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Roadmap' })).toBeFocused();
  await page.getByRole('link', { name: /Go Back/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Suggestions' })).toBeFocused();
});

test('a link to the comments starts focus at the comments, not the page top', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await ready(page);
  await page.locator('a[href="/feedback/seed-01#comments"]').click();
  await expect(page).toHaveURL(/\/feedback\/seed-01#comments$/);
  await expect(page.locator('#comments')).toBeFocused();
  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() => Boolean(document.activeElement?.closest('#comments'))),
  ).toBe(true);
});

test('an edit that clears the title is refused and keeps the saved title', async ({
  page,
}) => {
  await page.goto('/feedback/seed-01/edit');
  await ready(page);
  const title = page.getByLabel('Feedback title');
  const saved = await title.inputValue();
  expect(saved.length).toBeGreaterThan(0);
  await title.fill('   ');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('Enter a title.', { exact: true })).toBeVisible();
  await expect(title).toHaveAttribute('aria-invalid', 'true');
  await expect(page).toHaveURL(/\/feedback\/seed-01\/edit$/);
  await page.goto('/feedback/seed-01');
  await ready(page);
  await expect(page.getByRole('heading', { name: saved, exact: true })).toBeVisible();
});

test('a comment of only spaces is refused and nothing is posted', async ({ page }) => {
  await page.goto('/feedback/seed-01');
  await ready(page);
  await expect(page.getByRole('heading', { name: '2 Comments' })).toBeVisible();
  await page.getByLabel('Add Comment').fill('    ');
  await page.getByRole('button', { name: 'Post Comment', exact: true }).click();
  await expect(page.getByText('Write a comment.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '2 Comments' })).toBeVisible();
});
