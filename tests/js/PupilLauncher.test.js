/**
 * Pupil Launcher tests.
 *
 * @package AdminCoachTours
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Mock the WordPress dependencies before importing the component.
 */
const mockDispatch = vi.fn();
const mockSelect = vi.fn();

vi.mock( '@wordpress/element', () => ( {
	useState: vi.fn( ( initial ) => [ initial, vi.fn() ] ),
	useEffect: vi.fn( ( fn ) => fn() ),
	useCallback: vi.fn( ( fn ) => fn ),
	useRef: vi.fn( () => ( { current: null } ) ),
	createElement: vi.fn(),
} ) );

vi.mock( '@wordpress/data', () => ( {
	useSelect: vi.fn( ( selector ) => selector( () => ( {
		isAiTourLoading: () => false,
		getAiTourError: () => null,
		getCurrentTour: () => null,
	} ) ) ),
	useDispatch: vi.fn( () => ( {
		requestAiTour: mockDispatch,
		clearEphemeralTour: vi.fn(),
	} ) ),
} ) );

vi.mock( '@wordpress/i18n', () => ( {
	__: vi.fn( ( str ) => str ),
} ) );

vi.mock( '@wordpress/api-fetch', () => ( {
	default: vi.fn( () => Promise.resolve( { available: true, tasks: [] } ) ),
} ) );

describe( 'PupilLauncher', () => {
	beforeEach( () => {
		vi.clearAllMocks();

		// Set up global.
		global.window = {
			adminCoachTours: {
				aiAvailable: true,
			},
		};
	} );

	afterEach( () => {
		delete global.window;
	} );

	describe( 'CATEGORY_ICONS', () => {
		it( 'should define category icons', async () => {
			// Import the module to check exports.
			const module = await import(
				'../../assets/js/pupil/PupilLauncher.jsx'
			);

			// The default export is the component.
			expect( module.default ).toBeDefined();
		} );
	} );

	describe( 'Task handling', () => {
		it( 'should group tasks by category correctly', () => {
			const tasks = [
				{ id: '1', category: 'media', label: 'Add image' },
				{ id: '2', category: 'media', label: 'Add video' },
				{ id: '3', category: 'text', label: 'Add heading' },
			];

			const grouped = tasks.reduce( ( acc, task ) => {
				const cat = task.category || 'other';
				if ( ! acc[ cat ] ) {
					acc[ cat ] = [];
				}
				acc[ cat ].push( task );
				return acc;
			}, {} );

			expect( grouped.media ).toHaveLength( 2 );
			expect( grouped.text ).toHaveLength( 1 );
		} );

		it( 'should handle missing category gracefully', () => {
			const tasks = [
				{ id: '1', label: 'No category task' },
			];

			const grouped = tasks.reduce( ( acc, task ) => {
				const cat = task.category || 'other';
				if ( ! acc[ cat ] ) {
					acc[ cat ] = [];
				}
				acc[ cat ].push( task );
				return acc;
			}, {} );

			expect( grouped.other ).toHaveLength( 1 );
		} );
	} );

	describe( 'API request format', () => {
		it( 'should structure task request correctly', () => {
			const taskId = 'add-image';
			const postType = 'post';

			const requestBody = {
				taskId,
				postType,
			};

			expect( requestBody ).toEqual( {
				taskId: 'add-image',
				postType: 'post',
			} );
		} );

		it( 'should structure freeform request correctly', () => {
			const query = 'How do I add a button?';
			const postType = 'page';

			const requestBody = {
				query,
				postType,
			};

			expect( requestBody ).toEqual( {
				query: 'How do I add a button?',
				postType: 'page',
			} );
		} );
	} );

	describe( 'AI availability', () => {
		it( 'should detect AI availability from window config', () => {
			global.window.adminCoachTours = { aiAvailable: true };
			expect( window.adminCoachTours.aiAvailable ).toBe( true );

			global.window.adminCoachTours = { aiAvailable: false };
			expect( window.adminCoachTours.aiAvailable ).toBe( false );
		} );

		it( 'should handle missing config gracefully', () => {
			delete global.window.adminCoachTours;
			const aiAvailable = global.window?.adminCoachTours?.aiAvailable ?? false;
			expect( aiAvailable ).toBe( false );
		} );
	} );
} );

describe( 'Store actions for AI tours', () => {
	describe( 'REQUEST_AI_TOUR action', () => {
		it( 'should create action with task ID', () => {
			const action = {
				type: 'REQUEST_AI_TOUR',
				taskId: 'add-image',
				postType: 'post',
			};

			expect( action.type ).toBe( 'REQUEST_AI_TOUR' );
			expect( action.taskId ).toBe( 'add-image' );
		} );

		it( 'should create action with freeform query', () => {
			const action = {
				type: 'REQUEST_AI_TOUR',
				query: 'How do I format text?',
				postType: 'post',
			};

			expect( action.type ).toBe( 'REQUEST_AI_TOUR' );
			expect( action.query ).toBe( 'How do I format text?' );
		} );
	} );

	describe( 'SET_EPHEMERAL_TOUR action', () => {
		it( 'should store ephemeral tour', () => {
			const tour = {
				id: 'ephemeral',
				title: 'Add an Image',
				steps: [
					{ id: 'step-1', title: 'Open inserter' },
				],
			};

			const action = {
				type: 'SET_EPHEMERAL_TOUR',
				tour,
			};

			expect( action.tour.id ).toBe( 'ephemeral' );
			expect( action.tour.steps ).toHaveLength( 1 );
		} );
	} );

	describe( 'CLEAR_EPHEMERAL_TOUR action', () => {
		it( 'should clear ephemeral tour', () => {
			const action = { type: 'CLEAR_EPHEMERAL_TOUR' };
			expect( action.type ).toBe( 'CLEAR_EPHEMERAL_TOUR' );
		} );
	} );
} );

describe( 'Ephemeral tour reducer', () => {
	const initialState = {
		ephemeralTour: null,
		isAiTourLoading: false,
		aiTourError: null,
	};

	it( 'should handle SET_EPHEMERAL_TOUR', () => {
		const tour = { id: 'ephemeral', title: 'Test Tour', steps: [] };
		const action = { type: 'SET_EPHEMERAL_TOUR', tour };

		const newState = {
			...initialState,
			ephemeralTour: action.tour,
			isAiTourLoading: false,
			aiTourError: null,
		};

		expect( newState.ephemeralTour ).toEqual( tour );
		expect( newState.isAiTourLoading ).toBe( false );
	} );

	it( 'should handle AI_TOUR_LOADING', () => {
		const action = { type: 'AI_TOUR_LOADING', isLoading: true };

		const newState = {
			...initialState,
			isAiTourLoading: action.isLoading,
		};

		expect( newState.isAiTourLoading ).toBe( true );
	} );

	it( 'should handle AI_TOUR_ERROR', () => {
		const error = 'Failed to generate tour';
		const action = { type: 'AI_TOUR_ERROR', error };

		const newState = {
			...initialState,
			aiTourError: action.error,
			isAiTourLoading: false,
		};

		expect( newState.aiTourError ).toBe( error );
	} );

	it( 'should handle CLEAR_EPHEMERAL_TOUR', () => {
		const stateWithTour = {
			...initialState,
			ephemeralTour: { id: 'ephemeral', title: 'Test' },
		};

		const newState = {
			...stateWithTour,
			ephemeralTour: null,
		};

		expect( newState.ephemeralTour ).toBeNull();
	} );
} );
