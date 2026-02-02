/**
 * Store action creators.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { ACTION_TYPES } from './reducer';

/**
 * Generate a UUID v4.
 *
 * @return {string} UUID string.
 */
const generateId = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
		/[xy]/g,
		function ( c ) {
			const r = ( Math.random() * 16 ) | 0;
			const v = c === 'x' ? r : ( r & 0x3 ) | 0x8;
			return v.toString( 16 );
		}
	);
};

// ============================================================================
// Tour Loading Actions
// ============================================================================

/**
 * Set tours loading state.
 *
 * @param {boolean} isLoading Loading state.
 * @return {Object} Action object.
 */
export function setToursLoading( isLoading ) {
	return {
		type: ACTION_TYPES.SET_TOURS_LOADING,
		isLoading,
	};
}

/**
 * Set tours error.
 *
 * @param {string|null} error Error message.
 * @return {Object} Action object.
 */
export function setToursError( error ) {
	return {
		type: ACTION_TYPES.SET_TOURS_ERROR,
		error,
	};
}

/**
 * Receive tours from API.
 *
 * @param {Array} tours Array of tour objects.
 * @return {Object} Action object.
 */
export function receiveTours( tours ) {
	return {
		type: ACTION_TYPES.RECEIVE_TOURS,
		tours,
	};
}

/**
 * Receive a single tour.
 *
 * @param {Object} tour Tour object.
 * @return {Object} Action object.
 */
export function receiveTour( tour ) {
	return {
		type: ACTION_TYPES.RECEIVE_TOUR,
		tour,
	};
}

/**
 * Set current tour for editing (educator mode).
 * Fetches the tour if not already in the store.
 *
 * @param {number|null} tourId Tour ID or null to deselect.
 * @return {Generator} Action generator.
 */
export function* setCurrentTour( tourId ) {
	if ( ! tourId ) {
		yield {
			type: ACTION_TYPES.SET_CURRENT_TOUR,
			tourId: null,
		};
		return;
	}

	// First, try to fetch the tour to ensure it's in the store.
	try {
		const tour = yield {
			type: 'API_FETCH',
			request: {
				path: `/admin-coach-tours/v1/tours/${ tourId }`,
				method: 'GET',
			},
		};

		// If tour exists, receive it.
		if ( tour && tour.id ) {
			yield receiveTour( tour );
		}
	} catch ( error ) {
		// Tour might not exist yet (new post). Create a placeholder.
		console.log( '[ACT] Tour not found, creating placeholder for:', tourId );
		yield receiveTour( {
			id: tourId,
			title: '',
			steps: [],
			status: 'draft',
		} );
	}

	// Now set it as current.
	yield {
		type: ACTION_TYPES.SET_CURRENT_TOUR,
		tourId,
	};
}

/**
 * Fetch tours from REST API.
 *
 * @param {Object} args Query arguments.
 * @return {Object} Action object for control.
 */
export function fetchTours( args = {} ) {
	return {
		type: 'FETCH_TOURS',
		args,
	};
}

/**
 * Fetch a single tour.
 *
 * @param {number} tourId Tour ID.
 * @return {Object} Action object for control.
 */
export function fetchTour( tourId ) {
	return {
		type: 'FETCH_TOUR',
		tourId,
	};
}

/**
 * Save tour to server.
 *
 * @param {number} tourId   Tour ID.
 * @param {Object} tourData Tour data to save.
 * @return {Generator} Action generator.
 */
export function* saveTour( tourId, tourData ) {
	try {
		const result = yield {
			type: 'SAVE_TOUR',
			tourId,
			tourData,
		};

		if ( result?.id ) {
			yield receiveTour( result );
		}

		return result;
	} catch ( error ) {
		throw error;
	}
}

/**
 * Create a new tour.
 *
 * @param {Object} data Tour data (title, description, postTypes, editors, status).
 * @return {Function} Thunk that creates tour and returns result.
 */
export function* createTour( data ) {
	try {
		const result = yield {
			type: 'CREATE_TOUR',
			data,
		};

		if ( result?.id ) {
			yield receiveTour( result );
		}

		return result;
	} catch ( error ) {
		throw error;
	}
}

/**
 * Update an existing tour.
 *
 * @param {number} tourId Tour ID.
 * @param {Object} data   Tour data to update.
 * @return {Function} Thunk that updates tour and returns result.
 */
export function* updateTour( tourId, data ) {
	try {
		const result = yield {
			type: 'UPDATE_TOUR',
			tourId,
			data,
		};

		if ( result?.id ) {
			yield receiveTour( result );
		}

		return result;
	} catch ( error ) {
		throw error;
	}
}

