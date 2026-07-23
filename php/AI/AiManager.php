<?php
/**
 * AI Manager.
 *
 * Thin orchestrator around the WordPress AI connector API
 * (wp_get_connectors / wp_ai_client_prompt). API keys and provider
 * configuration are owned by WordPress Core connectors, not this plugin.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare(strict_types=1);

namespace AdminCoachTours\AI;

/**
 * AI Manager class.
 */
class AiManager {

	/**
	 * Option: whether AI features are enabled.
	 *
	 * @var string
	 */
	private const OPTION_ENABLED = 'act_ai_enabled';

	/**
	 * Option: preferred connector (provider) ID. Empty = auto.
	 *
	 * @var string
	 */
	private const OPTION_PROVIDER = 'act_ai_provider';

	/**
	 * Option: preferred model ID override. Empty = provider default.
	 *
	 * @var string
	 */
	private const OPTION_MODEL = 'act_ai_model';

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
	private function __construct() {}

	/**
	 * Check if AI features are enabled and a connector is configured.
	 *
	 * @return bool True if AI is available.
	 */
	public function is_available(): bool {
		if ( ! (bool) get_option( self::OPTION_ENABLED, false ) ) {
			return false;
		}

		return $this->is_connector_configured();
	}

	/**
	 * Check whether at least one usable AI provider connector exists.
	 *
	 * @return bool True if a configured connector is available.
	 */
	public function is_connector_configured(): bool {
		/**
		 * Short-circuit connector detection.
		 *
		 * @since 0.5.0
		 * @param bool|null $configured Return a boolean to override detection, or null to let the plugin decide.
		 */
		$filtered = apply_filters( 'admin_coach_tours_ai_connector_configured', null );
		if ( is_bool( $filtered ) ) {
			return $filtered;
		}

		return count( $this->get_configured_provider_ids() ) > 0;
	}

	/**
	 * Get the IDs of all configured AI provider connectors.
	 *
	 * @return array<int, string> List of connector IDs.
	 */
	public function get_configured_provider_ids(): array {
		if ( function_exists( 'wp_supports_ai' ) && ! wp_supports_ai() ) {
			return [];
		}

		if ( ! function_exists( 'wp_get_connectors' ) ) {
			return [];
		}

		try {
			$connectors = wp_get_connectors();
		} catch ( \Throwable $e ) {
			return [];
		}

		$provider_ids = [];

		foreach ( (array) $connectors as $connector_id => $connector ) {
			if ( ! is_array( $connector ) ) {
				continue;
			}

			if ( ( $connector[ 'type' ] ?? '' ) !== 'ai_provider' ) {
				continue;
			}

			$auth = $connector[ 'authentication' ] ?? [];
			if ( ! is_array( $auth ) ) {
				continue;
			}

			$method = $auth[ 'method' ] ?? '';

			if ( 'none' === $method ) {
				$provider_ids[] = (string) $connector_id;
				continue;
			}

			if ( 'api_key' !== $method ) {
				continue;
			}

			$setting_name = (string) ( $auth[ 'setting_name' ] ?? '' );
			if ( '' === $setting_name ) {
				continue;
			}

			$env_var_name  = (string) ( $auth[ 'env_var_name' ] ?? '' );
			$constant_name = (string) ( $auth[ 'constant_name' ] ?? '' );

			if ( function_exists( '_wp_connectors_get_api_key_source' ) ) {
				$source = _wp_connectors_get_api_key_source( $setting_name, $env_var_name, $constant_name );
				if ( 'none' !== $source ) {
					$provider_ids[] = (string) $connector_id;
				}
			}
		}

		return array_values(
			array_unique(
				array_filter( $provider_ids, static fn( string $id ): bool => '' !== $id )
			)
		);
	}

	/**
	 * Get configured connectors as an id => label map (for the settings UI).
	 *
	 * @return array<string, string> Map of connector ID to human-readable label.
	 */
	public function get_configured_connectors(): array {
		$ids = $this->get_configured_provider_ids();

		if ( empty( $ids ) || ! function_exists( 'wp_get_connectors' ) ) {
			return [];
		}

		try {
			$connectors = wp_get_connectors();
		} catch ( \Throwable $e ) {
			return [];
		}

		$map = [];

		foreach ( $ids as $id ) {
			$connector = $connectors[ $id ] ?? null;
			$label     = $id;

			if ( is_array( $connector ) ) {
				$label = (string) ( $connector[ 'label' ] ?? $connector[ 'name' ] ?? $id );
			}

			$map[ $id ] = '' !== $label ? $label : $id;
		}

		return $map;
	}

