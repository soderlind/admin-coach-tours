<?php
/**
 * AI Controller.
 *
 * Handles AI-related REST API endpoints.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare(strict_types=1);

namespace AdminCoachTours\Rest;

use AdminCoachTours\AI\AiManager;
use AdminCoachTours\AI\TaskPrompts;
use AdminCoachTours\AI\GutenbergKnowledgeBase;

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
				$status     = $error_data[ 'status' ] ?? 500;
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
			$status[ 'activeProvider' ] = [
				'id'   => $active_provider->get_id(),
				'name' => $active_provider->get_name(),
			];
		}

		foreach ( $ai_manager->get_providers() as $provider ) {
			$status[ 'providers' ][] = [
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
			$max_ancestors          = min( 3, count( $context[ 'ancestors' ] ) );

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

	/**
	 * Sanitize editor context from frontend.
	 *
	 * @since 0.3.0
	 * @param array $context Raw editor context.
	 * @return array Sanitized context.
	 */
	private static function sanitize_editor_context( array $context ): array {
		$sanitized = [];

		// Editor blocks with DOM info.
		if ( isset( $context[ 'editorBlocks' ] ) && is_array( $context[ 'editorBlocks' ] ) ) {
			$sanitized[ 'editorBlocks' ] = [];
			foreach ( array_slice( $context[ 'editorBlocks' ], 0, 20 ) as $block ) {
				$block_data = [
					'name'       => isset( $block[ 'name' ] ) ? sanitize_key( $block[ 'name' ] ) : '',
					'isEmpty'    => isset( $block[ 'isEmpty' ] ) ? (bool) $block[ 'isEmpty' ] : false,
					'isSelected' => isset( $block[ 'isSelected' ] ) ? (bool) $block[ 'isSelected' ] : false,
					'order'      => isset( $block[ 'order' ] ) ? absint( $block[ 'order' ] ) : 0,
					'clientId'   => isset( $block[ 'clientId' ] ) ? sanitize_text_field( $block[ 'clientId' ] ) : '',
				];

				// Include DOM info if available.
				if ( isset( $block[ 'domInfo' ] ) && is_array( $block[ 'domInfo' ] ) ) {
					$block_data[ 'domInfo' ] = [
						'tagName'          => isset( $block[ 'domInfo' ][ 'tagName' ] ) ? sanitize_key( $block[ 'domInfo' ][ 'tagName' ] ) : '',
						'dataType'         => isset( $block[ 'domInfo' ][ 'dataType' ] ) ? sanitize_text_field( $block[ 'domInfo' ][ 'dataType' ] ) : '',
						'dataBlock'        => isset( $block[ 'domInfo' ][ 'dataBlock' ] ) ? sanitize_text_field( $block[ 'domInfo' ][ 'dataBlock' ] ) : '',
						'hasRichText'      => isset( $block[ 'domInfo' ][ 'hasRichText' ] ) ? (bool) $block[ 'domInfo' ][ 'hasRichText' ] : false,
						'editableSelector' => isset( $block[ 'domInfo' ][ 'editableSelector' ] ) ? sanitize_text_field( $block[ 'domInfo' ][ 'editableSelector' ] ) : null,
					];
				}

				$sanitized[ 'editorBlocks' ][] = $block_data;
			}
		}

		// Visible elements.
		if ( isset( $context[ 'visibleElements' ] ) && is_array( $context[ 'visibleElements' ] ) ) {
			$ve                           = $context[ 'visibleElements' ];
			$sanitized[ 'visibleElements' ] = [
				'inserterOpen'      => isset( $ve[ 'inserterOpen' ] ) ? (bool) $ve[ 'inserterOpen' ] : false,
				'sidebarOpen'       => isset( $ve[ 'sidebarOpen' ] ) ? (bool) $ve[ 'sidebarOpen' ] : false,
				'sidebarTab'        => isset( $ve[ 'sidebarTab' ] ) ? sanitize_key( $ve[ 'sidebarTab' ] ) : null,
				'hasSelectedBlock'  => isset( $ve[ 'hasSelectedBlock' ] ) ? (bool) $ve[ 'hasSelectedBlock' ] : false,
				'selectedBlockType' => isset( $ve[ 'selectedBlockType' ] ) ? sanitize_key( $ve[ 'selectedBlockType' ] ) : null,
			];
		}

		// UI samples.
		if ( isset( $context[ 'uiSamples' ] ) && is_array( $context[ 'uiSamples' ] ) ) {
			$samples                = $context[ 'uiSamples' ];
			$sanitized[ 'uiSamples' ] = [];

			foreach ( [ 'inserterButton', 'publishButton', 'settingsButton', 'searchInput' ] as $key ) {
				if ( isset( $samples[ $key ] ) && is_array( $samples[ $key ] ) ) {
					$sanitized[ 'uiSamples' ][ $key ] = [
						'selector' => isset( $samples[ $key ][ 'selector' ] ) ? sanitize_text_field( $samples[ $key ][ 'selector' ] ) : null,
						'visible'  => isset( $samples[ $key ][ 'visible' ] ) ? (bool) $samples[ $key ][ 'visible' ] : false,
					];
				}
			}

			// Handle emptyBlockPlaceholder separately (has additional inIframe property).
			if ( isset( $samples[ 'emptyBlockPlaceholder' ] ) && is_array( $samples[ 'emptyBlockPlaceholder' ] ) ) {
				$sanitized[ 'uiSamples' ][ 'emptyBlockPlaceholder' ] = [
					'selector' => isset( $samples[ 'emptyBlockPlaceholder' ][ 'selector' ] ) ? sanitize_text_field( $samples[ 'emptyBlockPlaceholder' ][ 'selector' ] ) : null,
					'visible'  => isset( $samples[ 'emptyBlockPlaceholder' ][ 'visible' ] ) ? (bool) $samples[ 'emptyBlockPlaceholder' ][ 'visible' ] : false,
					'inIframe' => isset( $samples[ 'emptyBlockPlaceholder' ][ 'inIframe' ] ) ? (bool) $samples[ 'emptyBlockPlaceholder' ][ 'inIframe' ] : false,
				];
			}
		}

		return $sanitized;
	}

	/**
	 * Format editor context for AI prompt.
	 *
	 * @since 0.3.0
	 * @param array $context Sanitized editor context.
	 * @return string Formatted context for prompt.
	 */
	private static function format_editor_context_for_prompt( array $context ): string {
		$lines = [ 'CURRENT EDITOR STATE:' ];

		// Check for empty block placeholder first - it's a priority starting point.
		$has_empty_placeholder = ! empty( $context[ 'uiSamples' ][ 'emptyBlockPlaceholder' ][ 'visible' ] );

		if ( $has_empty_placeholder ) {
			$lines[] = '⭐ STARTING POINT AVAILABLE: Empty block placeholder is visible!';
			$lines[] = '   Users can click it and type "/" to add blocks - teach this workflow!';
		}

		// Blocks in editor with targeting options.
		if ( ! empty( $context[ 'editorBlocks' ] ) ) {
			$lines[] = '';
			$lines[] = 'BLOCKS IN EDITOR (with targeting options):';

			foreach ( $context[ 'editorBlocks' ] as $block ) {
				$status = [];
				if ( $block[ 'isEmpty' ] ) {
					$status[] = 'empty';
				}
				if ( $block[ 'isSelected' ] ) {
					$status[] = 'SELECTED';
				}
				$status_str = empty( $status ) ? '' : ' (' . implode( ', ', $status ) . ')';
				$lines[]    = "- #{$block[ 'order' ]}: {$block[ 'name' ]}{$status_str}";

				// Show targeting options.
				$targets = [];
				if ( $block[ 'isSelected' ] ) {
					$targets[] = 'wpBlock: "selected" (recommended - currently selected)';
				}
				if ( ! empty( $block[ 'clientId' ] ) ) {
					$targets[] = "wpBlock: \"clientId:{$block[ 'clientId' ]}\"";
				}
				if ( ! empty( $block[ 'domInfo' ][ 'editableSelector' ] ) ) {
					$targets[] = "css: \"{$block[ 'domInfo' ][ 'editableSelector' ]}\" (in iframe)";
				}
				if ( ! empty( $block[ 'domInfo' ][ 'dataType' ] ) ) {
					$targets[] = "css: \"[data-type=\\\"{$block[ 'domInfo' ][ 'dataType' ]}\\\"]\" (in iframe)";
				}

				if ( ! empty( $targets ) ) {
					$lines[] = '  Targeting options:';
					foreach ( $targets as $target ) {
						$lines[] = "    • {$target}";
					}
				}
			}
		} else {
			$lines[] = 'Blocks in editor: (empty editor or new post)';
		}

		// UI state.
		if ( ! empty( $context[ 'visibleElements' ] ) ) {
			$ve      = $context[ 'visibleElements' ];
			$state   = [];
			$state[] = $ve[ 'inserterOpen' ] ? 'Inserter panel is OPEN' : 'Inserter panel is closed';
			$state[] = $ve[ 'sidebarOpen' ] ? 'Settings sidebar is OPEN' : 'Settings sidebar is closed';

			if ( $ve[ 'hasSelectedBlock' ] && $ve[ 'selectedBlockType' ] ) {
				$state[] = 'Selected block: ' . $ve[ 'selectedBlockType' ];
			}
			$lines[] = '';
			$lines[] = 'UI State: ' . implode( '. ', $state );
		}

		// Verified selectors from page.
		if ( ! empty( $context[ 'uiSamples' ] ) ) {
			$lines[]          = '';
			$lines[]          = 'VERIFIED SELECTORS (confirmed working on this page):';
			$verified_samples = $context[ 'uiSamples' ];

			if ( ! empty( $verified_samples[ 'inserterButton' ][ 'selector' ] ) && $verified_samples[ 'inserterButton' ][ 'visible' ] ) {
				$lines[] = '- Inserter button: ' . $verified_samples[ 'inserterButton' ][ 'selector' ];
			}
			if ( ! empty( $verified_samples[ 'publishButton' ][ 'selector' ] ) && $verified_samples[ 'publishButton' ][ 'visible' ] ) {
				$lines[] = '- Publish/Save button: ' . $verified_samples[ 'publishButton' ][ 'selector' ];
			}
			if ( ! empty( $verified_samples[ 'settingsButton' ][ 'selector' ] ) && $verified_samples[ 'settingsButton' ][ 'visible' ] ) {
				$lines[] = '- Settings button: ' . $verified_samples[ 'settingsButton' ][ 'selector' ];
			}
			if ( ! empty( $verified_samples[ 'searchInput' ][ 'selector' ] ) && $verified_samples[ 'searchInput' ][ 'visible' ] ) {
				$lines[] = '- Search input: ' . $verified_samples[ 'searchInput' ][ 'selector' ];
			}
			if ( ! empty( $verified_samples[ 'emptyBlockPlaceholder' ][ 'selector' ] ) && $verified_samples[ 'emptyBlockPlaceholder' ][ 'visible' ] ) {
				$in_iframe = ! empty( $verified_samples[ 'emptyBlockPlaceholder' ][ 'inIframe' ] ) ? ' (in editor iframe)' : '';
				$lines[]   = '- Empty block placeholder: ' . $verified_samples[ 'emptyBlockPlaceholder' ][ 'selector' ] . $in_iframe;
			}
		}

		return implode( "\n", $lines );
	}

	/**
	 * Sanitize failure context from frontend.
	 *
	 * @since 0.3.6
	 * @param array $context Raw failure context.
	 * @return array Sanitized context.
	 */
	private static function sanitize_failure_context( array $context ): array {
		$sanitized = [
			'stepIndex' => isset( $context[ 'stepIndex' ] ) ? absint( $context[ 'stepIndex' ] ) : 0,
			'stepId'    => isset( $context[ 'stepId' ] ) ? sanitize_text_field( $context[ 'stepId' ] ) : '',
			'stepTitle' => isset( $context[ 'stepTitle' ] ) ? sanitize_text_field( $context[ 'stepTitle' ] ) : '',
			'error'     => isset( $context[ 'error' ] ) ? sanitize_text_field( $context[ 'error' ] ) : '',
			'reason'    => isset( $context[ 'reason' ] ) ? sanitize_text_field( $context[ 'reason' ] ) : '',
		];

		// Sanitize locators array.
		if ( isset( $context[ 'targetLocators' ] ) && is_array( $context[ 'targetLocators' ] ) ) {
			$sanitized[ 'targetLocators' ] = [];
			foreach ( array_slice( $context[ 'targetLocators' ], 0, 5 ) as $locator ) {
				$sanitized[ 'targetLocators' ][] = [
					'type'   => isset( $locator[ 'type' ] ) ? sanitize_key( $locator[ 'type' ] ) : '',
					'value'  => isset( $locator[ 'value' ] ) ? sanitize_text_field( $locator[ 'value' ] ) : '',
					'weight' => isset( $locator[ 'weight' ] ) ? absint( $locator[ 'weight' ] ) : 0,
				];
			}
		}

		return $sanitized;
	}

	/**
	 * Format failure context for AI prompt.
	 *
	 * This helps the AI learn from previous failures and generate better selectors.
	 *
	 * @since 0.3.6
	 * @param array $context Sanitized failure context.
	 * @return string Formatted context for prompt.
	 */
	private static function format_failure_context_for_prompt( array $context ): string {
		$lines = [
			'',
			'⚠️ PREVIOUS ATTEMPT FAILED - PLEASE FIX:',
			'',
			'The previous tour generation failed at step ' . ( $context[ 'stepIndex' ] + 1 ) . '.',
		];

		if ( ! empty( $context[ 'stepTitle' ] ) ) {
			$lines[] = 'Step title: "' . $context[ 'stepTitle' ] . '"';
		}

		if ( ! empty( $context[ 'error' ] ) ) {
			$lines[] = 'Error: ' . $context[ 'error' ];
		}

		if ( ! empty( $context[ 'targetLocators' ] ) ) {
			$lines[] = '';
			$lines[] = 'The following selectors DID NOT WORK:';
			foreach ( $context[ 'targetLocators' ] as $locator ) {
				$lines[] = '  ❌ ' . $locator[ 'type' ] . ': "' . $locator[ 'value' ] . '"';
			}
		}

		$lines[] = '';
		$lines[] = 'REQUIREMENTS FOR THIS RETRY:';
		$lines[] = '1. Use DIFFERENT selectors than the ones that failed';
		$lines[] = '2. Prefer more general, reliable selectors (aria-label, data-type attributes)';
		$lines[] = '3. Consider if the step order is correct - maybe a precondition is missing';
		$lines[] = '4. Double-check inEditorIframe constraint - is the element really in/out of the iframe?';
		$lines[] = '';

		return implode( "\n", $lines );
	}

	/**
	 * Get available AI tasks for pupils.
	 *
	 * @since 0.3.0
	 * @return \WP_REST_Response
	 */
	public static function get_tasks() {
		$ai_manager = AiManager::get_instance();

		// Check if AI is available.
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
	 * Generate a cache key for tour requests.
	 *
	 * @since 0.3.0
	 * @param string $task_id        Task ID.
	 * @param string $query          Freeform query.
	 * @param string $post_type      Post type.
	 * @param array  $editor_context Editor context.
	 * @return string Cache key.
	 */
	private static function generate_cache_key( string $task_id, string $query, string $post_type, array $editor_context ): string {
		// Build cache key from relevant context.
		// Include version to invalidate cache when prompts change.
		$key_data = [
			'version'   => '2', // Increment when prompt instructions change.
			'task'      => $task_id,
			'query'     => $query,
			'post_type' => $post_type,
		];

		// Include key editor state that affects tour generation.
		if ( ! empty( $editor_context[ 'editorBlocks' ] ) ) {
			// Just include block names and empty status, not client IDs.
			$key_data[ 'blocks' ] = array_map(
				function ( $b ) {
					return $b[ 'name' ] . ( $b[ 'isEmpty' ] ? ':empty' : '' );
				},
				$editor_context[ 'editorBlocks' ]
			);
		}

		if ( ! empty( $editor_context[ 'visibleElements' ] ) ) {
			$key_data[ 'ui' ] = [
				'inserterOpen' => $editor_context[ 'visibleElements' ][ 'inserterOpen' ] ?? false,
				'sidebarOpen'  => $editor_context[ 'visibleElements' ][ 'sidebarOpen' ] ?? false,
			];
		}

		// Check if empty placeholder is visible (important for workflow choice).
		if ( ! empty( $editor_context[ 'uiSamples' ][ 'emptyBlockPlaceholder' ][ 'visible' ] ) ) {
			$key_data[ 'hasPlaceholder' ] = true;
		}

		// Generate hash.
		$key_string = wp_json_encode( $key_data );
		$hash       = md5( $key_string );

		return 'act_tour_' . $hash;
	}

	/**
	 * Get cached tour if available.
	 *
	 * @since 0.3.0
	 * @param string $cache_key Cache key.
	 * @return array|false Cached tour or false.
	 */
	private static function get_cached_tour( string $cache_key ) {
		$cached = get_transient( $cache_key );

		if ( false !== $cached && is_array( $cached ) ) {
			return $cached;
		}

		return false;
	}

	/**
	 * Cache a generated tour.
	 *
	 * @since 0.3.0
	 * @param string $cache_key Cache key.
	 * @param array  $tour      Tour data.
	 * @return void
	 */
	private static function cache_tour( string $cache_key, array $tour ): void {
		// Cache for 24 hours.
		$expiration = apply_filters( 'admin_coach_tours_cache_expiration', DAY_IN_SECONDS );
		set_transient( $cache_key, $tour, $expiration );
	}

	/**
	 * Generate an AI tour from task or freeform query.
	 *
	 * @since 0.3.0
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function generate_tour( \WP_REST_Request $request ) {
		$ai_manager = AiManager::get_instance();

		if ( ! $ai_manager->is_available() ) {
			return new \WP_Error(
				'ai_not_available',
				__( 'AI is not configured or enabled.', 'admin-coach-tours' ),
				[ 'status' => 503 ]
			);
		}

		$task_id   = sanitize_key( $request->get_param( 'taskId' ) ?? '' );
		$query     = sanitize_text_field( $request->get_param( 'query' ) ?? '' );
		$post_type = sanitize_key( $request->get_param( 'postType' ) ?? 'post' );

		// Get and sanitize editor context.
		$raw_editor_context = $request->get_param( 'editorContext' );
		$editor_context     = [];
		if ( is_array( $raw_editor_context ) ) {
			$editor_context = self::sanitize_editor_context( $raw_editor_context );
		}

		// Get and sanitize failure context (for retry with learning).
		$raw_failure_context = $request->get_param( 'failureContext' );
		$failure_context     = null;
		if ( is_array( $raw_failure_context ) ) {
			$failure_context = self::sanitize_failure_context( $raw_failure_context );
		}

		// Require either a task or a query.
		if ( empty( $task_id ) && empty( $query ) ) {
			return new \WP_Error(
				'missing_input',
				__( 'Please provide a task or question.', 'admin-coach-tours' ),
				[ 'status' => 400 ]
			);
		}

		// Don't use cache when retrying with failure context.
		if ( empty( $failure_context ) ) {
			// Check cache first.
			$cache_key   = self::generate_cache_key( $task_id, $query, $post_type, $editor_context );
			$cached_tour = self::get_cached_tour( $cache_key );

			if ( false !== $cached_tour ) {
				// Return cached tour.
				return rest_ensure_response(
					[
						'tour'      => $cached_tour,
						'ephemeral' => true,
						'cached'    => true,
					]
				);
			}
		}

		// Get relevant Gutenberg context based on task/query.
		$task         = ! empty( $task_id ) ? TaskPrompts::get_task( $task_id ) : null;
		$search_query = $task ? ( $task[ 'description' ] ?? $task_id ) : $query;

		$context_data      = GutenbergKnowledgeBase::get_relevant_context( $search_query, 5 );
		$gutenberg_context = GutenbergKnowledgeBase::format_context_for_prompt( $context_data );

		// Format editor context for prompt.
		$editor_context_prompt = '';
		if ( ! empty( $editor_context ) ) {
			$editor_context_prompt = self::format_editor_context_for_prompt( $editor_context );
		}

		// Format failure context for prompt (contextual retry).
		$failure_context_prompt = '';
		if ( ! empty( $failure_context ) ) {
			$failure_context_prompt = self::format_failure_context_for_prompt( $failure_context );
		}

		// Build the system prompt with editor context and failure context.
		$system_prompt = TaskPrompts::get_system_prompt(
			$task_id,
			$query,
			$gutenberg_context,
			$post_type,
			$editor_context_prompt,
			$failure_context_prompt
		);

		// Generate the tour.
		$provider = $ai_manager->get_active_provider();

		if ( ! $provider ) {
			return new \WP_Error(
				'no_provider',
				__( 'No AI provider is available.', 'admin-coach-tours' ),
				[ 'status' => 503 ]
			);
		}

		$result = $provider->generate_tour( $system_prompt, $query );

		if ( is_wp_error( $result ) ) {
			$status = 500;

			if ( 'not_configured' === $result->get_error_code() ) {
				$status = 503;
			} elseif ( 'api_error' === $result->get_error_code() ) {
				$error_data = $result->get_error_data();
				$status     = $error_data[ 'status' ] ?? 500;
			} elseif ( 'out_of_scope' === $result->get_error_code() ) {
				$status = 422;
			}

			return new \WP_Error(
				$result->get_error_code(),
				$result->get_error_message(),
				[ 'status' => $status ]
			);
		}

		// Cache the successful result (but not for retries which bypass cache).
		if ( isset( $cache_key ) ) {
			self::cache_tour( $cache_key, $result );
		}

		// Return the ephemeral tour (not persisted).
		return rest_ensure_response(
			[
				'tour'      => $result,
				'ephemeral' => true,
				'cached'    => false,
			]
		);
	}
}
