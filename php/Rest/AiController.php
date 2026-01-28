<?php
/**
 * AI Controller.
 *
 * Handles AI-related REST API endpoints.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare( strict_types=1 );

namespace AdminCoachTours\Rest;

use AdminCoachTours\AI\AiManager;

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
			$status = 500;

			if ( 'not_configured' === $result->get_error_code() ) {
				$status = 503;
			} elseif ( 'api_error' === $result->get_error_code() ) {
				$error_data = $result->get_error_data();
				$status     = $error_data['status'] ?? 500;
			}

			return new \WP_Error(
				$result->get_error_code(),
				$result->get_error_message(),
				[ 'status' => $status ]
			);
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

		$status = [
			'available'      => $ai_manager->is_available(),
			'activeProvider' => null,
			'providers'      => [],
		];

		$active_provider = $ai_manager->get_active_provider();

		if ( $active_provider ) {
			$status['activeProvider'] = [
				'id'   => $active_provider->get_id(),
				'name' => $active_provider->get_name(),
			];
		}

		foreach ( $ai_manager->get_providers() as $provider ) {
			$status['providers'][] = [
				'id'         => $provider->get_id(),
				'name'       => $provider->get_name(),
				'configured' => $provider->is_configured(),
			];
		}

		return rest_ensure_response( $status );
	}

	/**
	 * Sanitize element context.
	 *
	 * @param array $context Raw context.
	 * @return array Sanitized context.
	 */
	private static function sanitize_element_context( array $context ): array {
		$sanitized = [];

		// Tag name.
		if ( isset( $context['tagName'] ) ) {
			$sanitized['tagName'] = sanitize_key( $context['tagName'] );
		}

		// Role.
		if ( isset( $context['role'] ) ) {
			$sanitized['role'] = sanitize_key( $context['role'] );
		}

		// ID.
		if ( isset( $context['id'] ) ) {
			$sanitized['id'] = sanitize_html_class( $context['id'] );
		}

		// Class names.
		if ( isset( $context['classNames'] ) && is_array( $context['classNames'] ) ) {
			$sanitized['classNames'] = array_map( 'sanitize_html_class', $context['classNames'] );
		}

		// Text content (limited length).
		if ( isset( $context['textContent'] ) ) {
			$sanitized['textContent'] = sanitize_text_field(
				substr( $context['textContent'], 0, 200 )
			);
		}

		// Label.
		if ( isset( $context['label'] ) ) {
			$sanitized['label'] = sanitize_text_field( $context['label'] );
		}

		// Placeholder.
		if ( isset( $context['placeholder'] ) ) {
			$sanitized['placeholder'] = sanitize_text_field( $context['placeholder'] );
		}

		// Data attributes.
		if ( isset( $context['dataAttrs'] ) && is_array( $context['dataAttrs'] ) ) {
			$sanitized['dataAttrs'] = [];
			foreach ( $context['dataAttrs'] as $key => $value ) {
				$sanitized['dataAttrs'][ sanitize_key( $key ) ] = sanitize_text_field( $value );
			}
		}

		// Ancestors (limited depth).
		if ( isset( $context['ancestors'] ) && is_array( $context['ancestors'] ) ) {
			$sanitized['ancestors'] = [];
			$max_ancestors = min( 3, count( $context['ancestors'] ) );

			for ( $i = 0; $i < $max_ancestors; $i++ ) {
				$ancestor = $context['ancestors'][ $i ];
				$sanitized_ancestor = [];

				if ( isset( $ancestor['tagName'] ) ) {
					$sanitized_ancestor['tagName'] = sanitize_key( $ancestor['tagName'] );
				}

				if ( isset( $ancestor['role'] ) ) {
					$sanitized_ancestor['role'] = sanitize_key( $ancestor['role'] );
				}

				if ( isset( $ancestor['id'] ) ) {
					$sanitized_ancestor['id'] = sanitize_html_class( $ancestor['id'] );
				}

				if ( isset( $ancestor['classNames'] ) && is_array( $ancestor['classNames'] ) ) {
					$sanitized_ancestor['classNames'] = array_map(
						'sanitize_html_class',
						array_slice( $ancestor['classNames'], 0, 3 )
					);
				}

				$sanitized['ancestors'][] = $sanitized_ancestor;
			}
		}

		return $sanitized;
	}
}
