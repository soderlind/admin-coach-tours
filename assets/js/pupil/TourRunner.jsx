/**
 * Tour Runner Component.
 *
 * Main orchestrator for running tours in pupil mode.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect, useCallback, useRef } from '@wordpress/element';
import { createPortal } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import CoachPanel from './CoachPanel.jsx';
import Highlighter from './Highlighter.js';
import { resolveTarget, resolveTargetWithRecovery } from '../runtime/resolveTarget.js';
import { applyPreconditions } from '../runtime/applyPreconditions.js';
import { watchCompletion } from '../runtime/watchCompletion.js';

const STORE_NAME = 'admin-coach-tours';

/**
 * Tour Runner component.
 *
 * @return {JSX.Element|null} Tour runner UI.
 */
export default function TourRunner() {
	const [ targetElement, setTargetElement ] = useState( null );
	const [ resolutionError, setResolutionError ] = useState( null );
	const [ isApplyingPreconditions, setIsApplyingPreconditions ] = useState( false );
	const [ completionWatcher, setCompletionWatcher ] = useState( null );
	const highlighterRef = useRef( null );

	// Get playback state from store.
	const {
		isPlaying,
		isPaused,
		currentTour,
		currentStep,
		stepIndex,
		totalSteps,
	} = useSelect( ( select ) => {
		const store = select( STORE_NAME );
		return {
			isPlaying: store.isPlaying(),
			isPaused: store.isPaused?.() || false,
			currentTour: store.getCurrentTour(),
			currentStep: store.getCurrentStep(),
			stepIndex: store.getCurrentStepIndex?.() || 0,
			totalSteps: store.getTotalSteps?.() || 0,
		};
	}, [] );

	// Get dispatch actions.
	const {
		pauseTour,
		resumeTour,
		stopTour,
		nextStep,
		previousStep,
		repeatStep,
		setResolution,
		markStepComplete,
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
			return;
		}

		let isMounted = true;

		const setupStep = async () => {
			setResolutionError( null );
			setIsApplyingPreconditions( true );

			// Cancel any existing completion watcher.
			if ( completionWatcher?.cancel ) {
				completionWatcher.cancel();
			}

			// 1. Apply preconditions.
			if ( currentStep.preconditions?.length > 0 ) {
				const preconditionResult = await applyPreconditions(
					currentStep.preconditions
				);

				if ( ! isMounted ) {
					return;
				}

				if ( ! preconditionResult.success ) {
					console.warn(
						'Some preconditions failed:',
						preconditionResult.failedPreconditions
					);
				}
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
					setTargetElement( result.element );
					setResolution( {
						success: true,
						usedLocator: result.usedLocator,
						recovered: result.recovered || false,
					} );

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
					setTargetElement( null );
					setResolutionError( result.error );
					setResolution( {
						success: false,
						error: result.error,
					} );

					if ( highlighterRef.current ) {
						highlighterRef.current.clear();
					}
				}
			}

			// 3. Set up completion watcher.
			if ( currentStep.completion ) {
				const watcher = watchCompletion(
					currentStep.completion,
					targetElement
				);
				setCompletionWatcher( watcher );

				// Wait for completion.
				watcher.promise.then( ( completionResult ) => {
					if ( ! isMounted ) {
						return;
					}

					if ( completionResult.success ) {
						markStepComplete( currentStep.id );

						// Auto-advance if not the last step.
						if ( stepIndex < totalSteps - 1 ) {
							// Small delay before advancing.
							setTimeout( () => {
								if ( isMounted ) {
									nextStep();
								}
							}, 500 );
						}
					}
				} );
			}
		};

		setupStep();

		return () => {
			isMounted = false;
			if ( completionWatcher?.cancel ) {
				completionWatcher.cancel();
			}
		};
	}, [ isPlaying, currentStep, stepIndex ] );

	/**
	 * Handle manual continue (for manual completion type).
	 */
	const handleContinue = useCallback( () => {
		if ( completionWatcher?.confirm ) {
			completionWatcher.confirm();
		} else {
			markStepComplete( currentStep?.id );
			nextStep();
		}
	}, [ completionWatcher, currentStep, markStepComplete, nextStep ] );

	/**
	 * Handle repeat step.
	 */
	const handleRepeat = useCallback( () => {
		// Cancel current watcher.
		if ( completionWatcher?.cancel ) {
			completionWatcher.cancel();
		}
		repeatStep();
	}, [ completionWatcher, repeatStep ] );

	/**
	 * Handle stop tour.
	 */
	const handleStop = useCallback( () => {
		if ( completionWatcher?.cancel ) {
			completionWatcher.cancel();
		}
		stopTour();
	}, [ completionWatcher, stopTour ] );

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
			isPaused={ isPaused }
			onContinue={ handleContinue }
			onRepeat={ handleRepeat }
			onPrevious={ previousStep }
			onNext={ nextStep }
			onPause={ pauseTour }
			onResume={ resumeTour }
			onStop={ handleStop }
		/>
	);

	// Render as portal at document body level.
	return createPortal( panelContent, document.body );
}
