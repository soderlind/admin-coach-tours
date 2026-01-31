/**
 * Tests for gatherEditorContext.
 *
 * @package AdminCoachTours
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { gatherEditorContext } from '../../assets/js/runtime/gatherEditorContext';

// Mock @wordpress/data.
vi.mock( '@wordpress/data', () => ( {
	select: vi.fn(),
} ) );

import { select } from '@wordpress/data';

describe( 'gatherEditorContext', () => {
	beforeEach( () => {
		// Reset mocks.
		vi.clearAllMocks();

		// Mock basic store responses.
		select.mockImplementation( ( storeName ) => {
			if ( storeName === 'core/block-editor' ) {
				return {
					getBlocks: () => [
						{
							name: 'core/paragraph',
							clientId: 'block-1',
							attributes: { content: '' },
						},
					],
					getSelectedBlock: () => null,
				};
			}
			if ( storeName === 'core/editor' ) {
				return {
					isInserterOpened: () => false,
				};
			}
			if ( storeName === 'core/edit-post' ) {
				return {
					getActiveGeneralSidebarName: () => null,
				};
			}
			return {};
		} );

		// Clear any existing DOM elements.
		document.body.innerHTML = '';
	} );

	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'should return expected structure', () => {
		const context = gatherEditorContext();

		expect( context ).toHaveProperty( 'editorBlocks' );
		expect( context ).toHaveProperty( 'visibleElements' );
		expect( context ).toHaveProperty( 'uiSamples' );
		expect( context ).toHaveProperty( 'timestamp' );
	} );

	it( 'should collect editor blocks', () => {
		const context = gatherEditorContext();

		expect( context.editorBlocks ).toBeInstanceOf( Array );
		expect( context.editorBlocks ).toHaveLength( 1 );
		expect( context.editorBlocks[ 0 ] ).toMatchObject( {
			name: 'core/paragraph',
			clientId: 'block-1',
			isEmpty: true,
		} );
	} );

	it( 'should collect visible elements state', () => {
		const context = gatherEditorContext();

		expect( context.visibleElements ).toMatchObject( {
			inserterOpen: false,
			sidebarOpen: false,
			sidebarTab: null,
			hasSelectedBlock: false,
			selectedBlockType: null,
		} );
	} );

	it( 'should detect open inserter', () => {
		select.mockImplementation( ( storeName ) => {
			if ( storeName === 'core/editor' ) {
				return {
					isInserterOpened: () => true,
				};
			}
			if ( storeName === 'core/block-editor' ) {
				return {
					getBlocks: () => [],
					getSelectedBlock: () => null,
				};
			}
			return {};
		} );

		const context = gatherEditorContext();
		expect( context.visibleElements.inserterOpen ).toBe( true );
	} );

	it( 'should detect selected block', () => {
		select.mockImplementation( ( storeName ) => {
			if ( storeName === 'core/block-editor' ) {
				return {
					getBlocks: () => [],
					getSelectedBlock: () => ( {
						name: 'core/image',
						clientId: 'selected-block',
					} ),
				};
			}
			return {};
		} );

		const context = gatherEditorContext();
		expect( context.visibleElements.hasSelectedBlock ).toBe( true );
		expect( context.visibleElements.selectedBlockType ).toBe( 'core/image' );
	} );

	it( 'should sample UI elements when present', () => {
		// Add inserter button to DOM.
		const button = document.createElement( 'button' );
		button.className = 'editor-document-tools__inserter-toggle';
		button.setAttribute( 'aria-label', 'Toggle block inserter' );
		button.style.width = '40px';
		button.style.height = '40px';
		document.body.appendChild( button );

		const context = gatherEditorContext();

		// Note: visibility check may fail in JSDOM since getBoundingClientRect returns 0.
		expect( context.uiSamples ).toHaveProperty( 'inserterButton' );
	} );

	it( 'should handle missing stores gracefully', () => {
		select.mockImplementation( () => null );

		// Should not throw.
		const context = gatherEditorContext();

		expect( context.editorBlocks ).toEqual( [] );
	} );

	it( 'should identify empty paragraph blocks', () => {
		select.mockImplementation( ( storeName ) => {
			if ( storeName === 'core/block-editor' ) {
				return {
					getBlocks: () => [
						{
							name: 'core/paragraph',
							clientId: 'block-1',
							attributes: { content: '' },
						},
						{
							name: 'core/paragraph',
							clientId: 'block-2',
							attributes: { content: 'Has content' },
						},
					],
					getSelectedBlock: () => null,
				};
			}
			return {};
		} );

		const context = gatherEditorContext();

		expect( context.editorBlocks[ 0 ].isEmpty ).toBe( true );
		expect( context.editorBlocks[ 1 ].isEmpty ).toBe( false );
	} );

	it( 'should identify empty image blocks', () => {
		select.mockImplementation( ( storeName ) => {
			if ( storeName === 'core/block-editor' ) {
				return {
					getBlocks: () => [
						{
							name: 'core/image',
							clientId: 'block-1',
							attributes: { url: '' },
						},
						{
							name: 'core/image',
							clientId: 'block-2',
							attributes: { url: 'https://example.com/image.jpg' },
						},
					],
					getSelectedBlock: () => null,
				};
			}
			return {};
		} );

		const context = gatherEditorContext();

		expect( context.editorBlocks[ 0 ].isEmpty ).toBe( true );
		expect( context.editorBlocks[ 1 ].isEmpty ).toBe( false );
	} );
} );
