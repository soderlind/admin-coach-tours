<?php
/**
 * Security capabilities management.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare(strict_types=1);

namespace AdminCoachTours\Security;

/**
 * Manages custom capabilities for the plugin.
 */
class Capabilities {

	/**
	 * Capability for editing tours.
	 */
	public const EDIT_TOURS = 'edit_act_tours';

	/**
	 * Capability for running tours.
	 */
	public const RUN_TOURS = 'run_act_tours';

	/**
	 * Capability for using AI features.
	 */
	public const USE_AI = 'use_act_ai';

	/**
	 * All custom capabilities.
	 *
	 * @var array<string, string>
	 */
	private const CAPABILITIES = [
		self::EDIT_TOURS => 'manage_options',
		self::RUN_TOURS  => 'read',
		self::USE_AI     => 'manage_options',
	];

	/**
	 * Post type capabilities mapping.
	 *
	 * @var array<string, string>
	 */
	private const POST_TYPE_CAPS = [
		'edit_post'              => 'edit_act_tour',
		'read_post'              => 'read_act_tour',
		'delete_post'            => 'delete_act_tour',
		'edit_posts'             => 'edit_act_tours',
		'edit_others_posts'      => 'edit_others_act_tours',
		'publish_posts'          => 'publish_act_tours',
		'read_private_posts'     => 'read_private_act_tours',
		'delete_posts'           => 'delete_act_tours',
		'delete_others_posts'    => 'delete_others_act_tours',
		'delete_published_posts' => 'delete_published_act_tours',
		'delete_private_posts'   => 'delete_private_act_tours',
		'edit_private_posts'     => 'edit_private_act_tours',
		'edit_published_posts'   => 'edit_published_act_tours',
		'create_posts'           => 'create_act_tours',
	];

	/**
	 * Initialize capabilities handling.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_filter( 'map_meta_cap', [ self::class, 'map_meta_caps' ], 10, 4 );
		add_filter( 'user_has_cap', [ self::class, 'grant_capabilities' ], 10, 4 );
	}

	/**
	 * Map meta capabilities for the custom post type.
	 *
	 * @param array  $caps    Primitive capabilities required.
	 * @param string $cap     Capability being checked.
	 * @param int    $user_id User ID.
	 * @param array  $args    Additional arguments.
	 * @return array Modified capabilities.
	 */
	public static function map_meta_caps( array $caps, string $cap, int $user_id, array $args ): array {
		// Handle post-type specific capabilities.
		if ( in_array( $cap, [ 'edit_act_tour', 'delete_act_tour', 'read_act_tour' ], true ) ) {
			$post = get_post( $args[ 0 ] ?? 0 );

			if ( ! $post ) {
				return [ 'do_not_allow' ];
			}

			$post_type = get_post_type_object( $post->post_type );
			if ( ! $post_type ) {
				return [ 'do_not_allow' ];
			}

			$caps = [];

			// Check ownership.
			$is_owner = (int) $post->post_author === $user_id;

			if ( $is_owner && 'edit_act_tour' === $cap ) {
				// Owner can edit their own.
				$caps[] = $post_type->cap->edit_posts;
			} elseif ( $is_owner && 'delete_act_tour' === $cap ) {
				// Owner can delete their own.
				$caps[] = $post_type->cap->delete_posts;
			} elseif ( $is_owner && 'read_act_tour' === $cap ) {
				// Owner can read their own.
				$caps[] = 'read';
			} elseif ( ! $is_owner && 'edit_act_tour' === $cap ) {
				// Non-owners need "others" capability.
				$caps[] = $post_type->cap->edit_others_posts;
			} elseif ( ! $is_owner && 'delete_act_tour' === $cap ) {
				$caps[] = $post_type->cap->delete_others_posts;
			} elseif ( ! $is_owner && 'read_act_tour' === $cap ) {
				$caps[] = $post_type->cap->read_private_posts;
			}
		}

		return $caps;
	}

	/**
	 * Dynamically grant our custom capabilities based on primitive capabilities.
	 *
	 * @param array   $allcaps All capabilities for the user.
	 * @param array   $caps    Capabilities being checked.
	 * @param array   $args    Additional arguments.
	 * @param WP_User $user    The user object.
	 * @return array Modified capabilities.
	 */
	public static function grant_capabilities( array $allcaps, array $caps, array $args, $user ): array {
		// Map our custom capabilities to WordPress primitive caps.
		foreach ( self::CAPABILITIES as $custom_cap => $required_cap ) {
			if ( ! empty( $allcaps[ $required_cap ] ) ) {
				$allcaps[ $custom_cap ] = true;
			}
		}

		// Grant post type caps to users with manage_options.
		if ( ! empty( $allcaps[ 'manage_options' ] ) ) {
			foreach ( self::POST_TYPE_CAPS as $primitive => $custom ) {
				$allcaps[ $custom ] = true;
			}
		}

		return $allcaps;
	}

	/**
	 * Check if current user can edit tours.
	 *
	 * @return bool
	 */
	public static function can_edit_tours(): bool {
		return current_user_can( self::EDIT_TOURS );
	}

	/**
	 * Check if current user can run tours.
	 *
	 * @return bool
	 */
	public static function can_run_tours(): bool {
		return current_user_can( self::RUN_TOURS );
	}

	/**
	 * Check if current user can use AI features.
	 *
	 * @return bool
	 */
	public static function can_use_ai(): bool {
		return current_user_can( self::USE_AI );
	}

	/**
	 * Verify nonce and capability for a REST request.
	 *
	 * @param \WP_REST_Request $request    The request object.
	 * @param string           $capability The capability to check.
	 * @param string           $nonce_action The nonce action. Default 'wp_rest'.
	 * @return true|\WP_Error True if valid, WP_Error otherwise.
	 */
	public static function verify_request(
		\WP_REST_Request $request,
		string $capability,
		string $nonce_action = 'wp_rest'
	): true|\WP_Error {
		// Check capability.
		if ( ! current_user_can( $capability ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to perform this action.', 'admin-coach-tours' ),
				[ 'status' => 403 ]
			);
		}

		// Verify nonce for non-GET requests.
		if ( 'GET' !== $request->get_method() ) {
			$nonce = $request->get_header( 'X-WP-Nonce' );
			if ( ! $nonce || ! wp_verify_nonce( $nonce, $nonce_action ) ) {
				return new \WP_Error(
					'rest_cookie_invalid_nonce',
					__( 'Cookie nonce is invalid.', 'admin-coach-tours' ),
					[ 'status' => 403 ]
				);
			}
		}

		return true;
	}
}
