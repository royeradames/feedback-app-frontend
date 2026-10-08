import type { Page } from '@playwright/test';

// The design's custom dropdowns are listbox buttons, not native selects.
export async function choose(page: Page, button: RegExp, option: string) {
  await page.getByRole('button', { name: button }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}
