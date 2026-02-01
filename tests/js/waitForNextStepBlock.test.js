/**
 * Tests for waitForNextStepBlock.
 *
 * @package AdminCoachTours
 * @since   0.3.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getExpectedBlockType,
	hasBlockOfType,
	waitForNextStepBlock,
} from '../../assets/js/runtime/waitForNextStepBlock';

// Mock WordPress data module.
vi.mock( '@wordpress/data', () => ( {
	select: vi.fn(),
	subscribe: vi.fn(),
} ) );

import { select, subscribe } from '@wordpress/data';

describe( 'waitForNextStepBlock', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	describe( 'getExpectedBlockType', () => {
		it( 'returns null for step without target', () => {
			expect( getExpectedBlockType( {} ) ).toBeNull();
			expect( getExpectedBlockType( { target: null } ) ).toBeNull();
		} );

		it( 'extracts block type from constraints', () => {
			const step = {
				target: {
					constraints: {
						blockType: 'core/image',
					},
				},
			};

			expect( getExpectedBlockType( step ) ).toBe( 'core/image' );
		} );

		it( 'extracts block type from data-type locator', () => {
			const step = {
				target: {
					locators: [
						{
							type: 'dataAttribute',
							attribute: 'data-type',
							value: 'core/video',
						},
					],
				},
			};

			expect( getExpectedBlockType( step ) ).toBe( 'core/video' );
		} );

		it( 'extracts block type from block locator', () => {
			const step = {
				target: {
					locators: [
						{
							type: 'block',
							blockName: 'core/gallery',
						},
					],
				},
			};

			expect( getExpectedBlockType( step ) ).toBe( 'core/gallery' );
		} );

		it( 'extracts block type from CSS selector with data-type', () => {
			const step = {
				target: {
					locators: [
						{
							type: 'css',
							value: '[data-type="core/paragraph"]',
						},
					],
				},
			};

			expect( getExpectedBlockType( step ) ).toBe( 'core/paragraph' );
		} );

		it( 'extracts block type from .wp-block-* CSS selector', () => {
			const step = {
				target: {
					locators: [
						{
							type: 'css',
							value: '.wp-block-image figure',
						},
					],
				},
			};

			expect( getExpectedBlockType( step ) ).toBe( 'core/image' );
		} );
	} );

	describe( 'hasBlockOfType', () => {
		it( 'returns true when block exists at top level', () => {
			select.mockReturnValue( {
				getBlocks: () => [
					{ name: 'core/paragraph', innerBlocks: [] },
					{ name: 'core/image', innerBlocks: [] },
				],
			} );

			expect( hasBlockOfType( 'core/image' ) ).toBe( true );
		} );

		it( 'returns true when block exists in inner blocks', () => {
			select.mockReturnValue( {
				getBlocks: () => [
					{
						name: 'core/group',
						innerBlocks: [
							{ name: 'core/paragraph', innerBlocks: [] },
							{ name: 'core/video', innerBlocks: [] },
						],
					},
				],
			} );

			expect( hasBlockOfType( 'core/video' ) ).toBe( true );
		} );

		it( 'returns false when block does not exist', () => {
			select.mockReturnValue( {
				getBlocks: () => [
					{ name: 'core/paragraph', innerBlocks: [] },
					{ name: 'core/heading', innerBlocks: [] },
				],
			} );

			expect( hasBlockOfType( 'core/image' ) ).toBe( false );
		} );

		it( 'returns false when store is not available', () => {
			select.mockReturnValue( null );

			expect( hasBlockOfType( 'core/image' ) ).toBe( false );
		} );
	} );

	describe( 'waitForNextStepBlock', () => {
		it( 'returns waited: false when no next step', async () => {
			const steps = [ { id: 'step-1' } ];
			const result = await waitForNextStepBlock( steps, 0 );

			expect( result.waited ).toBe( false );
		} );

		it( 'returns waited: false when next step has no expected block', async () => {
			const steps = [
				{ id: 'step-1' },
				{ id: 'step-2', target: { locators: [ { type: 'css', value: '.btn' } ] } },
			];

			const result = await waitForNextStepBlock( steps, 0 );

			expect( result.waited ).toBe( false );
		} );

		it( 'returns waited: false when block already exists', async () => {
			select.mockReturnValue( {
				getBlocks: () => [
					{ name: 'core/image', innerBlocks: [] },
				],
			} );

			const steps = [
				{ id: 'step-1' },
				{
					id: 'step-2',
					target: {
						constraints: { blockType: 'core/image' },
					},
				},
			];

			const result = await waitForNextStepBlock( steps, 0 );

			expect( result.waited ).toBe( false );
			expect( result.blockType ).toBe( 'core/image' );
		} );

		it( 'waits and returns success when block appears', async () => {
			// Initially no image block.
			let hasImage = false;
			select.mockImplementation( () => ( {
				getBlocks: () =>
					hasImage
						? [ { name: 'core/image', innerBlocks: [] } ]
						: [ { name: 'core/paragraph', innerBlocks: [] } ],
			} ) );

			// Mock subscribe to call callback after simulating block insertion.
			subscribe.mockImplementation( ( callback ) => {
				setTimeout( () => {
					hasImage = true;
					callback();
				}, 50 );
				return () => {};
			} );

			const steps = [
				{ id: 'step-1' },
				{
					id: 'step-2',
					target: {
						constraints: { blockType: 'core/image' },
					},
				},
			];

			const result = await waitForNextStepBlock( steps, 0, 1000 );

			expect( result.waited ).toBe( true );
			expect( result.blockType ).toBe( 'core/image' );
			expect( result.success ).toBe( true );
		} );
	} );
} );
