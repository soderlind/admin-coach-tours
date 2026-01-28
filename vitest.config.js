import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig( {
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: [ './tests/js/setup.js' ],
		include: [ 'tests/js/**/*.test.js' ],
		coverage: {
			provider: 'v8',
			reporter: [ 'text', 'json', 'html' ],
			include: [ 'assets/js/**/*.js', 'assets/js/**/*.jsx' ],
			exclude: [
				'assets/js/types/**',
				'node_modules/**',
				'build/**',
			],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve( __dirname, 'assets/js' ),
		},
	},
} );
