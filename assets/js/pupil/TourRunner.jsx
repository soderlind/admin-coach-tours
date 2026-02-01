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
import { __ } from '@wordpress/i18n';

import CoachPanel from './CoachPanel.jsx';
import Highlighter from './Highlighter.js';
import { resolveTarget, resolveTargetWithRecovery } from '../runtime/resolveTarget.js';
import { applyPreconditions, onLeaveStep, onEnterStep, clearInsertedBlocks, setCurrentStepIndex } from '../runtime/applyPreconditions.js';
import { watchCompletion } from '../runtime/watchCompletion.js';
import { waitForNextStepBlock } from '../runtime/waitForNextStepBlock.js';

const STORE_NAME = 'admin-coach-tours';

/**
 * Tour Runner component.
 *
 * @return {JSX.Element|null} Tour runner UI.
 */
export default function TourRunner() {
	console.log( '[ACT TourRunner] Component function called' );
	
	const [ targetElement, setTargetElement ] = useState( null );
	const [ resolutionError, setResolutionError ] = useState( null );
	const [ resolution, setResolution ] = useState( null );
	const [ isApplyingPreconditions, setIsApplyingPreconditions ] = useState( false );
	const [ repeatCounter, setRepeatCounter ] = useState( 0 );
	const highlighterRef = useRef( null );
	const previousStepIndexRef = useRef( null );
	const completionWatcherRef = useRef( null ); // Use ref to avoid stale closure in cleanup.

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

					// Highlight the element.
					if ( highlighterRef.current ) {
						highlighterRef.current.highlight( result.element );
					}

					// Scroll element into view.
					result.element.scrollIntoView( {
						behavior: 'smooth',
						block: 'center',
						inline: 'center',
					} );
				} else {
					resolvedElement = null;
					setTargetElement( null );
					setResolutionError( result.error );
					setResolution( {
						success: false,
						error: result.error,
					} );
					console.log( '[ACT TourRunner] Target resolution failed, NOT auto-advancing. Error:', result.error );

					if ( highlighterRef.current ) {
						highlighterRef.current.clear();
					}
				}
			}

			// 3. Set up completion watcher (use resolvedElement, not state).
			if ( currentStep.completion && resolvedElement ) {
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
							// Last step - just mark complete without advancing.
							console.log( '[ACT TourRunner] Last step completed' );
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
		};
	}, [ isPlaying, currentStep, stepIndex, repeatCounter ] );

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
