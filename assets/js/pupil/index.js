/**
 * Pupil Entry Point.
 *
 * Initializes the tour runner and AI launcher for pupils.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { render } from '@wordpress/element';
import { dispatch, select, subscribe } from '@wordpress/data';

import TourRunner from './TourRunner.jsx';
import PupilLauncher from './PupilLauncher.jsx';

// Import store to ensure it's registered.
import '../store/index.js';

const STORE_NAME = 'admin-coach-tours';

/**
 * Initialize the pupil tour runner.
 */
function init() {
	console.log( '[ACT Pupil] Initializing... v4' );
	console.log( '[ACT Pupil] TourRunner:', typeof TourRunner, TourRunner );
	console.log( '[ACT Pupil] AI Available:', window.adminCoachTours?.aiAvailable );

	// Create container for tour runner.
	const container = document.createElement( 'div' );
	container.id = 'admin-coach-tours-pupil';
	document.body.appendChild( container );

	// Render the tour runner.
	try {
		render( <TourRunner />, container );
		console.log( '[ACT Pupil] TourRunner rendered successfully' );
	} catch ( error ) {
		console.error( '[ACT Pupil] Error rendering TourRunner:', error );
	}

	// Create container for AI launcher.
	const launcherContainer = document.createElement( 'div' );
	launcherContainer.id = 'admin-coach-tours-launcher';
	document.body.appendChild( launcherContainer );

	try {
		render( <PupilLauncher />, launcherContainer );
		console.log( '[ACT Pupil] PupilLauncher rendered successfully' );
	} catch ( error ) {
		console.error( '[ACT Pupil] Error rendering PupilLauncher:', error );
	}

	// Check for auto-start tour from URL (use top window to handle iframe case).
	const topWindow = window.top || window;
	const urlParams = new URLSearchParams( topWindow.location.search );
	const autoStartTourId = urlParams.get( 'act_tour' );

	console.log( '[ACT Pupil] URL search:', topWindow.location.search );
	console.log( '[ACT Pupil] act_tour param:', autoStartTourId );

	if ( autoStartTourId ) {
		const tourId = parseInt( autoStartTourId, 10 );
		console.log( '[ACT Pupil] Will fetch and start tour:', tourId );

		// First, trigger the tour to be fetched via selector resolution.
		// Access the selector to kick off the resolver.
		const initialTour = select( STORE_NAME ).getTour( tourId );
		console.log( '[ACT Pupil] Initial tour state:', initialTour );

		// Subscribe to store changes and start tour once it's loaded.
		const unsubscribe = subscribe( () => {
			const store = select( STORE_NAME );
			const tour = store.getTour( tourId );
			const isLoading = store.isToursLoading();

			// Once tour is loaded and not loading, start it.
			if ( tour && ! isLoading ) {
				console.log( '[ACT Pupil] Tour loaded:', tour );
				console.log( '[ACT Pupil] Tour steps:', tour.steps, 'count:', tour.steps?.length );
				unsubscribe();
				dispatch( STORE_NAME ).startTour( tourId );
			}
		} );

		// Timeout fallback - if tour doesn't load within 10 seconds, give up.
		setTimeout( () => {
			console.log( '[ACT Pupil] Timeout reached, unsubscribing' );
			unsubscribe();
		}, 10000 );
	}
}

// Initialize when DOM is ready.
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