	/**
	 * Resolve the provider (connector) ID to use for generation.
	 *
	 * @return string Connector ID, or empty string for automatic selection.
	 */
	public function resolve_provider_id(): string {
		/**
		 * Filter the AI provider (connector) ID.
		 *
		 * @since 0.5.0
		 * @param string $provider_id Provider ID. Empty = use stored option / auto.
		 */
		$filtered = (string) apply_filters( 'admin_coach_tours_ai_provider_id', '' );
		if ( '' !== $filtered ) {
			return $filtered;
		}

		$ids    = $this->get_configured_provider_ids();
		$stored = (string) get_option( self::OPTION_PROVIDER, '' );

		if ( '' !== $stored && in_array( $stored, $ids, true ) ) {
			return $stored;
		}

		return $ids[ 0 ] ?? '';
	}

	/**
	 * Resolve the model ID override to use for generation.
	 *
	 * @return string Model ID, or empty string for the provider default.
	 */
	public function resolve_model(): string {
		/**
		 * Filter the AI model ID.
		 *
		 * @since 0.5.0
		 * @param string $model Model ID. Empty = provider default.
		 */
		$filtered = (string) apply_filters( 'admin_coach_tours_ai_model', '' );
		if ( '' !== $filtered ) {
			return $filtered;
		}

		return (string) get_option( self::OPTION_MODEL, '' );
	}

	/**
	 * Generate a step draft using AI.
	 *
	 * @param array $element_context Context about the target element.
	 * @param array $tour_context    Context about the tour (optional).
	 * @return array|\WP_Error Generated draft or error.
	 */
	public function generate_step_draft( array $element_context, array $tour_context = [] ): array|\WP_Error {
		if ( ! $this->is_available() ) {
			return new \WP_Error(
				'ai_not_available',
				__( 'AI is not configured or enabled.', 'admin-coach-tours' ),
				[ 'status' => 503 ]
			);
		}

		$system_prompt = $this->build_draft_system_prompt();
		$user_prompt   = $this->build_draft_user_prompt( $element_context, $tour_context );

		$text = $this->run_prompt( $system_prompt, $user_prompt, 0.7, 800 );

		if ( is_wp_error( $text ) ) {
			return $text;
		}

		$content = $this->decode_json( $text );

		if ( null === $content ) {
			return new \WP_Error(
				'parse_error',
				__( 'Could not parse AI response.', 'admin-coach-tours' )
			);
		}

		return $this->validate_and_sanitize_draft( $content );
	}

