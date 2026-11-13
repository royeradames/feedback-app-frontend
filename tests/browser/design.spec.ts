import { test, expect, type Page } from '@playwright/test';

// The official Frontend Mentor design and brief: layouts, counts, sort and
// filter controls, roadmap order, the mobile menu and tabs, and delete from the
// edit page.

async function sortBy(page: Page, option: string) {
  await page.getByRole('button', { name: /^Sort by/ }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

function cardIds(page: Page) {
  return page
    .locator('.feedback-list article')
    .evaluateAll((cards) =>
      cards.map((card) => card.getAttribute('data-feedback-id')),
    );
}

test('suggestions bar counts with the right plural and sorts through a listbox', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('font-family', /Jost/);
  await expect(page.getByText('6 Suggestions', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Bug', exact: true }).click();
  await expect(page.getByText('1 Suggestion', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  const sort = page.getByRole('button', { name: /^Sort by/ });
  await expect(sort).toHaveText(/Sort by\s*:\s*Most Upvotes/);
  await sort.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('listbox').getByRole('option')).toHaveText([
    'Most Upvotes',
    'Least Upvotes',
    'Most Comments',
    'Least Comments',
  ]);
  await expect(
    page.getByRole('option', { name: 'Most Upvotes' }),
  ).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(sort).toBeFocused();
  // Keyboard: open, move down twice, choose.
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(sort).toHaveText(/Most Comments/);
  await expect(sort).toBeFocused();
  expect((await cardIds(page))[0]).toBe('seed-02');
  await sortBy(page, 'Least Upvotes');
  expect((await cardIds(page))[0]).toBe('seed-06');
});

test('the empty board uses the design empty state with a way to add feedback', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'UI', exact: true }).click();
  await expect(page.getByText('0 Suggestions', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'There is no feedback yet.' }),
  ).toBeVisible();
  await expect(page.locator('.empty-state img')).toHaveAttribute(
    'src',
    /illustration-empty\.svg/,
  );
  await page
    .locator('.empty-state')
    .getByRole('link', { name: '+ Add Feedback' })
    .click();
  await expect(page).toHaveURL(/\/feedback\/new$/);
});

test('roadmap columns are ordered by upvotes and phone tabs switch columns', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/roadmap');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Roadmap' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
  for (const lane of ['planned', 'in-progress', 'live']) {
    const votes = await page
      .locator(`.roadmap-lane.${lane} .vote span:last-child`)
      .allTextContents();
    expect(votes.map(Number)).toEqual(
      [...votes.map(Number)].sort((a, b) => b - a),
    );
  }
  await expect(
    page.getByRole('heading', { name: 'Planned (2)', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Ideas prioritized for research')).toBeVisible();
  await page.setViewportSize({ width: 375, height: 800 });
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveText(['Planned (2)', 'In-Progress (3)', 'Live (1)']);
  await expect(
    page.getByRole('tab', { name: 'In-Progress (3)' }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText(
    'Currently being developed',
  );
  await page.getByRole('tab', { name: 'In-Progress (3)' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Live (1)' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Live (1)' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tabpanel')).toContainText('Released features');
});

test('the phone menu holds filters and the roadmap summary, and Escape closes it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: 'Bug', exact: true })).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: 'Bug', exact: true })).toBeVisible();
  await expect(page.locator('#board-menu').getByRole('link', { name: 'View' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await menu.click();
  await page.getByRole('button', { name: 'Bug', exact: true }).click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.feedback-list article')).toHaveCount(1);
});

test('detail and forms follow the design: go back, edit, comment counter, delete from edit', async ({
  page,
}) => {
  await page.goto('/feedback/seed-02');
  await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '4 Comments', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('250 Characters left')).toBeVisible();
  await page.getByLabel('Add Comment').fill('Twelve chars');
  await expect(page.getByText('238 Characters left')).toBeVisible();
  await page.getByRole('link', { name: 'Edit Feedback', exact: true }).click();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Editing ‘Add a dark theme option’',
    }),
  ).toBeVisible();
  await expect(page.getByText('Change feature state')).toBeVisible();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Add a dark theme option');
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeFocused();
  await page.goto('/feedback/new');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Create New Feedback' }),
  ).toBeVisible();
  await expect(page.getByText('Choose a category for your feedback')).toBeVisible();
});

test('vote names use the right plural', async ({ page }) => {
  await page.goto('/feedback/new');
  await page.getByLabel('Feedback Title').fill('Singular vote check');
  await page.getByLabel('Feedback Detail').fill('One vote reads in the singular.');
  await page.getByRole('button', { name: 'Add Feedback', exact: true }).click();
  await expect(page).toHaveURL(/\/feedback\/local-/);
  const vote = page.getByRole('button', { name: /^Upvote Singular vote check/ });
  await expect(vote).toHaveAccessibleName('Upvote Singular vote check (0 votes)');
  await vote.click();
  await expect(vote).toHaveAccessibleName('Upvote Singular vote check (1 vote)');
});
