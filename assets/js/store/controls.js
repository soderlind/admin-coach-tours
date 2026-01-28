/**
 * Store controls for side effects.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import apiFetch from '@wordpress/api-fetch';

/**
 * Control handlers.
 */
const controls = {
	/**
	 * Handle API fetch requests.
	 *
	 * @param {Object} action Action with request config.
	 * @return {Promise} API response.
	 */
	API_FETCH( action ) {
		return apiFetch( action.request );
	},

	/**
	 * Handle tour fetch requests.
	 *
	 * @param {Object} action Action with tourId.
	 * @return {Promise} API response.
	 */
	FETCH_TOUR( action ) {
		return apiFetch( {
			path: `/admin-coach-tours/v1/tours/${ action.tourId }`,
			method: 'GET',
		} );
	},

	/**
	 * Handle tours list fetch.
	 *
	 * @param {Object} action Action with args.
	 * @return {Promise} API response.
	 */
	FETCH_TOURS( action ) {
		const params = new URLSearchParams();

		if ( action.args.postType ) {
			params.append( 'post_type', action.args.postType );
		}
		if ( action.args.editor ) {
			params.append( 'editor', action.args.editor );
		}

		const query = params.toString();
		const path = `/admin-coach-tours/v1/tours${ query ? `?${ query }` : '' }`;

		return apiFetch( {
			path,
			method: 'GET',
		} );
	},

	/**
	 * Handle tour save requests.
	 *
	 * @param {Object} action Action with tourId.
	 * @return {Function} Thunk that saves tour.
	 */
	SAVE_TOUR( action ) {
		return async ( { select } ) => {
			const tour = select.getTour( action.tourId );
			if ( ! tour ) {
				throw new Error( 'Tour not found' );
			}

			return apiFetch( {
				path: `/admin-coach-tours/v1/tours/${ action.tourId }`,
				method: 'PUT',
				data: {
					title: tour.title,
					editor: tour.editor,
					postTypes: tour.postTypes,
					steps: tour.steps,
				},
			} );
		};
	},

	/**
	 * Handle AI draft requests.
	 *
	 * @param {Object} action Action with element context.
	 * @return {Promise} API response.
	 */
	REQUEST_AI_DRAFT( action ) {
		return apiFetch( {
			path: '/admin-coach-tours/v1/ai/draft-step',
			method: 'POST',
			data: {
				elementContext: action.elementContext,
				postType: action.postType,
			},
		} );
	},
};

export default controls;
