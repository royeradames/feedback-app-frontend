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
    // Screen-reader-only text (a 1px clipped box) has no visible line.
    const visuallyHidden = (node: Element | null, stop: Element) => {
      for (let at = node; at && at !== stop.parentElement; at = at.parentElement) {
        const box = at.getBoundingClientRect();
        if (at.matches('.sr-only') || (box.width <= 1 && box.height <= 1)) return true;
      }
      return false;
    };
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
      // A deliberately stacked control (a grid or a column, such as the brand
      // name over its tagline) is not a split; the sweep exempts it too.
      if (
        style.display.includes('grid') ||
        (style.display.includes('flex') && style.flexDirection.startsWith('column'))
      )
        continue;
      // Visible text and icons only.
      const parts: DOMRect[] = [];
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      );
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const owner = node instanceof Element ? node : node.parentElement;
        if (visuallyHidden(owner, element)) continue;
        if (node instanceof Element) {
          if (node.matches('svg, img')) parts.push(node.getBoundingClientRect());
          continue;
        }
        if (!node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        parts.push(...range.getClientRects());
      }
      // Boxes that share vertical space are on one line, so a small icon
      // centred on the text line counts with it.
      const boxes = parts
        .filter((box) => box.width > 0.5 && box.height > 0.5)
        .sort((a, b) => a.top - b.top);
      let rows = 0;
      let bottom = -Infinity;
      for (const box of boxes) {
        if (box.top >= bottom - 2) rows++;
        bottom = Math.max(bottom, box.bottom);
      }
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
// Mirrors the sweep's icon-align rule: a flex row or grid with two to four
// children, an icon child, and the first child with text.
export function iconsAlignToFirstLine(page: Page) {
  return page.evaluate(() => {
    const found: { check: string; detail: string }[] = [];
    const shown = (element: Element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        box.width > 0 &&
        box.height > 0 &&
        style.position !== 'absolute' &&
        style.position !== 'fixed'
      );
    };
    for (const row of document.querySelectorAll<HTMLElement>('main *')) {
      const style = getComputedStyle(row);
      const isRow =
        (style.display.includes('flex') && style.flexDirection.startsWith('row')) ||
        style.display.includes('grid');
      if (!isRow || !shown(row)) continue;
      const kids = [...row.children].filter(shown);
      if (kids.length < 2 || kids.length > 4) continue;
      const icon = kids.find((kid) => {
        const box = kid.getBoundingClientRect();
        return (
          box.width <= 40 &&
          box.height <= 40 &&
          (kid.matches('svg, img') ||
            (!!kid.querySelector('svg, img') && !kid.textContent?.trim()))
        );
      });
      if (!icon) continue;
      const text = kids.find(
        (kid) => kid !== icon && (kid.textContent ?? '').trim().length > 0,
      );
      if (!text) continue;
      // Group the text's visible boxes into lines.
      const boxes: DOMRect[] = [];
      const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim() || node.parentElement?.closest('.sr-only'))
          continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        boxes.push(...[...range.getClientRects()].filter((box) => box.width > 1));
      }
      boxes.sort((a, b) => a.top - b.top);
      const lines: { top: number; bottom: number }[] = [];
      for (const box of boxes) {
        const last = lines.at(-1);
        if (last && box.top < last.bottom - 2) last.bottom = Math.max(last.bottom, box.bottom);
        else lines.push({ top: box.top, bottom: box.bottom });
      }
      if (lines.length < 2) continue;
      const box = icon.getBoundingClientRect();
      const middle = (box.top + box.bottom) / 2;
      const first = lines[0];
      if (middle < first.top - 2 || middle > first.bottom + 2)
        found.push({
          check: 'icon-align',
          detail: `icon in ${row.className || row.tagName} is centred ${Math.round(middle - (first.top + first.bottom) / 2)}px from the first line at ${innerWidth}px`,
        });
    }
    return found;
  });
}
