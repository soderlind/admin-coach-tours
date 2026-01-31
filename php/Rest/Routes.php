<?php
/**
 * REST API Routes.
 *
 * Registers and handles REST API endpoints.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare( strict_types=1 );

namespace AdminCoachTours\Rest;

use AdminCoachTours\Security\Capabilities;
use AdminCoachTours\Storage\TourRepository;

/**
 * Routes class.
 */
class Routes {

	/**
	 * API namespace.
	 *
	 * @var string
	 */
	public const NAMESPACE = 'admin-coach-tours/v1';

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Get singleton instance.
	 *
	 * @return self
	 */
	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		// No initialization needed - uses TourRepository static methods.
	}

	/**
	 * Initialize routes.
	 */
	public static function init(): void {
		$instance = self::get_instance();
		add_action( 'rest_api_init', [ $instance, 'register_routes' ] );
	}

	/**
	 * Register REST API routes.
	 */
	public function register_routes(): void {
		// Tours collection.
		register_rest_route(
			self::NAMESPACE,
			'/tours',
			[
				[
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_tours' ],
					'permission_callback' => [ $this, 'can_run_tours' ],
					'args'                => $this->get_collection_params(),
				],
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'create_tour' ],
					'permission_callback' => [ $this, 'can_edit_tours' ],
					'args'                => $this->get_tour_create_args(),
				],
			]
		);

		// Single tour.
		register_rest_route(
			self::NAMESPACE,
			'/tours/(?P<id>\d+)',
			[
				[
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_tour' ],
					'permission_callback' => [ $this, 'can_run_tours' ],
					'args'                => [
						'id' => [
							'type'              => 'integer',
							'required'          => true,
							'sanitize_callback' => 'absint',
						],
					],
				],
				[
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => [ $this, 'update_tour' ],
					'permission_callback' => [ $this, 'can_edit_tours' ],
					'args'                => $this->get_tour_update_args(),
				],
				[
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => [ $this, 'delete_tour' ],
					'permission_callback' => [ $this, 'can_edit_tours' ],
					'args'                => [
						'id' => [
							'type'              => 'integer',
							'required'          => true,
							'sanitize_callback' => 'absint',
						],
					],
				],
			]
		);

		// Steps.
		register_rest_route(
			self::NAMESPACE,
			'/tours/(?P<tour_id>\d+)/steps',
			[
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'add_step' ],
					'permission_callback' => [ $this, 'can_edit_tours' ],
					'args'                => $this->get_step_create_args(),
				],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/tours/(?P<tour_id>\d+)/steps/(?P<step_id>[\w-]+)',
			[
				[
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => [ $this, 'update_step' ],
					'permission_callback' => [ $this, 'can_edit_tours' ],
					'args'                => $this->get_step_update_args(),
				],
				[
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => [ $this, 'delete_step' ],
					'permission_callback' => [ $this, 'can_edit_tours' ],
				],
			]
		);

		// Reorder steps.
		register_rest_route(
			self::NAMESPACE,
			'/tours/(?P<tour_id>\d+)/steps/reorder',
			[
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'reorder_steps' ],
					'permission_callback' => [ $this, 'can_edit_tours' ],
					'args'                => [
						'tour_id' => [
							'type'              => 'integer',
							'required'          => true,
							'sanitize_callback' => 'absint',
						],
						'order'   => [
							'type'        => 'array',
							'required'    => true,
							'items'       => [ 'type' => 'string' ],
							'description' => __( 'Array of step IDs in desired order.', 'admin-coach-tours' ),
						],
					],
				],
			]
		);

		// AI endpoint.
		register_rest_route(
			self::NAMESPACE,
			'/ai/generate-draft',
			[
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ AiController::class, 'generate_draft' ],
					'permission_callback' => [ $this, 'can_use_ai' ],
					'args'                => [
						'elementContext' => [
							'type'        => 'object',
							'required'    => true,
							'description' => __( 'Context about the target element.', 'admin-coach-tours' ),
						],
						'tourContext'    => [
							'type'        => 'object',
							'default'     => [],
							'description' => __( 'Optional context about the tour.', 'admin-coach-tours' ),
						],
					],
				],
			]
		);

		// AI status.
		register_rest_route(
			self::NAMESPACE,
			'/ai/status',
			[
				[
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => [ AiController::class, 'get_status' ],
					'permission_callback' => [ $this, 'can_edit_tours' ],
				],
			]
		);

		// AI tasks for pupil.
		register_rest_route(
			self::NAMESPACE,
			'/ai/tasks',
			[
				[
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => [ AiController::class, 'get_tasks' ],
					'permission_callback' => [ $this, 'can_run_tours' ],
				],
			]
		);

		// Generate AI tour.
		register_rest_route(
			self::NAMESPACE,
			'/ai/generate-tour',
			[
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ AiController::class, 'generate_tour' ],
					'permission_callback' => [ $this, 'can_run_tours' ],
					'args'                => [
						'taskId'   => [
							'type'        => 'string',
							'default'     => '',
							'description' => __( 'ID of a predefined task.', 'admin-coach-tours' ),
						],
						'query'    => [
							'type'        => 'string',
							'default'     => '',
							'description' => __( 'Freeform user query.', 'admin-coach-tours' ),
						],
						'postType' => [
							'type'        => 'string',
							'default'     => 'post',
							'description' => __( 'The post type being edited.', 'admin-coach-tours' ),
						],
					],
				],
			]
		);
	}

	/**
	 * Check if user can run tours.
	 *
	 * @return bool|\WP_Error
	 */
	public function can_run_tours() {
		if ( ! is_user_logged_in() ) {
			return new \WP_Error(
				'rest_not_logged_in',
				__( 'You must be logged in.', 'admin-coach-tours' ),
				[ 'status' => 401 ]
			);
		}

		if ( ! current_user_can( Capabilities::RUN_TOURS ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to run tours.', 'admin-coach-tours' ),
				[ 'status' => 403 ]
			);
		}

		return true;
	}

	/**
	 * Check if user can edit tours.
	 *
	 * @return bool|\WP_Error
	 */
	public function can_edit_tours() {
		if ( ! is_user_logged_in() ) {
			return new \WP_Error(
				'rest_not_logged_in',
				__( 'You must be logged in.', 'admin-coach-tours' ),
				[ 'status' => 401 ]
			);
		}

		if ( ! current_user_can( Capabilities::EDIT_TOURS ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to edit tours.', 'admin-coach-tours' ),
				[ 'status' => 403 ]
			);
		}

		return true;
	}

	/**
	 * Check if user can use AI.
	 *
	 * @return bool|\WP_Error
	 */
	public function can_use_ai() {
		if ( ! is_user_logged_in() ) {
			return new \WP_Error(
				'rest_not_logged_in',
				__( 'You must be logged in.', 'admin-coach-tours' ),
				[ 'status' => 401 ]
			);
		}

		if ( ! current_user_can( Capabilities::USE_AI ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to use AI features.', 'admin-coach-tours' ),
				[ 'status' => 403 ]
			);
		}

		return true;
	}

	/**
	 * Get tours.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_tours( \WP_REST_Request $request ) {
		$args = [
			'post_type'  => $request->get_param( 'post_type' ),
			'editor'     => $request->get_param( 'editor' ),
			'status'     => $request->get_param( 'status' ),
			'per_page'   => $request->get_param( 'per_page' ),
			'page'       => $request->get_param( 'page' ),
		];

		// Filter out null values.
		$args = array_filter( $args, fn( $v ) => null !== $v );

		$tours = TourRepository::get_all( $args );

		return rest_ensure_response( $tours );
	}

	/**
	 * Get single tour.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_tour( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$tour = TourRepository::get( $id );

		if ( ! $tour ) {
			return new \WP_Error(
				'tour_not_found',
				__( 'Tour not found.', 'admin-coach-tours' ),
				[ 'status' => 404 ]
			);
		}

		return rest_ensure_response( $tour );
	}

	/**
	 * Create tour.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function create_tour( \WP_REST_Request $request ) {
		$data = [
			'title'       => $request->get_param( 'title' ),
			'description' => $request->get_param( 'description' ),
			'post_types'  => $request->get_param( 'postTypes' ),
			'editors'     => $request->get_param( 'editors' ),
			'status'      => $request->get_param( 'status' ) ?? 'draft',
		];

		$result = TourRepository::create( $data );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$tour = TourRepository::get( $result );

		return rest_ensure_response( $tour );
	}

	/**
	 * Update tour.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function update_tour( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$existing = TourRepository::get( $id );

		if ( ! $existing ) {
			return new \WP_Error(
				'tour_not_found',
				__( 'Tour not found.', 'admin-coach-tours' ),
				[ 'status' => 404 ]
			);
		}

		$data = [];

		if ( $request->has_param( 'title' ) ) {
			$data['title'] = $request->get_param( 'title' );
		}

		if ( $request->has_param( 'description' ) ) {
			$data['description'] = $request->get_param( 'description' );
		}

		if ( $request->has_param( 'postTypes' ) ) {
			$data['post_types'] = $request->get_param( 'postTypes' );
		}

		if ( $request->has_param( 'editors' ) ) {
			$data['editors'] = $request->get_param( 'editors' );
		}

		if ( $request->has_param( 'status' ) ) {
			$data['status'] = $request->get_param( 'status' );
		}

		if ( $request->has_param( 'steps' ) ) {
			$data['steps'] = $request->get_param( 'steps' );
		}

		$result = TourRepository::update( $id, $data );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$tour = TourRepository::get( $id );

		return rest_ensure_response( $tour );
	}

	/**
	 * Delete tour.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function delete_tour( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$result = TourRepository::delete( $id );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( [ 'deleted' => true ] );
	}

	/**
	 * Add step to tour.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function add_step( \WP_REST_Request $request ) {
		$tour_id = $request->get_param( 'tour_id' );

		$step_data = [
			'title'        => $request->get_param( 'title' ) ?? '',
			'content'      => $request->get_param( 'content' ) ?? '',
			'target'       => $request->get_param( 'target' ),
			'completion'   => $request->get_param( 'completion' ),
			'preconditions' => $request->get_param( 'preconditions' ),
		];

		$result = TourRepository::add_step( $tour_id, $step_data );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Update step.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function update_step( \WP_REST_Request $request ) {
		$tour_id = $request->get_param( 'tour_id' );
		$step_id = $request->get_param( 'step_id' );

		$step_data = [];

		foreach ( [ 'title', 'content', 'target', 'completion', 'preconditions', 'recovery' ] as $field ) {
			if ( $request->has_param( $field ) ) {
				$step_data[ $field ] = $request->get_param( $field );
			}
		}

		$result = TourRepository::update_step( $tour_id, $step_id, $step_data );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Delete step.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function delete_step( \WP_REST_Request $request ) {
		$tour_id = $request->get_param( 'tour_id' );
		$step_id = $request->get_param( 'step_id' );

		$result = TourRepository::delete_step( $tour_id, $step_id );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( [ 'deleted' => true ] );
	}

	/**
	 * Reorder steps.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function reorder_steps( \WP_REST_Request $request ) {
		$tour_id = $request->get_param( 'tour_id' );
		$order   = $request->get_param( 'order' );

		$result = TourRepository::reorder_steps( $tour_id, $order );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Get collection params.
	 *
	 * @return array
	 */
	private function get_collection_params(): array {
		return [
			'post_type' => [
				'type'              => 'string',
				'description'       => __( 'Filter by post type scope.', 'admin-coach-tours' ),
				'sanitize_callback' => 'sanitize_key',
			],
			'editor'    => [
				'type'              => 'string',
				'enum'              => [ 'block', 'classic' ],
				'description'       => __( 'Filter by editor type.', 'admin-coach-tours' ),
				'sanitize_callback' => 'sanitize_key',
			],
			'status'    => [
				'type'              => 'string',
				'enum'              => [ 'publish', 'draft', 'any' ],
				'default'           => 'any',
				'description'       => __( 'Filter by status.', 'admin-coach-tours' ),
				'sanitize_callback' => 'sanitize_key',
			],
			'per_page'  => [
				'type'              => 'integer',
				'default'           => 100,
				'minimum'           => 1,
				'maximum'           => 100,
				'sanitize_callback' => 'absint',
			],
			'page'      => [
				'type'              => 'integer',
				'default'           => 1,
				'minimum'           => 1,
				'sanitize_callback' => 'absint',
			],
		];
	}

	/**
	 * Get tour create args.
	 *
	 * @return array
	 */
	private function get_tour_create_args(): array {
		return [
			'title'       => [
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			],
			'description' => [
				'type'              => 'string',
				'default'           => '',
				'sanitize_callback' => 'sanitize_textarea_field',
			],
			'postTypes'   => [
				'type'    => 'array',
				'default' => [],
				'items'   => [ 'type' => 'string' ],
			],
			'editors'     => [
				'type'    => 'array',
				'default' => [ 'block' ],
				'items'   => [
					'type' => 'string',
					'enum' => [ 'block', 'classic' ],
				],
			],
			'status'      => [
				'type'    => 'string',
				'enum'    => [ 'publish', 'draft' ],
				'default' => 'draft',
			],
		];
	}

	/**
	 * Get tour update args.
	 *
	 * @return array
	 */
	private function get_tour_update_args(): array {
		$args = $this->get_tour_create_args();

		// Make all fields optional for updates.
		foreach ( $args as $key => $config ) {
			$args[ $key ]['required'] = false;
		}

		$args['id'] = [
			'type'              => 'integer',
			'required'          => true,
			'sanitize_callback' => 'absint',
		];

		// Allow steps to be updated.
		$args['steps'] = [
			'type'  => 'array',
			'items' => [ 'type' => 'object' ],
		];

		return $args;
	}

	/**
	 * Get step create args.
	 *
	 * @return array
	 */
	private function get_step_create_args(): array {
		return [
			'tour_id'      => [
				'type'              => 'integer',
				'required'          => true,
				'sanitize_callback' => 'absint',
			],
			'title'        => [
				'type'    => 'string',
				'default' => '',
			],
			'content'      => [
				'type'    => 'string',
				'default' => '',
			],
			'target'       => [
				'type'     => 'object',
				'required' => true,
			],
			'completion'   => [
				'type' => 'object',
			],
			'preconditions' => [
				'type'  => 'array',
				'items' => [ 'type' => 'object' ],
			],
		];
	}

	/**
	 * Get step update args.
	 *
	 * @return array
	 */
	private function get_step_update_args(): array {
		return [
			'tour_id'      => [
				'type'              => 'integer',
				'required'          => true,
				'sanitize_callback' => 'absint',
			],
			'step_id'      => [
				'type'     => 'string',
				'required' => true,
			],
			'title'        => [
				'type' => 'string',
			],
			'content'      => [
				'type' => 'string',
			],
			'target'       => [
				'type' => 'object',
			],
			'completion'   => [
				'type' => 'object',
			],
			'preconditions' => [
				'type'  => 'array',
				'items' => [ 'type' => 'object' ],
			],
			'recovery'     => [
				'type'  => 'array',
				'items' => [ 'type' => 'object' ],
			],
		];
	}
}
