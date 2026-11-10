// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { loadEnv } = require('./utils/env');

// Loads .env, then .env.<TEST_ENV> on top of it (e.g. TEST_ENV=staging -> .env.staging).
const env = loadEnv();

const DEVICES = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
};
const browsers = env.BROWSERS.filter((b) => DEVICES[b]);

module.exports = defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          TEST_ENV: env.TEST_ENV,
          BASE_URL: env.BASE_URL,
          BROWSERS: env.BROWSERS.join(', '),
          NODE_VERSION: process.version,
          OS: `${process.platform} ${process.arch}`,
        },
        categories: [
          { name: 'Assertion failures', messageRegex: '.*expect\\(.*', matchedStatuses: ['failed'] },
          { name: 'Timeouts', messageRegex: '.*(Timeout|timed out).*', matchedStatuses: ['failed', 'broken'] },
          { name: 'Broken tests', matchedStatuses: ['broken'] },
        ],
      },
    ],
    ...(process.env.CI ? [['github']] : []),
  ],

  use: {
    baseURL: env.BASE_URL,
    // The site tags its key elements with data-qa="...", so getByTestId() targets those.
    testIdAttribute: 'data-qa',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // Creates one shared user per browser project, logs in through the UI and saves storageState.
    {
      name: 'setup',
      testDir: './fixtures',
      testMatch: /auth\.setup\.js/,
      teardown: 'teardown',
      use: { ...devices['Desktop Chrome'] },
    },
    // Deletes the shared users once every dependent project has finished.
    {
      name: 'teardown',
      testDir: './fixtures',
      testMatch: /auth\.teardown\.js/,
    },
    // Pure API tests: no browser needed, run once.
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.BASE_URL },
    },
    // UI tests, one project per browser listed in BROWSERS.
    ...browsers.map((name) => ({
      name,
      testIgnore: /api[\\/]/,
      dependencies: ['setup'],
      use: { ...DEVICES[name] },
    })),
  ],
});
