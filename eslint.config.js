const globals = require('globals');
const pluginJs = require('@eslint/js');
const stylisticJs = require('@stylistic/eslint-plugin-js');

module.exports = [
	{ files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	{
		files: ['tests/**/*'],
		languageOptions: { globals: globals.jest },
	},
	pluginJs.configs.recommended,
	stylisticJs.configs['all-flat'],
	{
		rules: {
			'prefer-const': 'error',
			'no-use-before-define': 'error',
			'no-unused-vars': ['error', { ignoreRestSiblings: true }],
			'@stylistic/js/quotes': ['error', 'single'],
			'@stylistic/js/indent': ['error', 'tab'],
			'@stylistic/js/quote-props': ['error', 'as-needed'],
			'@stylistic/js/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
			'@stylistic/js/array-element-newline': ['error', 'consistent'],
			'@stylistic/js/function-call-argument-newline': ['error', 'consistent'],
			'@stylistic/js/function-paren-newline': ['error', 'consistent'],
			'@stylistic/js/space-before-function-paren': [
				'error',
				{ anonymous: 'always', named: 'never', asyncArrow: 'always' },
			],
			'@stylistic/js/object-curly-spacing': ['error', 'always'],
			'@stylistic/js/padded-blocks': ['error', 'never'],
			'@stylistic/js/multiline-ternary': ['error', 'always-multiline'],
			'@stylistic/js/comma-dangle': ['error', 'always-multiline'],
			'@stylistic/js/newline-per-chained-call': ['error', { ignoreChainWithDepth: 5 }],
			'@stylistic/js/dot-location': ['error', 'property'],
			'@stylistic/js/lines-between-class-members': [
				'error',
				{ enforce: [{ blankLine: 'always', prev: 'method', next: 'method' }] },
			],
			'@stylistic/js/multiline-comment-style': ['error', 'separate-lines'],
			'@stylistic/js/lines-around-comment': ['error', { allowBlockStart: true }],
		},
	},
];
