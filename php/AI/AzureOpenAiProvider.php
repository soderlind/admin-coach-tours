<?php
/**
 * Azure OpenAI Provider.
 *
 * AI provider implementation for Azure OpenAI Service.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare( strict_types=1 );

namespace AdminCoachTours\AI;

use AdminCoachTours\Security\Encryption;

/**
 * Azure OpenAI Provider class.
 */
class AzureOpenAiProvider implements AiProviderInterface {

	/**
	 * Provider ID.
	 *
	 * @var string
	 */
	private const ID = 'azure_openai';

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
		return __( 'Azure OpenAI', 'admin-coach-tours' );
	}

	/**
	 * Check if the provider is configured and ready to use.
	 *
	 * @return bool True if configured.
	 */
	public function is_configured(): bool {
		$api_key  = $this->get_api_key();
		$endpoint = $this->get_endpoint();
		return ! empty( $api_key ) && ! empty( $endpoint );
	}

	/**
	 * Get the API key.
	 *
	 * @return string|null API key or null.
	 */
	private function get_api_key(): ?string {
		$settings      = get_option( 'act_ai_settings', [] );
		$encrypted_key = $settings['providers'][ self::ID ]['api_key'] ?? '';

		if ( empty( $encrypted_key ) ) {
			return null;
		}

		$decrypted = $this->encryption->decrypt( $encrypted_key );

		return $decrypted ?: null;
	}

	/**
	 * Get the Azure endpoint URL.
	 *
	 * @return string|null Endpoint URL or null.
	 */
	private function get_endpoint(): ?string {
		$settings = get_option( 'act_ai_settings', [] );
		return $settings['providers'][ self::ID ]['endpoint'] ?? null;
	}

	/**
	 * Get the deployment name.
	 *
	 * @return string Deployment name.
	 */
	private function get_deployment(): string {
		$settings = get_option( 'act_ai_settings', [] );
		return $settings['providers'][ self::ID ]['deployment'] ?? 'gpt-4o-mini';
	}

	/**
	 * Get the API version.
	 *
	 * @return string API version.
	 */
	private function get_api_version(): string {
		$settings = get_option( 'act_ai_settings', [] );
		return $settings['providers'][ self::ID ]['api_version'] ?? '2024-08-01-preview';
	}

	/**
	 * Build the API URL.
	 *
	 * @return string Full API URL.
	 */
	private function build_api_url(): string {
		$endpoint   = rtrim( $this->get_endpoint() ?? '', '/' );
		$deployment = $this->get_deployment();
		$version    = $this->get_api_version();

		return sprintf(
			'%s/openai/deployments/%s/chat/completions?api-version=%s',
			$endpoint,
			rawurlencode( $deployment ),
			rawurlencode( $version )
		);
	}

	/**
	 * Generate a step draft using AI.
	 *
	 * @param array $element_context Context about the target element.
	 * @param array $tour_context    Context about the tour.
	 * @return array|\WP_Error Generated draft or error.
	 */
	public function generate_step_draft( array $element_context, array $tour_context ): array|\WP_Error {
		$api_key  = $this->get_api_key();
		$endpoint = $this->get_endpoint();

		if ( ! $api_key || ! $endpoint ) {
			return new \WP_Error(
				'not_configured',
				__( 'Azure OpenAI is not fully configured. Please set both the API key and endpoint.', 'admin-coach-tours' )
			);
		}

		$system_prompt = $this->build_system_prompt();
		$user_prompt   = $this->build_user_prompt( $element_context, $tour_context );

		$response = wp_remote_post(
			$this->build_api_url(),
			[
				'timeout' => 30,
				'headers' => [
					'api-key'      => $api_key,
					'Content-Type' => 'application/json',
				],
				'body'    => wp_json_encode(
					[
						'messages' => [
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
				$error_data['error']['message'] ?? __( 'API request failed.', 'admin-coach-tours' ),
				[ 'status' => $code ]
			);
		}

		$data = json_decode( $body, true );

		if ( ! isset( $data['choices'][0]['message']['content'] ) ) {
			return new \WP_Error(
				'invalid_response',
				__( 'Invalid response from Azure OpenAI.', 'admin-coach-tours' )
			);
		}

		$content = json_decode( $data['choices'][0]['message']['content'], true );

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
		$tag  = $element_context['tagName'] ?? '';
		$role = $element_context['role'] ?? '';

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
		if ( 'checkbox' === $role || ( 'input' === $tag && 'checkbox' === ( $element_context['type'] ?? '' ) ) ) {
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
			'endpoint'    => [
				'type'        => 'text',
				'label'       => __( 'Endpoint URL', 'admin-coach-tours' ),
				'description' => __( 'Your Azure OpenAI resource endpoint (e.g., https://your-resource.openai.azure.com).', 'admin-coach-tours' ),
				'required'    => true,
			],
			'api_key'     => [
				'type'        => 'secret',
				'label'       => __( 'API Key', 'admin-coach-tours' ),
				'description' => __( 'Your Azure OpenAI API key.', 'admin-coach-tours' ),
				'required'    => true,
				'sensitive'   => true,
			],
			'deployment'  => [
				'type'        => 'text',
				'label'       => __( 'Deployment Name', 'admin-coach-tours' ),
				'description' => __( 'The name of your model deployment in Azure.', 'admin-coach-tours' ),
				'default'     => 'gpt-4o-mini',
			],
			'api_version' => [
				'type'        => 'text',
				'label'       => __( 'API Version', 'admin-coach-tours' ),
				'description' => __( 'The Azure OpenAI API version to use (e.g., 2024-08-01-preview).', 'admin-coach-tours' ),
				'default'     => '2024-08-01-preview',
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
		if ( empty( $settings['api_key'] ) ) {
			return new \WP_Error(
				'missing_api_key',
				__( 'API key is required.', 'admin-coach-tours' )
			);
		}

		if ( empty( $settings['endpoint'] ) ) {
			return new \WP_Error(
				'missing_endpoint',
				__( 'Endpoint URL is required.', 'admin-coach-tours' )
			);
		}

		// Validate endpoint URL format.
		if ( ! filter_var( $settings['endpoint'], FILTER_VALIDATE_URL ) ) {
			return new \WP_Error(
				'invalid_endpoint',
				__( 'Endpoint must be a valid URL.', 'admin-coach-tours' )
			);
		}

		// Ensure endpoint uses HTTPS.
		if ( ! str_starts_with( $settings['endpoint'], 'https://' ) ) {
			return new \WP_Error(
				'insecure_endpoint',
				__( 'Endpoint must use HTTPS.', 'admin-coach-tours' )
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
		return <<<PROMPT
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
			'title'   => sanitize_text_field( $content['title'] ?? '' ),
			'content' => wp_kses_post( $content['content'] ?? '' ),
		];

		if ( isset( $content['suggestedCompletion'] ) && is_array( $content['suggestedCompletion'] ) ) {
			$completion    = $content['suggestedCompletion'];
			$allowed_types = [ 'clickTarget', 'domValueChanged', 'manual', 'wpData' ];

			if ( in_array( $completion['type'] ?? '', $allowed_types, true ) ) {
				$draft['suggestedCompletion'] = [
					'type'   => $completion['type'],
					'params' => is_array( $completion['params'] ?? null ) ? $completion['params'] : [],
				];
			}
		}

		return $draft;
	}
}
