/**
 * Apply preconditions before step execution.
 *
 * Ensures the UI is in the expected state before presenting a step
 * (e.g., sidebar open, inserter closed, specific tab selected).
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { select, dispatch } from '@wordpress/data';

/**
 * @typedef {import('../types/step.js').Precondition} Precondition
 */

/**
 * Wait for a selector to match an element.
 *
 * @param {string} selector CSS selector.
 * @param {number} timeout  Timeout in ms.
 * @return {Promise<HTMLElement|null>} Element or null.
 */
async function waitForSelector( selector, timeout = 2000 ) {
	const startTime = Date.now();

	return new Promise( ( resolve ) => {
		const check = () => {
			const element = document.querySelector( selector );
			if ( element ) {
				resolve( element );
				return;
			}

			if ( Date.now() - startTime > timeout ) {
				resolve( null );
				return;
			}

			requestAnimationFrame( check );
		};

		check();
	} );
}

/**
 * Wait for a condition to be true.
 *
 * @param {Function} conditionFn Function returning boolean.
 * @param {number}   timeout     Timeout in ms.
 * @return {Promise<boolean>} True if condition met.
 */
async function waitForCondition( conditionFn, timeout = 2000 ) {
	const startTime = Date.now();

	return new Promise( ( resolve ) => {
		const check = () => {
			try {
				if ( conditionFn() ) {
					resolve( true );
					return;
				}
			} catch {
				// Condition function threw, keep trying.
			}

			if ( Date.now() - startTime > timeout ) {
				resolve( false );
				return;
			}

			requestAnimationFrame( check );
		};

		check();
	} );
}

/**
 * Ensure we're in the block editor.
 *
 * @return {Promise<boolean>} True if in editor.
 */
async function ensureEditor() {
	// Check if we're in the block editor.
	const editorStore = select( 'core/block-editor' );
	if ( ! editorStore ) {
		return false;
	}

	// Wait for editor to be ready.
	return waitForCondition( () => {
		const blocks = editorStore.getBlocks?.();
		return blocks !== undefined;
	} );
}

/**
 * Ensure the editor sidebar is open.
 *
 * @param {string} preferredSidebar Optional preferred sidebar ('edit-post/document', 'edit-post/block').
 * @return {Promise<boolean>} True if successful.
 */
async function ensureSidebarOpen( preferredSidebar = null ) {
	const editPostStore = select( 'core/edit-post' );
	const editPostDispatch = dispatch( 'core/edit-post' );

	if ( ! editPostStore || ! editPostDispatch ) {
		// Try interface store (newer WP versions).
		const interfaceStore = select( 'core/interface' );
		const interfaceDispatch = dispatch( 'core/interface' );

		if ( interfaceStore && interfaceDispatch ) {
			const activeItem = interfaceStore.getActiveComplementaryArea?.(
				'core/edit-post'
			);

			if ( ! activeItem ) {
				await interfaceDispatch.enableComplementaryArea?.(
					'core/edit-post',
					preferredSidebar || 'edit-post/document'
				);
			}

			return waitForCondition( () => {
				return !! interfaceStore.getActiveComplementaryArea?.(
					'core/edit-post'
				);
			} );
		}

		return false;
	}

	// Check if sidebar is already open.
	const isOpen =
		editPostStore.isEditorSidebarOpened?.() ||
		editPostStore.isPluginSidebarOpened?.();

	if ( isOpen ) {
		return true;
	}

	// Open the sidebar.
	try {
		if ( preferredSidebar ) {
			await editPostDispatch.openGeneralSidebar?.( preferredSidebar );
		} else {
			await editPostDispatch.openGeneralSidebar?.( 'edit-post/document' );
		}

		return waitForCondition( () => {
			return editPostStore.isEditorSidebarOpened?.();
		} );
	} catch {
		return false;
	}
}

/**
 * Ensure the editor sidebar is closed.
 *
 * @return {Promise<boolean>} True if successful.
 */
