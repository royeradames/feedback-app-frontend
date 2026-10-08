import { expect, type Page } from '@playwright/test';

// The design's custom dropdowns are listbox buttons, not native selects.
export async function choose(page: Page, button: RegExp, option: string) {
  await page.getByRole('button', { name: button }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

// The footer status leaves "Loading…" once the app has hydrated and read this
// browser's saved demo. Keyboard actions before that do nothing on a busy host.
export async function ready(page: Page) {
  await expect(page.locator('.storage-message')).not.toHaveText(/Loading/);
}
