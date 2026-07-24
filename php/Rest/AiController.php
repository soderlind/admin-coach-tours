<?php
/**
 * AI Controller.
 *
 * Thin HTTP adapter over the AI modules. Parses REST requests, delegates to
 * AiManager (drafts) and TourGenerator (tours), and maps results to HTTP.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare(strict_types=1);

namespace AdminCoachTours\Rest;

use AdminCoachTours\AI\AiManager;
use AdminCoachTours\AI\TaskPrompts;
use AdminCoachTours\AI\TourGenerator;
use AdminCoachTours\AI\TourRequest;

/**
 * AI Controller class.
 */
class AiController {

	/**
	 * Generate a step draft using AI.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function generate_draft( \WP_REST_Request $request ) {
		$ai_manager = AiManager::get_instance();

		if ( ! $ai_manager->is_available() ) {
			return new \WP_Error(
				'ai_not_available',
				__( 'AI is not configured or enabled.', 'admin-coach-tours' ),
				[ 'status' => 503 ]
			);
		}

		$element_context = $request->get_param( 'elementContext' );
		$tour_context    = $request->get_param( 'tourContext' ) ?? [];

		// Validate element context.
		if ( empty( $element_context ) || ! is_array( $element_context ) ) {
			return new \WP_Error(
				'invalid_context',
				__( 'Element context is required.', 'admin-coach-tours' ),
				[ 'status' => 400 ]
			);
		}

		// Sanitize element context.
		$sanitized_context = self::sanitize_element_context( $element_context );

		// Generate draft.
		$result = $ai_manager->generate_step_draft( $sanitized_context, $tour_context );

		if ( is_wp_error( $result ) ) {
			return self::map_error( $result );
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Get AI status.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_status() {
		$ai_manager = AiManager::get_instance();

		$connectors      = $ai_manager->get_configured_connectors();
		$active_provider = $ai_manager->resolve_provider_id();

		$status = [
			'available'      => $ai_manager->is_available(),
			'activeProvider' => '' !== $active_provider
				? [
					'id'   => $active_provider,
					'name' => $connectors[ $active_provider ] ?? $active_provider,
				]
				: null,
			'providers'      => [],
		];

		foreach ( $connectors as $id => $label ) {
			$status[ 'providers' ][] = [
				'id'         => $id,
				'name'       => $label,
				'configured' => true,
			];
		}

		return rest_ensure_response( $status );
	}

	/**
	 * Get available AI tasks for pupils.
	 *
	 * @since 0.3.0
	 * @return \WP_REST_Response
	 */
	public static function get_tasks() {
		$ai_manager = AiManager::get_instance();

		$available = $ai_manager->is_available();

		$response = [
			'available' => $available,
			'tasks'     => [],
		];

		if ( $available ) {
			$response[ 'tasks' ] = TaskPrompts::get_tasks();
		}

		return rest_ensure_response( $response );
	}

	/**
	 * Generate an AI tour from task or freeform query.
	 *
	 * @since 0.3.0
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function generate_tour( \WP_REST_Request $request ) {
		$generator = new TourGenerator( AiManager::get_instance() );
		$result    = $generator->generate( TourRequest::from_rest( $request ) );

		if ( is_wp_error( $result ) ) {
			return self::map_error( $result );
		}

		return rest_ensure_response(
			[
				'tour'      => $result[ 'tour' ],
				'ephemeral' => true,
				'cached'    => $result[ 'cached' ],
			]
		);
	}

	/**
	 * Map a generation WP_Error to an HTTP-status-bearing WP_Error.
	 *
	 * @param \WP_Error $error The error from the AI layer.
	 * @return \WP_Error
	 */
	private static function map_error( \WP_Error $error ): \WP_Error {
		$code   = $error->get_error_code();
		$status = 500;

		switch ( $code ) {
			case 'ai_not_available':
			case 'not_configured':
				$status = 503;
				break;
			case 'missing_input':
				$status = 400;
				break;
			case 'out_of_scope':
				$status = 422;
				break;
			case 'api_error':
				$data   = $error->get_error_data();
				$status = is_array( $data ) ? ( $data[ 'status' ] ?? 500 ) : 500;
				break;
			default:
				$data   = $error->get_error_data();
				$status = is_array( $data ) && isset( $data[ 'status' ] ) ? (int) $data[ 'status' ] : 500;
				break;
		}

		return new \WP_Error( $code, $error->get_error_message(), [ 'status' => $status ] );
	}

