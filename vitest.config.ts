/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test-setup.ts'],
		include: ['src/**/*.{test,spec}.{ts,tsx,js,jsx}'],
		css: {
			modules: {
				classNameStrategy: 'non-scoped'
			}
		},
		includeSource: ['src/**/*.{ts,tsx}']
	},
	resolve: {
		alias: {
			assets: resolve(__dirname, 'assets')
		}
	}
});
