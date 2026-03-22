import { defineConfig, devices } from '@playwright/test'

const port = 4173

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `yarn vite --host 127.0.0.1 --port ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        channel: 'chrome',
      },
    },
    {
      name: 'tablet-chromium',
      use: {
        ...devices['iPad Pro 11'],
        browserName: 'chromium',
        channel: 'chrome',
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        channel: 'chrome',
      },
    },
    {
      name: 'mobile-small-chromium',
      use: {
        ...devices['iPhone SE'],
        browserName: 'chromium',
        channel: 'chrome',
      },
    },
  ],
})
