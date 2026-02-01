<?php
/**
 * OpenAI Provider.
 *
 * AI provider implementation for OpenAI.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare(strict_types=1);

namespace AdminCoachTours\AI;

use AdminCoachTours\Security\Encryption;

/**
 * OpenAI Provider class.
 */
class OpenAiProvider implements AiProviderInterface {

	/**
	 * Provider ID.
	 *
	 * @var string
	 */
	private const ID = 'openai';

	/**
	 * API endpoint.
	 *
	 * @var string
	 */
	private const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

	/**
	 * Encryption helper.
	 *
	 * @var Encryption
	 */
	private Encryption $encryption;

	/**
	 * Constructor.
	 *
	 * @param Encryption $encryption Encryption helper.
	 */
	public function __construct( Encryption $encryption ) {
		$this->encryption = $encryption;
	}

	/**
	 * Get the provider identifier.
	 *
	 * @return string Provider ID.
	 */
	public function get_id(): string {
		return self::ID;
	}

	/**
	 * Get the provider display name.
	 *
	 * @return string Provider name.
	 */
	public function get_name(): string {
		return __( 'OpenAI', 'admin-coach-tours' );
	}

	/**
	 * Check if the provider is configured and ready to use.
	 *
	 * @return bool True if configured.
	 */
	public function is_configured(): bool {
		$api_key = $this->get_api_key();
		return ! empty( $api_key );
	}

	/**
	 * Get the API key.
	 *
	 * @return string|null API key or null.
	 */
	private function get_api_key(): ?string {
		$encrypted_key = get_option( 'act_ai_' . self::ID . '_api_key', '' );

		if ( empty( $encrypted_key ) ) {
			return null;
		}

		$decrypted = $this->encryption->decrypt( $encrypted_key );

		return $decrypted ?: null;
	}

	/**
	 * Get the model to use.
	 *
	 * @return string Model name.
	 */
	private function get_model(): string {
		$model = get_option( 'act_ai_' . self::ID . '_model', '' );
		return ! empty( $model ) ? $model : 'gpt-4o-mini';
	}

	/**
	 * Generate a step draft using AI.
	 *
	 * @param array $element_context Context about the target element.
	 * @param array $tour_context    Context about the tour.
	 * @return array|\WP_Error Generated draft or error.
	 */
	public function generate_step_draft( array $element_context, array $tour_context ): array|\WP_Error {
		$api_key = $this->get_api_key();

		if ( ! $api_key ) {
			return new \WP_Error(
				'not_configured',
				__( 'OpenAI API key is not configured.', 'admin-coach-tours' )
			);
		}

		$system_prompt = $this->build_system_prompt();
		$user_prompt   = $this->build_user_prompt( $element_context, $tour_context );

		$response = wp_remote_post(
			self::API_ENDPOINT,
			[
				'timeout' => 30,
				'headers' => [
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'application/json',
				],
				'body'    => wp_json_encode(
					[
						'model'           => $this->get_model(),
						'messages'        => [
							[
								'role'    => 'system',
								'content' => $system_prompt,
							],
							[
								'role'    => 'user',
								'content' => $user_prompt,
							],
						],
						'response_format' => [ 'type' => 'json_object' ],
						'max_tokens'      => 500,
						'temperature'     => 0.7,
					]
				),
			]
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );

		if ( 200 !== $code ) {
			$error_data = json_decode( $body, true );
			return new \WP_Error(
				'api_error',
				$error_data[ 'error' ][ 'message' ] ?? __( 'API request failed.', 'admin-coach-tours' ),
				[ 'status' => $code ]
			);
		}

		$data = json_decode( $body, true );

		if ( ! isset( $data[ 'choices' ][ 0 ][ 'message' ][ 'content' ] ) ) {
			return new \WP_Error(
				'invalid_response',
				__( 'Invalid response from OpenAI.', 'admin-coach-tours' )
			);
		}

		$content = json_decode( $data[ 'choices' ][ 0 ][ 'message' ][ 'content' ], true );

		if ( ! $content ) {
			return new \WP_Error(
				'parse_error',
				__( 'Could not parse AI response.', 'admin-coach-tours' )
			);
		}

		return $this->validate_and_sanitize_draft( $content );
	}

