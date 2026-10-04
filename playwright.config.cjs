const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./tests",
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "work/browser-report" }],
  ],
  outputDir: "work/browser-results",
  use: {
    baseURL: "http://127.0.0.1:8795",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { browserName: "chromium", viewport: { width: 1280, height: 900 } },
    },
    {
      name: "mobile-375",
      use: {
        browserName: "chromium",
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "mobile-320",
      use: {
        browserName: "chromium",
        viewport: { width: 320, height: 740 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `${process.env.PYTHON || "python"} -m http.server 8795 --bind 127.0.0.1 --directory site`,
    url: "http://127.0.0.1:8795",
    reuseExistingServer: false,
  },
});
