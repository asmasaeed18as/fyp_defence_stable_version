import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  reporter: [['list'], ['html']],
  use: {
    actionTimeout: 15000,
    navigationTimeout: 30000,
    baseURL: 'http://localhost:5173',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    launchOptions: {
      slowMo: 500, // Slows down Playwright operations by 500ms so you can see what's happening
    },
  },
  // Disabled webServer to avoid timeout; start dev server manually
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://127.0.0.1:5174',
  //   reuseExistingServer: !process.env.CI,
  // },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
