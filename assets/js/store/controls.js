/**
 * Store controls for side effects.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import apiFetch from '@wordpress/api-fetch';
import { gatherEditorContext } from '../runtime/gatherEditorContext';
import { ensureEmptyPlaceholder } from '../runtime/ensureEmptyPlaceholder';

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
	 * Gather editor context for AI tour generation.
	 *
	 * @return {Object} Editor context including blocks and UI state.
	 */
	GATHER_EDITOR_CONTEXT() {
		return gatherEditorContext();
	},

	/**
	 * Ensure an empty block placeholder exists for "/" quick inserter tours.
	 *
	 * @return {Promise<Object>} Result with wasInserted and clientId.
	 */
	ENSURE_EMPTY_PLACEHOLDER() {
		return ensureEmptyPlaceholder();
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
	 * @param {Object} action Action with tourId and tourData.
	 * @return {Promise} API response.
	 */
	SAVE_TOUR( action ) {
		console.log( '[ACT Controls] SAVE_TOUR:', action.tourId, action.tourData );
		console.log( '[ACT Controls] Steps count:', action.tourData?.steps?.length );
		return apiFetch( {
			path: `/admin-coach-tours/v1/tours/${ action.tourId }`,
			method: 'PUT',
			data: action.tourData,
		} );
	},

	/**
	 * Handle tour creation.
	 *
	 * @param {Object} action Action with tour data.
	 * @return {Promise} API response with created tour.
	 */
	CREATE_TOUR( action ) {
		return apiFetch( {
			path: '/admin-coach-tours/v1/tours',
			method: 'POST',
			data: action.data,
		} );
	},

	/**
	 * Handle tour update.
	 *
	 * @param {Object} action Action with tourId and data.
	 * @return {Promise} API response with updated tour.
	 */
	UPDATE_TOUR( action ) {
		return apiFetch( {
			path: `/admin-coach-tours/v1/tours/${ action.tourId }`,
			method: 'PUT',
			data: action.data,
		} );
	},

	/**
	 * Handle AI draft requests.
	 *
	 * @param {Object} action Action with element context.
	 * @return {Promise} API response.
	 */
	REQUEST_AI_DRAFT( action ) {
		return apiFetch( {
			path: '/admin-coach-tours/v1/ai/generate-draft',
			method: 'POST',
			data: {
				elementContext: action.elementContext,
				postType: action.postType,
			},
		} );
	},

	/**
	 * Handle AI tour generation requests.
	 *
	 * @param {Object} action Action with taskId, query, postType, and editorContext.
	 * @return {Promise} API response with generated tour.
	 */
	REQUEST_AI_TOUR( action ) {
		return apiFetch( {
			path: '/admin-coach-tours/v1/ai/generate-tour',
			method: 'POST',
			data: {
				taskId: action.taskId,
				query: action.query,
				postType: action.postType,
				editorContext: action.editorContext || null,
			},
		} );
	},

	/**
	 * Fetch available AI tasks.
	 *
	 * @return {Promise} API response with available tasks.
	 */
	FETCH_AI_TASKS() {
		return apiFetch( {
			path: '/admin-coach-tours/v1/ai/tasks',
			method: 'GET',
		} );
	},
};

export default controls;
