const {test, expect} = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('guided tour connects each project to the correct kind of evidence', async ({page, request}) => {
  await page.goto('/');
  await page.getByRole('link', {name:'Take a guided project tour', exact:false}).click();
  await expect(page).toHaveURL(/project-tour\.html$/);
  for (const [name, anchor] of [['01 / Business workflows', 'northline'], ['02 / Monitoring', 'sentinel'], ['03 / APIs', 'job-discovery']]) {
    await page.getByRole('link', {name:new RegExp(name)}).click();
    await expect(page).toHaveURL(new RegExp('#' + anchor + '$'));
    await expect(page.locator('#' + anchor)).toBeVisible();
  }
  await expect(page.getByRole('link', {name:'Open the sample repair'})).toHaveAttribute('href', 'https://northline-cycle-devin.netlify.app/demo/workshop.html#repair/NL-2401');
  await page.getByRole('link', {name:'Open the incident replay',exact:false}).click();
  await expect(page.locator('#replay-status-text')).toHaveText('Service outage detected');
  await page.getByRole('button', {name:'Replay lost signal',exact:true}).click();
  await expect(page.locator('#replay-healthy')).toHaveText('Unknown');
  await page.getByRole('button', {name:'Replay recovery',exact:true}).click();
  await expect(page.locator('#incident-memory')).toContainText('Recovered');
  await page.goto('/project-tour.html#job-discovery');
  await page.getByRole('link', {name:'Follow the workspace case study'}).click();
  await expect(page).toHaveURL(/job-discovery\.html#workflow$/);
  for (const path of ['/', '/project-tour.html', '/job-discovery.html']) {
    await page.goto(path);
    const references = await page.locator('a[href], img[src], link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href') || n.getAttribute('src')).filter(v => !/^(https?:|mailto:|#)/.test(v)));
    for (const reference of new Set(references)) expect((await request.get('/' + reference.split('#')[0])).status(), reference).toBe(200);
  }
});

test('tour is readable, keyboard accessible and useful without JavaScript', async ({page, browser, baseURL}, testInfo) => {
  await page.goto('/project-tour.html');
  await page.screenshot({path: testInfo.outputPath('project-tour.png')});
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', {name:'Skip to content'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await expect(page.locator('#sentinel')).toContainText('It does not run live checks or send alerts.');
  expect(await page.locator('a[href*="127.0.0.1"],a[href^="file:"]').count()).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const scan = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
  const context = await browser.newContext({javaScriptEnabled:false});
  try {
    const plain = await context.newPage();
    await plain.goto(baseURL + '/project-tour.html');
    await plain.getByRole('link', {name:/01 \/ Business workflows/}).click();
    await expect(plain).toHaveURL(/#northline$/);
    await expect(plain.getByRole('link', {name:'Open the sample repair'})).toBeVisible();
  } finally { await context.close(); }
});