// ============================================================================
// Tour Playback Actions
// ============================================================================

/**
 * Start a tour.
 *
 * @param {number} tourId Tour ID.
 * @param {string} mode   Mode ('educator' | 'pupil').
 * @return {Object} Action object.
 */
export function startTour( tourId, mode = 'pupil' ) {
	return {
		type: ACTION_TYPES.START_TOUR,
		tourId,
		mode,
	};
}

/**
 * End the current tour.
 *
 * @return {Object} Action object.
 */
export function endTour() {
	return {
		type: ACTION_TYPES.END_TOUR,
	};
}

/**
 * Alias for endTour - stop the current tour.
 *
 * @return {Object} Action object.
 */
export function stopTour() {
	return endTour();
}

/**
 * Set current step by index.
 *
 * @param {number} stepIndex Step index.
 * @return {Object} Action object.
 */
export function setCurrentStep( stepIndex ) {
	return {
		type: ACTION_TYPES.SET_CURRENT_STEP,
		stepIndex,
	};
}

/**
 * Go to next step.
 *
 * @return {Object} Action object.
 */
export function nextStep() {
	return {
		type: ACTION_TYPES.NEXT_STEP,
	};
}

/**
 * Go to previous step.
 *
 * @return {Object} Action object.
 */
export function previousStep() {
	return {
		type: ACTION_TYPES.PREVIOUS_STEP,
	};
}

/**
 * Skip current step.
 *
 * @return {Object} Action object.
 */
export function skipStep() {
	return {
		type: ACTION_TYPES.SKIP_STEP,
	};
}

/**
 * Repeat current step.
 *
 * @return {Object} Action object.
 */
export function repeatStep() {
	return {
		type: ACTION_TYPES.REPEAT_STEP,
	};
}

// ============================================================================
// Mode Management Actions
// ============================================================================

/**
 * Set current mode.
 *
 * @param {string|null} mode Mode ('educator' | 'pupil' | null).
 * @return {Object} Action object.
 */
export function setMode( mode ) {
	return {
		type: ACTION_TYPES.SET_MODE,
		mode,
	};
}

// ============================================================================
// Completion Actions
// ============================================================================

/**
 * Set completion satisfied state.
 *
 * @param {boolean} satisfied Whether completion is satisfied.
 * @return {Object} Action object.
 */
export function setCompletionSatisfied( satisfied ) {
	return {
		type: ACTION_TYPES.SET_COMPLETION_SATISFIED,
		satisfied,
	};
}

/**
 * Reset completion state.
 *
 * @return {Object} Action object.
 */
export function resetCompletion() {
	return {
		type: ACTION_TYPES.RESET_COMPLETION,
	};
}

/**
 * Mark step as complete and auto-advance.
 *
 * Sets completion satisfied and moves to next step.
 *
 * @return {Object} Action object (next step).
 */
export function markStepComplete() {
	// This is just an alias for nextStep - the completion watcher
	// handles the logic, this just triggers the advance.
	return nextStep();
}

// ============================================================================
// Target Resolution Actions
// ============================================================================

/**
 * Set resolved target element info.
 *
 * @param {Object} target Target resolution result.
 * @return {Object} Action object.
 */
export function setResolvedTarget( target ) {
	return {
		type: ACTION_TYPES.SET_RESOLVED_TARGET,
		target,
	};
}

/**
 * Clear resolved target.
 *
 * @return {Object} Action object.
 */
export function clearResolvedTarget() {
	return {
		type: ACTION_TYPES.CLEAR_RESOLVED_TARGET,
	};
}

/**
 * Set recovering state.
 *
 * @param {boolean} isRecovering Recovery state.
 * @return {Object} Action object.
 */
export function setRecovering( isRecovering ) {
	return {
		type: ACTION_TYPES.SET_RECOVERING,
		isRecovering,
	};
}

/**
 * Increment resolution attempts counter.
 *
 * @return {Object} Action object.
 */
export function incrementResolutionAttempts() {
	return {
		type: ACTION_TYPES.INCREMENT_RESOLUTION_ATTEMPTS,
	};
}

/**
 * Set last error message.
 *
 * @param {string|null} error Error message.
 * @return {Object} Action object.
 */
export function setLastError( error ) {
	return {
		type: ACTION_TYPES.SET_LAST_ERROR,
		error,
	};
}

// ============================================================================
// Educator Mode Actions
// ============================================================================

/**
 * Activate element picker.
 *
 * @param {string|null} stepId Optional step ID if repicking for existing step.
 * @return {Object} Action object.
 */
