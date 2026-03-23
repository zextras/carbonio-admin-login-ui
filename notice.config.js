/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import notice from 'eslint-plugin-notice';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const noticeRule = {
  ignores: [
    '**/node_modules/**',
    'dist/**',
    '**/build/**',
    'coverage/**',
    'scripts/**',
    '**/notice.template.ts',
  ],
  plugins: {
    notice: notice,
  },
  rules: {
    'notice/notice': [
      'error',
      {
        templateFile: resolve(__dirname, 'notice.template.ts'),
        templateVars: {
          year: new Date().getFullYear(),
          author: 'Zextras <https://www.zextras.com>',
          license: 'AGPL-3.0-only',
        },
        varRegexps: {
          year: /20\d{2}/,
        },
        onNonMatchingHeader: 'replace',
      },
    ],
  },
};

export default noticeRule;
