/**
 * Tests for captureLocatorBundle.
 *
 * @package AdminCoachTours
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import captureLocatorBundle, { captureElementContext } from '../../assets/js/runtime/captureLocatorBundle';

describe( 'captureLocatorBundle', () => {
	let container;

	beforeEach( () => {
		container = document.createElement( 'div' );
		container.id = 'test-container';
		document.body.appendChild( container );
	} );

	afterEach( () => {
		document.body.removeChild( container );
	} );

	describe( 'basic capture', () => {
		it( 'should return a bundle object with locators array', () => {
			container.innerHTML = '<button id="my-button">Click</button>';
			const button = container.querySelector( '#my-button' );

			const bundle = captureLocatorBundle( button );

			expect( bundle ).toBeDefined();
			expect( bundle.locators ).toBeDefined();
			expect( Array.isArray( bundle.locators ) ).toBe( true );
		} );

		it( 'should capture element with data-testid', () => {
			container.innerHTML = '<button data-testid="submit-btn">Submit</button>';
			const button = container.querySelector( '[data-testid="submit-btn"]' );

			const bundle = captureLocatorBundle( button );
			const testIdLocator = bundle.locators.find( ( l ) => l.type === 'testId' );

			expect( testIdLocator ).toBeDefined();
			expect( testIdLocator.value ).toBe( 'submit-btn' );
		} );

		it( 'should capture element with aria-label', () => {
			container.innerHTML = '<button aria-label="Close modal">×</button>';
			const button = container.querySelector( '[aria-label]' );

			const bundle = captureLocatorBundle( button );
			const ariaLocator = bundle.locators.find( ( l ) => l.type === 'ariaLabel' );

			expect( ariaLocator ).toBeDefined();
			expect( ariaLocator.value ).toBe( 'Close modal' );
		} );

		it( 'should include multiple locator types when available', () => {
			container.innerHTML = '<button id="btn" data-testid="test-btn" aria-label="Test">Click</button>';
			const button = container.querySelector( '#btn' );

			const bundle = captureLocatorBundle( button );
			const types = bundle.locators.map( ( l ) => l.type );

			expect( types ).toContain( 'testId' );
			expect( types ).toContain( 'ariaLabel' );
		} );
	} );
} );

describe( 'captureElementContext', () => {
	let container;

	beforeEach( () => {
		container = document.createElement( 'div' );
		container.id = 'context-test-container';
		document.body.appendChild( container );
	} );

	afterEach( () => {
		document.body.removeChild( container );
	} );

	it( 'should extract tag name', () => {
		container.innerHTML = '<button>Click</button>';
		const button = container.querySelector( 'button' );

		const context = captureElementContext( button );

		expect( context.tagName ).toBe( 'button' );
	} );

	it( 'should extract id if present', () => {
		container.innerHTML = '<div id="my-div">Content</div>';
		const div = container.querySelector( '#my-div' );

		const context = captureElementContext( div );

		expect( context.id ).toBe( 'my-div' );
	} );

	it( 'should extract role attribute', () => {
		container.innerHTML = '<div role="navigation">Nav</div>';
		const nav = container.querySelector( '[role]' );

		const context = captureElementContext( nav );

		expect( context.role ).toBe( 'navigation' );
	} );
} );
