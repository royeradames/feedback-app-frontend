import { test, expect, type Page } from '@playwright/test';
import {
  controlsOnOneLine,
  headerRowsDoNotStack,
  iconsAlignToFirstLine,
  messagesKeepTheirSpace,
  textIsNotSqueezed,
} from './layout-checks';

// Regression checks for the October 8, 2026 width-sweep fix packet
// (qa-fix-packets-20261008/feedback-app-frontend.md, items 1-20).

const routes = [
  '/',
  '/roadmap',
  '/feedback/new',
  '/feedback/seed-01',
  '/feedback/seed-01/edit',
];
const details = ['seed-01', 'seed-02', 'seed-03', 'seed-04'];

async function submitFirstFormEmpty(page: Page) {
  // The sweep's "submit empty form 1": the first visible form, sent empty.
  const form = page.locator('main form').first();
  await form.locator('textarea, input').first().fill('');
  await form.locator('button[type=submit]').first().click();
  await page.waitForTimeout(150);
}

test('item 1: phone headers keep every control on one row from 320 to 400px', async ({
  page,
}) => {
  const findings = [];
  for (const route of routes) {
    await page.goto(route);
    for (let width = 320; width <= 400; width += 10) {
      await page.setViewportSize({ width, height: 800 });
      findings.push(
        ...(await headerRowsDoNotStack(page)).map((f) => ({ route, ...f })),
        ...(await controlsOnOneLine(page, 'header')).map((f) => ({
          route,
          ...f,
        })),
      );
    }
  }
  expect(findings).toEqual([]);
});

test('items 2-5 and 7-10: messages after an empty comment submit keep their space', async ({
  page,
}) => {
  const findings = [];
  for (const id of details) {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto('/feedback/' + id);
    await submitFirstFormEmpty(page);
    for (const width of [320, 400, 480, 768, 1024, 1440]) {
      // The sweep measures at 800px and at the page's full height.
      await page.setViewportSize({ width, height: 800 });
      const full = await page.evaluate(() => document.documentElement.scrollHeight);
      for (const height of [800, Math.min(full, 10000)]) {
        await page.setViewportSize({ width, height });
        findings.push(
          ...(await messagesKeepTheirSpace(page)).map((f) => ({ id, height, ...f })),
        );
      }
    }
  }
  expect(findings).toEqual([]);
});

test('items 6 and 15-18: short labels are not squeezed from 320 to 360px', async ({
  page,
}) => {
  const findings = [];
  for (const id of details) {
    for (const path of ['/feedback/' + id, '/feedback/' + id + '/edit']) {
      await page.setViewportSize({ width: 400, height: 800 });
      await page.goto(path);
      await submitFirstFormEmpty(page);
      for (let width = 320; width <= 360; width += 10) {
        await page.setViewportSize({ width, height: 800 });
        findings.push(
          ...(await textIsNotSqueezed(page)).map((f) => ({ path, ...f })),
          ...(await controlsOnOneLine(page, 'main')).map((f) => ({
            path,
            ...f,
          })),
        );
      }
    }
  }
  expect(findings).toEqual([]);
});

test('items 11-14: icon and label stay on one line after an empty submit', async ({
  page,
}) => {
  const findings = [];
  for (const id of details) {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto('/feedback/' + id);
    await submitFirstFormEmpty(page);
    for (const width of [320, 400, 480, 560]) {
      await page.setViewportSize({ width, height: 800 });
      findings.push(
        ...(await controlsOnOneLine(page)).map((f) => ({ id, ...f })),
      );
    }
  }
  expect(findings).toEqual([]);
});

test('item 19: icons align with the first line of their text at every width', async ({
  page,
}) => {
  const findings = [];
  for (const id of details) {
    await page.goto('/feedback/' + id);
    for (const width of [320, 400, 560, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      findings.push(
        ...(await iconsAlignToFirstLine(page)).map((f) => ({ id, ...f })),
      );
    }
  }
  expect(findings).toEqual([]);
});

test('item 20: every route declares og:site_name and one WebSite JSON-LD', async ({
  page,
}) => {
  for (const route of [...routes, '/feedback/seed-02/edit']) {
    await page.goto(route);
    await expect(
      page.locator('meta[property="og:site_name"]'),
      route,
    ).toHaveAttribute('content', 'Product Feedback');
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const sites = blocks
      .map((block) => JSON.parse(block))
      .filter((data) => data['@type'] === 'WebSite');
    expect(sites, route).toEqual([
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Product Feedback',
        url: 'https://feedback-app-frontend.royeradames.com/',
      },
    ]);
  }
});