export function activatePicker( stepId = null ) {
	return {
		type: ACTION_TYPES.ACTIVATE_PICKER,
		stepId,
	};
}

/**
 * Start picking an element (alias for activatePicker).
 *
 * @param {string|null} stepId Optional step ID if repicking for existing step.
 * @return {Object} Action object.
 */
export function startPicking( stepId = null ) {
	return activatePicker( stepId );
}

/**
 * Deactivate element picker.
 *
 * @return {Object} Action object.
 */
export function deactivatePicker() {
	return {
		type: ACTION_TYPES.DEACTIVATE_PICKER,
	};
}

/**
 * Stop picking (alias for deactivatePicker).
 *
 * @return {Object} Action object.
 */
export function stopPicking() {
	return deactivatePicker();
}

/**
 * Select a step for editing.
 *
 * @param {string|null} stepId Step ID.
 * @return {Object} Action object.
 */
export function selectStep( stepId ) {
	return {
		type: ACTION_TYPES.SELECT_STEP,
		stepId,
	};
}

/**
 * Set pending changes flag.
 *
 * @param {boolean} pending Has pending changes.
 * @return {Object} Action object.
 */
export function setPendingChanges( pending ) {
	return {
		type: ACTION_TYPES.SET_PENDING_CHANGES,
		pending,
	};
}

/**
 * Update a step.
 *
 * @param {number} tourId  Tour ID.
 * @param {string} stepId  Step ID.
 * @param {Object} updates Updates to apply.
 * @return {Generator} Action generator.
 */
export function* updateStep( tourId, stepId, updates ) {
	yield {
		type: ACTION_TYPES.UPDATE_STEP,
		tourId,
		stepId,
		updates,
	};
}

/**
 * Add a new step.
 *
 * @param {number}      tourId Tour ID.
 * @param {Object}      step   Step data (without id/order).
 * @param {number|null} index  Insert position.
 * @return {Generator} Action generator.
 */
export function* addStep( tourId, step = {}, index = null ) {
	const newStep = {
		id: generateId(),
		order: 0,
		title: '',
		instruction: '',
		hint: '',
		target: {
			locators: [],
			constraints: { visible: true },
		},
		preconditions: [],
		completion: { type: 'manual' },
		recovery: [ { action: 'reapplyPreconditions', timeout: 1000 } ],
		tags: [],
		version: 1,
		...step,
	};

	yield {
		type: ACTION_TYPES.ADD_STEP,
		tourId,
		step: newStep,
		index,
	};
}

/**
 * Delete a step.
 *
 * @param {number} tourId Tour ID.
 * @param {string} stepId Step ID.
 * @return {Generator} Action generator.
 */
export function* deleteStep( tourId, stepId ) {
	yield {
		type: ACTION_TYPES.DELETE_STEP,
		tourId,
		stepId,
	};
}

/**
 * Reorder steps.
 *
 * @param {number}   tourId  Tour ID.
 * @param {string[]} stepIds Ordered step IDs.
 * @return {Generator} Action generator.
 */
export function* reorderSteps( tourId, stepIds ) {
	yield {
		type: ACTION_TYPES.REORDER_STEPS,
		tourId,
		stepIds,
	};
}

// ============================================================================
// AI Drafting Actions
// ============================================================================

/**
 * Set AI draft loading state.
 *
 * @param {boolean} isLoading Loading state.
 * @return {Object} Action object.
 */
export function setAiDraftLoading( isLoading ) {
	return {
		type: ACTION_TYPES.SET_AI_DRAFT_LOADING,
		isLoading,
	};
}

/**
 * Set AI draft error.
 *
 * @param {string|null} error Error message.
 * @return {Object} Action object.
 */
export function setAiDraftError( error ) {
	return {
		type: ACTION_TYPES.SET_AI_DRAFT_ERROR,
		error,
	};
}

/**
 * Set AI draft result.
 *
 * @param {Object} result AI draft output.
 * @return {Object} Action object.
 */
export function setAiDraftResult( result ) {
	return {
		type: ACTION_TYPES.SET_AI_DRAFT_RESULT,
		result,
	};
}

/**
 * Clear AI draft state.
 *
 * @return {Object} Action object.
 */
export function clearAiDraft() {
	return {
		type: ACTION_TYPES.CLEAR_AI_DRAFT,
	};
}

/**
 * Request AI to draft step.
 *
 * @param {Object} elementContext Element context for AI.
 * @param {string} postType       Current post type.
 * @return {Generator} Generator that handles AI draft request.
 */
