import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/browser',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4394',
    launchOptions: {
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    },
  },
  webServer: {
    command: 'npm run start -- --port 4394',
    url: 'http://127.0.0.1:4394',
    reuseExistingServer: false,
  },
  reporter: 'list',
});
