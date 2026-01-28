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
	];
}

export default applyPreconditions;
