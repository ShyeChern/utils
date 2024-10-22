import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
	pluginJs.configs.recommended,
	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	...tseslint.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		ignores: ['**/*.js', '**/*d.ts'],
	},
	{
		files: ['tests/**/*'],
		languageOptions: { globals: globals.jest, sourceType: 'commonjs' },
	},
	{
		plugins: {
			'@stylistic': stylistic,
			import: importPlugin,
		},
	},
	eslintPluginUnicorn.configs['flat/recommended'],
	{
		rules: {
			'prefer-const': 'error',
			'no-use-before-define': 'error',
			'unicorn/prefer-node-protocol': 'error',
			'no-unused-vars': ['error', { ignoreRestSiblings: true }],
			'@typescript-eslint/no-explicit-any': 'off',
			'@stylistic/quotes': ['error', 'single'],
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/quote-props': ['error', 'as-needed'],
			'@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
			'@stylistic/array-element-newline': ['error', 'consistent'],
			'@stylistic/function-call-argument-newline': ['error', 'consistent'],
			'@stylistic/function-paren-newline': ['error', 'consistent'],
			'@stylistic/space-before-function-paren': [
				'error',
				{ anonymous: 'always', named: 'never', asyncArrow: 'always' },
			],
			'@stylistic/object-curly-spacing': ['error', 'always'],
			'@stylistic/padded-blocks': ['error', 'never'],
			'@stylistic/multiline-ternary': ['error', 'always-multiline'],
			'@stylistic/comma-dangle': ['error', 'always-multiline'],
			'@stylistic/newline-per-chained-call': ['error', { ignoreChainWithDepth: 5 }],
			'@stylistic/dot-location': ['error', 'property'],
			'@stylistic/lines-between-class-members': [
				'error',
				{ enforce: [{ blankLine: 'always', prev: 'method', next: 'method' }] },
			],
			'@stylistic/multiline-comment-style': ['error', 'separate-lines'],
			'@stylistic/lines-around-comment': [
				'error',
				{ allowBlockStart: true, beforeBlockComment: false },
			],
			'@stylistic/nonblock-statement-body-position': ['error', 'beside'],
			'unicorn/prevent-abbreviations': 'off',
			'unicorn/prefer-module': 'off',
			'unicorn/no-anonymous-default-export': 'off',
			'unicorn/prefer-spread': 'off',
			'unicorn/no-static-only-class': 'off',
			'unicorn/prefer-top-level-await': 'off',
			'unicorn/no-array-reduce': 'off',
			'unicorn/no-null': 'off',
			'unicorn/numeric-separators-style': 'off',
			'import/order': 'error',
		},
	},
);
