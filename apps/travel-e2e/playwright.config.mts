import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';

// The port travel:serve listens on (set in its project.json, so it never collides with
// another workspace on 4200). Nx starts that task before the tests; a task dependency
// cannot carry a configuration, so it has to be the default one.
const port = 4310;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  // Locally Nx starts travel:serve first, or a dev server you already run on this port
  // is reused. On CI Playwright starts the server itself.
  webServer: {
    command: 'npx nx run travel:serve',
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    cwd: '../..',
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
