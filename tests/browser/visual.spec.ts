import { test, expect, type Locator, type Page } from '@playwright/test';

const widths = [400, 768, 1440];

// Reads the select's own pixels, so the check holds for a native or a custom
// caret: the rightmost ink is the caret, and its distance to the control's
// right edge is the inset Royer can see.
async function caretGeometry(page: Page, select: Locator) {
  await select.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const png = await select.screenshot({ animations: 'disabled' });
  const paddingRight = await select.evaluate((element) =>
    parseFloat(getComputedStyle(element).paddingRight),
  );
  const pixels = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = 'data:image/png;base64,' + base64;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const { data, width, height } = context.getImageData(
      0,
      0,
      image.width,
      image.height,
    );
    // Stay clear of the 1px border and its rounded corners.
    const top = 10;
    const bottom = height - 10;
    const counts = new Map<string, number>();
    for (let y = top; y < bottom; y++) {
      for (let x = Math.floor(width / 2); x < width - 3; x++) {
        const i = (y * width + x) * 4;
        const keyColor = `${data[i]},${data[i + 1]},${data[i + 2]}`;
        counts.set(keyColor, (counts.get(keyColor) ?? 0) + 1);
      }
    }
    const background = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])[0][0]
      .split(',')
      .map(Number);
    const inkAt = (x: number) => {
      for (let y = top; y < bottom; y++) {
        const i = (y * width + x) * 4;
        const diff =
          Math.abs(data[i] - background[0]) +
          Math.abs(data[i + 1] - background[1]) +
          Math.abs(data[i + 2] - background[2]);
        if (diff > 60) return true;
      }
      return false;
    };
    let rightInk = -1;
    for (let x = width - 3; x >= 0; x--) {
      if (inkAt(x)) {
        rightInk = x;
        break;
      }
    }
    let caretLeft = rightInk;
    let blank = 0;
    for (let x = rightInk; x >= 0 && blank < 4; x--) {
      if (inkAt(x)) {
        caretLeft = x;
        blank = 0;
      } else blank++;
    }
    return { width, rightInk, caretLeft };
  }, png.toString('base64'));
  return {
    ...pixels,
    inset: pixels.width - 1 - pixels.rightInk,
    caretFromRight: pixels.width - pixels.caretLeft,
    paddingRight,
  };
}

const selects: {
  name: string;
  path: string;
  find: (page: Page) => Locator;
}[] = [
  { name: 'Sort by', path: '/', find: (page) => page.getByLabel('Sort by') },
  {
    name: 'Appearance',
    path: '/',
    find: (page) => page.getByLabel('Appearance'),
  },
  {
    name: 'Category',
    path: '/feedback/new',
    find: (page) => page.getByLabel('Category', { exact: true }),
  },
  {
    name: 'Status',
    path: '/feedback/seed-01/edit',
    find: (page) => page.getByLabel('Status', { exact: true }),
  },
];

test('select carets keep real padding from the right edge at 400, 768 and 1440', async ({
  page,
}) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const select of selects) {
        await page.goto(select.path);
        const control = select.find(page);
        await expect(control).toBeVisible();
        const geometry = await caretGeometry(page, control);
        const where = `${select.name} at ${width}px ${colorScheme} ${JSON.stringify(geometry)}`;
        expect(geometry.rightInk, where).toBeGreaterThan(0);
        // The official design keeps the arrow 24px from the field's right edge.
        expect(geometry.inset, where).toBeGreaterThanOrEqual(20);
        // The option text box ends before the caret starts, so long labels never
        // run under the arrow.
        expect(geometry.paddingRight, where).toBeGreaterThanOrEqual(
          geometry.caretFromRight + 4,
        );
      }
    }
  }
});

test('comment counts use the design comment icon on board, detail and roadmap', async ({
  page,
}) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/feedback/seed-01', '/roadmap']) {
      await page.goto(path);
      const link = page.locator('.comment-count').first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAccessibleName(/^\d+ comments on .+/);
      await expect(link).not.toContainText('◌');
      const icon = link.locator('img');
      await expect(icon).toHaveCount(1);
      await expect(icon).toHaveAttribute('alt', '');
      await expect
        .poll(() => icon.evaluate((image: HTMLImageElement) => image.complete))
        .toBe(true);
      const image = await icon.evaluate((element: HTMLImageElement) => {
        const rect = element.getBoundingClientRect();
        return {
          src: element.currentSrc,
          naturalWidth: element.naturalWidth,
          naturalHeight: element.naturalHeight,
          width: rect.width,
          height: rect.height,
        };
      });
      const where = `${path} at ${width}px ${JSON.stringify(image)}`;
      expect(image.src, where).toMatch(/\/assets\/shared\/icon-comments\.svg/);
      expect(image.naturalWidth, where).toBe(18);
      expect(image.naturalHeight, where).toBe(16);
      expect(image.width, where).toBe(18);
      expect(image.height, where).toBe(16);
    }
  }
});
