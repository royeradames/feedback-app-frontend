import type { Page } from '@playwright/test';

// Small in-page versions of the QA sweep detectors (royer-responsive-sweep),
// so the October 8 findings stay covered in this repo's own suite.

export type Finding = { check: string; detail: string };

// Controls of four words or fewer must render on one line: an icon and its
// label never split, and a short label is never squeezed to two lines.
export function controlsOnOneLine(page: Page, scope = 'body') {
  return page.evaluate((scope) => {
    const found: { check: string; detail: string }[] = [];
    const root = document.querySelector(scope);
    if (!root) return found;
    for (const element of root.querySelectorAll<HTMLElement>(
      'a, button, summary, [role=tab], [role=option], .tag',
    )) {
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      if (element.closest('.sr-only, [hidden], [aria-hidden=true]')) continue;
      const text = (element.innerText ?? '').trim();
      if (!text || text.split(/\s+/).length > 4) continue;
      const range = document.createRange();
      range.selectNodeContents(element);
      const lines = new Set(
        [...range.getClientRects()]
          .filter((box) => box.width > 0.5 && box.height > 0.5)
          .map((box) => Math.round(box.top / 4)),
      );
      // Rects from inline children on the same line share a top within 4px.
      const tops = [...lines].sort((a, b) => a - b);
      let rows = tops.length ? 1 : 0;
      for (let i = 1; i < tops.length; i++) if (tops[i] - tops[i - 1] > 2) rows++;
      if (rows > 1)
        found.push({
          check: 'one-line-control',
          detail: `"${text}" wraps to ${rows} lines at ${innerWidth}px`,
        });
    }
    return found;
  }, scope);
}

// A header or nav row that wraps must not stack its controls into rows.
export function headerRowsDoNotStack(page: Page) {
  return page.evaluate(() => {
    const found: { check: string; detail: string }[] = [];
    for (const header of document.querySelectorAll<HTMLElement>(
      'header, nav',
    )) {
      if (header.closest('footer')) continue;
      for (const row of [header, ...header.querySelectorAll<HTMLElement>('*')]) {
        const style = getComputedStyle(row);
        if (
          !style.display.includes('flex') ||
          style.flexDirection.startsWith('column') ||
          style.flexWrap === 'nowrap'
        )
          continue;
        const children = [...row.children]
          .map((child) => child.getBoundingClientRect())
          .filter((box) => box.width && box.height);
        const tops = new Set(children.map((box) => Math.round(box.top)));
        const rows = [...tops]
          .sort((a, b) => a - b)
          .filter((top, i, all) => i === 0 || top - all[i - 1] > 8).length;
        if (rows > 1)
          found.push({
            check: 'crowded-header',
            detail: `${row.className || row.tagName} stacks ${rows} rows at ${innerWidth}px`,
          });
      }
    }
    return found;
  });
}

// Status and error messages stay in flow, never overlap the content beside
// them, and keep at least 4px from it.
export function messagesKeepTheirSpace(page: Page) {
  return page.evaluate(() => {
    const found: { check: string; detail: string }[] = [];
    const messages = document.querySelectorAll<HTMLElement>(
      '[role=status], [role=alert], [aria-live], output, .error, [class*=message], [class*=notice]',
    );
    const visible = (element: Element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return (
        box.width > 0 &&
        box.height > 0 &&
        style.visibility !== 'hidden' &&
        !element.closest('.sr-only')
      );
    };
    for (const message of messages) {
      if (!visible(message) || !message.textContent?.trim()) continue;
      const box = message.getBoundingClientRect();
      const siblings = [...(message.parentElement?.children ?? [])].filter(
        (sibling) => sibling !== message && visible(sibling),
      );
      for (const sibling of siblings) {
        const other = sibling.getBoundingClientRect();
        const across =
          Math.min(box.right, other.right) - Math.max(box.left, other.left);
        if (across <= 0) continue;
        const gap = Math.max(other.top - box.bottom, box.top - other.bottom);
        if (gap < 4)
          found.push({
            check: gap < 0 ? 'overlap' : 'tight-spacing',
            detail: `"${message.textContent.trim().slice(0, 40)}" is ${gap.toFixed(1)}px from "${(sibling.textContent ?? '').trim().slice(0, 40)}" at ${innerWidth}px`,
          });
      }
    }
    return found;
  });
}

// A short label must keep about 8 characters per line; a squeezed column
// wrapping "Edit feedback" onto two lines fails.
export function textIsNotSqueezed(page: Page) {
  return page.evaluate(() => {
    const found: { check: string; detail: string }[] = [];
    for (const element of document.querySelectorAll<HTMLElement>(
      'main a, main button, main h1, main h2, main h3, main p, main label, main span',
    )) {
      if (element.closest('.sr-only')) continue;
      if ([...element.children].some((child) => child.matches('p, div')))
        continue;
      const text = (element.innerText ?? '').trim();
      if (text.split(/\s+/).length < 2) continue;
      const style = getComputedStyle(element);
      const lineHeight =
        parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
      const range = document.createRange();
      range.selectNodeContents(element);
      const boxes = [...range.getClientRects()].filter((box) => box.width > 1);
      if (!boxes.length) continue;
      const top = Math.min(...boxes.map((box) => box.top));
      const bottom = Math.max(...boxes.map((box) => box.bottom));
      const lines = Math.max(1, Math.round((bottom - top) / lineHeight));
      if (lines > 1 && text.length / lines < 8)
        found.push({
          check: 'squeezed',
          detail: `"${text.slice(0, 40)}" has ${(text.length / lines).toFixed(1)} characters per line at ${innerWidth}px`,
        });
    }
    return found;
  });
}

// An icon of 40px or less beside wrapping text sits on the text's first line.
export function iconsAlignToFirstLine(page: Page) {
  return page.evaluate(() => {
    const found: { check: string; detail: string }[] = [];
    for (const icon of document.querySelectorAll<HTMLElement>(
      'main img, main svg',
    )) {
      const box = icon.getBoundingClientRect();
      if (!box.width || box.width > 40 || box.height > 40) continue;
      const row = icon.parentElement;
      if (!row) continue;
      const style = getComputedStyle(row);
      if (
        !(style.display.includes('flex') || style.display.includes('grid')) ||
        style.flexDirection.startsWith('column')
      )
        continue;
      for (const text of row.children) {
        if (text === icon || !(text instanceof HTMLElement)) continue;
        const range = document.createRange();
        range.selectNodeContents(text);
        const lines = [...range.getClientRects()].filter(
          (line) => line.width > 1 && line.height > 1,
        );
        if (lines.length < 2) continue;
        const tops = [...new Set(lines.map((line) => Math.round(line.top)))];
        if (tops.length < 2) continue;
        const first = lines.reduce((a, b) => (b.top < a.top ? b : a));
        const center = box.top + box.height / 2;
        if (center < first.top - 2 || center > first.bottom + 2)
          found.push({
            check: 'icon-align',
            detail: `icon in ${row.className || row.tagName} is centred ${Math.round(center - first.top)}px below the first line at ${innerWidth}px`,
          });
      }
    }
    return found;
  });
}
