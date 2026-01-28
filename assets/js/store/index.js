/**
 * Admin Coach Tours - WordPress data store.
 *
 * Central state management for tour playback, editing, and UI state.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { createReduxStore, register } from '@wordpress/data';
import reducer from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';
import * as resolvers from './resolvers';
import controls from './controls';

/**
 * Store name constant.
 */
export const STORE_NAME = 'admin-coach-tours';

/**
 * Initial state for the store.
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
};

/**
 * Create the Redux store.
 */
const store = createReduxStore( STORE_NAME, {
	reducer,
	actions,
	selectors,
	resolvers,
	controls,
	initialState: DEFAULT_STATE,
} );

/**
 * Register the store with WordPress.
 */
register( store );

export default store;
