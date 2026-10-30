const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('job-discovery case study has a usable route, real assets and honest access status', async ({ page, request }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore the job-board case study', exact: true }).click();
  await expect(page).toHaveURL(/job-discovery\.html$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Find the opportunity.');
  await expect(page.getByText('source is currently private', { exact: false })).toBeVisible();
  for (const src of await page.locator('img').evaluateAll(nodes => nodes.map(n => n.getAttribute('src')))) {
    expect((await request.get('/' + src)).status()).toBe(200);
  }
  await page.getByRole('link', { name: 'Verification ↓', exact: true }).click();
  await expect(page).toHaveURL(/#verification$/);
  await expect(page.getByText('Public hosting, sustained inventory freshness, off-host recovery and real email delivery', { exact: false })).toBeVisible();
  expect(await page.locator('a[href*="127.0.0.1"],a[href*="mini-job-board/pull"],a[href^="file:"]').count()).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.locator('body')).toContainText('fictional roles');
});

test('case study supports keyboard access and automated accessibility checks', async ({ page }) => {
  await page.goto('/job-discovery.html');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
