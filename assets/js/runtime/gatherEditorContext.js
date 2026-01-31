/**
 * Gather Editor Context for AI Tour Generation.
 *
 * Collects information about the current editor state to help AI
 * generate accurate tour steps with working selectors.
 *
 * @package AdminCoachTours
 * @since   0.3.0
 */

import { select } from '@wordpress/data';

/**
 * Get visible UI elements in the editor.
 *
 * @return {Object} Information about visible UI elements.
 */
function getVisibleElements() {
	const elements = {
		inserterOpen: false,
		sidebarOpen: false,
		sidebarTab: null,
		toolbarVisible: false,
		hasSelectedBlock: false,
		selectedBlockType: null,
	};

	try {
		// Check if inserter is open.
		const editorStore = select( 'core/editor' );
		if ( editorStore?.isInserterOpened ) {
			elements.inserterOpen = editorStore.isInserterOpened();
		}

		// Check sidebar state.
		const editPostStore = select( 'core/edit-post' );
		if ( editPostStore?.getActiveGeneralSidebarName ) {
			const sidebarName = editPostStore.getActiveGeneralSidebarName();
			elements.sidebarOpen = !! sidebarName;
			elements.sidebarTab = sidebarName || null;
		}

		// Check block selection.
		const blockEditorStore = select( 'core/block-editor' );
		if ( blockEditorStore?.getSelectedBlock ) {
			const selectedBlock = blockEditorStore.getSelectedBlock();
			elements.hasSelectedBlock = !! selectedBlock;
			elements.selectedBlockType = selectedBlock?.name || null;
		}

		// Check toolbar visibility.
		elements.toolbarVisible = !! document.querySelector( '.block-editor-block-toolbar' );
	} catch ( e ) {
		console.warn( '[ACT] Error getting visible elements:', e );
	}

	return elements;
}

/**
 * Get current blocks in the editor.
 *
 * @return {Array} List of block types currently in the editor.
 */
function getEditorBlocks() {
	try {
		const blockEditorStore = select( 'core/block-editor' );
		if ( ! blockEditorStore?.getBlocks ) {
			return [];
		}

		const blocks = blockEditorStore.getBlocks();
		return blocks.map( ( block ) => ( {
			name: block.name,
			clientId: block.clientId,
			isEmpty: isBlockEmpty( block ),
		} ) );
	} catch ( e ) {
		console.warn( '[ACT] Error getting editor blocks:', e );
		return [];
	}
}

/**
 * Check if a block is empty.
 *
 * @param {Object} block Block object.
 * @return {boolean} True if block is empty.
 */
function isBlockEmpty( block ) {
	if ( ! block ) {
		return true;
	}

	// Paragraph blocks are empty if they have no content.
	if ( block.name === 'core/paragraph' ) {
		return ! block.attributes?.content || block.attributes.content === '';
	}

	// Image blocks are empty if they have no URL.
	if ( block.name === 'core/image' ) {
		return ! block.attributes?.url;
	}

	// Video blocks are empty if they have no src.
	if ( block.name === 'core/video' ) {
		return ! block.attributes?.src;
	}

	// Default to not empty.
	return false;
}

/**
 * Sample key UI elements from the page to help AI generate accurate selectors.
 *
 * @return {Object} Information about available UI elements.
 */
function sampleUIElements() {
	const samples = {
		inserterButton: null,
		publishButton: null,
		settingsButton: null,
		searchInput: null,
		emptyBlockPlaceholder: null,
	};

	try {
		// Sample inserter button.
		const inserterSelectors = [
			'.editor-document-tools__inserter-toggle',
			'button.block-editor-inserter-toggle',
			'[aria-label="Toggle block inserter"]',
		];
		for ( const sel of inserterSelectors ) {
			const el = document.querySelector( sel );
			if ( el ) {
				samples.inserterButton = {
					selector: sel,
					ariaLabel: el.getAttribute( 'aria-label' ) || null,
					visible: isElementVisible( el ),
				};
				break;
			}
		}

		// Sample publish/save button.
		const publishSelectors = [
			'.editor-post-publish-button',
			'.editor-post-save-draft',
		];
		for ( const sel of publishSelectors ) {
			const el = document.querySelector( sel );
			if ( el ) {
				samples.publishButton = {
					selector: sel,
					text: el.textContent?.trim() || null,
					visible: isElementVisible( el ),
				};
				break;
			}
		}

		// Sample settings button.
		const settingsBtn = document.querySelector( 'button[aria-label="Settings"]' );
		if ( settingsBtn ) {
			samples.settingsButton = {
				selector: 'button[aria-label="Settings"]',
				visible: isElementVisible( settingsBtn ),
			};
		}

		// Sample search input in inserter (if open).
		const searchInput = document.querySelector( '.components-search-control__input' );
		if ( searchInput ) {
			samples.searchInput = {
				selector: '.components-search-control__input',
				visible: isElementVisible( searchInput ),
			};
		}

		// Sample empty block placeholder (the "Type / to choose a block" element).
		// This appears in empty posts and is an important starting point.
		const placeholderSelectors = [
			// Inside the editor iframe.
			{ selector: '.block-editor-default-block-appender__content', inIframe: true },
			{ selector: '[data-empty="true"] .block-editor-rich-text__editable', inIframe: true },
			{ selector: 'p[data-empty="true"]', inIframe: true },
			// In case it's not in iframe (older WP).
			{ selector: '.block-editor-default-block-appender__content', inIframe: false },
		];

		for ( const { selector, inIframe } of placeholderSelectors ) {
			let el = null;

			if ( inIframe ) {
				// Try to find in editor iframe.
				const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
				if ( iframe?.contentDocument ) {
					el = iframe.contentDocument.querySelector( selector );
				}
			} else {
				el = document.querySelector( selector );
			}

			if ( el ) {
				samples.emptyBlockPlaceholder = {
					selector,
					inIframe,
					placeholder: el.getAttribute( 'data-placeholder' ) || el.getAttribute( 'aria-label' ) || null,
					visible: true, // If found, assume visible.
				};
				break;
			}
		}
	} catch ( e ) {
		console.warn( '[ACT] Error sampling UI elements:', e );
	}

	return samples;
}

/**
 * Check if an element is visible.
 *
 * @param {Element} el DOM element.
 * @return {boolean} True if element is visible.
 */
function isElementVisible( el ) {
	if ( ! el ) {
		return false;
	}

	const rect = el.getBoundingClientRect();
	const style = window.getComputedStyle( el );

	return (
		rect.width > 0 &&
		rect.height > 0 &&
		style.visibility !== 'hidden' &&
		style.display !== 'none'
	);
}

/**
 * Gather complete editor context for AI tour generation.
 *
 * @return {Object} Editor context including blocks, UI state, and samples.
 */
export function gatherEditorContext() {
	return {
		editorBlocks: getEditorBlocks(),
		visibleElements: getVisibleElements(),
		uiSamples: sampleUIElements(),
		wpVersion: window.adminCoachTours?.wpVersion || 'unknown',
		timestamp: Date.now(),
	};
}

export default gatherEditorContext;
