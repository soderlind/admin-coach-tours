/**
 * Wait for Next Step's Block.
 *
 * Checks if the next step in a tour expects a specific block to exist,
 * and waits for it to be present before allowing the step transition.
 *
 * @package AdminCoachTours
 * @since   0.3.1
 */

import { select, subscribe } from '@wordpress/data';

/**
 * Extract expected block type from a step's target configuration.
 *
 * @param {Object} step Step configuration.
 * @return {string|null} Block type name (e.g., 'core/image') or null.
 */
export function getExpectedBlockType( step ) {
	if ( ! step?.target ) {
		return null;
	}

	const { target } = step;

	// Check if target has a blockType constraint.
	if ( target.constraints?.blockType ) {
		return target.constraints.blockType;
	}

	// Check locators for block-related targeting.
	const locators = target.locators || [];
	for ( const locator of locators ) {
		// Check for data-type attribute (block type).
		if ( locator.type === 'dataAttribute' && locator.attribute === 'data-type' ) {
			return locator.value;
		}

		// Check for block targeting by name.
		if ( locator.type === 'block' && locator.blockName ) {
			return locator.blockName;
		}
	}

	// Check CSS selectors for block type hints.
	for ( const locator of locators ) {
		if ( locator.type === 'css' && locator.value ) {
			// Match patterns like [data-type="core/image"] or .wp-block-image.
			const dataTypeMatch = locator.value.match( /\[data-type=["']([^"']+)["']\]/ );
			if ( dataTypeMatch ) {
				return dataTypeMatch[ 1 ];
			}

			// Match .wp-block-{name} patterns.
			const wpBlockMatch = locator.value.match( /\.wp-block-(\w+)/ );
			if ( wpBlockMatch ) {
				return `core/${ wpBlockMatch[ 1 ] }`;
			}
		}
	}

	return null;
}

/**
 * Check if a specific block type exists in the editor.
 *
 * @param {string} blockType Block type to check for (e.g., 'core/image').
 * @return {boolean} True if block exists.
 */
export function hasBlockOfType( blockType ) {
	try {
		const blockEditorStore = select( 'core/block-editor' );
		if ( ! blockEditorStore?.getBlocks ) {
			return false;
		}

		const blocks = blockEditorStore.getBlocks();

		// Recursive function to search nested blocks.
		const findBlock = ( blockList ) => {
			for ( const block of blockList ) {
				if ( block.name === blockType ) {
					return true;
				}
				// Check inner blocks.
				if ( block.innerBlocks?.length > 0 ) {
					if ( findBlock( block.innerBlocks ) ) {
						return true;
					}
				}
			}
			return false;
		};

		return findBlock( blocks );
	} catch ( e ) {
		console.warn( '[ACT] Error checking for block type:', e );
		return false;
	}
}

/**
 * Wait for a specific block type to appear in the editor.
 *
 * @param {string} blockType Block type to wait for.
 * @param {number} timeout   Maximum wait time in ms (default: 5000).
 * @return {Promise<{success: boolean, timedOut?: boolean}>} Result.
 */
export function waitForBlock( blockType, timeout = 5000 ) {
	return new Promise( ( resolve ) => {
		// Check immediately.
		if ( hasBlockOfType( blockType ) ) {
			console.log( '[ACT waitForBlock] Block already exists:', blockType );
			resolve( { success: true } );
			return;
		}

		console.log( '[ACT waitForBlock] Waiting for block:', blockType );

		let timeoutId = null;
		let unsubscribe = null;
		let isResolved = false;

		const cleanup = () => {
			if ( timeoutId ) {
				clearTimeout( timeoutId );
			}
			if ( unsubscribe ) {
				unsubscribe();
			}
		};

		const complete = ( success, timedOut = false ) => {
			if ( isResolved ) {
				return;
			}
			isResolved = true;
			cleanup();
			resolve( { success, timedOut } );
		};

		// Set up timeout.
		if ( timeout > 0 ) {
			timeoutId = setTimeout( () => {
				console.log( '[ACT waitForBlock] Timeout waiting for:', blockType );
				complete( false, true );
			}, timeout );
		}

		// Subscribe to store changes.
		unsubscribe = subscribe( () => {
			if ( hasBlockOfType( blockType ) ) {
				console.log( '[ACT waitForBlock] Block appeared:', blockType );
				complete( true );
			}
		} );
	} );
}

/**
 * Look ahead and wait for the next step's expected block before advancing.
 *
 * @param {Array}  steps       All steps in the tour.
 * @param {number} currentIndex Current step index.
 * @param {number} timeout     Maximum wait time in ms (default: 5000).
 * @return {Promise<{waited: boolean, blockType?: string, success?: boolean}>} Result.
 */
export async function waitForNextStepBlock( steps, currentIndex, timeout = 5000 ) {
	const nextIndex = currentIndex + 1;

	// Check if there's a next step.
	if ( nextIndex >= steps.length ) {
		return { waited: false };
	}

	const nextStep = steps[ nextIndex ];
	const expectedBlockType = getExpectedBlockType( nextStep );

	if ( ! expectedBlockType ) {
		console.log( '[ACT waitForNextStepBlock] Next step does not expect a specific block' );
		return { waited: false };
	}

	console.log( '[ACT waitForNextStepBlock] Next step expects block:', expectedBlockType );

	// Check if block already exists.
	if ( hasBlockOfType( expectedBlockType ) ) {
		console.log( '[ACT waitForNextStepBlock] Block already exists' );
		return { waited: false, blockType: expectedBlockType };
	}

	// Wait for the block to appear.
	const result = await waitForBlock( expectedBlockType, timeout );

	return {
		waited: true,
		blockType: expectedBlockType,
		success: result.success,
		timedOut: result.timedOut,
	};
}

export default waitForNextStepBlock;