	/**
	 * Suggest a completion condition based on element context.
	 *
	 * @param array $element_context Context about the target element.
	 * @return array|\WP_Error Suggested completion or error.
	 */
	public function suggest_completion( array $element_context ): array|\WP_Error {
		// Use heuristics instead of AI for this simple case.
		$tag  = $element_context[ 'tagName' ] ?? '';
		$role = $element_context[ 'role' ] ?? '';

		// Button or link - suggest click.
		if ( in_array( $tag, [ 'button', 'a' ], true ) || 'button' === $role || 'link' === $role ) {
			return [
				'type'   => 'clickTarget',
				'params' => [],
			];
		}

		// Input fields - suggest value change.
		if ( in_array( $tag, [ 'input', 'textarea', 'select' ], true ) || 'textbox' === $role ) {
			return [
				'type'   => 'domValueChanged',
				'params' => [],
			];
		}

		// Checkbox - suggest click.
		if ( 'checkbox' === $role || ( 'input' === $tag && 'checkbox' === ( $element_context[ 'type' ] ?? '' ) ) ) {
			return [
				'type'   => 'clickTarget',
				'params' => [],
			];
		}

		// Default to manual.
		return [
			'type'   => 'manual',
			'params' => [],
		];
	}

	/**
	 * Get provider settings schema.
	 *
	 * @return array Settings schema.
	 */
	public function get_settings_schema(): array {
		return [
			'api_key' => [
				'type'        => 'secret',
				'label'       => __( 'API Key', 'admin-coach-tours' ),
				'description' => __( 'Your OpenAI API key.', 'admin-coach-tours' ),
				'required'    => true,
			],
			'model'   => [
				'type'        => 'select',
				'label'       => __( 'Model', 'admin-coach-tours' ),
				'description' => __( 'The OpenAI model to use.', 'admin-coach-tours' ),
				'options'     => [ 'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo' ],
				'default'     => 'gpt-4o-mini',
			],
		];
	}

	/**
	 * Validate provider settings.
	 *
	 * @param array $settings Settings to validate.
	 * @return bool|\WP_Error True if valid, error otherwise.
	 */
	public function validate_settings( array $settings ): bool|\WP_Error {
		if ( empty( $settings[ 'api_key' ] ) ) {
			return new \WP_Error(
				'missing_api_key',
				__( 'API key is required.', 'admin-coach-tours' )
			);
		}

		// Basic format check.
		if ( ! str_starts_with( $settings[ 'api_key' ], 'sk-' ) ) {
			return new \WP_Error(
				'invalid_api_key',
				__( 'Invalid API key format.', 'admin-coach-tours' )
			);
		}

		return true;
	}

	/**
	 * Build the system prompt.
	 *
	 * @return string System prompt.
	 */
	private function build_system_prompt(): string {
		return <<<'PROMPT'
You are an expert WordPress admin UI instructor. Your task is to generate clear, helpful step content for a guided tour of the WordPress admin interface.

Given information about a UI element, generate:
1. A concise title (5-10 words) describing the action
2. Helpful content (1-3 sentences) explaining what to do and why
3. A suggested completion condition type

Respond ONLY with valid JSON in this exact format:
{
  "title": "Click the Publish button",
  "content": "The Publish button makes your content live...",
  "suggestedCompletion": {
    "type": "clickTarget",
    "params": {}
  }
}

Completion types available:
- clickTarget: User must click the highlighted element
- domValueChanged: User must change a form field value
- manual: User clicks continue button
- wpData: Watch for WordPress data store changes

Be friendly but concise. Focus on the action and its purpose.
PROMPT;
	}

	/**
	 * Build the user prompt.
	 *
	 * @param array $element_context Element context.
	 * @param array $tour_context    Tour context.
	 * @return string User prompt.
	 */
	private function build_user_prompt( array $element_context, array $tour_context ): string {
		$parts = [ 'Generate step content for this UI element:' ];

		$parts[] = 'Element: ' . wp_json_encode( $element_context );

		if ( ! empty( $tour_context ) ) {
			$parts[] = 'Tour context: ' . wp_json_encode( $tour_context );
		}

		return implode( "\n\n", $parts );
	}

	/**
	 * Validate and sanitize the AI draft.
	 *
	 * @param array $content Raw content from AI.
	 * @return array Sanitized draft.
	 */
	private function validate_and_sanitize_draft( array $content ): array {
		$draft = [
			'title'   => sanitize_text_field( $content[ 'title' ] ?? '' ),
			'content' => wp_kses_post( $content[ 'content' ] ?? '' ),
		];

		if ( isset( $content[ 'suggestedCompletion' ] ) && is_array( $content[ 'suggestedCompletion' ] ) ) {
			$completion    = $content[ 'suggestedCompletion' ];
			$allowed_types = [ 'clickTarget', 'domValueChanged', 'manual', 'wpData' ];

			if ( in_array( $completion[ 'type' ] ?? '', $allowed_types, true ) ) {
				$draft[ 'suggestedCompletion' ] = [
					'type'   => $completion[ 'type' ],
					'params' => is_array( $completion[ 'params' ] ?? null ) ? $completion[ 'params' ] : [],
				];
			}
		}

		return $draft;
	}

