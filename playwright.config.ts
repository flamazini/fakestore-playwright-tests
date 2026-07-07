import { defineConfig } from '@playwright/test';
import { config } from './src/config/config';

const isLocal = config.baseUrl.includes('localhost') || config.baseUrl.includes('127.0.0.1');

export default defineConfig({
  testDir: './tests',
  timeout: 15000,
  fullyParallel: false, // deterministic order, easier to reason about for now
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: config.baseUrl,
    trace: 'retain-on-failure',
  },
  webServer: isLocal
    ? {
        command: 'npm run mock-server',
        url: `${config.baseUrl}/products`,
        reuseExistingServer: true,
        timeout: 10000,
        env: { MOCK_PORT: String(config.mockPort) },
      }
    : undefined,
});