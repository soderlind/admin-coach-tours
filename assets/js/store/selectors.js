/**
 * Store selectors.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { createSelector } from '@wordpress/data';

// ============================================================================
// Tour Selectors
// ============================================================================

/**
 * Get tours as an object keyed by ID.
 *
 * @param {Object} state Store state.
 * @return {Object} Tours object.
 */
export function getToursById( state ) {
	return state.tours;
}

/**
 * Get all tours as an array (memoized).
 *
 * @param {Object} state Store state.
 * @return {Array} Array of tours.
 */
export const getTours = createSelector(
	( state ) => Object.values( state.tours ),
	( state ) => [ state.tours ]
);

/**
 * Get a single tour by ID.
 *
 * @param {Object} state  Store state.
 * @param {number} tourId Tour ID.
 * @return {Object|null} Tour object or null.
 */
export function getTour( state, tourId ) {
	return state.tours[ tourId ] || null;
}

/**
 * Get tours loading state.
 *
 * @param {Object} state Store state.
 * @return {boolean} Loading state.
 */
export function isToursLoading( state ) {
	return state.toursLoading;
}

/**
 * Get tours error.
 *
 * @param {Object} state Store state.
 * @return {string|null} Error message.
 */
export function getToursError( state ) {
	return state.toursError;
}

/**
 * Get tours filtered by post type (memoized).
 *
 * @param {Object} state    Store state.
 * @param {string} postType Post type to filter by.
 * @return {Array} Filtered tours.
 */
export const getToursByPostType = createSelector(
	( state, postType ) =>
		getTours( state ).filter(
			( tour ) =>
				tour.postTypes &&
				tour.postTypes.includes( postType ) &&
				tour.status === 'publish'
		),
	( state, postType ) => [ state.tours, postType ]
);

/**
 * Get tours filtered by editor type (memoized).
 *
 * @param {Object} state  Store state.
 * @param {string} editor Editor type ('block', 'classic', 'site').
 * @return {Array} Filtered tours.
 */
export const getToursByEditor = createSelector(
	( state, editor ) =>
		getTours( state ).filter(
			( tour ) => tour.editor === editor && tour.status === 'publish'
		),
	( state, editor ) => [ state.tours, editor ]
);

// ============================================================================
// Current Tour Selectors
// ============================================================================

/**
 * Get current tour ID.
 *
 * @param {Object} state Store state.
 * @return {number|null} Current tour ID.
 */
export function getCurrentTourId( state ) {
	return state.currentTourId;
}

/**
 * Get current tour object.
 *
 * @param {Object} state Store state.
 * @return {Object|null} Current tour.
 */
export function getCurrentTour( state ) {
	return state.currentTourId ? state.tours[ state.currentTourId ] : null;
}

/**
 * Get current step index.
 *
 * @param {Object} state Store state.
 * @return {number} Current step index.
 */
export function getCurrentStepIndex( state ) {
	return state.currentStepIndex;
}

/**
 * Get current step object (memoized).
 *
 * @param {Object} state Store state.
 * @return {Object|null} Current step.
 */
export const getCurrentStep = createSelector(
	( state ) => {
		const tour = getCurrentTour( state );
		if ( ! tour || ! tour.steps ) {
			return null;
		}
		return tour.steps[ state.currentStepIndex ] || null;
	},
	( state ) => [
		state.tours,
		state.currentTourId,
		state.currentStepIndex,
	]
);

/**
 * Get total steps count for current tour.
 *
 * @param {Object} state Store state.
 * @return {number} Total steps.
 */
export function getTotalSteps( state ) {
	const tour = getCurrentTour( state );
	return tour?.steps?.length || 0;
}

/**
 * Check if there is a next step.
 *
 * @param {Object} state Store state.
 * @return {boolean} Has next step.
 */
export function hasNextStep( state ) {
	return state.currentStepIndex < getTotalSteps( state ) - 1;
}

/**
 * Check if there is a previous step.
 *
 * @param {Object} state Store state.
 * @return {boolean} Has previous step.
 */
export function hasPreviousStep( state ) {
	return state.currentStepIndex > 0;
}

/**
 * Get tour progress as percentage.
 *
 * @param {Object} state Store state.
 * @return {number} Progress (0-100).
 */
export function getProgress( state ) {
	const total = getTotalSteps( state );
	if ( total === 0 ) {
		return 0;
	}
	return Math.round( ( ( state.currentStepIndex + 1 ) / total ) * 100 );
}

// ============================================================================
// Mode Selectors
// ============================================================================

/**
 * Get current mode.
 *
 * @param {Object} state Store state.
 * @return {string|null} Mode ('educator' | 'pupil' | null).
 */
export function getMode( state ) {
	return state.mode;
}

/**
 * Check if in educator mode.
 *
 * @param {Object} state Store state.
 * @return {boolean} Is educator mode.
 */
export function isEducatorMode( state ) {
	return state.mode === 'educator';
}

/**
 * Check if in pupil mode.
 *
 * @param {Object} state Store state.
 * @return {boolean} Is pupil mode.
 */
export function isPupilMode( state ) {
	return state.mode === 'pupil';
}

/**
 * Check if a tour is active.
 *
 * @param {Object} state Store state.
 * @return {boolean} Tour is active.
 */
export function isTourActive( state ) {
	return state.currentTourId !== null && state.mode !== null;
}

// ============================================================================
// Completion Selectors
// ============================================================================

