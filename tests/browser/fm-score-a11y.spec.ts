import { test, expect, type Page } from '@playwright/test';
import { ready } from './helpers';

// Frontend Mentor score findings, October 10: buttons under 4.5:1 at rest or
// on hover, vote names that leave out the visible count, and form markup.

async function contrastOf(page: Page, selector: string, index: number) {
  return page.evaluate(
    ({ selector, index }) => {
      const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const parse = (v: string) => {
        const m = v.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return { r, g, b, a };
      };
      const lum = (c: { r: number; g: number; b: number }) =>
        0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
      const el = document.querySelectorAll(selector)[index] as HTMLElement;
      const fg = parse(getComputedStyle(el).color)!;
      let node: HTMLElement | null = el;
      let bg = null;
      while (node) {
        const c = parse(getComputedStyle(node).backgroundColor);
        if (c && c.a > 0.5) {
          bg = c;
          break;
        }
        node = node.parentElement;
      }
      bg ??= { r: 255, g: 255, b: 255, a: 1 };
      const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
      return {
        ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100,
        label: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 30),
      };
    },
    { selector, index },
  );
}

const pages = ['/', '/roadmap', '/feedback/seed-01', '/feedback/seed-01/edit'];
const controls =
  '.btn:not(.btn-text), .chip, .vote, .roadmap-summary-head a, .feedback-copy a, .mention, .error';

for (const theme of ['light', 'dark'] as const) {
  for (const path of pages) {
    test(`buttons and accent text keep 4.5:1 contrast at rest and on hover (${theme}, ${path})`, async ({ page }) => {
      // Dark runs use the OS preference, the default "system" appearance.
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(path);
      await ready(page);
      // No transitions, so a hover is read at its final colour.
      await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
      if (path === '/') {
        // A voted button has its own hover colours.
        await page.locator('button.vote').first().click();
        await expect(page.locator('button.vote').first()).toHaveAttribute('aria-pressed', 'true');
      }
      if (path === '/feedback/seed-01/edit') {
        // Field errors after an empty save.
        await page.getByLabel('Feedback title').fill('');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.locator('.error').first()).toBeVisible();
      }
      const count = await page.locator(controls).count();
      const failures: string[] = [];
      for (let i = 0; i < count; i++) {
        const control = page.locator(controls).nth(i);
        if (!(await control.isVisible())) continue;
        const rest = await contrastOf(page, controls, i);
        if (rest.ratio < 4.5) failures.push(`rest "${rest.label}" ${rest.ratio}`);
        await control.hover();
        const hover = await contrastOf(page, controls, i);
        if (hover.ratio < 4.5) failures.push(`hover "${hover.label}" ${hover.ratio}`);
        await page.mouse.move(0, 0);
      }
      expect(failures).toEqual([]);
    });
  }
}

for (const theme of ['light', 'dark'] as const) {
  test(`the active option of a keyboard-focused list keeps 4.5:1 (${theme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    await ready(page);
    await page.getByRole('button', { name: /^Sort by/ }).focus();
    await page.keyboard.press('Enter');
    const list = page.getByRole('listbox');
    await expect(list).toBeVisible();
    await expect(list).toBeFocused();
    await page.keyboard.press('ArrowDown');
    const option = '[role="listbox"] [role="option"].active';
    await expect(page.locator(option)).toHaveCount(1);
    const { ratio, label } = await contrastOf(page, option, 0);
    expect(ratio, label).toBeGreaterThanOrEqual(4.5);
  });
}

test('each vote button name starts with the count it shows', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const votes = page.locator('button.vote');
  const count = await votes.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const shown = (await votes.nth(i).innerText()).trim();
    await expect(votes.nth(i)).toHaveAccessibleName(new RegExp(`^${shown} votes?, upvote `));
  }
});

test('form groups have a legend first and text fields say their type', async ({ page }) => {
  for (const path of ['/feedback/seed-01', '/feedback/new']) {
    await page.goto(path);
    await ready(page);
    const markup = await page.evaluate(() => ({
      fieldsets: [...document.querySelectorAll('fieldset')].map(
        (f) => f.firstElementChild?.tagName.toLowerCase() ?? 'none',
      ),
      untyped: [...document.querySelectorAll('input:not([type])')].map((i) => i.id || i.outerHTML.slice(0, 60)),
    }));
    expect(markup.fieldsets.every((first) => first === 'legend'), `${path} ${markup.fieldsets}`).toBe(true);
    expect(markup.untyped, path).toEqual([]);
  }
});
