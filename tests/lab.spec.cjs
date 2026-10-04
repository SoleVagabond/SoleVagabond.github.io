const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("node:fs");

test("notification evidence agrees with the original receipts and downloads unchanged", async ({ page }, testInfo) => {
  await page.goto('/lab.html#sentinel/recovered/0');
  const original = JSON.parse(fs.readFileSync('site/assets/notification-delivery.json', 'utf8'));
  const rows = page.locator('#notification-evidence-table tbody tr');
  await expect(rows).toHaveCount(original.steps.length);
  for (let index = 0; index < original.steps.length; index++) {
    const data = original.steps[index].notifications;
    await expect(rows.nth(index).locator('td')).toHaveText([
      String(data.summary.pending), String(data.summary.delivered),
      `${data.receipts.length} / ${data.receipts.reduce((total, row) => total + row.requests, 0)}`
    ]);
  }
  const lost = original.steps.find(step => step.step === 'accepted-with-lost-reply').notifications;
  const retried = original.steps.find(step => step.step === 'same-reference-retried').notifications;
  const id = lost.deliveries.at(-1).event.id;
  const receipt = retried.receipts.filter(row => row.event.id === id);
  expect(receipt).toHaveLength(1);
  expect(receipt[0].requests).toBe(2);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download notification recording' }).click();
  const download = await downloadPromise;
  expect(JSON.parse(fs.readFileSync(await download.path(), 'utf8'))).toEqual(original);
  await page.locator('#notification-evidence').screenshot({ path: testInfo.outputPath('notification-evidence.png') });
  await page.getByRole('button', { name: '02 / Request trace', exact: true }).click();
  await expect(page.locator('#notification-evidence')).toBeHidden();
});

test("recorded outage, lost signal and recovery retain distinct meanings", async ({
  page,
}) => {
  await page.goto("/lab.html");
  await expect(page.locator("#replay-status-text")).toHaveText(
    "All services operational",
  );
  await expect(page.locator("#replay-healthy")).toHaveText("4");
  await page
    .getByRole("button", { name: "Replay outage", exact: true })
    .click();
  await expect(page.locator("#replay-status-text")).toHaveText(
    "Service outage detected",
  );
  await expect(page.locator("#replay-active")).toHaveText("1");
  await expect(page.locator("#incident-memory")).toContainText(
    "Unexpected HTTP 503",
  );
  await page
    .getByRole("button", { name: "Replay lost signal", exact: true })
    .click();
  await expect(page.locator("#replay-status-text")).toHaveText(
    "Telemetry is stale",
  );
  await expect(page.locator("#replay-healthy")).toHaveText("Unknown");
  await expect(page.locator("#response-rows .response-state")).toHaveText([
    "Unknown",
    "Unknown",
    "Unknown",
    "Unknown",
  ]);
  await expect(page.locator("#incident-memory")).toContainText(
    "Last observed active",
  );
  await page
    .getByRole("button", { name: "Replay recovery", exact: true })
    .click();
  await expect(page.locator("#replay-active")).toHaveText("0");
  await expect(page.locator("#incident-memory")).toContainText("Recovered");
  await expect(page.locator("#incident-memory")).toContainText(
    "Unexpected HTTP 503",
  );
});

test("freshness boundary, deep links and exported evidence agree", async ({
  page,
}) => {
  await page.goto("/lab.html#sentinel/healthy/15");
  await expect(page.locator("#replay-status-text")).toHaveText(
    "All services operational",
  );
  const slider = page.getByRole("slider", { name: "Add observation age" });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#replay-status-text")).toHaveText(
    "Telemetry is stale",
  );
  await expect(page).toHaveURL(/#sentinel\/healthy\/16$/);
  await expect(
    page.getByRole("textbox", { name: "Link to this exploration state" }),
  ).toHaveValue(/#sentinel\/healthy\/16$/);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download this state" }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(fs.readFileSync(await download.path(), "utf8"));
  const original = JSON.parse(
    fs.readFileSync("site/assets/local-incident-sequence.json", "utf8"),
  );
  expect(exported.recording).toEqual(original.steps[0]);
  expect(exported.replay.addedAgeSeconds).toBe(16);
  expect(exported.replay.currentServiceStatusKnown).toBe(false);
  await page.reload();
  await expect(page.locator("#replay-status-text")).toHaveText(
    "Telemetry is stale",
  );
  await page
    .getByRole("button", { name: "Replay recovery", exact: true })
    .click();
  await page.goBack();
  await expect(page.locator("#replay-status-text")).toHaveText(
    "Telemetry is stale",
  );
  await expect(slider).toHaveValue("16");
});

test("architecture trace is keyboard accessible, shareable and grounded in source", async ({
  page,
}) => {
  await page.goto("/lab.html#northline/save");
  await expect(
    page.getByRole("heading", { name: "The saved version matters." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Inspect this implementation" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/SoleVagabond/northline-cycle/blob/main/lib/blob-store.js",
  );
  const stage = page.getByRole("button", {
    name: "04 / Workflow Track & approve",
  });
  await stage.focus();
  await page.keyboard.press("Enter");
  await expect(stage).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/#northline\/track$/);
  await expect(
    page.getByRole("heading", { name: "Progress follows the rules." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await expect(stage).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#northline-panel")).toBeVisible();
  await page.getByRole("button", { name: "Copy a link to this state" }).click();
  await expect(page.locator("#share-status")).toContainText(
    /Link copied|Copy the selected link/,
  );
  await page.goto("/lab.html#sentinel/unrecognized/NaN");
  await expect(page.locator("#replay-status-text")).toHaveText(
    "All services operational",
  );
});

test("unavailable and malformed recordings expose no fabricated status and can recover", async ({
  page,
}) => {
  await page.route("**/assets/local-incident-sequence.json", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.goto("/lab.html");
  await expect(page.getByRole("alert")).toContainText(
    "No service status is available.",
  );
  await expect(page.locator("#replay-body")).toBeHidden();
  await expect(page.locator("#lab-tools")).toBeHidden();
  await page.unroute("**/assets/local-incident-sequence.json");
  await page.route("**/assets/local-incident-sequence.json", (route) =>
    route.fulfill({ contentType: "application/json", body: '{"steps":[]}' }),
  );
  await page.getByRole("button", { name: "Retry loading evidence" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.unroute("**/assets/local-incident-sequence.json");
  await page.getByRole("button", { name: "Retry loading evidence" }).click();
  await expect(page.locator("#replay-status-text")).toHaveText(
    "All services operational",
  );
});

test("both lab views fit the screen and pass automated accessibility scans", async ({
  page,
}, testInfo) => {
  await page.goto("/lab.html#sentinel/outage/0");
  await expect(page.locator("#replay-status-text")).toHaveText(
    "Service outage detected",
  );
  for (const label of ["01 / Incident replay", "02 / Request trace"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    await page.screenshot({
      path: `work/browser-results/${testInfo.project.name}-${label.startsWith("01") ? "replay" : "trace"}.png`,
      fullPage: true,
    });
  }
});