	/**
	 * Generate a complete tour using AI.
	 *
	 * @since 0.3.0
	 * @param string $system_prompt The system prompt with task instructions.
	 * @param string $user_message  Optional user message for freeform queries.
	 * @return array|\WP_Error Generated tour with title and steps, or error.
	 */
	public function generate_tour( string $system_prompt, string $user_message = '' ): array|\WP_Error {
		$api_key = $this->get_api_key();

		if ( ! $api_key ) {
			return new \WP_Error(
				'not_configured',
				__( 'OpenAI API key is not configured.', 'admin-coach-tours' )
			);
		}

		$messages = [
			[
				'role'    => 'system',
				'content' => $system_prompt,
			],
		];

		// Add user message for freeform queries.
		if ( ! empty( $user_message ) ) {
			$messages[] = [
				'role'    => 'user',
				'content' => $user_message,
			];
		} else {
			// For predefined tasks, just request the tour.
			$messages[] = [
				'role'    => 'user',
				'content' => 'Generate the tour now. Return only valid JSON.',
			];
		}

		$response = wp_remote_post(
			self::API_ENDPOINT,
			[
				'timeout' => 60,
				// Longer timeout for tour generation.
				'headers' => [
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'application/json',
				],
				'body'    => wp_json_encode(
					[
						'model'           => $this->get_model(),
						'messages'        => $messages,
						'response_format' => [ 'type' => 'json_object' ],
						'max_tokens'      => 4000,
						'temperature'     => 0.7,
					]
				),
			]
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );

		if ( 200 !== $code ) {
			$error_data = json_decode( $body, true );
			return new \WP_Error(
				'api_error',
				$error_data[ 'error' ][ 'message' ] ?? __( 'API request failed.', 'admin-coach-tours' ),
				[ 'status' => $code ]
			);
		}

		$data = json_decode( $body, true );

		if ( ! isset( $data[ 'choices' ][ 0 ][ 'message' ][ 'content' ] ) ) {
			return new \WP_Error(
				'invalid_response',
				__( 'Invalid response from OpenAI.', 'admin-coach-tours' )
			);
		}

		$raw_content = $data[ 'choices' ][ 0 ][ 'message' ][ 'content' ];

		// Log the raw AI response for debugging.
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( '[ACT AI Response] Raw content from OpenAI: ' . $raw_content );

		$content = json_decode( $raw_content, true );

		if ( ! $content ) {
			return new \WP_Error(
				'parse_error',
				__( 'Could not parse AI response.', 'admin-coach-tours' )
			);
		}

		// Log the parsed tour structure.
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log, WordPress.PHP.DevelopmentFunctions.error_log_print_r
		error_log( '[ACT AI Response] Parsed tour: ' . print_r( $content, true ) );

		// Check for scope error from freeform queries.
		if ( isset( $content[ 'error' ] ) && 'scope' === $content[ 'error' ] ) {
			return new \WP_Error(
				'out_of_scope',
				$content[ 'message' ] ?? __( 'This question is outside the scope of the editor assistant.', 'admin-coach-tours' )
			);
		}

		return $this->validate_and_sanitize_tour( $content );
	}

