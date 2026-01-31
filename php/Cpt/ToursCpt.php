<?php
/**
 * Tours Custom Post Type registration.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare(strict_types=1);

namespace AdminCoachTours\Cpt;

/**
 * Handles registration and configuration of the act_tour custom post type.
 */
class ToursCpt {

	/**
	 * Post type slug.
	 */
	public const POST_TYPE = 'act_tour';

	/**
	 * Meta key for storing steps JSON.
	 */
	public const META_STEPS = '_act_steps';

	/**
	 * Meta key for schema version.
	 */
	public const META_SCHEMA_VERSION = '_act_schema_version';

	/**
	 * Meta key for editor scope.
	 */
	public const META_EDITOR = '_act_editor';

	/**
	 * Meta key for post types scope.
	 */
	public const META_POST_TYPES = '_act_post_types';

	/**
	 * Current schema version.
	 */
	public const SCHEMA_VERSION = 1;

	/**
	 * Initialize the CPT registration.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'init', [ self::class, 'register_post_type' ] );
		add_action( 'init', [ self::class, 'register_meta' ] );
	}

	/**
	 * Register the act_tour post type.
	 *
	 * @return void
	 */
	public static function register_post_type(): void {
		$labels = [
			'name'                  => _x( 'Coach Tours', 'Post Type General Name', 'admin-coach-tours' ),
			'singular_name'         => _x( 'Coach Tour', 'Post Type Singular Name', 'admin-coach-tours' ),
			'menu_name'             => __( 'Coach Tours', 'admin-coach-tours' ),
			'name_admin_bar'        => __( 'Coach Tour', 'admin-coach-tours' ),
			'archives'              => __( 'Tour Archives', 'admin-coach-tours' ),
			'attributes'            => __( 'Tour Attributes', 'admin-coach-tours' ),
			'parent_item_colon'     => __( 'Parent Tour:', 'admin-coach-tours' ),
			'all_items'             => __( 'All Tours', 'admin-coach-tours' ),
			'add_new_item'          => __( 'Add New Tour', 'admin-coach-tours' ),
			'add_new'               => __( 'Add New', 'admin-coach-tours' ),
			'new_item'              => __( 'New Tour', 'admin-coach-tours' ),
			'edit_item'             => __( 'Edit Tour', 'admin-coach-tours' ),
			'update_item'           => __( 'Update Tour', 'admin-coach-tours' ),
			'view_item'             => __( 'View Tour', 'admin-coach-tours' ),
			'view_items'            => __( 'View Tours', 'admin-coach-tours' ),
			'search_items'          => __( 'Search Tour', 'admin-coach-tours' ),
			'not_found'             => __( 'Not found', 'admin-coach-tours' ),
			'not_found_in_trash'    => __( 'Not found in Trash', 'admin-coach-tours' ),
			'featured_image'        => __( 'Featured Image', 'admin-coach-tours' ),
			'set_featured_image'    => __( 'Set featured image', 'admin-coach-tours' ),
			'remove_featured_image' => __( 'Remove featured image', 'admin-coach-tours' ),
			'use_featured_image'    => __( 'Use as featured image', 'admin-coach-tours' ),
			'insert_into_item'      => __( 'Insert into tour', 'admin-coach-tours' ),
			'uploaded_to_this_item' => __( 'Uploaded to this tour', 'admin-coach-tours' ),
			'items_list'            => __( 'Tours list', 'admin-coach-tours' ),
			'items_list_navigation' => __( 'Tours list navigation', 'admin-coach-tours' ),
			'filter_items_list'     => __( 'Filter tours list', 'admin-coach-tours' ),
		];

		$args = [
			'label'               => __( 'Coach Tour', 'admin-coach-tours' ),
			'description'         => __( 'Interactive guided tours for WordPress admin', 'admin-coach-tours' ),
			'labels'              => $labels,
			'supports'            => [ 'title', 'editor', 'author', 'custom-fields' ],
			'hierarchical'        => false,
			'public'              => false,
			'show_ui'             => true,
			'show_in_menu'        => false, // Hidden in v0.3.0 - AI generates tours for pupils.
			'menu_position'       => 100,
			'menu_icon'           => 'dashicons-welcome-learn-more',
			'show_in_admin_bar'   => false,
			'show_in_nav_menus'   => false,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => false,
			'rewrite'             => false,
			'capability_type'     => 'post',
			'show_in_rest'        => true,
			'rest_base'           => 'act-tours',
			'rest_namespace'      => 'admin-coach-tours/v1',
		];

		register_post_type( self::POST_TYPE, $args );
	}