export function* requestAiDraft( elementContext, postType ) {
	// Set loading state.
	yield setAiDraftLoading( true );
	yield setAiDraftError( null );

	try {
		const result = yield {
			type: 'REQUEST_AI_DRAFT',
			elementContext,
			postType,
		};

		yield setAiDraftResult( result );
		return result;
	} catch ( error ) {
		yield setAiDraftError( error.message || 'Failed to generate AI draft' );
		throw error;
	} finally {
		yield setAiDraftLoading( false );
	}
}

// ============================================================================
// UI Actions
// ============================================================================

/**
 * Set sidebar open state.
 *
 * @param {boolean} isOpen Sidebar open state.
 * @return {Object} Action object.
 */
export function setSidebarOpen( isOpen ) {
	return {
		type: ACTION_TYPES.SET_SIDEBAR_OPEN,
		isOpen,
	};
}

// ============================================================================
// AI Tour Generation Actions (Pupil Mode)
// ============================================================================

/**
 * Set AI tour loading state.
 *
 * @param {boolean} isLoading Loading state.
 * @return {Object} Action object.
 */
export function setAiTourLoading( isLoading ) {
	return {
		type: ACTION_TYPES.SET_AI_TOUR_LOADING,
		isLoading,
	};
}

/**
 * Set AI tour error.
 *
 * @param {string|null} error Error message.
 * @return {Object} Action object.
 */
export function setAiTourError( error ) {
	return {
		type: ACTION_TYPES.SET_AI_TOUR_ERROR,
		error,
	};
}

/**
 * Set last failure context for contextual retry.
 *
 * @param {Object|null} failureContext Context about the failure (step, selector, error).
 * @return {Object} Action object.
 */
export function setLastFailureContext( failureContext ) {
	return {
		type: ACTION_TYPES.SET_LAST_FAILURE_CONTEXT,
		failureContext,
	};
}

/**
 * Receive an ephemeral tour from AI.
 *
 * @param {Object} tour Generated tour object.
 * @return {Object} Action object.
 */
export function receiveEphemeralTour( tour ) {
	return {
		type: ACTION_TYPES.RECEIVE_EPHEMERAL_TOUR,
		tour,
	};
}

/**
 * Clear ephemeral tour.
 *
 * @return {Object} Action object.
 */
export function clearEphemeralTour() {
	return {
		type: ACTION_TYPES.CLEAR_EPHEMERAL_TOUR,
	};
}

/**
 * Request AI to generate a tour.
 *
 * @param {string}      taskId         Predefined task ID (optional).
 * @param {string}      query          Freeform user query (optional).
 * @param {string}      postType       Current post type.
 * @param {Object|null} failureContext Context from a previous failed attempt (for retry).
 * @return {Generator} Generator that handles AI tour generation.
 */
export function* requestAiTour( taskId, query, postType, failureContext = null ) {
	// Set loading state.
	yield setAiTourLoading( true );
	yield setAiTourError( null );

	try {
		// Gather editor context to help AI generate accurate selectors.
		const editorContext = yield {
			type: 'GATHER_EDITOR_CONTEXT',
		};

		const result = yield {
			type: 'REQUEST_AI_TOUR',
			taskId,
			query,
			postType,
			editorContext,
			failureContext,
		};

		console.log( '[ACT AI Response] Full result:', result );
		console.log( '[ACT AI Response] Tour:', JSON.stringify( result.tour, null, 2 ) );

		// Add an ID to the ephemeral tour.
		const tour = {
			id: 'ephemeral',
			...result.tour,
		};

		yield receiveEphemeralTour( tour );

		// Ensure an empty block placeholder exists for "/" quick inserter tours.
		yield {
			type: 'ENSURE_EMPTY_PLACEHOLDER',
		};

		// Automatically start the tour.
		yield startTour( 'ephemeral', 'pupil' );

		return tour;
	} catch ( error ) {
		yield setAiTourError( error.message || 'Failed to generate tour' );
		throw error;
	} finally {
		yield setAiTourLoading( false );
	}
}

/**
 * Start an ephemeral tour directly (for pre-loaded tours).
 *
 * @param {Object} tour Tour object with title and steps.
 * @return {Generator} Generator that sets up and starts the tour.
 */
export function* startEphemeralTour( tour ) {
	// Add ID if not present.
	const tourWithId = {
		id: 'ephemeral',
		...tour,
	};

	yield receiveEphemeralTour( tourWithId );

	// Ensure an empty block placeholder exists for "/" quick inserter tours.
	yield {
		type: 'ENSURE_EMPTY_PLACEHOLDER',
	};

	yield startTour( 'ephemeral', 'pupil' );
}
