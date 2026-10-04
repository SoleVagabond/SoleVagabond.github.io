const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
test("work, contact and source links lead to the actual projects", async ({
  page,
  request,
}) => {
  await expect(page).toHaveTitle(
    "Devin — Web applications, automation & systems",
  );
  await page.getByRole("link", { name: "Explore the work" }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(
    page.getByRole("link", { name: "Try the application" }),
  ).toHaveAttribute("href", "https://northline-cycle-devin.netlify.app/");
  await expect(
    page.getByRole("link", { name: "Run the incident lab" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/SoleVagabond/sentinel-node#try-it-locally",
  );
  await page
    .getByRole("link", { name: "Contact", exact: false })
    .first()
    .click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(
    page.getByRole("link", { name: "Visit my Upwork profile" }),
  ).toHaveAttribute(
    "href",
    "https://www.upwork.com/freelancers/~01e5e1f1782f59fb21",
  );
  const assets = await page
    .locator("img")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("src")));
  for (const src of assets)
    expect((await request.get("/" + src)).status()).toBe(200);
});
test("all incident evidence states update the image, caption and full-image link", async ({
  page,
}) => {
  for (const [label, key, caption] of [
    ["Lost signal", "stale", "old observation becomes unknown"],
    ["Recovery", "recovery", "resolved incident retained"],
    ["Service outage", "outage", "HTTP 503 opens an incident"],
  ]) {
    const button = page.getByRole("button", { name: label, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator(".gallery button[aria-pressed=true]"),
    ).toHaveCount(1);
    await expect(page.locator("#sentinel-image")).toHaveAttribute(
      "src",
      `assets/sentinel-${key}.png`,
    );
    await expect(page.locator("#sentinel-caption")).toContainText(caption);
    await expect(page.locator("#sentinel-image-link")).toHaveAttribute(
      "href",
      new RegExp(`sentinel-${key}\\.png$`),
    );
    await expect
      .poll(() =>
        page
          .locator("#sentinel-image")
          .evaluate((img) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true);
  }
});
test("project details work and layouts stay within the screen", async ({
  page,
}, testInfo) => {
  await page.locator("summary").first().click();
  await page.locator("summary").nth(1).click();
  await expect(
    page.getByRole("heading", { name: "Progress has a history." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recovery doesn’t erase the outage." }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
  await page.screenshot({
    path: `work/browser-results/${testInfo.project.name}-portfolio.png`,
    fullPage: true,
  });
});
test("keyboard navigation reaches content, disclosure and gallery controls", async ({
  page,
}) => {
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await page.locator("summary").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("details").first()).toHaveAttribute("open", "");
  await page.getByRole("button", { name: "Lost signal", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Lost signal", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("automated accessibility scan covers expanded details and each evidence state", async ({
  page,
}) => {
  await page.locator("summary").first().click();
  await page.locator("summary").nth(1).click();
  for (const label of ["Service outage", "Lost signal", "Recovery"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  }
});