async function ensureSidebarClosed() {
	const editPostStore = select( 'core/edit-post' );
	const editPostDispatch = dispatch( 'core/edit-post' );

	if ( ! editPostStore || ! editPostDispatch ) {
		// Try interface store.
		const interfaceStore = select( 'core/interface' );
		const interfaceDispatch = dispatch( 'core/interface' );

		if ( interfaceStore && interfaceDispatch ) {
			const activeItem = interfaceStore.getActiveComplementaryArea?.(
				'core/edit-post'
			);

			if ( activeItem ) {
				await interfaceDispatch.disableComplementaryArea?.(
					'core/edit-post'
				);
			}

			return waitForCondition( () => {
				return ! interfaceStore.getActiveComplementaryArea?.(
					'core/edit-post'
				);
			} );
		}

		return false;
	}

	// Check if sidebar is already closed.
	const isOpen = editPostStore.isEditorSidebarOpened?.();

	if ( ! isOpen ) {
		return true;
	}

	// Close the sidebar.
	try {
		await editPostDispatch.closeGeneralSidebar?.();

		return waitForCondition( () => {
			return ! editPostStore.isEditorSidebarOpened?.();
		} );
	} catch {
		return false;
	}
}

/**
 * Select a specific sidebar tab.
 *
 * @param {string} tabName Tab name ('document', 'block', or plugin sidebar name).
 * @return {Promise<boolean>} True if successful.
 */
async function selectSidebarTab( tabName ) {
	const editPostDispatch = dispatch( 'core/edit-post' );

	if ( ! editPostDispatch ) {
		return false;
	}

	// Map friendly names to sidebar identifiers.
	const tabMap = {
		document: 'edit-post/document',
		post: 'edit-post/document',
		block: 'edit-post/block',
	};

	const sidebarId = tabMap[ tabName ] || tabName;

	try {
		await editPostDispatch.openGeneralSidebar?.( sidebarId );

		// Wait for tab to be active.
		return waitForCondition( () => {
			const editPostStore = select( 'core/edit-post' );
			return editPostStore?.getActiveGeneralSidebarName?.() === sidebarId;
		} );
	} catch {
		return false;
	}
}

/**
 * Open the block inserter.
 *
 * @return {Promise<boolean>} True if successful.
 */
async function openInserter() {
	const editPostStore = select( 'core/edit-post' );
	const editPostDispatch = dispatch( 'core/edit-post' );

	// Check if already open.
	if ( editPostStore?.isInserterOpened?.() ) {
		return true;
	}

	try {
		await editPostDispatch?.setIsInserterOpened?.( true );

		return waitForCondition( () => {
			return editPostStore?.isInserterOpened?.();
		} );
	} catch {
		// Try clicking the inserter button.
		const inserterButton = document.querySelector(
			'.edit-post-header-toolbar__inserter-toggle, ' +
				'button[aria-label*="inserter"], ' +
				'button[aria-label*="Add block"]'
		);

		if ( inserterButton ) {
			inserterButton.click();
			return waitForSelector(
				'.block-editor-inserter__content, .editor-inserter__content'
			).then( ( el ) => !! el );
		}

		return false;
	}
}

/**
 * Close the block inserter.
 *
 * @return {Promise<boolean>} True if successful.
 */
async function closeInserter() {
	const editPostStore = select( 'core/edit-post' );
	const editPostDispatch = dispatch( 'core/edit-post' );

	// Check if already closed.
	if ( ! editPostStore?.isInserterOpened?.() ) {
		return true;
	}

	try {
		await editPostDispatch?.setIsInserterOpened?.( false );

		return waitForCondition( () => {
			return ! editPostStore?.isInserterOpened?.();
		} );
	} catch {
		return false;
	}
}

/**
 * Select a specific block in the editor.
 *
 * @param {string} clientId Block client ID.
 * @return {Promise<boolean>} True if successful.
 */
async function selectBlock( clientId ) {
	const blockEditorDispatch = dispatch( 'core/block-editor' );

	if ( ! blockEditorDispatch || ! clientId ) {
		return false;
	}

	try {
		await blockEditorDispatch.selectBlock?.( clientId );

		return waitForCondition( () => {
			const blockEditorStore = select( 'core/block-editor' );
			return (
				blockEditorStore?.getSelectedBlockClientId?.() === clientId
			);
		} );
	} catch {
		return false;
	}
}

/**
 * Focus a specific element.
 *
 * @param {string} selector CSS selector.
 * @return {Promise<boolean>} True if successful.
 */
