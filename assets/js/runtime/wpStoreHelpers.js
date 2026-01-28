/**
 * WordPress data store helper utilities.
 *
 * Provides simplified access to common @wordpress/data operations
 * for preconditions and completion watchers.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { select, dispatch, subscribe } from '@wordpress/data';

/**
 * Get a value from a WordPress data store.
 *
 * @param {string}   storeName    Store name.
 * @param {string}   selectorName Selector name.
 * @param {Array}    args         Selector arguments.
 * @return {*} Value from store.
 */
export function getStoreValue( storeName, selectorName, args = [] ) {
	const store = select( storeName );

	if ( ! store ) {
		throw new Error( `Store not found: ${ storeName }` );
	}

	if ( typeof store[ selectorName ] !== 'function' ) {
		throw new Error( `Selector not found: ${ storeName }.${ selectorName }` );
	}

	return store[ selectorName ]( ...args );
}

/**
 * Dispatch an action to a WordPress data store.
 *
 * @param {string} storeName  Store name.
 * @param {string} actionName Action name.
 * @param {Array}  args       Action arguments.
 * @return {Promise<*>} Action result.
 */
export async function dispatchAction( storeName, actionName, args = [] ) {
	const storeDispatch = dispatch( storeName );

	if ( ! storeDispatch ) {
		throw new Error( `Store not found: ${ storeName }` );
	}

	if ( typeof storeDispatch[ actionName ] !== 'function' ) {
		throw new Error( `Action not found: ${ storeName }.${ actionName }` );
	}

	return storeDispatch[ actionName ]( ...args );
}

/**
 * Subscribe to store changes and call callback when a condition is met.
 *
 * @param {string}   storeName    Store name.
 * @param {string}   selectorName Selector name.
 * @param {Array}    args         Selector arguments.
 * @param {Function} conditionFn  Function to test condition.
 * @param {Function} callback     Called when condition is met.
 * @return {Function} Unsubscribe function.
 */
export function subscribeUntil(
	storeName,
	selectorName,
	args,
	conditionFn,
	callback
) {
	let previousValue;

	const unsubscribe = subscribe( () => {
		try {
			const currentValue = getStoreValue( storeName, selectorName, args );

			// Skip if value hasn't changed.
			if ( currentValue === previousValue ) {
				return;
			}

			previousValue = currentValue;

			if ( conditionFn( currentValue ) ) {
				unsubscribe();
				callback( currentValue );
			}
		} catch {
			// Store or selector not available yet.
		}
	} );

	// Initial check.
	try {
		const initialValue = getStoreValue( storeName, selectorName, args );
		previousValue = initialValue;

		if ( conditionFn( initialValue ) ) {
			unsubscribe();
			// Use setTimeout to ensure callback is async.
			setTimeout( () => callback( initialValue ), 0 );
		}
	} catch {
		// Store not ready.
	}

	return unsubscribe;
}

/**
 * Wait for a store selector to return a specific value.
 *
 * @param {string} storeName    Store name.
 * @param {string} selectorName Selector name.
 * @param {Array}  args         Selector arguments.
 * @param {*}      expectedValue Expected value.
 * @param {number} timeout      Timeout in ms.
 * @return {Promise<boolean>} True if value matches.
 */
export function waitForStoreValue(
	storeName,
	selectorName,
	args,
	expectedValue,
	timeout = 5000
) {
	return new Promise( ( resolve ) => {
		let unsubscribe;
		let timeoutId;

		const cleanup = () => {
			if ( unsubscribe ) {
				unsubscribe();
			}
			if ( timeoutId ) {
				clearTimeout( timeoutId );
			}
		};

		unsubscribe = subscribeUntil(
			storeName,
			selectorName,
			args,
			( value ) => value === expectedValue,
			() => {
				cleanup();
				resolve( true );
			}
		);

		if ( timeout > 0 ) {
			timeoutId = setTimeout( () => {
				cleanup();
				resolve( false );
			}, timeout );
		}
	} );
}

/**
 * Common store queries for Gutenberg editor.
 */
