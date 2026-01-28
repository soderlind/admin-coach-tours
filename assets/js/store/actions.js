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
 * @param {number} tourId Tour ID.
 * @return {Object} Action object for control.
 */
export function saveTour( tourId ) {
	return {
		type: 'SAVE_TOUR',
		tourId,
	};
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
 * @return {Object} Action object.
 */
export function activatePicker() {
	return {
		type: ACTION_TYPES.ACTIVATE_PICKER,
	};
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
 * @return {Object} Action object.
 */
export function updateStep( tourId, stepId, updates ) {
	return {
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
 * @return {Object} Action object.
 */
export function addStep( tourId, step = {}, index = null ) {
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

	return {
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
 * @return {Object} Action object.
 */
export function deleteStep( tourId, stepId ) {
	return {
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
 * @return {Object} Action object.
 */
export function reorderSteps( tourId, stepIds ) {
	return {
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
 * @return {Object} Action object for control.
 */
export function requestAiDraft( elementContext, postType ) {
	return {
		type: 'REQUEST_AI_DRAFT',
		elementContext,
		postType,
	};
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