/**
 * Check if completion is satisfied.
 *
 * @param {Object} state Store state.
 * @return {boolean} Completion satisfied.
 */
export function isCompletionSatisfied( state ) {
	return state.completionSatisfied;
}

/**
 * Get skipped steps.
 *
 * @param {Object} state Store state.
 * @return {string[]} Array of skipped step IDs.
 */
export function getSkippedSteps( state ) {
	return state.skippedSteps;
}

/**
 * Check if a specific step was skipped.
 *
 * @param {Object} state  Store state.
 * @param {string} stepId Step ID.
 * @return {boolean} Was skipped.
 */
export function wasStepSkipped( state, stepId ) {
	return state.skippedSteps.includes( stepId );
}

// ============================================================================
// Target Resolution Selectors
// ============================================================================

/**
 * Get resolved target.
 *
 * @param {Object} state Store state.
 * @return {Object|null} Resolved target info.
 */
export function getResolvedTarget( state ) {
	return state.resolvedTarget;
}

/**
 * Check if currently recovering.
 *
 * @param {Object} state Store state.
 * @return {boolean} Is recovering.
 */
export function isRecovering( state ) {
	return state.isRecovering;
}

/**
 * Get resolution attempts count.
 *
 * @param {Object} state Store state.
 * @return {number} Attempts count.
 */
export function getResolutionAttempts( state ) {
	return state.resolutionAttempts;
}

/**
 * Get last error.
 *
 * @param {Object} state Store state.
 * @return {string|null} Error message.
 */
export function getLastError( state ) {
	return state.lastError;
}

// ============================================================================
// Educator Mode Selectors
// ============================================================================

/**
 * Check if picker is active.
 *
 * @param {Object} state Store state.
 * @return {boolean} Picker active.
 */
export function isPickerActive( state ) {
	return state.isPickerActive;
}

/**
 * Get the step ID being picked for (if repicking target).
 *
 * @param {Object} state Store state.
 * @return {string|null} Step ID or null if adding new step.
 */
export function getPickingStepId( state ) {
	return state.pickingStepId || null;
}

/**
 * Get selected step ID.
 *
 * @param {Object} state Store state.
 * @return {string|null} Selected step ID.
 */
export function getSelectedStepId( state ) {
	return state.selectedStepId;
}

/**
 * Get selected step object (memoized).
 *
 * @param {Object} state Store state.
 * @return {Object|null} Selected step.
 */
export const getSelectedStep = createSelector(
	( state ) => {
		const tour = getCurrentTour( state );
		if ( ! tour || ! state.selectedStepId ) {
			return null;
		}
		return tour.steps.find( ( step ) => step.id === state.selectedStepId );
	},
	( state ) => [ state.tours, state.currentTourId, state.selectedStepId ]
);

/**
 * Check if there are pending changes.
 *
 * @param {Object} state Store state.
 * @return {boolean} Has pending changes.
 */
export function hasPendingChanges( state ) {
	return state.pendingChanges;
}

// ============================================================================
// AI Draft Selectors
// ============================================================================

/**
 * Check if AI draft is loading.
 *
 * @param {Object} state Store state.
 * @return {boolean} AI draft loading.
 */
export function isAiDraftLoading( state ) {
	return state.aiDraftLoading;
}

/**
 * Check if AI drafting is in progress (alias for isAiDraftLoading).
 *
 * @param {Object} state Store state.
 * @return {boolean} AI drafting in progress.
 */
export function isAiDrafting( state ) {
	return isAiDraftLoading( state );
}

/**
 * Get AI draft error.
 *
 * @param {Object} state Store state.
 * @return {string|null} Error message.
 */
export function getAiDraftError( state ) {
	return state.aiDraftError;
}

/**
 * Get AI draft result.
 *
 * @param {Object} state Store state.
 * @return {Object|null} AI draft output.
 */
export function getAiDraftResult( state ) {
	return state.aiDraftResult;
}

/**
 * Get AI draft (alias for getAiDraftResult).
 *
 * @param {Object} state Store state.
 * @return {Object|null} AI draft output.
 */
export function getAiDraft( state ) {
	return getAiDraftResult( state );
}

// ============================================================================
// UI Selectors
// ============================================================================

/**
 * Check if sidebar is open.
 *
 * @param {Object} state Store state.
 * @return {boolean} Sidebar open.
 */
export function isSidebarOpen( state ) {
	return state.sidebarOpen;
}

// ============================================================================
// AI Tour Selectors (Pupil Mode)
// ============================================================================

/**
 * Check if AI tour is loading.
 *
 * @param {Object} state Store state.
 * @return {boolean} AI tour loading.
 */
export function isAiTourLoading( state ) {
	return state.aiTourLoading;
}

/**
 * Get AI tour error.
 *
 * @param {Object} state Store state.
 * @return {string|null} Error message.
 */
export function getAiTourError( state ) {
	return state.aiTourError;
}

/**
 * Get ephemeral tour.
 *
 * @param {Object} state Store state.
 * @return {Object|null} Ephemeral tour.
 */
export function getEphemeralTour( state ) {
	return state.ephemeralTour;
}

/**
 * Check if currently running an ephemeral tour.
 *
 * @param {Object} state Store state.
 * @return {boolean} Is ephemeral tour active.
 */
export function isEphemeralTourActive( state ) {
	return state.currentTourId === 'ephemeral' && state.mode === 'pupil';
}
