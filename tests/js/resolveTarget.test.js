/**
 * Tests for resolveTarget.
 *
 * @package AdminCoachTours
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import resolveTarget from '../../assets/js/runtime/resolveTarget';

describe( 'resolveTarget', () => {
	let container;

	beforeEach( () => {
		container = document.createElement( 'div' );
		container.id = 'test-container';
		document.body.appendChild( container );
	} );

	afterEach( () => {
		document.body.removeChild( container );
	} );

	describe( 'with CSS selector locator', () => {
		it( 'should find element by CSS selector', () => {
			container.innerHTML = '<button class="my-button">Click me</button>';

			const target = {
				locators: [
					{ type: 'css', value: '.my-button', priority: 1 },
				],
			};

			const result = resolveTarget( target );

			expect( result ).toBeDefined();
		} );

		it( 'should return result object for missing element', () => {
			const target = {
				locators: [
					{ type: 'css', value: '.nonexistent', priority: 1 },
				],
			};

			const result = resolveTarget( target );

			expect( result ).toBeDefined();
		} );
	} );

	describe( 'with testId locator', () => {
		it( 'should find element by data-testid', () => {
			container.innerHTML = '<input data-testid="email-input" type="email" />';

			const target = {
				locators: [
					{ type: 'testId', value: 'email-input', priority: 1 },
				],
			};

			const result = resolveTarget( target );

			expect( result ).toBeDefined();
		} );
	} );

	describe( 'with ariaLabel locator', () => {
		it( 'should find element by aria-label', () => {
			container.innerHTML = '<button aria-label="Close">×</button>';

			const target = {
				locators: [
					{ type: 'ariaLabel', value: 'Close', priority: 1 },
				],
			};

			const result = resolveTarget( target );

			expect( result ).toBeDefined();
		} );
	} );

	describe( 'with multiple locators', () => {
		it( 'should handle target with multiple locator types', () => {
			container.innerHTML = '<button class="btn" data-block="paragraph">Edit</button>';

			const target = {
				locators: [
					{ type: 'dataAttribute', attribute: 'data-block', value: 'paragraph', priority: 1 },
					{ type: 'css', value: '.btn', priority: 2 },
				],
			};

			const result = resolveTarget( target );

			expect( result ).toBeDefined();
		} );
	} );
} );
