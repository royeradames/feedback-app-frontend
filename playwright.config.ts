import { defineConfig } from '@playwright/test';
// PW_PORT lets a shared build host run the suite without taking the default port.
const port = Number(process.env.PW_PORT ?? 4394);
export default defineConfig({
  testDir: 'tests/browser',
  workers: 1,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    launchOptions: {
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    },
  },
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
  reporter: 'list',
});
