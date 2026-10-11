import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', workers: 1, timeout: 30000,
  testMatch: 'events.spec.js',
  use: { channel: process.env.PW_CHANNEL || undefined, baseURL: 'http://127.0.0.1:4198', viewport: { width: 1440, height: 900 }, trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:4198', reuseExistingServer: true },
});
