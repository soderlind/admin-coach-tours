/**
 * Pupil Entry Point.
 *
 * Initializes the tour runner for pupils.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { render } from '@wordpress/element';
import { dispatch } from '@wordpress/data';

import TourRunner from './TourRunner.jsx';

// Import store to ensure it's registered.
import '../store/index.js';

const STORE_NAME = 'admin-coach-tours';

/**
 * Initialize the pupil tour runner.
 */
function init() {
	// Create container for tour runner.
	const container = document.createElement( 'div' );
	container.id = 'admin-coach-tours-pupil';
	document.body.appendChild( container );

	// Render the tour runner.
	render( <TourRunner />, container );

	// Check for auto-start tour from URL.
	const urlParams = new URLSearchParams( window.location.search );
	const autoStartTourId = urlParams.get( 'act_tour' );

	if ( autoStartTourId ) {
		// Wait for store to be ready, then start tour.
		setTimeout( () => {
			dispatch( STORE_NAME ).startTour( parseInt( autoStartTourId, 10 ) );
		}, 500 );
	}
}

// Initialize when DOM is ready.
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
