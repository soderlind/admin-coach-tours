/**
 * Store resolvers for async data fetching.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import apiFetch from '@wordpress/api-fetch';
import { setToursLoading, setToursError, receiveTours, receiveTour } from './actions';

/**
 * Resolver for getTours.
 *
 * @return {Function} Generator function.
 */
export function* getTours() {
	yield setToursLoading( true );

	try {
		const tours = yield {
			type: 'API_FETCH',
			request: {
				path: '/admin-coach-tours/v1/tours',
				method: 'GET',
			},
		};

		yield receiveTours( tours );
	} catch ( error ) {
		yield setToursError( error.message || 'Failed to fetch tours' );
	}
}

/**
 * Resolver for getTour.
 *
 * @param {number} tourId Tour ID.
 * @return {Function} Generator function.
 */
export function* getTour( tourId ) {
	yield setToursLoading( true );

	try {
		const tour = yield {
			type: 'API_FETCH',
			request: {
				path: `/admin-coach-tours/v1/tours/${ tourId }`,
				method: 'GET',
			},
		};

		yield receiveTour( tour );
	} catch ( error ) {
		yield setToursError( error.message || 'Failed to fetch tour' );
	}
}

/**
 * Resolver for getToursByPostType.
 *
 * @param {string} postType Post type.
 * @return {Function} Generator function.
 */
export function* getToursByPostType( postType ) {
	yield setToursLoading( true );

	try {
		const tours = yield {
			type: 'API_FETCH',
			request: {
				path: `/admin-coach-tours/v1/tours?post_type=${ postType }&editor=block`,
				method: 'GET',
			},
		};

		yield receiveTours( tours );
	} catch ( error ) {
		yield setToursError( error.message || 'Failed to fetch tours' );
	}
}
