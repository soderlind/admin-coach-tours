/**
 * Store reducer.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

/**
 * Default state for the store.
 */
export const DEFAULT_STATE = {
	// Tour data.
	tours: {},
	toursLoading: false,
	toursError: null,

	// Current tour state.
	currentTourId: null,
	currentStepIndex: 0,

	// Mode: 'educator' | 'pupil' | null.
	mode: null,

	// Completion tracking.
	completionSatisfied: false,
	skippedSteps: [],

	// Educator mode state.
	isPickerActive: false,
	pickingStepId: null,
	selectedStepId: null,
	pendingChanges: false,

	// Pupil mode state.
	tourProgress: {},
	isRecovering: false,
	lastError: null,

	// Target resolution.
	resolvedTarget: null,
	resolutionAttempts: 0,

	// UI state.
	sidebarOpen: false,
	aiDraftLoading: false,
	aiDraftError: null,
	aiDraftResult: null,

	// AI tour generation (pupil mode).
	aiTourLoading: false,
	aiTourError: null,
	ephemeralTour: null,
	lastFailureContext: null,
};

/**
 * Action types.
 */
export const ACTION_TYPES = {
	// Tour loading.
	SET_TOURS_LOADING: 'SET_TOURS_LOADING',
	SET_TOURS_ERROR: 'SET_TOURS_ERROR',
	RECEIVE_TOURS: 'RECEIVE_TOURS',
	RECEIVE_TOUR: 'RECEIVE_TOUR',

	// Tour selection/editing.
	SET_CURRENT_TOUR: 'SET_CURRENT_TOUR',

	// Tour playback.
	START_TOUR: 'START_TOUR',
	END_TOUR: 'END_TOUR',
	SET_CURRENT_STEP: 'SET_CURRENT_STEP',
	NEXT_STEP: 'NEXT_STEP',
	PREVIOUS_STEP: 'PREVIOUS_STEP',
	SKIP_STEP: 'SKIP_STEP',
	REPEAT_STEP: 'REPEAT_STEP',

	// Mode management.
	SET_MODE: 'SET_MODE',

	// Completion.
	SET_COMPLETION_SATISFIED: 'SET_COMPLETION_SATISFIED',
	RESET_COMPLETION: 'RESET_COMPLETION',

	// Target resolution.
	SET_RESOLVED_TARGET: 'SET_RESOLVED_TARGET',
	CLEAR_RESOLVED_TARGET: 'CLEAR_RESOLVED_TARGET',
	SET_RECOVERING: 'SET_RECOVERING',
	INCREMENT_RESOLUTION_ATTEMPTS: 'INCREMENT_RESOLUTION_ATTEMPTS',
	SET_LAST_ERROR: 'SET_LAST_ERROR',

	// Educator mode.
	ACTIVATE_PICKER: 'ACTIVATE_PICKER',
	DEACTIVATE_PICKER: 'DEACTIVATE_PICKER',
	SELECT_STEP: 'SELECT_STEP',
	SET_PENDING_CHANGES: 'SET_PENDING_CHANGES',
	UPDATE_STEP: 'UPDATE_STEP',
	ADD_STEP: 'ADD_STEP',
	DELETE_STEP: 'DELETE_STEP',
	REORDER_STEPS: 'REORDER_STEPS',

	// AI drafting.
	SET_AI_DRAFT_LOADING: 'SET_AI_DRAFT_LOADING',
	SET_AI_DRAFT_ERROR: 'SET_AI_DRAFT_ERROR',
	SET_AI_DRAFT_RESULT: 'SET_AI_DRAFT_RESULT',
	CLEAR_AI_DRAFT: 'CLEAR_AI_DRAFT',

	// UI.
	SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',

	// Ephemeral AI tours.
	SET_AI_TOUR_LOADING: 'SET_AI_TOUR_LOADING',
	RECEIVE_EPHEMERAL_TOUR: 'RECEIVE_EPHEMERAL_TOUR',
	SET_AI_TOUR_ERROR: 'SET_AI_TOUR_ERROR',
	CLEAR_EPHEMERAL_TOUR: 'CLEAR_EPHEMERAL_TOUR',
	SET_LAST_FAILURE_CONTEXT: 'SET_LAST_FAILURE_CONTEXT',
};

/**
 * Main reducer function.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Action object.
 * @return {Object} New state.
 */
