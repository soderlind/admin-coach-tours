/**
 * Ensure Empty Block Placeholder Exists.
 *
 * Checks if there's an empty paragraph block in the editor.
 * If not, inserts one so tours can use the "/" quick inserter workflow.
 *
 * @package AdminCoachTours
 * @since   0.3.1
 */

import { select, dispatch } from '@wordpress/data';

/**
 * Check if an empty paragraph block exists in the editor.
 *
 * @return {boolean} True if an empty paragraph exists.
 */
export function hasEmptyParagraph() {
	try {
		const blockEditorStore = select( 'core/block-editor' );
		if ( ! blockEditorStore?.getBlocks ) {
			return false;
		}

		const blocks = blockEditorStore.getBlocks();
		return blocks.some(
			( block ) =>
				block.name === 'core/paragraph' &&
				( ! block.attributes?.content || block.attributes.content === '' )
		);
	} catch ( e ) {
		console.warn( '[ACT] Error checking for empty paragraph:', e );
		return false;
	}
}

/**
 * Insert an empty paragraph block at the end of the editor content and select it.
 *
 * @return {Promise<string|null>} The clientId of the inserted block, or null on failure.
 */
export async function insertEmptyParagraph() {
	try {
		const { createBlock } = await import( '@wordpress/blocks' );
		const blockEditorDispatch = dispatch( 'core/block-editor' );

		if ( ! blockEditorDispatch || ! createBlock ) {
			console.warn( '[ACT] Block editor not available for inserting paragraph' );
			return null;
		}

		// Create an empty paragraph block.
		const block = createBlock( 'core/paragraph', { content: '' } );

		// Get current blocks to determine insertion position.
		const blockEditorStore = select( 'core/block-editor' );
		const blocks = blockEditorStore?.getBlocks() || [];
		const insertIndex = blocks.length;

		// Insert at the end.
		await blockEditorDispatch.insertBlock( block, insertIndex, '', false );

		// Select the block so it becomes active and editable.
		await blockEditorDispatch.selectBlock( block.clientId );

		console.log( '[ACT] Inserted and selected empty paragraph block:', block.clientId );

		return block.clientId;
	} catch ( e ) {
		console.error( '[ACT] Error inserting empty paragraph:', e );
		return null;
	}
}

/**
 * Wait for a condition to be true, polling at intervals.
 *
 * @param {Function} conditionFn Function that returns true when condition is met.
 * @param {number}   timeout     Maximum time to wait in ms.
 * @param {number}   interval    Polling interval in ms.
 * @return {Promise<boolean>} True if condition met, false if timeout.
 */
async function waitForCondition( conditionFn, timeout = 3000, interval = 50 ) {
	const startTime = Date.now();
	while ( Date.now() - startTime < timeout ) {
		if ( conditionFn() ) {
			return true;
		}
		await new Promise( ( resolve ) => setTimeout( resolve, interval ) );
	}
	return false;
}

/**
 * Focus a block element in the editor.
 *
 * @param {string} clientId The block client ID.
 * @return {Promise<boolean>} True if focused successfully.
 */
async function focusBlock( clientId ) {
	// Small delay to let React update the DOM.
	await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );

	// Find the block element.
	const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
	const targetDoc = iframe?.contentDocument || document;
	const blockElement = targetDoc.querySelector( `[data-block="${ clientId }"]` );

	if ( ! blockElement ) {
		console.warn( '[ACT focusBlock] Block element not found:', clientId );
		return false;
	}

	// Find the editable element within the block.
	const editableSelectors = [
		'[contenteditable="true"]',
		'.block-editor-rich-text__editable',
		'textarea',
		'input[type="text"]',
	];

	let focusTarget = null;
	for ( const selector of editableSelectors ) {
		focusTarget = blockElement.querySelector( selector );
		if ( focusTarget ) {
			break;
		}
	}

	// If no editable found, focus the block itself.
	if ( ! focusTarget ) {
		focusTarget = blockElement;
	}

	// Scroll into view and focus.
	focusTarget.scrollIntoView( { behavior: 'smooth', block: 'center' } );
	focusTarget.focus();

	// For contenteditable, also set selection/cursor position.
	if ( focusTarget.getAttribute( 'contenteditable' ) === 'true' ) {
		const selection = targetDoc.getSelection();
		const range = targetDoc.createRange();
		range.selectNodeContents( focusTarget );
		range.collapse( false ); // Collapse to end.
		selection?.removeAllRanges();
		selection?.addRange( range );
	}

	console.log( '[ACT focusBlock] Focused:', focusTarget.tagName, focusTarget.className );
	return true;
}

/**
 * Ensure an empty paragraph block exists in the editor.
 *
 * If no empty paragraph exists, inserts one at the end.
 * This is needed for tours that use the "/" quick inserter workflow.
 *
 * @return {Promise<Object>} Result object with wasInserted boolean and optional clientId.
 */
export async function ensureEmptyPlaceholder() {
	const exists = hasEmptyParagraph();

	if ( exists ) {
		console.log( '[ACT] Empty paragraph already exists' );
		// Find and select the existing empty paragraph.
		const blockEditorStore = select( 'core/block-editor' );
		const blocks = blockEditorStore?.getBlocks() || [];
		const emptyParagraph = blocks.find(
			( block ) =>
				block.name === 'core/paragraph' &&
				( ! block.attributes?.content || block.attributes.content === '' )
		);
		if ( emptyParagraph ) {
			await dispatch( 'core/block-editor' ).selectBlock( emptyParagraph.clientId );
			console.log( '[ACT] Selected existing empty paragraph:', emptyParagraph.clientId );
			// Focus the block element to ensure it's ready for interaction.
			await focusBlock( emptyParagraph.clientId );
		}
		return { wasInserted: false, clientId: emptyParagraph?.clientId || null };
	}

	console.log( '[ACT] No empty paragraph found, inserting one' );
	const clientId = await insertEmptyParagraph();

	if ( ! clientId ) {
		return { wasInserted: false, clientId: null };
	}

	// Wait for the block element to appear in DOM (check both main doc and iframe).
	const success = await waitForCondition( () => {
		const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
		const iframeDoc = iframe?.contentDocument;
		const targetDoc = iframeDoc || document;
		return !! targetDoc.querySelector( `[data-block="${ clientId }"]` );
	}, 3000 );

	if ( success ) {
		console.log( '[ACT] Block appeared in DOM:', clientId );
		// Focus the block element to ensure it's ready for interaction.
		await focusBlock( clientId );
	} else {
		console.warn( '[ACT] Block inserted but not found in DOM:', clientId );
	}

	return { wasInserted: true, clientId };
}

export default ensureEmptyPlaceholder;
