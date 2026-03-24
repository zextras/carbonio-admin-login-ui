/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

import noticeConfig from './notice.config.js';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'src/mockServiceWorker.js',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.config.*',
      '.prettierrc',
      '.reuse/template.js',
    ],
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      parser: typescriptParser,
    },
    rules: {
      'no-console': ['error', { allow: ['error'] }],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-duplicate-imports': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
        },
      ],
    },
  },
  noticeConfig,
);
