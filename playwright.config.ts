import { defineConfig } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'e2e',
  workers: 1,
  timeout: 240_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: { actionTimeout: 2000, baseURL: `http://localhost:${PORT}`, channel: 'msedge', headless: true },
  webServer: {
    command: 'node e2e/serve.mjs',
    port: PORT,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      PORT: String(PORT),
      BIBERDAMM_DB: '.e2e-data/e2e.db'
    }
  }
});
