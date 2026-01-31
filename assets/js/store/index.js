/**
 * Admin Coach Tours - WordPress data store.
 *
 * Central state management for tour playback, editing, and UI state.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { createReduxStore, register, select } from '@wordpress/data';
import reducer, { DEFAULT_STATE } from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';
import * as resolvers from './resolvers';
import controls from './controls';

/**
 * Store name constant.
 */
export const STORE_NAME = 'admin-coach-tours';

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
 * Register the store with WordPress (only if not already registered).
 */
if ( ! select( STORE_NAME ) ) {
	register( store );
}

export default store;
export { DEFAULT_STATE };