async function focusElement( selector ) {
	const element = await waitForSelector( selector );

	if ( ! element ) {
		return false;
	}

	try {
		element.focus();
		return document.activeElement === element;
	} catch {
		return false;
	}
}

/**
 * Scroll element into view.
 *
 * @param {string} selector CSS selector.
 * @return {Promise<boolean>} True if successful.
 */
async function scrollIntoView( selector ) {
	const element = await waitForSelector( selector );

	if ( ! element ) {
		return false;
	}

	try {
		element.scrollIntoView( {
			behavior: 'smooth',
			block: 'center',
			inline: 'center',
		} );

		// Wait a bit for smooth scroll.
		await new Promise( ( resolve ) => setTimeout( resolve, 300 ) );

		return true;
	} catch {
		return false;
	}
}

/**
 * Open a modal/popover by clicking a trigger.
 *
 * @param {string} triggerSelector Trigger element selector.
 * @param {string} modalSelector   Modal element selector to wait for.
 * @return {Promise<boolean>} True if successful.
 */
async function openModal( triggerSelector, modalSelector ) {
	// Check if modal is already open.
	const existingModal = document.querySelector( modalSelector );
	if ( existingModal ) {
		return true;
	}

	const trigger = await waitForSelector( triggerSelector );
	if ( ! trigger ) {
		return false;
	}

	trigger.click();

	return waitForSelector( modalSelector ).then( ( el ) => !! el );
}

/**
 * Global storage for blocks inserted by preconditions.
 * Used by wpBlock locator with 'inserted' value.
 * Exposed on window for cross-module access.
 *
 * Maps markerId -> clientId for direct lookups.
 */
export const insertedBlocks = new Map();
window.__actInsertedBlocks = insertedBlocks;

/**
 * Track blocks inserted per step for navigation.
 * Maps stepIndex -> { markerId: clientId }
 * This allows us to reuse blocks when navigating back/forward.
 */
const insertedBlocksByStep = new Map();
let currentStepIndex = 0;

/**
 * Set the current step index for tracking.
 * Called by TourRunner when step changes.
 *
 * @param {number} stepIndex Current step index.
 */
export function setCurrentStepIndex( stepIndex ) {
	currentStepIndex = stepIndex;
	console.log( '[ACT setCurrentStepIndex]', stepIndex );
}

/**
 * Clear blocks when leaving a step.
 * Deselects the current block but preserves inserted blocks for reuse.
 *
 * @param {number} leavingStepIndex Step index being left.
 * @return {Promise<void>}
 */
export async function onLeaveStep( leavingStepIndex ) {
	console.log( '[ACT onLeaveStep] Leaving step:', leavingStepIndex );

	const blockEditorDispatch = dispatch( 'core/block-editor' );
	const blockEditorSelect = select( 'core/block-editor' );

	if ( ! blockEditorDispatch || ! blockEditorSelect ) {
		return;
	}

	// Deselect current block when leaving.
	const selectedClientId = blockEditorSelect.getSelectedBlockClientId?.();
	if ( selectedClientId ) {
		try {
			await blockEditorDispatch.clearSelectedBlock?.();
			console.log( '[ACT onLeaveStep] Deselected block:', selectedClientId );
		} catch ( e ) {
			console.warn( '[ACT onLeaveStep] Could not deselect block:', e );
		}
	}
}

/**
 * Called when entering a step.
 * Reselects previously inserted blocks if returning to a step.
 *
 * @param {number} enteringStepIndex Step index being entered.
 * @return {Promise<void>}
 */
export async function onEnterStep( enteringStepIndex ) {
	console.log( '[ACT onEnterStep] Entering step:', enteringStepIndex );
	setCurrentStepIndex( enteringStepIndex );
}

/**
 * Clear all tracking when tour ends.
 */
export function clearInsertedBlocks() {
	insertedBlocks.clear();
	insertedBlocksByStep.clear();
	currentStepIndex = 0;
	console.log( '[ACT clearInsertedBlocks] Cleared all tracking' );
}

/**
 * Get previously inserted block for a step/marker combo.
 *
 * @param {number} stepIndex Step index.
 * @param {string} markerId  Marker ID.
 * @return {string|null} Block clientId or null.
 */