export default function reducer( state = DEFAULT_STATE, action ) {
	switch ( action.type ) {
		// Tour loading.
		case ACTION_TYPES.SET_TOURS_LOADING:
			return {
				...state,
				toursLoading: action.isLoading,
			};

		case ACTION_TYPES.SET_TOURS_ERROR:
			return {
				...state,
				toursError: action.error,
				toursLoading: false,
			};

		case ACTION_TYPES.RECEIVE_TOURS:
			return {
				...state,
				tours: action.tours.reduce( ( acc, tour ) => {
					acc[ tour.id ] = tour;
					return acc;
				}, { ...state.tours } ),
				toursLoading: false,
				toursError: null,
			};

		case ACTION_TYPES.RECEIVE_TOUR:
			return {
				...state,
				tours: {
					...state.tours,
					[ action.tour.id ]: action.tour,
				},
				toursLoading: false,
			};

		// Tour selection for editing.
		case ACTION_TYPES.SET_CURRENT_TOUR:
			return {
				...state,
				currentTourId: action.tourId,
				currentStepIndex: 0,
				mode: action.tourId ? 'educator' : null,
				selectedStepId: null,
			};

		// Tour playback.
		case ACTION_TYPES.START_TOUR:
			return {
				...state,
				currentTourId: action.tourId,
				currentStepIndex: 0,
				mode: action.mode || 'pupil',
				completionSatisfied: false,
				skippedSteps: [],
				lastError: null,
				resolutionAttempts: 0,
			};

		case ACTION_TYPES.END_TOUR:
			return {
				...state,
				currentTourId: null,
				currentStepIndex: 0,
				mode: null,
				completionSatisfied: false,
				resolvedTarget: null,
				isRecovering: false,
				lastError: null,
			};

		case ACTION_TYPES.SET_CURRENT_STEP:
			return {
				...state,
				currentStepIndex: action.stepIndex,
				completionSatisfied: false,
				resolvedTarget: null,
				resolutionAttempts: 0,
				lastError: null,
			};

		case ACTION_TYPES.NEXT_STEP: {
			const tour = state.tours[ state.currentTourId ];
			const nextIndex = state.currentStepIndex + 1;
			const hasMore = tour && nextIndex < tour.steps.length;

			if ( ! hasMore ) {
				// Tour complete.
				return {
					...state,
					currentTourId: null,
					currentStepIndex: 0,
					mode: null,
					completionSatisfied: false,
					resolvedTarget: null,
				};
			}

			return {
				...state,
				currentStepIndex: nextIndex,
				completionSatisfied: false,
				resolvedTarget: null,
				resolutionAttempts: 0,
				lastError: null,
			};
		}

		case ACTION_TYPES.PREVIOUS_STEP:
			return {
				...state,
				currentStepIndex: Math.max( 0, state.currentStepIndex - 1 ),
				completionSatisfied: false,
				resolvedTarget: null,
				resolutionAttempts: 0,
			};

		case ACTION_TYPES.SKIP_STEP: {
			const tour = state.tours[ state.currentTourId ];
			const currentStep = tour?.steps[ state.currentStepIndex ];
			const nextIndex = state.currentStepIndex + 1;
			const hasMore = tour && nextIndex < tour.steps.length;

			const newSkipped = currentStep
				? [ ...state.skippedSteps, currentStep.id ]
				: state.skippedSteps;

			if ( ! hasMore ) {
				return {
					...state,
					skippedSteps: newSkipped,
					currentTourId: null,
					currentStepIndex: 0,
					mode: null,
				};
			}

			return {
				...state,
				currentStepIndex: nextIndex,
				skippedSteps: newSkipped,
				completionSatisfied: false,
				resolvedTarget: null,
				resolutionAttempts: 0,
			};
		}

		case ACTION_TYPES.REPEAT_STEP:
			return {
				...state,
				completionSatisfied: false,
				resolvedTarget: null,
				resolutionAttempts: 0,
				lastError: null,
				isRecovering: false,
			};

		// Mode management.
		case ACTION_TYPES.SET_MODE:
			return {
				...state,
				mode: action.mode,
			};

		// Completion.
		case ACTION_TYPES.SET_COMPLETION_SATISFIED:
			return {
				...state,
				completionSatisfied: action.satisfied,
			};

		case ACTION_TYPES.RESET_COMPLETION:
			return {
				...state,
				completionSatisfied: false,
			};

		// Target resolution.
		case ACTION_TYPES.SET_RESOLVED_TARGET:
			return {
				...state,
				resolvedTarget: action.target,
				lastError: null,
			};

		case ACTION_TYPES.CLEAR_RESOLVED_TARGET:
			return {
				...state,
				resolvedTarget: null,
			};

		case ACTION_TYPES.SET_RECOVERING:
			return {
				...state,
				isRecovering: action.isRecovering,
			};

		case ACTION_TYPES.INCREMENT_RESOLUTION_ATTEMPTS:
			return {
				...state,
				resolutionAttempts: state.resolutionAttempts + 1,
			};

		case ACTION_TYPES.SET_LAST_ERROR:
			return {
				...state,
				lastError: action.error,
			};

		// Educator mode.
		case ACTION_TYPES.ACTIVATE_PICKER:
			return {
				...state,
				isPickerActive: true,
				pickingStepId: action.stepId || null,
			};

		case ACTION_TYPES.DEACTIVATE_PICKER:
			return {
				...state,
				isPickerActive: false,
				pickingStepId: null,
			};

		case ACTION_TYPES.SELECT_STEP:
			return {
				...state,
				selectedStepId: action.stepId,
			};

		case ACTION_TYPES.SET_PENDING_CHANGES:
			return {
				...state,
				pendingChanges: action.pending,
			};

		case ACTION_TYPES.UPDATE_STEP: {
			const tour = state.tours[ action.tourId ];
			if ( ! tour ) {
				return state;
			}

			const updatedSteps = tour.steps.map( ( step ) =>
				step.id === action.stepId
					? { ...step, ...action.updates }
					: step
			);

			return {
				...state,
				tours: {
					...state.tours,
					[ action.tourId ]: {
						...tour,
						steps: updatedSteps,
					},
				},
				pendingChanges: true,
			};
		}

		case ACTION_TYPES.ADD_STEP: {
			const tour = state.tours[ action.tourId ];
			if ( ! tour ) {
				return state;
			}

			const newSteps = [ ...tour.steps ];
			const insertIndex = action.index ?? newSteps.length;
			newSteps.splice( insertIndex, 0, action.step );

			// Re-index orders.
			newSteps.forEach( ( step, i ) => {
				step.order = i;
			} );

			return {
				...state,
				tours: {
					...state.tours,
					[ action.tourId ]: {
						...tour,
						steps: newSteps,
					},
				},
				selectedStepId: action.step.id,
				pendingChanges: true,
			};
		}

		case ACTION_TYPES.DELETE_STEP: {
			const tour = state.tours[ action.tourId ];
			if ( ! tour ) {
				return state;
			}

			const filteredSteps = tour.steps.filter(
				( step ) => step.id !== action.stepId
			);

			// Re-index orders.
			filteredSteps.forEach( ( step, i ) => {
				step.order = i;
			} );

			return {
				...state,
				tours: {
					...state.tours,
					[ action.tourId ]: {
						...tour,
						steps: filteredSteps,
					},
				},
				selectedStepId:
					state.selectedStepId === action.stepId
						? null
						: state.selectedStepId,
				pendingChanges: true,
			};
		}

		case ACTION_TYPES.REORDER_STEPS: {
			const tour = state.tours[ action.tourId ];
			if ( ! tour ) {
				return state;
			}

			const stepsMap = {};
			tour.steps.forEach( ( step ) => {
				stepsMap[ step.id ] = step;
			} );

			const reorderedSteps = action.stepIds.map( ( id, index ) => ( {
				...stepsMap[ id ],
				order: index,
			} ) );

			return {
				...state,
				tours: {
					...state.tours,
					[ action.tourId ]: {
						...tour,
						steps: reorderedSteps,
					},
				},
				pendingChanges: true,
			};
		}

		// AI drafting.
		case ACTION_TYPES.SET_AI_DRAFT_LOADING:
			return {
				...state,
				aiDraftLoading: action.isLoading,
				aiDraftError: action.isLoading ? null : state.aiDraftError,
			};

		case ACTION_TYPES.SET_AI_DRAFT_ERROR:
			return {
				...state,
				aiDraftError: action.error,
				aiDraftLoading: false,
			};

		case ACTION_TYPES.SET_AI_DRAFT_RESULT:
			return {
				...state,
				aiDraftResult: action.result,
				aiDraftLoading: false,
				aiDraftError: null,
			};

		case ACTION_TYPES.CLEAR_AI_DRAFT:
			return {
				...state,
				aiDraftResult: null,
				aiDraftError: null,
				aiDraftLoading: false,
			};

		// UI.
		case ACTION_TYPES.SET_SIDEBAR_OPEN:
			return {
				...state,
				sidebarOpen: action.isOpen,
			};

		// AI tour generation (pupil mode).
		case ACTION_TYPES.SET_AI_TOUR_LOADING:
			return {
				...state,
				aiTourLoading: action.isLoading,
				aiTourError: action.isLoading ? null : state.aiTourError,
			};

		case ACTION_TYPES.SET_AI_TOUR_ERROR:
			return {
				...state,
				aiTourError: action.error,
				aiTourLoading: false,
			};

		case ACTION_TYPES.RECEIVE_EPHEMERAL_TOUR:
			return {
				...state,
				ephemeralTour: action.tour,
				aiTourLoading: false,
				aiTourError: null,
				// Also put it in tours with special 'ephemeral' key.
				tours: {
					...state.tours,
					ephemeral: action.tour,
				},
			};

		case ACTION_TYPES.CLEAR_EPHEMERAL_TOUR:
			return {
				...state,
				ephemeralTour: null,
				aiTourError: null,
				aiTourLoading: false,
				lastFailureContext: null,
				// Remove from tours.
				tours: Object.fromEntries(
					Object.entries( state.tours ).filter( ( [ key ] ) => key !== 'ephemeral' )
				),
			};

		case ACTION_TYPES.SET_LAST_FAILURE_CONTEXT:
			return {
				...state,
				lastFailureContext: action.failureContext,
			};

		default:
			return state;
	}
}