	/**
	 * Register post meta fields.
	 *
	 * @return void
	 */
	public static function register_meta(): void {
		// Steps JSON.
		register_post_meta(
			self::POST_TYPE,
			self::META_STEPS,
			[
				'type'              => 'string',
				'description'       => __( 'JSON array of tour steps', 'admin-coach-tours' ),
				'single'            => true,
				'sanitize_callback' => [ self::class, 'sanitize_steps_json' ],
				'auth_callback'     => [ self::class, 'auth_callback' ],
				'show_in_rest'      => [
					'schema' => [
						'type' => 'string',
					],
				],
			]
		);

		// Schema version.
		register_post_meta(
			self::POST_TYPE,
			self::META_SCHEMA_VERSION,
			[
				'type'              => 'integer',
				'description'       => __( 'Steps schema version', 'admin-coach-tours' ),
				'single'            => true,
				'default'           => self::SCHEMA_VERSION,
				'sanitize_callback' => 'absint',
				'auth_callback'     => [ self::class, 'auth_callback' ],
				'show_in_rest'      => true,
			]
		);

		// Editor scope (block, classic, site).
		register_post_meta(
			self::POST_TYPE,
			self::META_EDITOR,
			[
				'type'              => 'string',
				'description'       => __( 'Editor type this tour applies to', 'admin-coach-tours' ),
				'single'            => true,
				'default'           => 'block',
				'sanitize_callback' => [ self::class, 'sanitize_editor_scope' ],
				'auth_callback'     => [ self::class, 'auth_callback' ],
				'show_in_rest'      => true,
			]
		);

		// Post types scope.
		register_post_meta(
			self::POST_TYPE,
			self::META_POST_TYPES,
			[
				'type'              => 'array',
				'description'       => __( 'Post types this tour applies to', 'admin-coach-tours' ),
				'single'            => true,
				'default'           => [ 'post', 'page' ],
				'sanitize_callback' => [ self::class, 'sanitize_post_types' ],
				'auth_callback'     => [ self::class, 'auth_callback' ],
				'show_in_rest'      => [
					'schema' => [
						'type'  => 'array',
						'items' => [
							'type' => 'string',
						],
					],
				],
			]
		);

		// Steps modified timestamp (for triggering dirty state).
		register_post_meta(
			self::POST_TYPE,
			'_act_steps_modified',
			[
				'type'              => 'integer',
				'description'       => __( 'Timestamp when steps were last modified', 'admin-coach-tours' ),
				'single'            => true,
				'default'           => 0,
				'sanitize_callback' => 'absint',
				'auth_callback'     => [ self::class, 'auth_callback' ],
				'show_in_rest'      => true,
			]
		);
	}

	/**
	 * Authorization callback for meta fields.
	 *
	 * @param bool   $allowed   Whether the user is allowed.
	 * @param string $meta_key  The meta key.
	 * @param int    $object_id The object ID.
	 * @return bool
	 */
	public static function auth_callback( bool $allowed, string $meta_key, int $object_id ): bool {
		return current_user_can( 'edit_act_tours' );
	}

