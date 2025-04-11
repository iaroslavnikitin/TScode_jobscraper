// @ts-check

const { devices } = require("@playwright/test");
const { permission } = require("process");

import { defineConfig } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
const config = {
  testDir: "./tests",
  retries: 1,
  workers: 5,
  timeout: 40000, // this parameter will overwrite the default timeout which is 30000 mil sec
  expect: {
    timeout: 5000, // this parameter will overwrite the default timeout for assertions only
  },

  /* Run tests in files in parallel */
  fullyParallel: true,
  // /* Fail the build on CI if you accidentally left test.only in the source code. */
  // forbidOnly: !!process.env.CI,
  // /* Retry on CI only */
  // retries: process.env.CI ? 2 : 0,
  // /* Opt out of parallel tests on CI. */
  // workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* See https://playwright.dev/docs/api/class-testoptions. */

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chrome",
      use: {
        browserName: "chromium",
        headless: false,
        viewport: { width: 1900, height: 1200 },
        //   launchOptions: {
        //     args: ["--window-size=1900,1200"],
        //   },
        trace: "retain-on-failure",
        screenshot: "on",
        video: {
          mode: "retain-on-failure",
          size: { width: 1200, height: 960 },
        },
        ignoreHttpsErrors: true,
        permissions: ["geolocation"],
        reporter: "html",
        //   ...devices['iPhone 15 Pro'],
      },
    },
/*     {
      name: "firefox",
      use: {
        browserName: "firefox",
        headless: true,
        viewport: { width: 1900, height: 1200 },
        //   launchOptions: {
        //     args: ["--window-size=1900,1200"],
        //   },
        trace: "retain-on-failure",
        screenshot: "on",
        video: {
          mode: "retain-on-failure",
          size: { width: 1200, height: 960 },
        },
        ignoreHttpsErrors: true,
        permissions: ["geolocation"],
        reporter: "html",
        //   ...devices['iPhone 15 Pro'],
      },
    },
    {
      name: "safari",
      use: {
        browserName: "webkit",
        headless: false,
        viewport: { width: 1900, height: 1200 },
        //   launchOptions: {
        //     args: ["--window-size=1900,1200"],
        //   },
        trace: "retain-on-failure",
        screenshot: "on",
        video: {
          mode: "retain-on-failure",
          size: { width: 1200, height: 960 },
        },
        ignoreHttpsErrors: true,
        permissions: ["geolocation"],
        reporter: "html",
        //   ...devices['iPhone 15 Pro'],
      },
    }, */
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
};

module.exports = config;
// module.exports = {
//     reporter: [['html', { open: 'never' }]],
//     // other configurations...
// };
export default defineConfig({
  reporter: [["line"], ["allure-playwright"]],
});