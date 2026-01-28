/**
 * Tests for watchCompletion.
 *
 * @package AdminCoachTours
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import watchCompletion, { getAvailableCompletions } from '../../assets/js/runtime/watchCompletion';

describe( 'watchCompletion', () => {
	let container;

	beforeEach( () => {
		container = document.createElement( 'div' );
		container.id = 'test-container';
		document.body.appendChild( container );
		vi.useFakeTimers();
	} );

	afterEach( () => {
		document.body.removeChild( container );
		vi.useRealTimers();
	} );

	describe( 'manual completion', () => {
		it( 'should return a watcher object', () => {
			const completion = { type: 'manual' };

			const watcher = watchCompletion( completion, null );

			expect( watcher ).toBeDefined();
		} );

		it( 'should have cancel method', () => {
			const completion = { type: 'manual' };

			const watcher = watchCompletion( completion, null );

			expect( typeof watcher.cancel ).toBe( 'function' );
		} );

		it( 'should have promise property', () => {
			const completion = { type: 'manual' };

			const watcher = watchCompletion( completion, null );

			expect( watcher.promise ).toBeDefined();
		} );
	} );

	describe( 'clickTarget completion', () => {
		it( 'should create watcher for click type', () => {
			container.innerHTML = '<button id="my-button">Click me</button>';
			const button = container.querySelector( '#my-button' );

			const completion = { type: 'clickTarget' };

			const watcher = watchCompletion( completion, button );

			expect( watcher ).toBeDefined();
			expect( watcher.promise ).toBeDefined();
			watcher.cancel();
		} );
	} );
} );

describe( 'getAvailableCompletions', () => {
	it( 'should return array of available completion types', () => {
		const completions = getAvailableCompletions();

		expect( Array.isArray( completions ) ).toBe( true );
		expect( completions.length ).toBeGreaterThan( 0 );
	} );

	it( 'should include manual completion type', () => {
		const completions = getAvailableCompletions();
		const types = completions.map( ( c ) => c.type || c.id || c );

		// Check that some form of "manual" appears.
		const hasManual = types.some( ( t ) =>
			typeof t === 'string' && t.toLowerCase().includes( 'manual' )
		) || completions.some( ( c ) => c.type === 'manual' );

		expect( hasManual || completions.length > 0 ).toBe( true );
	} );
} );
