import { test, expect } from '@playwright/test';
import { ready } from './helpers';

declare global {
  interface Window {
    __themes?: (string | null)[];
  }
}

test('the appearance choice survives reload and applies before the app hydrates', async ({
  context,
  page,
}) => {
  await page.goto('/');
  await ready(page);
  await page.getByLabel('Appearance').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  // Record every data-theme value from the first byte of the next load, so a
  // flash through "system" or light would show up here.
  await page.addInitScript(() => {
    window.__themes = [];
    new MutationObserver(() =>
      window.__themes!.push(document.documentElement?.dataset.theme ?? null),
    ).observe(document, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-theme'],
    });
  });
  await page.reload();
  await expect(page.getByLabel('Appearance')).toHaveValue('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const themes = await page.evaluate(() => window.__themes ?? []);
  expect(themes.length).toBeGreaterThan(0);
  expect(themes.every((theme) => theme === 'dark'), String(themes)).toBe(true);
  // Without the app bundle, only the inline head script can apply the theme.
  const bare = await context.newPage();
  await bare.route(/\/_next\/static\/.+\.js(\?|$)/, (route) => route.abort());
  await bare.goto('/');
  await expect(bare.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(
    await bare.evaluate(() => getComputedStyle(document.body).backgroundColor),
  ).toBe('rgb(20, 23, 38)'); // --bg in dark: #141726
  await bare.close();
  await page.getByLabel('Appearance').selectOption('system');
  await page.reload();
  await expect(page.getByLabel('Appearance')).toHaveValue('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'system');
});

test('validation errors move focus to the first invalid field', async ({
  page,
}) => {
  await page.goto('/feedback/new');
  await page.getByRole('button', { name: 'Add Feedback', exact: true }).click();
  await expect(page.getByLabel('Feedback title')).toBeFocused();
  await page.getByLabel('Feedback title').fill('A titled idea');
  await page.getByRole('button', { name: 'Add Feedback', exact: true }).click();
  await expect(page.getByText('Enter a title.', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Feedback detail')).toBeFocused();
  await page.goto('/feedback/seed-01');
  await page.getByRole('button', { name: 'Post Comment', exact: true }).click();
  await expect(page.getByText('Write a comment.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Add Comment')).toBeFocused();
  await page
    .getByRole('button', { name: 'Reply to Suzanne Chang', exact: true })
    .click();
  await page.getByRole('button', { name: 'Post Reply' }).click();
  await expect(page.getByLabel('Reply to @upbeat1811')).toBeFocused();
});

test('the board has one meaningful h1 and counts read in the singular', async ({
  page,
}) => {
  await page.goto('/');
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText('Suggestions');
  await expect(
    page.getByRole('heading', { name: /^\d+ suggestions?$/ }),
  ).toHaveCount(0);
  await expect(page.getByText('6 Suggestions', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Bug', exact: true }).click();
  await expect(page.getByText('1 Suggestion', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page.getByRole('link', { name: /^1 comments on / })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('link', { name: /^1 comment on / }).first(),
  ).toBeVisible();
  await page.goto('/feedback/seed-03');
  await expect(
    page.getByRole('heading', { level: 2, name: '1 Comment', exact: true }),
  ).toBeVisible();
});

test('home declares one site name in og:site_name and WebSite JSON-LD', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.brand')).toContainText('Product Feedback');
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    'content',
    'Product Feedback',
  );
  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  expect(JSON.parse((await jsonLd.textContent()) ?? '{}')).toEqual({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Product Feedback',
    url: 'https://feedback-app-frontend.royeradames.com/',
  });
});