function getStepInsertedBlock( stepIndex, markerId ) {
	const stepBlocks = insertedBlocksByStep.get( stepIndex );
	if ( stepBlocks && stepBlocks[ markerId ] ) {
		return stepBlocks[ markerId ];
	}
	return null;
}

/**
 * Store inserted block for a step.
 *
 * @param {number} stepIndex Step index.
 * @param {string} markerId  Marker ID.
 * @param {string} clientId  Block client ID.
 */
function setStepInsertedBlock( stepIndex, markerId, clientId ) {
	if ( ! insertedBlocksByStep.has( stepIndex ) ) {
		insertedBlocksByStep.set( stepIndex, {} );
	}
	insertedBlocksByStep.get( stepIndex )[ markerId ] = clientId;
}

/**
 * Insert a block as a precondition.
 * Creates a block with a marker so we can target it later.
 * The block will be selected and focused after insertion.
 * If returning to a step that already inserted this block, reuses it.
 *
 * @param {string} blockName Block type name (e.g., 'core/paragraph').
 * @param {Object} attributes Optional block attributes.
 * @param {string} markerId Optional marker ID for retrieval.
 * @return {Promise<boolean>} True if successful.
 */
async function insertBlock( blockName = 'core/paragraph', attributes = {}, markerId = 'act-inserted-block' ) {
	console.log( '[ACT insertBlock] Called with:', { blockName, markerId, currentStepIndex } );
	console.log( '[ACT insertBlock] insertedBlocks map:', Array.from( insertedBlocks.entries() ) );
	console.log( '[ACT insertBlock] insertedBlocksByStep:', Array.from( insertedBlocksByStep.entries() ) );
	
	try {
		const { createBlock } = await import( '@wordpress/blocks' );
		const blockEditorDispatch = dispatch( 'core/block-editor' );
		const blockEditorSelect = select( 'core/block-editor' );

		if ( ! blockEditorDispatch || ! createBlock ) {
			console.warn( '[ACT insertBlock] Block editor not available' );
			return false;
		}

		// Check if this step already inserted a block with this marker.
		const stepClientId = getStepInsertedBlock( currentStepIndex, markerId );
		console.log( '[ACT insertBlock] stepClientId from getStepInsertedBlock:', stepClientId );
		
		if ( stepClientId ) {
			const existingBlock = blockEditorSelect.getBlock( stepClientId );
			console.log( '[ACT insertBlock] existingBlock from store:', existingBlock?.name );
			if ( existingBlock ) {
				// Block still exists, select and focus it.
				await blockEditorDispatch.selectBlock( stepClientId );
				await focusBlockElement( stepClientId );
				console.log( '[ACT insertBlock] Reusing step block:', stepClientId, 'for step:', currentStepIndex );
				return true;
			}
			
			// Block not in store - it may have been transformed/replaced.
			// Check if DOM element still exists and get its current clientId.
			const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
			const targetDoc = iframe?.contentDocument || document;
			const blockElement = targetDoc.querySelector( `[data-block="${ stepClientId }"]` );
			
			if ( blockElement ) {
				// DOM element exists, select it.
				await blockEditorDispatch.selectBlock( stepClientId );
				await focusBlockElement( stepClientId );
				console.log( '[ACT insertBlock] Block still in DOM, reusing:', stepClientId );
				return true;
			}
			
			console.log( '[ACT insertBlock] Block not in store or DOM, checking for any existing blocks of this type' );
		}

		// Fallback: check global marker map (for backwards compatibility).
		console.log( '[ACT insertBlock] Checking global map for:', markerId, 'has:', insertedBlocks.has( markerId ) );
		if ( insertedBlocks.has( markerId ) ) {
			const existingClientId = insertedBlocks.get( markerId );
			const existingBlock = blockEditorSelect.getBlock( existingClientId );
			console.log( '[ACT insertBlock] existingBlock from global map:', existingBlock?.name );
			if ( existingBlock ) {
				// Block still exists, select and focus it.
				await blockEditorDispatch.selectBlock( existingClientId );
				await focusBlockElement( existingClientId );
				// Track for this step too.
				setStepInsertedBlock( currentStepIndex, markerId, existingClientId );
				console.log( '[ACT insertBlock] Reusing existing block:', existingClientId );
				return true;
			}
			
			// Check DOM for this clientId too.
			const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
			const targetDoc = iframe?.contentDocument || document;
			const blockElement = targetDoc.querySelector( `[data-block="${ existingClientId }"]` );
			
			if ( blockElement ) {
				await blockEditorDispatch.selectBlock( existingClientId );
				await focusBlockElement( existingClientId );
				setStepInsertedBlock( currentStepIndex, markerId, existingClientId );
				console.log( '[ACT insertBlock] Block from global map still in DOM:', existingClientId );
				return true;
			}
		}

		// Final fallback: check if there's already a block of the target type we can use.
		// This handles the case where the block was transformed by WordPress.
		const allBlocks = blockEditorSelect.getBlocks() || [];
		console.log( '[ACT insertBlock] Checking for existing blocks of type:', blockName, 'found:', allBlocks.length, 'total blocks' );
		console.log( '[ACT insertBlock] Block names in editor:', allBlocks.map( ( b ) => b.name ) );
		
		const matchingBlock = allBlocks.find( ( b ) => b.name === blockName );
		if ( matchingBlock ) {
			console.log( '[ACT insertBlock] Found existing block of same type:', matchingBlock.clientId );
			await blockEditorDispatch.selectBlock( matchingBlock.clientId );
			await focusBlockElement( matchingBlock.clientId );
			// Update tracking with new clientId.
			insertedBlocks.set( markerId, matchingBlock.clientId );
			setStepInsertedBlock( currentStepIndex, markerId, matchingBlock.clientId );
			console.log( '[ACT insertBlock] Reusing existing block of type:', blockName );
			return true;
		}
		
		// If no exact match, try to find ANY block we can use (not empty).
		// The user may have typed in the placeholder, changing its type.
		if ( allBlocks.length > 0 ) {
			// Find the last non-empty block, or just the last block.
			const lastBlock = allBlocks[ allBlocks.length - 1 ];
			console.log( '[ACT insertBlock] Considering last block:', lastBlock.name, lastBlock.clientId );
			
			// If the last block is similar (a text block), reuse it.
			const textBlockTypes = [ 'core/paragraph', 'core/heading', 'core/list', 'core/quote' ];
			if ( textBlockTypes.includes( lastBlock.name ) || textBlockTypes.includes( blockName ) ) {
				console.log( '[ACT insertBlock] Reusing last text block instead of creating new:', lastBlock.clientId );
				await blockEditorDispatch.selectBlock( lastBlock.clientId );
				await focusBlockElement( lastBlock.clientId );
				insertedBlocks.set( markerId, lastBlock.clientId );
				setStepInsertedBlock( currentStepIndex, markerId, lastBlock.clientId );
				return true;
			}
		}

		console.log( '[ACT insertBlock] No existing block found, creating new one' );

		// Create the block with marker in metadata.
		const blockAttributes = {
			...attributes,
			metadata: {
				...( attributes.metadata || {} ),
				actMarkerId: markerId,
			},
		};

		const block = createBlock( blockName, blockAttributes );

		// Insert at the end of the root and select it.
		const rootClientId = '';
		await blockEditorDispatch.insertBlock( block, undefined, rootClientId, true );

		// Store the clientId for later retrieval (both global and per-step).
		insertedBlocks.set( markerId, block.clientId );
		setStepInsertedBlock( currentStepIndex, markerId, block.clientId );

		// Wait for the block to appear in DOM.
		const success = await waitForCondition( () => {
			// Check in main document and iframe.
			const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
			const iframeDoc = iframe?.contentDocument;
			const targetDoc = iframeDoc || document;
			return !! targetDoc.querySelector( `[data-block="${ block.clientId }"]` );
		}, 3000 );

		if ( success ) {
			// Ensure the block is selected (sometimes insertBlock doesn't auto-select).
			await blockEditorDispatch.selectBlock( block.clientId );

			// Focus the block element in the DOM.
			await focusBlockElement( block.clientId );
		}

		console.log( '[ACT insertBlock] Inserted block:', block.clientId, 'markerId:', markerId, 'step:', currentStepIndex, 'success:', success );

		return success;
	} catch ( error ) {
		console.error( '[ACT insertBlock] Error:', error );
		return false;
	}
}

