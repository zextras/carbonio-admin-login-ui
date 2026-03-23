import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import cssModules from 'eslint-plugin-css-modules';
import noticeConfig from './notice.config.js';
import typescriptParser from '@typescript-eslint/parser';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/dist-types/**',
			'**/build/**',
			'**/coverage/**',
			'**/*vitest*',
			'**/*.config.*',
			'**/.prettierrc.js',
			'**/.reuse/template.js',
			'**/fileTransformer.js'
		]
	},
	{
		plugins: {
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
			'css-modules': cssModules
		},
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: './tsconfig.eslint.json',
				tsconfigRootDir: __dirname
			}
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
					'ts-ignore': true
				}
			],
			// TODO: remove all the rules below this line once the codebase is cleaned up
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-expressions': 'warn',
			'@typescript-eslint/no-require-imports': 'warn',
			'@typescript-eslint/no-unsafe-function-type': 'warn',
			'@typescript-eslint/no-empty-object-type': 'warn'
		}
	},
	noticeConfig
);