	/**
	 * Validate and sanitize a generated tour.
	 *
	 * @since 0.3.0
	 * @param array $content Raw tour content from AI.
	 * @return array|\WP_Error Sanitized tour or error.
	 */
	private function validate_and_sanitize_tour( array $content ): array|\WP_Error {
		if ( ! isset( $content[ 'title' ] ) || ! isset( $content[ 'steps' ] ) || ! is_array( $content[ 'steps' ] ) ) {
			return new \WP_Error(
				'invalid_tour_format',
				__( 'AI response did not contain a valid tour structure.', 'admin-coach-tours' )
			);
		}

		if ( empty( $content[ 'steps' ] ) ) {
			return new \WP_Error(
				'empty_tour',
				__( 'AI generated a tour with no steps.', 'admin-coach-tours' )
			);
		}

		$tour = [
			'title' => sanitize_text_field( $content[ 'title' ] ),
			'steps' => [],
		];

		$allowed_completion_types = [
			'clickTarget',
			'domValueChanged',
			'manual',
			'wpData',
			'elementAppear',
			'elementDisappear',
			'customEvent',
		];

		$allowed_precondition_types = [
			'ensureEditor',
			'ensureSidebarOpen',
			'ensureSidebarClosed',
			'selectSidebarTab',
			'openInserter',
			'closeInserter',
			'selectBlock',
			'focusElement',
			'scrollIntoView',
			'openModal',
			'closeModal',
			'insertBlock',
		];

		$allowed_locator_types = [
			'css',
			'role',
			'testId',
			'dataAttribute',
			'ariaLabel',
			'contextual',
			'wpBlock',
		];

		foreach ( $content[ 'steps' ] as $index => $step ) {
			$sanitized_step = [
				'id'            => sanitize_key( $step[ 'id' ] ?? 'step-' . $index ),
				'order'         => (int) ( $step[ 'order' ] ?? $index ),
				'title'         => sanitize_text_field( $step[ 'title' ] ?? '' ),
				'content'       => wp_kses_post( $step[ 'content' ] ?? '' ),
				'target'        => [
					'locators'    => [],
					'constraints' => [
						'visible' => true,
					],
				],
				'preconditions' => [],
				'completion'    => [
					'type' => 'manual',
				],
			];

			// Process locators.
			if ( isset( $step[ 'target' ][ 'locators' ] ) && is_array( $step[ 'target' ][ 'locators' ] ) ) {
				foreach ( $step[ 'target' ][ 'locators' ] as $locator ) {
					if ( ! isset( $locator[ 'type' ] ) || ! isset( $locator[ 'value' ] ) ) {
						continue;
					}

					if ( ! in_array( $locator[ 'type' ], $allowed_locator_types, true ) ) {
						continue;
					}

					$sanitized_step[ 'target' ][ 'locators' ][] = [
						'type'     => $locator[ 'type' ],
						'value'    => sanitize_text_field( $locator[ 'value' ] ),
						'weight'   => (int) ( $locator[ 'weight' ] ?? 50 ),
						'fallback' => (bool) ( $locator[ 'fallback' ] ?? false ),
					];
				}
			}

			// Process constraints.
			if ( isset( $step[ 'target' ][ 'constraints' ] ) && is_array( $step[ 'target' ][ 'constraints' ] ) ) {
				$constraints                             = $step[ 'target' ][ 'constraints' ];
				$sanitized_step[ 'target' ][ 'constraints' ] = [
					'visible'        => (bool) ( $constraints[ 'visible' ] ?? true ),
					'inEditorIframe' => (bool) ( $constraints[ 'inEditorIframe' ] ?? false ),
				];
			}

			// Process preconditions.
			if ( isset( $step[ 'preconditions' ] ) && is_array( $step[ 'preconditions' ] ) ) {
				foreach ( $step[ 'preconditions' ] as $precondition ) {
					if ( ! isset( $precondition[ 'type' ] ) ) {
						continue;
					}

					if ( ! in_array( $precondition[ 'type' ], $allowed_precondition_types, true ) ) {
						continue;
					}

					$sanitized_precondition = [
						'type' => $precondition[ 'type' ],
					];

					if ( isset( $precondition[ 'params' ] ) && is_array( $precondition[ 'params' ] ) ) {
						$sanitized_precondition[ 'params' ] = array_map( 'sanitize_text_field', $precondition[ 'params' ] );
					}

					$sanitized_step[ 'preconditions' ][] = $sanitized_precondition;
				}
			}

			// Process completion.
			if ( isset( $step[ 'completion' ] ) && is_array( $step[ 'completion' ] ) ) {
				$completion_type = $step[ 'completion' ][ 'type' ] ?? 'manual';

				if ( in_array( $completion_type, $allowed_completion_types, true ) ) {
					$sanitized_step[ 'completion' ] = [
						'type' => $completion_type,
					];

					if ( isset( $step[ 'completion' ][ 'params' ] ) && is_array( $step[ 'completion' ][ 'params' ] ) ) {
						$sanitized_step[ 'completion' ][ 'params' ] = array_map(
							'sanitize_text_field',
							$step[ 'completion' ][ 'params' ]
						);
					}
				}
			}

			$tour[ 'steps' ][] = $sanitized_step;
		}

		return $tour;
	}
}
