<?php
/**
 * Tour Repository for storing and retrieving tours.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare(strict_types=1);

namespace AdminCoachTours\Storage;

use AdminCoachTours\Cpt\ToursCpt;
use AdminCoachTours\Validation\StepSchema;
use WP_Error;
use WP_Post;
use WP_Query;

/**
 * Repository for tour CRUD operations with versioning and migration support.
 */
class TourRepository {

	/**
	 * Get all tours, optionally filtered by scope.
	 *
	 * @param array $args {
	 *     Optional. Query arguments.
	 *
	 *     @type string $editor     Filter by editor type (block, classic, site).
	 *     @type array  $post_types Filter by applicable post types.
	 *     @type string $status     Post status. Default 'publish'.
	 *     @type int    $per_page   Number of tours to retrieve. Default -1 (all).
	 * }
	 * @return array Array of tour data with steps.
	 */
	public static function get_all( array $args = [] ): array {
		$defaults = [
			'editor'     => '',
			'post_types' => [],
			'status'     => 'publish',
			'per_page'   => -1,
		];

		$args = wp_parse_args( $args, $defaults );

		$query_args = [
			'post_type'      => ToursCpt::POST_TYPE,
			'post_status'    => $args['status'],
			'posts_per_page' => $args['per_page'],
			'orderby'        => 'menu_order title',
			'order'          => 'ASC',
		];

		// Filter by editor scope.
		if ( ! empty( $args['editor'] ) ) {
			$query_args['meta_query'][] = [
				'key'     => ToursCpt::META_EDITOR,
				'value'   => sanitize_key( $args['editor'] ),
				'compare' => '=',
			];
		}

		// Filter by post types.
		if ( ! empty( $args['post_types'] ) && is_array( $args['post_types'] ) ) {
			$query_args['meta_query'][] = [
				'key'     => ToursCpt::META_POST_TYPES,
				'value'   => array_map( 'sanitize_key', $args['post_types'] ),
				'compare' => 'IN',
			];
		}

		if ( isset( $query_args['meta_query'] ) && count( $query_args['meta_query'] ) > 1 ) {
			$query_args['meta_query']['relation'] = 'AND';
		}

		$query = new WP_Query( $query_args );
		$tours = [];

		foreach ( $query->posts as $post ) {
			$tour_data = self::get( $post->ID );
			if ( ! is_wp_error( $tour_data ) ) {
				$tours[] = $tour_data;
			}
		}

		return $tours;
	}

	/**
	 * Get a single tour by ID.
	 *
	 * @param int $tour_id The tour post ID.
	 * @return array|WP_Error Tour data or error.
	 */
	public static function get( int $tour_id ): array|WP_Error {
		$post = get_post( $tour_id );

		if ( ! $post || ToursCpt::POST_TYPE !== $post->post_type ) {
			return new WP_Error(
				'tour_not_found',
				__( 'Tour not found', 'admin-coach-tours' ),
				[ 'status' => 404 ]
			);
		}

		// Get and migrate steps if needed.
		$steps          = self::get_steps( $tour_id );
		$schema_version = (int) get_post_meta( $tour_id, ToursCpt::META_SCHEMA_VERSION, true );

		if ( $schema_version < ToursCpt::SCHEMA_VERSION ) {
			$steps = self::migrate_steps( $steps, $schema_version );
			self::save_steps( $tour_id, $steps );
			update_post_meta( $tour_id, ToursCpt::META_SCHEMA_VERSION, ToursCpt::SCHEMA_VERSION );
		}

		return [
			'id'            => $tour_id,
			'title'         => $post->post_title,
			'status'        => $post->post_status,
			'editor'        => get_post_meta( $tour_id, ToursCpt::META_EDITOR, true ) ?: 'block',
			'postTypes'     => get_post_meta( $tour_id, ToursCpt::META_POST_TYPES, true ) ?: [ 'post', 'page' ],
			'steps'         => $steps,
			'schemaVersion' => ToursCpt::SCHEMA_VERSION,
			'author'        => (int) $post->post_author,
			'created'       => $post->post_date_gmt,
			'modified'      => $post->post_modified_gmt,
		];
	}

