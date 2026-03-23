/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { playwright } from '@vitest/browser-playwright';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

function getPlugins() {
  return [
    svgr({
      svgrOptions: {
        ref: true,
        svgo: false,
        titleProp: true,
        exportType: 'default',
      },
      include: '**/*.svg',
    }),
  ];
}

function browserProjectConfig() {
  return {
    define: {
      BASE_PATH: JSON.stringify(''),
    },
    test: {
      name: 'browser',
      maxConcurrency: 3,
      setupFiles: ['./vitest-browser-setup.ts'],
      sequence: {
        groupOrder: 2,
      },
      fileParallelism: false,
      retry: 2,
      include: ['**/*.browser.test.{ts,tsx}'],
      browser: {
        enabled: true,
        provider: playwright(),
        instances: [{ browser: 'chromium' as const }],
        viewport: { width: 834, height: 2000 },
        headless: !!process.env.CI,
        screenshotFailures: !process.env.CI,
        providerOptions: { launch: { timeout: 60_000 } },
      },
      exclude: ['dist/**', 'node_modules/**'],
      globals: true,
      css: true,
      clearMocks: true,
      testTimeout: process.env.ci ? 20_000 : 10_000,
      hookTimeout: 15_000,
    },
    plugins: getPlugins(),
  };
}

export default defineConfig({
  server: {
    fs: {
      allow: ['../..'], // allow monorepo root
    },
  },
  test: {
    globals: true,
    passWithNoTests: true,
    maxConcurrency: 3,
    projects: [browserProjectConfig()],

    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/[.]**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        '**/{karma,vite,vitest,ava,babel,nyc,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
        '**/*.config.{js,ts}',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      include: ['src/**/*.{ts,tsx}'],
    },
  },
});
