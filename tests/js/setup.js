/**
 * Vitest test setup file.
 *
 * @package AdminCoachTours
 */

import { vi } from 'vitest';

// Polyfill CSS.escape if not available (not in jsdom).
if ( typeof CSS === 'undefined' || ! CSS.escape ) {
	globalThis.CSS = {
		escape: ( str ) => {
			if ( ! str ) {
				return '';
			}
			return str
				.replace( /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '\\$&' )
				.replace( /^-+/, ( match ) => match.replace( /-/g, '\\-' ) )
				.replace( /^\d/, '\\3$& ' );
		},
	};
}

// Mock @wordpress/data.
vi.mock( '@wordpress/data', () => ( {
	select: vi.fn(),
	dispatch: vi.fn(),
	subscribe: vi.fn( () => vi.fn() ),
	createReduxStore: vi.fn(),
	register: vi.fn(),
} ) );

// Mock @wordpress/i18n.
vi.mock( '@wordpress/i18n', () => ( {
	__: vi.fn( ( str ) => str ),
	_x: vi.fn( ( str ) => str ),
	_n: vi.fn( ( single, plural, number ) => ( number === 1 ? single : plural ) ),
	sprintf: vi.fn( ( format, ...args ) => {
		let result = format;
		args.forEach( ( arg, index ) => {
			result = result.replace( new RegExp( `%${ index + 1 }\\$s|%s`, 'g' ), arg );
		} );
		return result;
	} ),
} ) );

// Mock DOM APIs that may not be available in jsdom.
global.ResizeObserver = vi.fn().mockImplementation( () => ( {
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
} ) );

global.MutationObserver = vi.fn().mockImplementation( () => ( {
	observe: vi.fn(),
	disconnect: vi.fn(),
	takeRecords: vi.fn( () => [] ),
} ) );

// Set up global WordPress object.
global.wp = {
	data: {
		select: vi.fn(),
		dispatch: vi.fn(),
		subscribe: vi.fn( () => vi.fn() ),
	},
	i18n: {
		__: ( str ) => str,
		_x: ( str ) => str,
		_n: ( single, plural, number ) => ( number === 1 ? single : plural ),
		sprintf: ( format, ...args ) => {
			let result = format;
			args.forEach( ( arg, index ) => {
				result = result.replace( new RegExp( `%${ index + 1 }\\$s|%s`, 'g' ), arg );
			} );
			return result;
		},
	},
};

// Mock Element.animate if not available.
if ( ! Element.prototype.animate ) {
	Element.prototype.animate = vi.fn().mockReturnValue( {
		finished: Promise.resolve(),
		cancel: vi.fn(),
		play: vi.fn(),
		pause: vi.fn(),
	} );
}
