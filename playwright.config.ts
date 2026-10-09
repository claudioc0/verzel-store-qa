import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    // Cada execução grava em playwright-report/ (fora do Git). O relatório da entrega fica preservado
    // em evidencias/automacao/relatorio/ e só é atualizado de propósito, com npm run relatorio:entrega.
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'https://verzel-store.qa-test-verzel-store.workers.dev',
    locale: 'pt-BR',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'api', testDir: './tests/api' },
    { name: 'ui-chromium', testDir: './tests/ui', use: { ...devices['Desktop Chrome'] } },
  ],
});