/**
 * Focus a block element in the DOM.
 * Handles both iframed and non-iframed editors.
 *
 * @param {string} clientId Block client ID.
 * @return {Promise<boolean>} True if focused.
 */
async function focusBlockElement( clientId ) {
	// Small delay to let React update the DOM.
	await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );

	// Find the block element.
	const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
	const targetDoc = iframe?.contentDocument || document;
	const blockElement = targetDoc.querySelector( `[data-block="${ clientId }"]` );

	if ( ! blockElement ) {
		console.warn( '[ACT focusBlockElement] Block element not found:', clientId );
		return false;
	}

	// Find the editable element within the block.
	const editableSelectors = [
		'[contenteditable="true"]',
		'.block-editor-rich-text__editable',
		'textarea',
		'input[type="text"]',
		'input:not([type])',
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

	// For contenteditable, also set selection to the end.
	if ( focusTarget.getAttribute( 'contenteditable' ) === 'true' ) {
		const selection = targetDoc.getSelection();
		const range = targetDoc.createRange();
		range.selectNodeContents( focusTarget );
		range.collapse( false ); // Collapse to end.
		selection?.removeAllRanges();
		selection?.addRange( range );
	}

	console.log( '[ACT focusBlockElement] Focused:', focusTarget.tagName, focusTarget.className );
	return true;
}