export const editorQueries = {
	/**
	 * Check if editor is ready.
	 *
	 * @return {boolean} True if ready.
	 */
	isEditorReady() {
		try {
			const blocks = getStoreValue( 'core/block-editor', 'getBlocks' );
			return blocks !== undefined;
		} catch {
			return false;
		}
	},

	/**
	 * Get currently selected block.
	 *
	 * @return {Object|null} Selected block or null.
	 */
	getSelectedBlock() {
		try {
			return getStoreValue( 'core/block-editor', 'getSelectedBlock' );
		} catch {
			return null;
		}
	},

	/**
	 * Get selected block client ID.
	 *
	 * @return {string|null} Client ID or null.
	 */
	getSelectedBlockClientId() {
		try {
			return getStoreValue(
				'core/block-editor',
				'getSelectedBlockClientId'
			);
		} catch {
			return null;
		}
	},

	/**
	 * Check if sidebar is open.
	 *
	 * @return {boolean} True if open.
	 */
	isSidebarOpen() {
		try {
			return getStoreValue( 'core/edit-post', 'isEditorSidebarOpened' );
		} catch {
			// Try interface store for newer WP.
			try {
				const activeArea = getStoreValue(
					'core/interface',
					'getActiveComplementaryArea',
					[ 'core/edit-post' ]
				);
				return !! activeArea;
			} catch {
				return false;
			}
		}
	},

	/**
	 * Get active sidebar name.
	 *
	 * @return {string|null} Sidebar name or null.
	 */
	getActiveSidebar() {
		try {
			return getStoreValue(
				'core/edit-post',
				'getActiveGeneralSidebarName'
			);
		} catch {
			try {
				return getStoreValue(
					'core/interface',
					'getActiveComplementaryArea',
					[ 'core/edit-post' ]
				);
			} catch {
				return null;
			}
		}
	},

	/**
	 * Check if inserter is open.
	 *
	 * @return {boolean} True if open.
	 */
	isInserterOpen() {
		try {
			return getStoreValue( 'core/edit-post', 'isInserterOpened' );
		} catch {
			return false;
		}
	},

	/**
	 * Get all blocks.
	 *
	 * @return {Object[]} Array of blocks.
	 */
	getBlocks() {
		try {
			return getStoreValue( 'core/block-editor', 'getBlocks' );
		} catch {
			return [];
		}
	},

	/**
	 * Get block count.
	 *
	 * @return {number} Number of blocks.
	 */
	getBlockCount() {
		try {
			return getStoreValue( 'core/block-editor', 'getBlockCount' );
		} catch {
			return 0;
		}
	},

	/**
	 * Check if post is dirty (has unsaved changes).
	 *
	 * @return {boolean} True if dirty.
	 */
	isPostDirty() {
		try {
			return getStoreValue( 'core/editor', 'isEditedPostDirty' );
		} catch {
			return false;
		}
	},

	/**
	 * Check if post is being saved.
	 *
	 * @return {boolean} True if saving.
	 */
	isSaving() {
		try {
			return getStoreValue( 'core/editor', 'isSavingPost' );
		} catch {
			return false;
		}
	},

	/**
	 * Get post type.
	 *
	 * @return {string|null} Post type or null.
	 */
	getPostType() {
		try {
			return getStoreValue( 'core/editor', 'getCurrentPostType' );
		} catch {
			return null;
		}
	},

	/**
	 * Get current post ID.
	 *
	 * @return {number|null} Post ID or null.
	 */
	getPostId() {
		try {
			return getStoreValue( 'core/editor', 'getCurrentPostId' );
		} catch {
			return null;
		}
	},

	/**
	 * Check if block has been inserted.
	 *
	 * @param {string} blockName Block name to check.
	 * @return {boolean} True if block exists.
	 */
	hasBlock( blockName ) {
		try {
			const blocks = getStoreValue( 'core/block-editor', 'getBlocks' );
			return blocks.some( ( block ) => block.name === blockName );
		} catch {
			return false;
		}
	},

	/**
	 * Get block by name.
	 *
	 * @param {string} blockName Block name to find.
	 * @return {Object|null} Block or null.
	 */
	getBlockByName( blockName ) {
		try {
			const blocks = getStoreValue( 'core/block-editor', 'getBlocks' );
			return blocks.find( ( block ) => block.name === blockName ) || null;
		} catch {
			return null;
		}
	},
};

/**
 * Common store actions for Gutenberg editor.
 */
