import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import process from 'node:process';
import typescriptEslint from 'typescript-eslint';

export default [
	// Global config
	{
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},

	// Ignored files
	{
		ignores: [
			'**/dist/',
			'**/node_modules/',
			'src/tests/debug-items.js',
			'src/tests/directus-versions.js',
		],
	},

	// Enable recommended rules for JS files
	eslintJs.configs.recommended,

	// Custom basic rules
	{
		rules: {
			// No console & debugger statements in production
			'no-console': process.env.NODE_ENV !== 'development' ? 'error' : 'off',
			'no-debugger': process.env.NODE_ENV !== 'development' ? 'error' : 'off',
			// Require empty line between certain statements
			'padding-line-between-statements': [
				'error',
				{
					blankLine: 'always',
					prev: [
						'block',
						'block-like',
						'cjs-export',
						'class',
						'export',
						'import',
						'multiline-block-like',
						'multiline-const',
						'multiline-expression',
						'multiline-let',
						'multiline-var',
					],
					next: '*',
				},
				{
					blankLine: 'always',
					prev: ['const', 'let'],
					next: ['block', 'block-like', 'cjs-export', 'class', 'export', 'import'],
				},
				{
					blankLine: 'always',
					prev: '*',
					next: [
						'multiline-block-like',
						'multiline-const',
						'multiline-expression',
						'multiline-let',
						'multiline-var',
					],
				},
				{ blankLine: 'any', prev: ['export', 'import'], next: ['export', 'import'] },
			],
			// Require empty line between class members
			'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
			// Disallow nested ternary expressions
			'no-nested-ternary': 'error',
			// Require brace style for multi-line control statements
			curly: ['error', 'multi-line'],
			// Disallow expressions where the operation doesn't affect the value
			'no-constant-binary-expression': 'error',
		},
	},

	// Enable TypeScript plugin and recommended rules for TypeScript files
	...typescriptEslint.configs.recommended,

	// Custom TypeScript rules
	{
		files: ['**/*.ts'],
		rules: {
			// Allow unused arguments and variables when they begin with an underscore
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			// Allow ts-directive comments (used to suppress TypeScript compiler errors)
			'@typescript-eslint/ban-ts-comment': 'off',
			// Allow usage of the any type (consider enabling this rule later on)
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},

	// Test files
	{
		files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'no-console': 'off',
		},
	},

	eslintConfigPrettier,
];