	/**
	 * Get steps for a tour.
	 *
	 * @param int $tour_id The tour post ID.
	 * @return array Array of steps.
	 */
	public static function get_steps( int $tour_id ): array {
		$steps_json = get_post_meta( $tour_id, ToursCpt::META_STEPS, true );

		if ( empty( $steps_json ) ) {
			return [];
		}

		if ( is_string( $steps_json ) ) {
			$steps = json_decode( $steps_json, true );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				return [];
			}
		} else {
			$steps = $steps_json;
		}

		if ( ! is_array( $steps ) ) {
			return [];
		}

		// Sort by order.
		usort(
			$steps,
			function ( $a, $b ) {
				return ( $a['order'] ?? 0 ) <=> ( $b['order'] ?? 0 );
			}
		);

		return $steps;
	}

	/**
	 * Create a new tour.
	 *
	 * @param array $data {
	 *     Tour data.
	 *
	 *     @type string $title     Tour title (required).
	 *     @type string $editor    Editor scope. Default 'block'.
	 *     @type array  $postTypes Post types scope. Default ['post', 'page'].
	 *     @type array  $steps     Initial steps. Default [].
	 *     @type string $status    Post status. Default 'draft'.
	 * }
	 * @return int|WP_Error Tour ID on success, WP_Error on failure.
	 */
	public static function create( array $data ): int|WP_Error {
		if ( empty( $data['title'] ) ) {
			return new WP_Error(
				'missing_title',
				__( 'Tour title is required', 'admin-coach-tours' ),
				[ 'status' => 400 ]
			);
		}

		// Validate steps if provided.
		$steps = $data['steps'] ?? [];
		if ( ! empty( $steps ) ) {
			$validation = StepSchema::validate_all( $steps );
			if ( is_wp_error( $validation ) ) {
				return $validation;
			}
		}

		$post_data = [
			'post_type'   => ToursCpt::POST_TYPE,
			'post_title'  => sanitize_text_field( $data['title'] ),
			'post_status' => isset( $data['status'] ) ? sanitize_key( $data['status'] ) : 'draft',
			'post_author' => get_current_user_id(),
		];

		$tour_id = wp_insert_post( $post_data, true );

		if ( is_wp_error( $tour_id ) ) {
			return $tour_id;
		}

		// Save meta.
		update_post_meta( $tour_id, ToursCpt::META_EDITOR, $data['editor'] ?? 'block' );
		update_post_meta( $tour_id, ToursCpt::META_POST_TYPES, $data['postTypes'] ?? [ 'post', 'page' ] );
		update_post_meta( $tour_id, ToursCpt::META_SCHEMA_VERSION, ToursCpt::SCHEMA_VERSION );

		// Save steps.
		self::save_steps( $tour_id, $steps );

		return $tour_id;
	}

	/**
	 * Update an existing tour.
	 *
	 * @param int   $tour_id The tour post ID.
	 * @param array $data    Tour data to update.
	 * @return true|WP_Error True on success, WP_Error on failure.
	 */
	public static function update( int $tour_id, array $data ): true|WP_Error {
		$post = get_post( $tour_id );

		if ( ! $post || ToursCpt::POST_TYPE !== $post->post_type ) {
			return new WP_Error(
				'tour_not_found',
				__( 'Tour not found', 'admin-coach-tours' ),
				[ 'status' => 404 ]
			);
		}

		// Validate steps if provided.
		if ( isset( $data['steps'] ) ) {
			$validation = StepSchema::validate_all( $data['steps'] );
			if ( is_wp_error( $validation ) ) {
				return $validation;
			}
		}

		// Update post data if provided.
		$post_data = [ 'ID' => $tour_id ];
		if ( isset( $data['title'] ) ) {
			$post_data['post_title'] = sanitize_text_field( $data['title'] );
		}
		if ( isset( $data['status'] ) ) {
			$post_data['post_status'] = sanitize_key( $data['status'] );
		}

		if ( count( $post_data ) > 1 ) {
			$result = wp_update_post( $post_data, true );
			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}

		// Update meta.
		if ( isset( $data['editor'] ) ) {
			update_post_meta( $tour_id, ToursCpt::META_EDITOR, $data['editor'] );
		}
		if ( isset( $data['postTypes'] ) ) {
			update_post_meta( $tour_id, ToursCpt::META_POST_TYPES, $data['postTypes'] );
		}

		// Update steps.
		if ( isset( $data['steps'] ) ) {
			self::save_steps( $tour_id, $data['steps'] );
		}

		return true;
	}

	/**
	 * Delete a tour.
	 *
	 * @param int  $tour_id      The tour post ID.
	 * @param bool $force_delete Whether to bypass trash. Default false.
	 * @return true|WP_Error True on success, WP_Error on failure.
	 */
	public static function delete( int $tour_id, bool $force_delete = false ): true|WP_Error {
		$post = get_post( $tour_id );

		if ( ! $post || ToursCpt::POST_TYPE !== $post->post_type ) {
			return new WP_Error(
				'tour_not_found',
				__( 'Tour not found', 'admin-coach-tours' ),
				[ 'status' => 404 ]
			);
		}

		$result = wp_delete_post( $tour_id, $force_delete );

		if ( ! $result ) {
			return new WP_Error(
				'delete_failed',
				__( 'Failed to delete tour', 'admin-coach-tours' ),
				[ 'status' => 500 ]
			);
		}

		return true;
	}

	/**
	 * Save steps for a tour.
	 *
	 * @param int   $tour_id The tour post ID.
	 * @param array $steps   Steps to save.
	 * @return bool True on success.
	 */
	public static function save_steps( int $tour_id, array $steps ): bool {
		// Ensure order is sequential.
		$steps = array_values( $steps );
		foreach ( $steps as $i => &$step ) {
			$step['order'] = $i;
			if ( empty( $step['id'] ) ) {
				$step['id'] = wp_generate_uuid4();
			}
		}

		$json = wp_json_encode( $steps );

		// Write directly to database to bypass sanitize_callback issues.
		// The sanitize_callback on register_post_meta was corrupting the JSON data.
		global $wpdb;
		$meta_key = ToursCpt::META_STEPS;

		// Delete existing.
		$wpdb->delete(
			$wpdb->postmeta,
			[
				'post_id'  => $tour_id,
				'meta_key' => $meta_key,
			],
			[ '%d', '%s' ]
		);

		// Insert new.
		$result = $wpdb->insert(
			$wpdb->postmeta,
			[
				'post_id'    => $tour_id,
				'meta_key'   => $meta_key,
				'meta_value' => $json,
			],
			[ '%d', '%s', '%s' ]
		);

		// Clear meta cache so subsequent reads get fresh data.
		wp_cache_delete( $tour_id, 'post_meta' );

		return false !== $result;
	}

	/**
	 * Add a step to a tour.
	 *
	 * @param int   $tour_id The tour post ID.
	 * @param array $step    Step data.
	 * @param int   $index   Position to insert. -1 for end. Default -1.
	 * @return array|WP_Error Updated step with id, or error.
	 */
	public static function add_step( int $tour_id, array $step, int $index = -1 ): array|WP_Error {
		// Validate step.
		if ( empty( $step['id'] ) ) {
			$step['id'] = wp_generate_uuid4();
		}

		$steps = self::get_steps( $tour_id );

		// Set order.
		if ( $index < 0 || $index >= count( $steps ) ) {
			$step['order'] = count( $steps );
			$steps[]       = $step;
		} else {
			$step['order'] = $index;
			array_splice( $steps, $index, 0, [ $step ] );
			// Re-index orders.
			foreach ( $steps as $i => &$s ) {
				$s['order'] = $i;
			}
		}

		// Validate.
		$validation = StepSchema::validate( $step );
		if ( is_wp_error( $validation ) ) {
			return $validation;
		}

		self::save_steps( $tour_id, $steps );

		return $step;
	}

	/**
	 * Update a step in a tour.
	 *
	 * @param int    $tour_id The tour post ID.
	 * @param string $step_id The step ID.
	 * @param array  $data    Step data to update.
	 * @return array|WP_Error Updated step or error.
	 */
	public static function update_step( int $tour_id, string $step_id, array $data ): array|WP_Error {
		$steps = self::get_steps( $tour_id );
		$found = false;

		foreach ( $steps as &$step ) {
			if ( $step['id'] === $step_id ) {
				$step  = array_merge( $step, $data );
				$found = true;

				// Validate updated step.
				$validation = StepSchema::validate( $step );
				if ( is_wp_error( $validation ) ) {
					return $validation;
				}
				break;
			}
		}

		if ( ! $found ) {
			return new WP_Error(
				'step_not_found',
				__( 'Step not found', 'admin-coach-tours' ),
				[ 'status' => 404 ]
			);
		}

		self::save_steps( $tour_id, $steps );

		return $step;
	}

	/**
	 * Delete a step from a tour.
	 *
	 * @param int    $tour_id The tour post ID.
	 * @param string $step_id The step ID.
	 * @return true|WP_Error True on success, WP_Error on failure.
	 */
	public static function delete_step( int $tour_id, string $step_id ): true|WP_Error {
		$steps    = self::get_steps( $tour_id );
		$filtered = array_filter(
			$steps,
			function ( $step ) use ( $step_id ) {
				return $step['id'] !== $step_id;
			}
		);

		if ( count( $filtered ) === count( $steps ) ) {
			return new WP_Error(
				'step_not_found',
				__( 'Step not found', 'admin-coach-tours' ),
				[ 'status' => 404 ]
			);
		}

		self::save_steps( $tour_id, array_values( $filtered ) );

		return true;
	}

	/**
	 * Reorder steps in a tour.
	 *
	 * @param int   $tour_id  The tour post ID.
	 * @param array $step_ids Ordered array of step IDs.
	 * @return true|WP_Error True on success, WP_Error on failure.
	 */
	public static function reorder_steps( int $tour_id, array $step_ids ): true|WP_Error {
		$steps     = self::get_steps( $tour_id );
		$steps_map = [];

		foreach ( $steps as $step ) {
			$steps_map[ $step['id'] ] = $step;
		}

		$reordered = [];
		foreach ( $step_ids as $i => $id ) {
			if ( ! isset( $steps_map[ $id ] ) ) {
				return new WP_Error(
					'step_not_found',
					sprintf(
						/* translators: %s: step ID */
						__( 'Step not found: %s', 'admin-coach-tours' ),
						$id
					),
					[ 'status' => 404 ]
				);
			}
			$step          = $steps_map[ $id ];
			$step['order'] = $i;
			$reordered[]   = $step;
		}

		self::save_steps( $tour_id, $reordered );

		return true;
	}

	/**
	 * Migrate steps from older schema versions.
	 *
	 * @param array $steps   Steps to migrate.
	 * @param int   $version Current schema version of the steps.
	 * @return array Migrated steps.
	 */
	private static function migrate_steps( array $steps, int $version ): array {
		// Version 0 -> 1: Add version field and normalize structure.
		if ( $version < 1 ) {
			foreach ( $steps as &$step ) {
				// Ensure all required fields exist.
				$step = array_merge(
					[
						'id'            => wp_generate_uuid4(),
						'order'         => 0,
						'title'         => '',
						'instruction'   => '',
						'hint'          => '',
						'target'        => [
							'locators'    => [],
							'constraints' => [],
						],
						'preconditions' => [],
						'completion'    => [ 'type' => 'manual' ],
						'recovery'      => [],
						'tags'          => [],
						'version'       => 1,
					],
					$step
				);
			}
		}

		// Future migrations would go here.

		return $steps;
	}
}
