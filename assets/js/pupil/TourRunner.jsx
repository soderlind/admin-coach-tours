/**
 * Tour Runner Component.
 *
 * Main orchestrator for running tours in pupil mode.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { useSelect, useDispatch, dispatch as wpDispatch, select as wpSelect } from '@wordpress/data';
import { useState, useEffect, useCallback, useRef } from '@wordpress/element';
import { createPortal } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import CoachPanel from './CoachPanel.jsx';
import Highlighter from './Highlighter.js';
import { resolveTarget, resolveTargetWithRecovery } from '../runtime/resolveTarget.js';
import { applyPreconditions, onLeaveStep, onEnterStep, clearInsertedBlocks, setCurrentStepIndex, focusCurrentBlock } from '../runtime/applyPreconditions.js';
import { watchCompletion } from '../runtime/watchCompletion.js';
import { waitForNextStepBlock } from '../runtime/waitForNextStepBlock.js';

const STORE_NAME = 'admin-coach-tours';

/**
 * Extract the expected block type from step locators.
 *
 * Parses locators to find data-type selectors and returns a human-readable block name.
 *
 * @param {Array} locators Array of locators from the step.
 * @return {string|null} Human-readable block name or null.
 */
function getExpectedBlockType( locators ) {
	if ( ! Array.isArray( locators ) ) {
		return null;
	}

	for ( const locator of locators ) {
		if ( locator.type === 'css' && typeof locator.value === 'string' ) {
			// Look for data-type="core/xxx" pattern.
			const match = locator.value.match( /data-type=["']?(core\/[\w-]+)["']?/i );
			if ( match ) {
				// Convert "core/image" to "Image".
				const blockType = match[ 1 ].replace( 'core/', '' );
				return blockType.charAt( 0 ).toUpperCase() + blockType.slice( 1 ).replace( /-/g, ' ' );
			}
		}
		if ( locator.type === 'wpBlock' && typeof locator.value === 'string' ) {
			// Look for "type:core/xxx" pattern.
			const match = locator.value.match( /type:(core\/[\w-]+)/i );
			if ( match ) {
				const blockType = match[ 1 ].replace( 'core/', '' );
				return blockType.charAt( 0 ).toUpperCase() + blockType.slice( 1 ).replace( /-/g, ' ' );
			}
		}
	}

	return null;
}

/**
 * Extract the raw expected block name (e.g. "core/image") from step locators.
 *
 * @param {Array} locators Array of locators from the step.
 * @return {string|null} Raw block name or null.
 */
function getExpectedBlockName( locators ) {
	if ( ! Array.isArray( locators ) ) {
		return null;
	}

	for ( const locator of locators ) {
		if ( typeof locator.value !== 'string' ) {
			continue;
		}
		if ( locator.type === 'css' ) {
			const match = locator.value.match( /data-type=["']?(core\/[\w-]+)["']?/i );
			if ( match ) {
				return match[ 1 ];
			}
		}
		if ( locator.type === 'wpBlock' ) {
			const match = locator.value.match( /type:(core\/[\w-]+)/i );
			if ( match ) {
				return match[ 1 ];
			}
		}
	}

	return null;
}

/**
 * Detect whether the user diverged from the tour by adding a different block
 * than the step expects (e.g. asked for an Image but inserted a Gallery).
 *
 * @param {string|null} expectedName Raw expected block name (e.g. "core/image").
 * @return {boolean} True if a different, non-empty block is present and the
 *                   expected block is absent.
 */
function userAddedDifferentBlock( expectedName ) {
	if ( ! expectedName ) {
		return false;
	}

	const blockEditor = wpSelect( 'core/block-editor' );
	if ( ! blockEditor?.getBlocks ) {
		return false;
	}

	const blocks = blockEditor.getBlocks() || [];

	const hasExpected =
		( blockEditor.getBlocksByName?.( expectedName )?.length || 0 ) > 0 ||
		blocks.some( ( block ) => block.name === expectedName );

	if ( hasExpected ) {
		return false;
	}

	// Any non-paragraph block, or a paragraph the user has typed into, counts
	// as the user having built something other than the expected block.
	return blocks.some( ( block ) => {
		if ( block.name === expectedName ) {
			return false;
		}
		if ( block.name === 'core/paragraph' ) {
			return ( block.attributes?.content || '' ).toString().trim().length > 0;
		}
		return true;
	} );
}

/**
 * Scroll an element into view, handling cross-frame scenarios.
 * When element is inside an iframe, we need to scroll both the iframe content
 * and ensure the iframe area is visible in the main window.
 *
 * @param {HTMLElement} element Element to scroll into view.
 */
function scrollElementIntoView( element ) {
	if ( ! element ) {
		return;
	}

	// Check if element is inside an iframe.
	const ownerDoc = element.ownerDocument;
	const isInIframe = ownerDoc !== document;

	if ( isInIframe ) {
		// First, scroll within the iframe to center the element.
		element.scrollIntoView( {
			behavior: 'smooth',
			block: 'center',
			inline: 'center',
		} );

		// Then, ensure the iframe region where the element is located
		// is visible in the main window.
		// Give the iframe scroll a moment to complete.
		setTimeout( () => {
			const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
			if ( iframe ) {
				// Get the element's position relative to the iframe viewport.
				const elementRect = element.getBoundingClientRect();
				const iframeRect = iframe.getBoundingClientRect();

				// Calculate where the element is in the main window coordinate system.
				const elementTopInMain = iframeRect.top + elementRect.top;
				const elementBottomInMain = iframeRect.top + elementRect.bottom;
				const viewportHeight = window.innerHeight;

				// Check if element is fully visible in the main window.
				const isFullyVisible = elementTopInMain >= 100 && elementBottomInMain <= viewportHeight - 100;

				if ( ! isFullyVisible ) {
					// Scroll the main window to center the element.
					const scrollTarget = elementTopInMain + window.scrollY - ( viewportHeight / 2 );
					window.scrollTo( {
						top: Math.max( 0, scrollTarget ),
						behavior: 'smooth',
					} );
				}
			}
		}, 150 );
	} else {
		// Element is in main document, simple scroll.
		element.scrollIntoView( {
			behavior: 'smooth',
			block: 'center',
			inline: 'center',
		} );
	}
}

/**
 * Tour Runner component.
 *
 * @return {JSX.Element|null} Tour runner UI.
 */
export default function TourRunner() {
	console.log( '[ACT TourRunner] Component function called' );
	
	const [ targetElement, setTargetElement ] = useState( null );
	const [ resolutionError, setResolutionError ] = useState( null );
	const [ expectedBlockType, setExpectedBlockType ] = useState( null );
	const [ resolution, setResolution ] = useState( null );
	const [ isApplyingPreconditions, setIsApplyingPreconditions ] = useState( false );
	const [ repeatCounter, setRepeatCounter ] = useState( 0 );
	const highlighterRef = useRef( null );
	const previousStepIndexRef = useRef( null );
	const completionWatcherRef = useRef( null ); // Use ref to avoid stale closure in cleanup.
	const lastStepClickCleanupRef = useRef( null ); // Removes the last-step click-to-finish listener.

	// Get playback state from store.
	const {
		isPlaying,
		currentTour,
		currentStep,
		stepIndex,
		totalSteps,
	} = useSelect( ( select ) => {
		const store = select( STORE_NAME );
		const data = {
			// Only run in pupil mode, not educator mode.
			isPlaying: store.isPupilMode(),
			currentTour: store.getCurrentTour(),
			currentStep: store.getCurrentStep(),
			stepIndex: store.getCurrentStepIndex() || 0,
			totalSteps: store.getTotalSteps() || 0,
		};
		console.log( '[ACT TourRunner] useSelect:', data );
		return data;
	}, [] );

	// Get dispatch actions.
	const {
		stopTour,
		nextStep,
		previousStep,
		repeatStep,
		setAiTourError,
		setLastFailureContext,
	} = useDispatch( STORE_NAME );

	/**
	 * Initialize highlighter.
	 */
	useEffect( () => {
		if ( ! highlighterRef.current ) {
			highlighterRef.current = new Highlighter();
		}

		return () => {
			if ( highlighterRef.current ) {
				highlighterRef.current.destroy();
				highlighterRef.current = null;
			}
		};
	}, [] );

	/**
	 * Handle step change - resolve target and apply preconditions.
	 */
	useEffect( () => {
		if ( ! isPlaying || ! currentStep ) {
			// Clear highlight when not playing.
			if ( highlighterRef.current ) {
				highlighterRef.current.clear();
			}
			setTargetElement( null );
			// Clear block tracking when tour ends.
			clearInsertedBlocks();
			return;
		}

		let isMounted = true;
		let resolvedElement = null; // Track the resolved element locally.
		const previousStepIndex = previousStepIndexRef.current;

		const setupStep = async () => {
			setResolutionError( null );
			setIsApplyingPreconditions( true );

			// Cancel any existing completion watcher using ref (avoids stale closure).
			if ( completionWatcherRef.current?.cancel ) {
				console.log( '[ACT TourRunner] Cancelling previous completion watcher' );
				completionWatcherRef.current.cancel();
				completionWatcherRef.current = null;
			}

			// Handle step transition: leave previous step, enter new step.
			if ( previousStepIndex !== null && previousStepIndex !== stepIndex ) {
				await onLeaveStep( previousStepIndex );
			}
			await onEnterStep( stepIndex );
			previousStepIndexRef.current = stepIndex;

			// 1. Apply preconditions.
			console.log( '[ACT TourRunner] Preconditions for step:', stepIndex, currentStep.preconditions );
			if ( currentStep.preconditions?.length > 0 ) {
				console.log( '[ACT TourRunner] Applying', currentStep.preconditions.length, 'preconditions' );
				const preconditionResult = await applyPreconditions(
					currentStep.preconditions
				);
				console.log( '[ACT TourRunner] Precondition result:', preconditionResult );

				if ( ! isMounted ) {
					return;
				}

				if ( ! preconditionResult.success ) {
					console.warn(
						'Some preconditions failed:',
						preconditionResult.failedPreconditions
					);
				}
			} else {
				console.log( '[ACT TourRunner] No preconditions for this step' );
			}

			setIsApplyingPreconditions( false );

			// 2. Resolve target element.
			if ( currentStep.target ) {
				// Try with recovery if available.
				const recoveryFn = currentStep.recovery
					? async () => {
							// Execute recovery steps.
							await applyPreconditions( currentStep.recovery );
					  }
					: null;

				const result = await resolveTargetWithRecovery(
					currentStep.target,
					recoveryFn
				);

				if ( ! isMounted ) {
					return;
				}

				if ( result.success ) {
					resolvedElement = result.element; // Store locally for completion watcher.
					setTargetElement( result.element );
					setResolutionError( null );
					setExpectedBlockType( null );
					setResolution( {
						success: true,
						usedLocator: result.usedLocator,
						recovered: result.recovered || false,
					} );

					// If the element is inside a block, select it in WordPress data store.
					// Check the element itself and traverse up to find parent block.
					let blockClientId = result.element.getAttribute( 'data-block' );
					if ( ! blockClientId ) {
						const blockWrapper = result.element.closest( '[data-block]' );
						if ( blockWrapper ) {
							blockClientId = blockWrapper.getAttribute( 'data-block' );
							console.log( '[ACT TourRunner] Found parent block:', blockClientId );
						}
					}
					if ( blockClientId ) {
						try {
							const blockEditorDispatch = wpDispatch( 'core/block-editor' );
							if ( blockEditorDispatch?.selectBlock ) {
								await blockEditorDispatch.selectBlock( blockClientId );
								console.log( '[ACT TourRunner] Selected block:', blockClientId );
							}
						} catch ( err ) {
							console.warn( '[ACT TourRunner] Could not select block:', err );
						}
					}

					// Scroll element into view FIRST with cross-frame support.
					scrollElementIntoView( result.element );

					// Then highlight after scroll completes (wait for smooth scroll).
					setTimeout( () => {
						if ( highlighterRef.current && result.element?.isConnected ) {
							highlighterRef.current.highlight( result.element );
						}
					}, 350 ); // Allow time for smooth scroll to finish
				} else {
					resolvedElement = null;

					// If the user diverged (added a different block than this step
					// expects), retrying can't succeed. Stop the tour cleanly with a
					// clear message instead of the confusing "Try Again" loop.
					const expectedName = getExpectedBlockName( currentStep.target?.locators );
					if ( userAddedDifferentBlock( expectedName ) ) {
						const expectedLabel = getExpectedBlockType( currentStep.target?.locators );
						console.log( '[ACT TourRunner] User added a different block than expected; aborting tour.' );

						if ( highlighterRef.current ) {
							highlighterRef.current.clear();
						}

						clearInsertedBlocks();
						previousStepIndexRef.current = null;
						stopTour();

						setAiTourError(
							expectedLabel
								? sprintf(
									/* translators: %s: expected block type name. */
									__( 'This tour was for adding a %s block, but a different block was added. The tour has stopped — start a new tour for the block you added.', 'admin-coach-tours' ),
									expectedLabel
								)
								: __( 'A different block than expected was added, so the tour has stopped.', 'admin-coach-tours' )
						);

						return;
					}

					setTargetElement( null );
					setResolutionError( result.error );
					setExpectedBlockType( getExpectedBlockType( currentStep.target?.locators ) );
					setResolution( {
						success: false,
						error: result.error,
					} );
					console.log( '[ACT TourRunner] Target resolution failed, NOT auto-advancing. Error:', result.error );

					if ( highlighterRef.current ) {
						highlighterRef.current.clear();
					}

					// If this is a retry that also failed, consider the entire AI tour generation failed.
					// Stop the tour and show an error to the user.
					if ( repeatCounter > 0 ) {
						console.log( '[ACT TourRunner] Retry also failed. Failing the entire tour.' );

						// Store failure context for contextual retry.
						setLastFailureContext( {
							stepIndex,
							stepId: currentStep.id,
							stepTitle: currentStep.title,
							targetLocators: currentStep.target?.locators || [],
							error: result.error,
							reason: 'Step retry failed - target element could not be found after second attempt',
						} );

						clearInsertedBlocks();
						previousStepIndexRef.current = null;
						stopTour();
						
						// Get expected block type for better error message.
						const blockType = getExpectedBlockType( currentStep.target?.locators );
						const errorMessage = blockType
							? sprintf(
								/* translators: %s: block type name */
								__( 'Could not find the %s block. Make sure to insert or select the correct block, then try again.', 'admin-coach-tours' ),
								blockType
							)
							: __( 'The generated tour could not complete. Try again to get a fresh set of instructions.', 'admin-coach-tours' );
						
						setAiTourError( errorMessage );
					}
				}
			}

			// 3. Set up completion watcher (use resolvedElement, not state).
			if ( currentStep.completion && resolvedElement ) {
				console.log( '[ACT TourRunner] Setting up completion watcher for step:', stepIndex, 'type:', currentStep.completion.type, 'params:', currentStep.completion.params );
				
				// Small delay to ensure DOM is stable and UI is ready.
				await new Promise( ( r ) => setTimeout( r, 100 ) );

				if ( ! isMounted ) {
					return;
				}

				const watcher = watchCompletion(
					currentStep.completion,
					resolvedElement // Use local variable, not stale state!
				);
				completionWatcherRef.current = watcher; // Store in ref for reliable cleanup.

				// On the last step, clicking the highlighted block also finishes
				// the tour (no need to press "Finish"). A short grace period avoids
				// the click that reached this step from closing it immediately.
				if ( stepIndex === totalSteps - 1 && resolvedElement ) {
					const finishOnClick = () => {
						if ( ! isMounted ) {
							return;
						}
						console.log( '[ACT TourRunner] Last step: block clicked, finishing tour' );
						clearInsertedBlocks();
						focusCurrentBlock();
						nextStep();
					};

					const graceTimer = setTimeout( () => {
						if ( ! isMounted || ! resolvedElement.isConnected ) {
							return;
						}
						resolvedElement.addEventListener( 'click', finishOnClick, {
							once: true,
							capture: true,
						} );
						lastStepClickCleanupRef.current = () => {
							resolvedElement.removeEventListener( 'click', finishOnClick, {
								capture: true,
							} );
						};
					}, 400 );

					// Ensure the pending timer is cleared on cleanup too.
					const priorCleanup = lastStepClickCleanupRef.current;
					lastStepClickCleanupRef.current = () => {
						clearTimeout( graceTimer );
						if ( priorCleanup ) {
							priorCleanup();
						}
						resolvedElement.removeEventListener( 'click', finishOnClick, {
							capture: true,
						} );
					};
				}

				// Wait for completion.
				watcher.promise.then( async ( completionResult ) => {
					if ( ! isMounted ) {
						return;
					}

					if ( completionResult.success ) {
						console.log( '[ACT TourRunner] Completion detected for step:', stepIndex );

						// Auto-advance if not the last step.
						if ( stepIndex < totalSteps - 1 ) {
							// Look ahead: wait for the next step's expected block before advancing.
							const tourSteps = currentTour?.steps || [];

							const lookAheadResult = await waitForNextStepBlock( tourSteps, stepIndex, 5000 );

							if ( lookAheadResult.waited ) {
								console.log( '[ACT TourRunner] Waited for block:', lookAheadResult.blockType, 'success:', lookAheadResult.success );
							}

							// Advance after a small delay.
							setTimeout( () => {
								if ( isMounted ) {
									console.log( '[ACT TourRunner] Auto-advancing from step:', stepIndex );
									nextStep();
								}
							}, 300 );
						} else {
							// Last step - end the tour.
							console.log( '[ACT TourRunner] Last step completed, ending tour' );
							clearInsertedBlocks();
							// Return the caret to the current block before the panel closes.
							focusCurrentBlock();
							nextStep(); // This will end the tour since there's no next step.
						}
					}
				} );
			}
		};

		setupStep();

		return () => {
			isMounted = false;
			// Use ref for cleanup to avoid stale closure.
			if ( completionWatcherRef.current?.cancel ) {
				console.log( '[ACT TourRunner] Cleanup: Cancelling completion watcher' );
				completionWatcherRef.current.cancel();
				completionWatcherRef.current = null;
			}
			// Remove any last-step click-to-finish listener/timer.
			if ( lastStepClickCleanupRef.current ) {
				lastStepClickCleanupRef.current();
				lastStepClickCleanupRef.current = null;
			}
		};
	}, [ isPlaying, currentStep, stepIndex, repeatCounter, stopTour, setAiTourError ] );

	/**
	 * Handle manual continue (for manual completion type or finish).
	 */
	const handleContinue = useCallback( async () => {
		if ( completionWatcherRef.current?.confirm ) {
			completionWatcherRef.current.confirm();
		} else {
			// Look ahead: wait for next step's expected block before advancing.
			if ( stepIndex < totalSteps - 1 ) {
				const tourSteps = currentTour?.steps || [];
				const lookAheadResult = await waitForNextStepBlock( tourSteps, stepIndex, 5000 );

				if ( lookAheadResult.waited ) {
					console.log( '[ACT TourRunner] Manual continue waited for block:', lookAheadResult.blockType );
				}
			}

			// Advance to next step (or end tour if last step).
			nextStep();
		}
	}, [ nextStep, stepIndex, totalSteps, currentTour ] );

	/**
	 * Handle repeat step.
	 */
	const handleRepeat = useCallback( () => {
		// Cancel current watcher using ref.
		if ( completionWatcherRef.current?.cancel ) {
			completionWatcherRef.current.cancel();
			completionWatcherRef.current = null;
		}
		// Increment counter to trigger useEffect re-run.
		setRepeatCounter( ( c ) => c + 1 );
		repeatStep();
	}, [ repeatStep ] );

	/**
	 * Handle stop tour.
	 */
	const handleStop = useCallback( () => {
		// Cancel watcher using ref.
		if ( completionWatcherRef.current?.cancel ) {
			completionWatcherRef.current.cancel();
			completionWatcherRef.current = null;
		}
		// Clear inserted blocks tracking when tour stops.
		clearInsertedBlocks();
		previousStepIndexRef.current = null;
		stopTour();
		// Return the caret to the block the user was on.
		focusCurrentBlock();
	}, [ stopTour ] );

	// Don't render if not playing.
	if ( ! isPlaying || ! currentTour || ! currentStep ) {
		return null;
	}

	const panelContent = (
		<CoachPanel
			step={ currentStep }
			stepIndex={ stepIndex }
			totalSteps={ totalSteps }
			tourTitle={ currentTour.title }
			targetElement={ targetElement }
			resolutionError={ resolutionError }
			expectedBlockType={ expectedBlockType }
			isApplyingPreconditions={ isApplyingPreconditions }
			onContinue={ handleContinue }
			onRepeat={ handleRepeat }
			onPrevious={ previousStep }
			onNext={ nextStep }
			onStop={ handleStop }
		/>
	);

	// Render as portal at document body level.
	return createPortal( panelContent, document.body );
}