	/**
	 * Sanitize element context (single-element draft requests).
	 *
	 * @param array $context Raw context.
	 * @return array Sanitized context.
	 */
	private static function sanitize_element_context( array $context ): array {
		$sanitized = [];

		// Tag name.
		if ( isset( $context[ 'tagName' ] ) ) {
			$sanitized[ 'tagName' ] = sanitize_key( $context[ 'tagName' ] );
		}

		// Role.
		if ( isset( $context[ 'role' ] ) ) {
			$sanitized[ 'role' ] = sanitize_key( $context[ 'role' ] );
		}

		// ID.
		if ( isset( $context[ 'id' ] ) ) {
			$sanitized[ 'id' ] = sanitize_html_class( $context[ 'id' ] );
		}

		// Class names.
		if ( isset( $context[ 'classNames' ] ) && is_array( $context[ 'classNames' ] ) ) {
			$sanitized[ 'classNames' ] = array_map( 'sanitize_html_class', $context[ 'classNames' ] );
		}

		// Text content (limited length).
		if ( isset( $context[ 'textContent' ] ) ) {
			$sanitized[ 'textContent' ] = sanitize_text_field(
				substr( $context[ 'textContent' ], 0, 200 )
			);
		}

		// Label.
		if ( isset( $context[ 'label' ] ) ) {
			$sanitized[ 'label' ] = sanitize_text_field( $context[ 'label' ] );
		}

		// Placeholder.
		if ( isset( $context[ 'placeholder' ] ) ) {
			$sanitized[ 'placeholder' ] = sanitize_text_field( $context[ 'placeholder' ] );
		}

		// Data attributes.
		if ( isset( $context[ 'dataAttrs' ] ) && is_array( $context[ 'dataAttrs' ] ) ) {
			$sanitized[ 'dataAttrs' ] = [];
			foreach ( $context[ 'dataAttrs' ] as $key => $value ) {
				$sanitized[ 'dataAttrs' ][ sanitize_key( $key ) ] = sanitize_text_field( $value );
			}
		}

		// Ancestors (limited depth).
		if ( isset( $context[ 'ancestors' ] ) && is_array( $context[ 'ancestors' ] ) ) {
			$sanitized[ 'ancestors' ] = [];
			$max_ancestors            = min( 3, count( $context[ 'ancestors' ] ) );

			for ( $i = 0; $i < $max_ancestors; $i++ ) {
				$ancestor           = $context[ 'ancestors' ][ $i ];
				$sanitized_ancestor = [];

				if ( isset( $ancestor[ 'tagName' ] ) ) {
					$sanitized_ancestor[ 'tagName' ] = sanitize_key( $ancestor[ 'tagName' ] );
				}

				if ( isset( $ancestor[ 'role' ] ) ) {
					$sanitized_ancestor[ 'role' ] = sanitize_key( $ancestor[ 'role' ] );
				}

				if ( isset( $ancestor[ 'id' ] ) ) {
					$sanitized_ancestor[ 'id' ] = sanitize_html_class( $ancestor[ 'id' ] );
				}

				if ( isset( $ancestor[ 'classNames' ] ) && is_array( $ancestor[ 'classNames' ] ) ) {
					$sanitized_ancestor[ 'classNames' ] = array_map(
						'sanitize_html_class',
						array_slice( $ancestor[ 'classNames' ], 0, 3 )
					);
				}

				$sanitized[ 'ancestors' ][] = $sanitized_ancestor;
			}
		}

		return $sanitized;
	}
}
