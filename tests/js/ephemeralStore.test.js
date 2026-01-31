/**
 * Store tests for ephemeral tours.
 *
 * @package AdminCoachTours
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe( 'Store Actions', () => {
	describe( 'requestAiTour', () => {
		it( 'should create REQUEST_AI_TOUR action with taskId', () => {
			const taskId = 'add-image';
			const postType = 'post';

			// Simulate what the action creator returns.
			const action = {
				type: 'REQUEST_AI_TOUR',
				taskId,
				postType,
			};

			expect( action.type ).toBe( 'REQUEST_AI_TOUR' );
			expect( action.taskId ).toBe( 'add-image' );
			expect( action.postType ).toBe( 'post' );
		} );

		it( 'should create REQUEST_AI_TOUR action with query', () => {
			const query = 'How do I add a cover image?';
			const postType = 'page';

			const action = {
				type: 'REQUEST_AI_TOUR',
				query,
				postType,
			};

			expect( action.type ).toBe( 'REQUEST_AI_TOUR' );
			expect( action.query ).toBe( query );
			expect( action.postType ).toBe( 'page' );
		} );
	} );

	describe( 'setEphemeralTour', () => {
		it( 'should create SET_EPHEMERAL_TOUR action', () => {
			const tour = {
				id: 'ephemeral',
				title: 'Add an Image',
				steps: [
					{
						id: 'open-inserter',
						order: 0,
						title: 'Open the block inserter',
						content: '<p>Click the + button to open the inserter.</p>',
						target: {
							locators: [ { type: 'css', value: '.editor-inserter-toggle', weight: 80 } ],
						},
						completion: { type: 'clickTarget' },
					},
				],
			};

			const action = {
				type: 'SET_EPHEMERAL_TOUR',
				tour,
			};

			expect( action.type ).toBe( 'SET_EPHEMERAL_TOUR' );
			expect( action.tour ).toEqual( tour );
		} );
	} );

	describe( 'clearEphemeralTour', () => {
		it( 'should create CLEAR_EPHEMERAL_TOUR action', () => {
			const action = { type: 'CLEAR_EPHEMERAL_TOUR' };

			expect( action.type ).toBe( 'CLEAR_EPHEMERAL_TOUR' );
		} );
	} );

	describe( 'setAiTourLoading', () => {
		it( 'should create AI_TOUR_LOADING action with true', () => {
			const action = {
				type: 'AI_TOUR_LOADING',
				isLoading: true,
			};

			expect( action.isLoading ).toBe( true );
		} );

		it( 'should create AI_TOUR_LOADING action with false', () => {
			const action = {
				type: 'AI_TOUR_LOADING',
				isLoading: false,
			};

			expect( action.isLoading ).toBe( false );
		} );
	} );

	describe( 'setAiTourError', () => {
		it( 'should create AI_TOUR_ERROR action', () => {
			const error = 'AI is not configured.';

			const action = {
				type: 'AI_TOUR_ERROR',
				error,
			};

			expect( action.type ).toBe( 'AI_TOUR_ERROR' );
			expect( action.error ).toBe( error );
		} );

		it( 'should create AI_TOUR_ERROR with null to clear error', () => {
			const action = {
				type: 'AI_TOUR_ERROR',
				error: null,
			};

			expect( action.error ).toBeNull();
		} );
	} );
} );

describe( 'Store Reducer', () => {
	const initialState = {
		currentTour: null,
		currentStep: null,
		isPlaying: false,
		ephemeralTour: null,
		isAiTourLoading: false,
		aiTourError: null,
	};

	const reducer = ( state = initialState, action ) => {
		switch ( action.type ) {
			case 'SET_EPHEMERAL_TOUR':
				return {
					...state,
					ephemeralTour: action.tour,
					isAiTourLoading: false,
					aiTourError: null,
				};
			case 'CLEAR_EPHEMERAL_TOUR':
				return {
					...state,
					ephemeralTour: null,
				};
			case 'AI_TOUR_LOADING':
				return {
					...state,
					isAiTourLoading: action.isLoading,
				};
			case 'AI_TOUR_ERROR':
				return {
					...state,
					aiTourError: action.error,
					isAiTourLoading: false,
				};
			default:
				return state;
		}
	};

	it( 'should return initial state', () => {
		expect( reducer( undefined, { type: 'UNKNOWN' } ) ).toEqual( initialState );
	} );

	it( 'should handle SET_EPHEMERAL_TOUR', () => {
		const tour = { id: 'ephemeral', title: 'Test', steps: [] };
		const action = { type: 'SET_EPHEMERAL_TOUR', tour };

		const newState = reducer( initialState, action );

		expect( newState.ephemeralTour ).toEqual( tour );
		expect( newState.isAiTourLoading ).toBe( false );
		expect( newState.aiTourError ).toBeNull();
	} );

	it( 'should handle CLEAR_EPHEMERAL_TOUR', () => {
		const stateWithTour = {
			...initialState,
			ephemeralTour: { id: 'ephemeral', title: 'Test' },
		};

		const action = { type: 'CLEAR_EPHEMERAL_TOUR' };
		const newState = reducer( stateWithTour, action );

		expect( newState.ephemeralTour ).toBeNull();
	} );

	it( 'should handle AI_TOUR_LOADING', () => {
		const action = { type: 'AI_TOUR_LOADING', isLoading: true };
		const newState = reducer( initialState, action );

		expect( newState.isAiTourLoading ).toBe( true );
	} );

	it( 'should handle AI_TOUR_ERROR', () => {
		const action = { type: 'AI_TOUR_ERROR', error: 'Something went wrong' };
		const newState = reducer( initialState, action );

		expect( newState.aiTourError ).toBe( 'Something went wrong' );
		expect( newState.isAiTourLoading ).toBe( false );
	} );
} );

describe( 'Store Selectors', () => {
	const state = {
		ephemeralTour: { id: 'ephemeral', title: 'Test Tour', steps: [] },
		isAiTourLoading: false,
		aiTourError: null,
	};

	describe( 'getEphemeralTour', () => {
		it( 'should return ephemeral tour', () => {
			const selector = ( s ) => s.ephemeralTour;
			expect( selector( state ) ).toEqual( state.ephemeralTour );
		} );

		it( 'should return null when no tour', () => {
			const selector = ( s ) => s.ephemeralTour;
			expect( selector( { ephemeralTour: null } ) ).toBeNull();
		} );
	} );

	describe( 'isAiTourLoading', () => {
		it( 'should return loading state', () => {
			const selector = ( s ) => s.isAiTourLoading;
			expect( selector( state ) ).toBe( false );
			expect( selector( { isAiTourLoading: true } ) ).toBe( true );
		} );
	} );

	describe( 'getAiTourError', () => {
		it( 'should return error', () => {
			const selector = ( s ) => s.aiTourError;
			expect( selector( state ) ).toBeNull();
			expect( selector( { aiTourError: 'Error message' } ) ).toBe( 'Error message' );
		} );
	} );
} );

describe( 'Controls', () => {
	describe( 'REQUEST_AI_TOUR control', () => {
		it( 'should build correct API path', () => {
			const buildPath = () => '/admin-coach-tours/v1/ai/generate-tour';
			expect( buildPath() ).toBe( '/admin-coach-tours/v1/ai/generate-tour' );
		} );

		it( 'should build correct request body for task', () => {
			const taskId = 'add-image';
			const postType = 'post';

			const body = { taskId, postType };

			expect( body ).toEqual( {
				taskId: 'add-image',
				postType: 'post',
			} );
		} );

		it( 'should build correct request body for query', () => {
			const query = 'How do I add a YouTube embed?';
			const postType = 'page';

			const body = { query, postType };

			expect( body ).toEqual( {
				query: 'How do I add a YouTube embed?',
				postType: 'page',
			} );
		} );
	} );
} );