	/**
	 * Sanitize steps JSON.
	 *
	 * @param mixed $value The raw value.
	 * @return string Sanitized JSON string.
	 */
	public static function sanitize_steps_json( mixed $value ): string {
		if ( empty( $value ) ) {
			return '[]';
		}

		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				return '[]';
			}
			$value = $decoded;
		}

		if ( ! is_array( $value ) ) {
			return '[]';
		}

		// Sanitize each step.
		$sanitized = array_map( [ self::class, 'sanitize_step' ], $value );

		return wp_json_encode( array_values( $sanitized ) );
	}

	/**
	 * Sanitize a single step.
	 *
	 * @param array $step Raw step data.
	 * @return array Sanitized step.
	 */
	public static function sanitize_step( array $step ): array {
		return [
			'id'             => isset( $step['id'] ) ? sanitize_key( $step['id'] ) : wp_generate_uuid4(),
			'order'          => isset( $step['order'] ) ? absint( $step['order'] ) : 0,
			'title'          => isset( $step['title'] ) ? sanitize_text_field( $step['title'] ) : '',
			'instruction'    => isset( $step['instruction'] ) ? wp_kses_post( $step['instruction'] ) : '',
			'hint'           => isset( $step['hint'] ) ? sanitize_text_field( $step['hint'] ) : '',
			'target'         => self::sanitize_target( $step['target'] ?? [] ),
			'preconditions'  => self::sanitize_preconditions( $step['preconditions'] ?? [] ),
			'completion'     => self::sanitize_completion( $step['completion'] ?? [] ),
			'recovery'       => self::sanitize_recovery( $step['recovery'] ?? [] ),
			'tags'           => self::sanitize_tags( $step['tags'] ?? [] ),
			'version'        => isset( $step['version'] ) ? absint( $step['version'] ) : 1,
			'content'        => isset( $step['content'] ) ? sanitize_text_field( $step['content'] ) : '',
			'elementContext' => self::sanitize_element_context( $step['elementContext'] ?? [] ),
		];
	}

	/**
	 * Sanitize target locator bundle.
	 *
	 * @param array $target Raw target data.
	 * @return array Sanitized target.
	 */
	private static function sanitize_target( array $target ): array {
		$sanitized = [
			'locators'    => [],
			'constraints' => [],
		];

		if ( isset( $target['locators'] ) && is_array( $target['locators'] ) ) {
			foreach ( $target['locators'] as $locator ) {
				if ( ! is_array( $locator ) ) {
					continue;
				}
				$sanitized['locators'][] = [
					'type'     => isset( $locator['type'] ) ? sanitize_key( $locator['type'] ) : 'css',
					'value'    => isset( $locator['value'] ) ? sanitize_text_field( $locator['value'] ) : '',
					'weight'   => isset( $locator['weight'] ) ? absint( $locator['weight'] ) : 50,
					'fallback' => ! empty( $locator['fallback'] ),
				];
			}
		}

		if ( isset( $target['constraints'] ) && is_array( $target['constraints'] ) ) {
			$sanitized['constraints'] = [
				'visible'         => ! empty( $target['constraints']['visible'] ),
				'inEditorIframe'  => ! empty( $target['constraints']['inEditorIframe'] ),
				'withinContainer' => isset( $target['constraints']['withinContainer'] )
					? sanitize_text_field( $target['constraints']['withinContainer'] )
					: '',
				'index'           => isset( $target['constraints']['index'] )
					? absint( $target['constraints']['index'] )
					: null,
			];
		}

		return $sanitized;
	}

	/**
	 * Sanitize preconditions array.
	 *
	 * @param array $preconditions Raw preconditions.
	 * @return array Sanitized preconditions.
	 */
	private static function sanitize_preconditions( array $preconditions ): array {
		// Note: sanitize_key() lowercases, so these must be lowercase.
		$allowed_types = [
			'ensureeditor',
			'ensuresidebaropen',
			'ensuresidebarclosed',
			'selectsidebartab',
			'openinserter',
			'closeinserter',
			'insertblock',
		];

		// Map from lowercase to proper camelCase for output.
		$type_map = [
			'ensureeditor'        => 'ensureEditor',
			'ensuresidebaropen'   => 'ensureSidebarOpen',
			'ensuresidebarclosed' => 'ensureSidebarClosed',
			'selectsidebartab'    => 'selectSidebarTab',
			'openinserter'        => 'openInserter',
			'closeinserter'       => 'closeInserter',
			'insertblock'         => 'insertBlock',
		];

		$sanitized = [];

		foreach ( $preconditions as $condition ) {
			if ( ! is_array( $condition ) || ! isset( $condition['type'] ) ) {
				continue;
			}

			$type_lower = sanitize_key( $condition['type'] );
			if ( ! in_array( $type_lower, $allowed_types, true ) ) {
				continue;
			}

			// Use proper camelCase for the type.
			$type = $type_map[ $type_lower ];

			$sanitized_condition = [
				'type' => $type,
			];

			// Handle value (for backwards compatibility).
			if ( isset( $condition['value'] ) ) {
				$sanitized_condition['value'] = sanitize_text_field( $condition['value'] );
			}

			// Handle params object.
			if ( isset( $condition['params'] ) && is_array( $condition['params'] ) ) {
				$sanitized_condition['params'] = self::sanitize_precondition_params( $type, $condition['params'] );
			}

			$sanitized[] = $sanitized_condition;
		}

		return $sanitized;
	}

	/**
	 * Sanitize precondition params based on type.
	 *
	 * @param string $type   Precondition type.
	 * @param array  $params Raw params.
	 * @return array Sanitized params.
	 */
	private static function sanitize_precondition_params( string $type, array $params ): array {
		$sanitized = [];

		switch ( $type ) {
			case 'insertBlock':
				if ( isset( $params['blockName'] ) ) {
					$sanitized['blockName'] = sanitize_text_field( $params['blockName'] );
				}
				if ( isset( $params['markerId'] ) ) {
					$sanitized['markerId'] = sanitize_key( $params['markerId'] );
				}
				if ( isset( $params['attributes'] ) && is_array( $params['attributes'] ) ) {
					// Allow attributes through - they're block-specific.
					$sanitized['attributes'] = $params['attributes'];
				}
				break;

			case 'ensureSidebarOpen':
				if ( isset( $params['sidebar'] ) ) {
					$sanitized['sidebar'] = sanitize_text_field( $params['sidebar'] );
				}
				break;

			case 'selectSidebarTab':
				if ( isset( $params['tab'] ) ) {
					$sanitized['tab'] = sanitize_text_field( $params['tab'] );
				}
				break;

			default:
				// Pass through unknown params with basic sanitization.
				foreach ( $params as $key => $value ) {
					if ( is_string( $value ) ) {
						$sanitized[ sanitize_key( $key ) ] = sanitize_text_field( $value );
					}
				}
				break;
		}

		return $sanitized;
	}

	/**
	 * Sanitize completion rule.
	 *
	 * @param array $completion Raw completion data.
	 * @return array Sanitized completion.
	 */
	private static function sanitize_completion( array $completion ): array {
		$allowed_types = [
			'clickTarget',
			'domValueChanged',
			'wpData',
			'manual',
		];

		$type = isset( $completion['type'] ) ? sanitize_key( $completion['type'] ) : 'manual';
		if ( ! in_array( $type, $allowed_types, true ) ) {
			$type = 'manual';
		}

		return [
			'type'     => $type,
			'store'    => isset( $completion['store'] ) ? sanitize_text_field( $completion['store'] ) : '',
			'selector' => isset( $completion['selector'] ) ? sanitize_text_field( $completion['selector'] ) : '',
			'expected' => $completion['expected'] ?? null,
			'operator' => isset( $completion['operator'] ) ? sanitize_key( $completion['operator'] ) : 'equals',
		];
	}

	/**
	 * Sanitize recovery actions.
	 *
	 * @param array $recovery Raw recovery data.
	 * @return array Sanitized recovery.
	 */
	private static function sanitize_recovery( array $recovery ): array {
		$allowed_actions = [
			'reapplyPreconditions',
			'scrollIntoView',
			'waitAndRetry',
		];

		$sanitized = [];

		foreach ( $recovery as $action ) {
			if ( ! is_array( $action ) || ! isset( $action['action'] ) ) {
				continue;
			}

			$action_type = sanitize_key( $action['action'] );
			if ( ! in_array( $action_type, $allowed_actions, true ) ) {
				continue;
			}

			$sanitized[] = [
				'action'  => $action_type,
				'timeout' => isset( $action['timeout'] ) ? absint( $action['timeout'] ) : 1000,
			];
		}

		return $sanitized;
	}

	/**
	 * Sanitize tags array.
	 *
	 * @param array $tags Raw tags.
	 * @return array Sanitized tags.
	 */
	private static function sanitize_tags( array $tags ): array {
		return array_values(
			array_filter(
				array_map( 'sanitize_key', $tags )
			)
		);
	}

	/**
	 * Sanitize element context for debugging/display purposes.
	 *
	 * @param array $context Raw element context.
	 * @return array Sanitized element context.
	 */
	private static function sanitize_element_context( array $context ): array {
		if ( empty( $context ) ) {
			return [];
		}

		$sanitized = [];

		if ( isset( $context['tagName'] ) ) {
			$sanitized['tagName'] = sanitize_key( $context['tagName'] );
		}

		if ( isset( $context['role'] ) ) {
			$sanitized['role'] = sanitize_text_field( $context['role'] );
		}

		if ( isset( $context['classNames'] ) && is_array( $context['classNames'] ) ) {
			$sanitized['classNames'] = array_values(
				array_map( 'sanitize_html_class', $context['classNames'] )
			);
		}

		if ( isset( $context['label'] ) ) {
			$sanitized['label'] = sanitize_text_field( $context['label'] );
		}

		if ( isset( $context['textContent'] ) ) {
			$sanitized['textContent'] = sanitize_text_field( $context['textContent'] );
		}

		if ( isset( $context['dataAttrs'] ) && is_array( $context['dataAttrs'] ) ) {
			$sanitized['dataAttrs'] = array_map( 'sanitize_text_field', $context['dataAttrs'] );
		}

		if ( isset( $context['ancestors'] ) && is_array( $context['ancestors'] ) ) {
			$sanitized['ancestors'] = [];
			foreach ( $context['ancestors'] as $ancestor ) {
				if ( ! is_array( $ancestor ) ) {
					continue;
				}
				$sanitized_ancestor = [];
				if ( isset( $ancestor['tagName'] ) ) {
					$sanitized_ancestor['tagName'] = sanitize_key( $ancestor['tagName'] );
				}
				if ( isset( $ancestor['classNames'] ) && is_array( $ancestor['classNames'] ) ) {
					$sanitized_ancestor['classNames'] = array_values(
						array_map( 'sanitize_html_class', $ancestor['classNames'] )
					);
				}
				$sanitized['ancestors'][] = $sanitized_ancestor;
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitize editor scope.
	 *
	 * @param mixed $value Raw value.
	 * @return string Sanitized editor scope.
	 */
	public static function sanitize_editor_scope( mixed $value ): string {
		$allowed = [ 'block', 'classic', 'site' ];
		$value   = sanitize_key( $value );

		return in_array( $value, $allowed, true ) ? $value : 'block';
	}

	/**
	 * Sanitize post types array.
	 *
	 * @param mixed $value Raw value.
	 * @return array Sanitized post types.
	 */
	public static function sanitize_post_types( mixed $value ): array {
		if ( ! is_array( $value ) ) {
			return [ 'post', 'page' ];
		}

		return array_values(
			array_filter(
				array_map( 'sanitize_key', $value ),
				function ( $type ) {
					return post_type_exists( $type ) || in_array( $type, [ 'post', 'page' ], true );
				}
			)
		);
	}
}