/**
 * Close any open modals/popovers.
 *
 * @param {string} modalSelector Modal selector.
 * @return {Promise<boolean>} True if closed or already closed.
 */
async function closeModal( modalSelector ) {
	const modal = document.querySelector( modalSelector );

	if ( ! modal ) {
		return true;
	}

	// Try close button.
	const closeButton = modal.querySelector(
		'button[aria-label="Close"], ' +
			'.components-modal__header button, ' +
			'.components-popover__close'
	);

	if ( closeButton ) {
		closeButton.click();
		return waitForCondition( () => {
			return ! document.querySelector( modalSelector );
		} );
	}

	// Try pressing Escape.
	document.dispatchEvent(
		new KeyboardEvent( 'keydown', {
			key: 'Escape',
			code: 'Escape',
			bubbles: true,
		} )
	);

	return waitForCondition( () => {
		return ! document.querySelector( modalSelector );
	} );
}

/**
 * Precondition handlers.
 */
const preconditionHandlers = {
	ensureEditor,
	ensureSidebarOpen,
	ensureSidebarClosed,
	selectSidebarTab,
	openInserter,
	closeInserter,
	selectBlock,
	focusElement,
	scrollIntoView,
	openModal,
	closeModal,
	insertBlock,
};

/**
 * Apply a single precondition.
 *
 * @param {Precondition} precondition Precondition to apply.
 * @return {Promise<Object>} Result with success flag.
 */
export async function applyPrecondition( precondition ) {
	const { type, params = {} } = precondition;

	const handler = preconditionHandlers[ type ];

	if ( ! handler ) {
		return {
			success: false,
			error: `Unknown precondition type: ${ type }`,
			type,
		};
	}

	try {
		// Convert params object to arguments based on type.
		let result;

		switch ( type ) {
			case 'ensureEditor':
				result = await handler();
				break;

			case 'ensureSidebarOpen':
				result = await handler( params.sidebar );
				break;

			case 'ensureSidebarClosed':
				result = await handler();
				break;

			case 'selectSidebarTab':
				result = await handler( params.tab );
				break;

			case 'openInserter':
			case 'closeInserter':
				result = await handler();
				break;

			case 'selectBlock':
				result = await handler( params.clientId );
				break;

			case 'focusElement':
			case 'scrollIntoView':
				result = await handler( params.selector );
				break;

			case 'openModal':
				result = await handler( params.trigger, params.modal );
				break;

			case 'closeModal':
				result = await handler( params.modal );
				break;

			case 'insertBlock':
				result = await handler(
					params.blockName || 'core/paragraph',
					params.attributes || {},
					params.markerId || 'act-inserted-block'
				);
				break;

			default:
				result = false;
		}

		return {
			success: result,
			type,
			error: result ? null : `Precondition failed: ${ type }`,
		};
	} catch ( error ) {
		return {
			success: false,
			type,
			error: `Precondition error: ${ error.message }`,
		};
	}
}