export const editorActions = {
	/**
	 * Select a block.
	 *
	 * @param {string} clientId Block client ID.
	 * @return {Promise<void>} Promise.
	 */
	selectBlock( clientId ) {
		return dispatchAction( 'core/block-editor', 'selectBlock', [ clientId ] );
	},

	/**
	 * Clear block selection.
	 *
	 * @return {Promise<void>} Promise.
	 */
	clearSelectedBlock() {
		return dispatchAction( 'core/block-editor', 'clearSelectedBlock' );
	},

	/**
	 * Open sidebar.
	 *
	 * @param {string} sidebar Sidebar name.
	 * @return {Promise<void>} Promise.
	 */
	openSidebar( sidebar = 'edit-post/document' ) {
		return dispatchAction( 'core/edit-post', 'openGeneralSidebar', [
			sidebar,
		] );
	},

	/**
	 * Close sidebar.
	 *
	 * @return {Promise<void>} Promise.
	 */
	closeSidebar() {
		return dispatchAction( 'core/edit-post', 'closeGeneralSidebar' );
	},

	/**
	 * Toggle inserter.
	 *
	 * @param {boolean} isOpen Whether to open.
	 * @return {Promise<void>} Promise.
	 */
	toggleInserter( isOpen ) {
		return dispatchAction( 'core/edit-post', 'setIsInserterOpened', [
			isOpen,
		] );
	},

	/**
	 * Insert block.
	 *
	 * @param {Object} block    Block to insert.
	 * @param {number} index    Position index.
	 * @param {string} rootClientId Parent block ID.
	 * @return {Promise<void>} Promise.
	 */
	insertBlock( block, index, rootClientId ) {
		return dispatchAction( 'core/block-editor', 'insertBlock', [
			block,
			index,
			rootClientId,
		] );
	},

	/**
	 * Remove block.
	 *
	 * @param {string} clientId Block client ID.
	 * @return {Promise<void>} Promise.
	 */
	removeBlock( clientId ) {
		return dispatchAction( 'core/block-editor', 'removeBlock', [ clientId ] );
	},

	/**
	 * Update block attributes.
	 *
	 * @param {string} clientId   Block client ID.
	 * @param {Object} attributes Attributes to update.
	 * @return {Promise<void>} Promise.
	 */
	updateBlockAttributes( clientId, attributes ) {
		return dispatchAction( 'core/block-editor', 'updateBlockAttributes', [
			clientId,
			attributes,
		] );
	},

	/**
	 * Save post.
	 *
	 * @return {Promise<void>} Promise.
	 */
	savePost() {
		return dispatchAction( 'core/editor', 'savePost' );
	},
};

/**
 * Create a selector config for watchCompletion wpData type.
 *
 * @param {string} storeName  Store name.
 * @param {string} selector   Selector name.
 * @param {*}      expected   Expected value.
 * @param {string} comparator Comparator type.
 * @return {Object} Completion config.
 */
export function createWpDataCompletion(
	storeName,
	selector,
	expected,
	comparator = 'equals'
) {
	return {
		type: 'wpData',
		params: {
			storeName,
			selector,
			expectedValue: expected,
			comparator,
		},
	};
}

/**
 * Common completion configurations.
 */
export const completionPresets = {
	/**
	 * Complete when a block is selected.
	 *
	 * @return {Object} Completion config.
	 */
	blockSelected() {
		return createWpDataCompletion(
			'core/block-editor',
			'getSelectedBlockClientId',
			null,
			'notEquals'
		);
	},

	/**
	 * Complete when a specific block type is inserted.
	 *
	 * @param {string} blockName Block name.
	 * @param {number} minCount  Minimum count.
	 * @return {Object} Completion config.
	 */
	blockInserted( blockName, minCount = 1 ) {
		return {
			type: 'wpData',
			params: {
				storeName: 'core/block-editor',
				selector: 'getBlocksByName',
				args: [ blockName ],
				expectedValue: minCount,
				comparator: 'lengthGreaterThan',
			},
		};
	},

	/**
	 * Complete when sidebar is opened.
	 *
	 * @return {Object} Completion config.
	 */
	sidebarOpened() {
		return createWpDataCompletion(
			'core/edit-post',
			'isEditorSidebarOpened',
			true,
			'equals'
		);
	},

	/**
	 * Complete when post is saved.
	 *
	 * @return {Object} Completion config.
	 */
	postSaved() {
		return createWpDataCompletion(
			'core/editor',
			'isEditedPostDirty',
			false,
			'equals'
		);
	},

	/**
	 * Complete when inserter is opened.
	 *
	 * @return {Object} Completion config.
	 */
	inserterOpened() {
		return createWpDataCompletion(
			'core/edit-post',
			'isInserterOpened',
			true,
			'equals'
		);
	},

	/**
	 * Complete when block count increases.
	 *
	 * @param {number} initialCount Initial block count.
	 * @return {Object} Completion config.
	 */
	blockCountIncreased( initialCount ) {
		return {
			type: 'wpData',
			params: {
				storeName: 'core/block-editor',
				selector: 'getBlockCount',
				expectedValue: initialCount,
				comparator: 'greaterThan',
			},
		};
	},
};

export default {
	getStoreValue,
	dispatchAction,
	subscribeUntil,
	waitForStoreValue,
	editorQueries,
	editorActions,
	createWpDataCompletion,
	completionPresets,
};
