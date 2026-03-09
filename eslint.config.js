import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import cssModules from 'eslint-plugin-css-modules';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import testingLibrary from 'eslint-plugin-testing-library';
import noticeConfig from './notice.config.js';
import typescriptParser from '@typescript-eslint/parser';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	react.configs.flat.recommended,
	react.configs.flat['jsx-runtime'],
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
			'react-hooks': reactHooks,
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
			'css-modules': cssModules,
			'jsx-a11y': jsxA11y
		},
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: './tsconfig.eslint.json',
				tsconfigRootDir: __dirname
			}
		},
		settings: { react: { version: 'detect' } },
		rules: {
			...reactHooks.configs.recommended.rules,
			...jsxA11y.configs.recommended.rules,
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
			'react/no-children-prop': 'warn',
			'@typescript-eslint/no-unused-expressions': 'warn',
			'@typescript-eslint/no-require-imports': 'warn',
			'@typescript-eslint/no-unsafe-function-type': 'warn',
			'@typescript-eslint/no-empty-object-type': 'warn',
			'react/prop-types': 'off'
		}
	},
	noticeConfig,
	{
		files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
		plugins: {
			'testing-library': testingLibrary
		},
		rules: {
			...testingLibrary.configs['flat/react'].rules
		}
	}
);
