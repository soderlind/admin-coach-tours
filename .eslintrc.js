module.exports = {
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	env: {
		browser: true,
		es2022: true,
	},
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	globals: {
		wp: 'readonly',
		adminCoachToursData: 'readonly',
	},
	rules: {
		// Allow console for development.
		'no-console': [ 'warn', { allow: [ 'warn', 'error' ] } ],
		// Prefer template literals.
		'prefer-template': 'error',
		// Consistent JSX boolean attributes.
		'react/jsx-boolean-value': [ 'error', 'never' ],
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	overrides: [
		{
			files: [ 'tests/**/*.js' ],
			env: {
				jest: true,
			},
			globals: {
				vi: 'readonly',
				describe: 'readonly',
				it: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
			},
		},
	],
};
