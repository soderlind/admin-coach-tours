/**
 * Tests for ensureEmptyPlaceholder.
 *
 * @package AdminCoachTours
 * @since   0.3.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	hasEmptyParagraph,
	insertEmptyParagraph,
	ensureEmptyPlaceholder,
} from '../../assets/js/runtime/ensureEmptyPlaceholder';

// Mock WordPress data module.
vi.mock( '@wordpress/data', () => ( {
	select: vi.fn(),
	dispatch: vi.fn(),
} ) );

// Mock WordPress blocks module.
vi.mock( '@wordpress/blocks', () => ( {
	createBlock: vi.fn(),
} ) );

import { select, dispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

describe( 'ensureEmptyPlaceholder', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	describe( 'hasEmptyParagraph', () => {
		it( 'returns true when empty paragraph exists', () => {
			select.mockReturnValue( {
				getBlocks: () => [
					{ name: 'core/paragraph', attributes: { content: '' } },
				],
			} );

			expect( hasEmptyParagraph() ).toBe( true );
		} );

		it( 'returns true when paragraph has no content attribute', () => {
			select.mockReturnValue( {
				getBlocks: () => [
					{ name: 'core/paragraph', attributes: {} },
				],
			} );

			expect( hasEmptyParagraph() ).toBe( true );
		} );

		it( 'returns false when no empty paragraph exists', () => {
			select.mockReturnValue( {
				getBlocks: () => [
					{ name: 'core/paragraph', attributes: { content: 'Hello world' } },
					{ name: 'core/heading', attributes: { content: 'Title' } },
				],
			} );

			expect( hasEmptyParagraph() ).toBe( false );
		} );

		it( 'returns false when no blocks exist', () => {
			select.mockReturnValue( {
				getBlocks: () => [],
			} );

			expect( hasEmptyParagraph() ).toBe( false );
		} );

		it( 'returns false when store is not available', () => {
			select.mockReturnValue( null );

			expect( hasEmptyParagraph() ).toBe( false );
		} );

		it( 'returns false when getBlocks is not available', () => {
			select.mockReturnValue( {} );

			expect( hasEmptyParagraph() ).toBe( false );
		} );
	} );

	describe( 'insertEmptyParagraph', () => {
		it( 'creates and inserts an empty paragraph block', async () => {
			const mockInsertBlock = vi.fn().mockResolvedValue( undefined );
			const mockSelectBlock = vi.fn().mockResolvedValue( undefined );
			const mockClientId = 'test-client-id-123';

			createBlock.mockReturnValue( {
				name: 'core/paragraph',
				clientId: mockClientId,
				attributes: { content: '' },
			} );

			select.mockReturnValue( {
				getBlocks: () => [
					{ name: 'core/heading', clientId: 'block-1' },
				],
			} );

			dispatch.mockReturnValue( {
				insertBlock: mockInsertBlock,
				selectBlock: mockSelectBlock,
			} );

			const result = await insertEmptyParagraph();

			expect( result ).toBe( mockClientId );
			expect( createBlock ).toHaveBeenCalledWith( 'core/paragraph', { content: '' } );
			expect( mockInsertBlock ).toHaveBeenCalledWith(
				expect.objectContaining( {
					name: 'core/paragraph',
					clientId: mockClientId,
				} ),
				1, // Insert at end (1 existing block)
				'',
				false
			);
		} );

		it( 'returns null when block editor dispatch is not available', async () => {
			dispatch.mockReturnValue( null );

			const result = await insertEmptyParagraph();

			expect( result ).toBeNull();
		} );
	} );

	describe( 'ensureEmptyPlaceholder', () => {
		it( 'returns wasInserted: false when empty paragraph already exists', async () => {
			const mockSelectBlock = vi.fn().mockResolvedValue( undefined );

			select.mockReturnValue( {
				getBlocks: () => [
					{ name: 'core/paragraph', clientId: 'empty-para-1', attributes: { content: '' } },
				],
			} );

			dispatch.mockReturnValue( {
				selectBlock: mockSelectBlock,
			} );

			const result = await ensureEmptyPlaceholder();

			expect( result ).toEqual( { wasInserted: false, clientId: 'empty-para-1' } );
			expect( mockSelectBlock ).toHaveBeenCalledWith( 'empty-para-1' );
		} );

		it( 'inserts paragraph and returns wasInserted: true when no empty paragraph exists', async () => {
			const mockInsertBlock = vi.fn().mockResolvedValue( undefined );
			const mockSelectBlock = vi.fn().mockResolvedValue( undefined );
			const mockClientId = 'new-block-id';

			select.mockReturnValue( {
				getBlocks: () => [
					{ name: 'core/heading', attributes: { content: 'Title' } },
				],
			} );

			createBlock.mockReturnValue( {
				name: 'core/paragraph',
				clientId: mockClientId,
				attributes: { content: '' },
			} );

			dispatch.mockReturnValue( {
				insertBlock: mockInsertBlock,
				selectBlock: mockSelectBlock,
			} );

			const result = await ensureEmptyPlaceholder();

			expect( result.wasInserted ).toBe( true );
			expect( result.clientId ).toBe( mockClientId );
		} );
	} );
} );
