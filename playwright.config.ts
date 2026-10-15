import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests/browser', use: { baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:3000', browserName: 'chromium', channel: 'msedge', screenshot: 'only-on-failure' }, workers: 1, reporter: 'list' });