	/**
	 * Generate a complete tour using AI.
	 *
	 * @param string $system_prompt The system prompt with task instructions.
	 * @param string $user_message  Optional user message for freeform queries.
	 * @return array|\WP_Error Generated tour with title and steps, or error.
	 */
	public function generate_tour( string $system_prompt, string $user_message = '' ): array|\WP_Error {
		if ( ! $this->is_available() ) {
			return new \WP_Error(
				'ai_not_available',
				__( 'AI is not configured or enabled.', 'admin-coach-tours' ),
				[ 'status' => 503 ]
			);
		}

		$user = '' !== $user_message
			? $user_message
			: 'Generate the tour now. Return only valid JSON.';

		$text = $this->run_prompt( $system_prompt, $user, 0.7, 4000 );

		if ( is_wp_error( $text ) ) {
			return $text;
		}

		$content = $this->decode_json( $text );

		if ( null === $content ) {
			return new \WP_Error(
				'parse_error',
				__( 'Could not parse AI response.', 'admin-coach-tours' )
			);
		}

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
	 * Suggest a completion condition based on element context (heuristics, no AI call).
	 *
	 * @param array $element_context Context about the target element.
	 * @return array Suggested completion.
	 */
	public function suggest_completion( array $element_context ): array {
		$tag  = $element_context[ 'tagName' ] ?? '';
		$role = $element_context[ 'role' ] ?? '';

		// Checkbox - suggest click.
		if ( 'checkbox' === $role || ( 'input' === $tag && 'checkbox' === ( $element_context[ 'type' ] ?? '' ) ) ) {
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

		// Button or link - suggest click.
		if ( in_array( $tag, [ 'button', 'a' ], true ) || 'button' === $role || 'link' === $role ) {
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
	 * Run a prompt through the WordPress AI client and return the text output.
	 *
	 * @param string $system_prompt System instruction.
	 * @param string $user_message  User message / prompt.
	 * @param float  $temperature   Sampling temperature.
	 * @param int    $max_tokens    Maximum output tokens.
	 * @return string|\WP_Error Generated text or error.
	 */
	private function run_prompt( string $system_prompt, string $user_message, float $temperature, int $max_tokens ): string|\WP_Error {
		if ( ! function_exists( 'wp_ai_client_prompt' ) ) {
			return new \WP_Error(
				'ai_unavailable',
				__( 'The WordPress AI client is not available.', 'admin-coach-tours' ),
				[ 'status' => 503 ]
			);
		}

		try {
			$builder = wp_ai_client_prompt( $user_message );

			if ( method_exists( $builder, 'using_system_instruction' ) ) {
				$builder = $this->apply_builder( $builder, 'using_system_instruction', $system_prompt );
			} else {
				// No system-instruction support: fold it into the prompt.
				$builder = wp_ai_client_prompt( trim( $system_prompt . "\n\n" . $user_message ) );
			}

			$builder = $this->apply_builder( $builder, 'using_temperature', $temperature );
			$builder = $this->apply_builder( $builder, 'using_max_tokens', $max_tokens );

			$provider_id = $this->resolve_provider_id();
			if ( '' !== $provider_id ) {
				$builder = $this->apply_builder( $builder, 'using_provider', $provider_id );
			}

			$model = $this->resolve_model();
			if ( '' !== $model ) {
				$builder = $this->apply_builder( $builder, 'using_model', $model );
			}

			$result = $builder->generate_text();
		} catch ( \Throwable $e ) {
			return new \WP_Error( 'api_error', $e->getMessage(), [ 'status' => 502 ] );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( is_string( $result ) && '' !== trim( $result ) ) {
			return $result;
		}

		if ( is_array( $result ) ) {
			$candidate = $result[ 'text' ] ?? $result[ 'content' ] ?? '';
			if ( is_string( $candidate ) && '' !== trim( $candidate ) ) {
				return $candidate;
			}
		}

		return new \WP_Error(
			'invalid_response',
			__( 'The AI client returned an empty response.', 'admin-coach-tours' ),
			[ 'status' => 502 ]
		);
	}

	/**
	 * Call a fluent builder method if it exists, returning the resulting builder.
	 *
	 * @param object $builder The prompt builder.
	 * @param string $method  Method name.
	 * @param mixed  $value   Argument.
	 * @return object The (possibly new) builder.
	 */
	private function apply_builder( object $builder, string $method, mixed $value ): object {
		if ( ! method_exists( $builder, $method ) ) {
			return $builder;
		}

		$result = $builder->{$method}( $value );

		return is_object( $result ) ? $result : $builder;
	}

	/**
	 * Decode a JSON string from an AI response, tolerating Markdown code fences.
	 *
	 * @param string $text Raw AI text.
	 * @return array|null Decoded array, or null on failure.
	 */
	private function decode_json( string $text ): ?array {
		$text = trim( $text );

		// Strip ```json ... ``` fences if present.
		if ( str_starts_with( $text, '```' ) ) {
			$text = (string) preg_replace( '/^```(?:json)?\s*/i', '', $text );
			$text = (string) preg_replace( '/\s*```$/', '', $text );
			$text = trim( $text );
		}

		$data = json_decode( $text, true );
		if ( is_array( $data ) ) {
			return $data;
		}

		// Fallback: extract the first {...} block.
		if ( preg_match( '/\{.*\}/s', $text, $matches ) ) {
			$data = json_decode( $matches[ 0 ], true );
			if ( is_array( $data ) ) {
				return $data;
			}
		}

		return null;
	}

	/**
	 * Build the system prompt for a single step draft.
	 *
	 * @return string System prompt.
	 */
	private function build_draft_system_prompt(): string {
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
	 * Build the user prompt for a single step draft.
	 *
	 * @param array $element_context Element context.
	 * @param array $tour_context    Tour context.
	 * @return string User prompt.
	 */
	private function build_draft_user_prompt( array $element_context, array $tour_context ): string {
		$parts = [ 'Generate step content for this UI element:' ];

		$parts[] = 'Element: ' . wp_json_encode( $element_context );

		if ( ! empty( $tour_context ) ) {
			$parts[] = 'Tour context: ' . wp_json_encode( $tour_context );
		}

		return implode( "\n\n", $parts );
	}

	/**
	 * Validate and sanitize a single step draft.
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
	 * Validate and sanitize a generated tour.
	 *
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
				$constraints                                 = $step[ 'target' ][ 'constraints' ];
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
