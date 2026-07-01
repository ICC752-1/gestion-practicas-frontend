import { defineConfig, devices } from '@playwright/test'

const baseURL =
  globalThis.process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173'

export default defineConfig({
  testDir: './tests/accessibility',
  testMatch: '**/*.a11y.js',
  fullyParallel: false,
  workers: 1,
  outputDir: 'reports/accessibility/artifacts',
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'reports/accessibility/html',
        open: 'never',
      },
    ],
    [
      'json',
      {
        outputFile: 'reports/accessibility/results.json',
      },
    ],
  ],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-escritorio',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: 'chromium-movil',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
  webServer: globalThis.process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --host 127.0.0.1',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