/**
 * Apply all preconditions for a step in order.
 *
 * @param {Precondition[]} preconditions Array of preconditions.
 * @return {Promise<Object>} Result with overall success and details.
 */
export async function applyPreconditions( preconditions ) {
	if ( ! preconditions || preconditions.length === 0 ) {
		return {
			success: true,
			results: [],
		};
	}

	const results = [];
	let allSuccessful = true;

	for ( const precondition of preconditions ) {
		const result = await applyPrecondition( precondition );
		results.push( result );

		if ( ! result.success ) {
			allSuccessful = false;
			// Continue to try other preconditions.
		}
	}

	return {
		success: allSuccessful,
		results,
		failedPreconditions: results.filter( ( r ) => ! r.success ),
	};
}

/**
 * Get available precondition types with descriptions.
 *
 * @return {Object[]} Array of precondition type info.
 */
export function getAvailablePreconditions() {
	return [
		{
			type: 'ensureEditor',
			label: 'Ensure in Editor',
			description: 'Verify block editor is loaded and ready',
			params: [],
		},
		{
			type: 'ensureSidebarOpen',
			label: 'Open Sidebar',
			description: 'Ensure editor sidebar is open',
			params: [
				{
					name: 'sidebar',
					type: 'string',
					optional: true,
					description: 'Preferred sidebar (edit-post/document, edit-post/block)',
				},
			],
		},
		{
			type: 'ensureSidebarClosed',
			label: 'Close Sidebar',
			description: 'Ensure editor sidebar is closed',
			params: [],
		},
		{
			type: 'selectSidebarTab',
			label: 'Select Sidebar Tab',
			description: 'Switch to specific sidebar tab',
			params: [
				{
					name: 'tab',
					type: 'string',
					required: true,
					description: 'Tab name (document, block, or plugin sidebar)',
				},
			],
		},
		{
			type: 'openInserter',
			label: 'Open Inserter',
			description: 'Open the block inserter panel',
			params: [],
		},
		{
			type: 'closeInserter',
			label: 'Close Inserter',
			description: 'Close the block inserter panel',
			params: [],
		},
		{
			type: 'selectBlock',
			label: 'Select Block',
			description: 'Select a specific block by client ID',
			params: [
				{
					name: 'clientId',
					type: 'string',
					required: true,
					description: 'Block client ID',
				},
			],
		},
		{
			type: 'focusElement',
			label: 'Focus Element',
			description: 'Focus a specific element',
			params: [
				{
					name: 'selector',
					type: 'string',
					required: true,
					description: 'CSS selector',
				},
			],
		},
		{
			type: 'scrollIntoView',
			label: 'Scroll Into View',
			description: 'Scroll element into viewport',
			params: [
				{
					name: 'selector',
					type: 'string',
					required: true,
					description: 'CSS selector',
				},
			],
		},
		{
			type: 'openModal',
			label: 'Open Modal',
			description: 'Click trigger and wait for modal',
			params: [
				{
					name: 'trigger',
					type: 'string',
					required: true,
					description: 'Trigger element selector',
				},
				{
					name: 'modal',
					type: 'string',
					required: true,
					description: 'Modal element selector',
				},
			],
		},
		{
			type: 'closeModal',
			label: 'Close Modal',
			description: 'Close an open modal',
			params: [
				{
					name: 'modal',
					type: 'string',
					required: true,
					description: 'Modal element selector',
				},
			],
		},
		{
			type: 'insertBlock',
			label: 'Insert Block',
			description: 'Insert a block into the editor (creates targetable element)',
			params: [
				{
					name: 'blockName',
					type: 'string',
					optional: true,
					description: 'Block type (default: core/paragraph)',
				},
				{
					name: 'attributes',
					type: 'object',
					optional: true,
					description: 'Block attributes',
				},
				{
					name: 'markerId',
					type: 'string',
					optional: true,
					description: 'Marker ID for targeting with wpBlock:inserted locator',
				},
			],
		},
	];
}

export default applyPreconditions;
