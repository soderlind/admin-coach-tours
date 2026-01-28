/**
 * External dependencies
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		'educator/index': path.resolve( __dirname, 'assets/js/educator/index.js' ),
		'pupil/index': path.resolve( __dirname, 'assets/js/pupil/index.js' ),
		'settings': path.resolve( __dirname, 'assets/js/settings.js' ),
	},
	output: {
		...defaultConfig.output,
		path: path.resolve( __dirname, 'build' ),
	},
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...( defaultConfig.resolve?.alias || {} ),
			'@': path.resolve( __dirname, 'assets/js' ),
		},
	},
};
