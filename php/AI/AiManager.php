<?php
/**
 * AI Manager.
 *
 * Manages AI providers and orchestrates AI operations.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare( strict_types=1 );

namespace AdminCoachTours\AI;

use AdminCoachTours\Security\Encryption;

/**
 * AI Manager class.
 */
class AiManager {

	/**
	 * Option name for AI settings.
	 *
	 * @var string
	 */
	private const OPTION_NAME = 'act_ai_settings';

	/**
	 * Registered providers.
	 *
	 * @var array<string, AiProviderInterface>
	 */
	private array $providers = [];

	/**
	 * Encryption helper.
	 *
	 * @var Encryption|null
	 */
	private ?Encryption $encryption = null;

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
		$this->encryption = new Encryption();
		$this->register_default_providers();
	}

	/**
	 * Register default AI providers.
	 */
	private function register_default_providers(): void {
		$this->register_provider( new OpenAiProvider( $this->encryption ) );
		$this->register_provider( new AnthropicProvider( $this->encryption ) );

		/**
		 * Filter to allow registering additional AI providers.
		 *
		 * @since 0.1.0
		 * @param AiManager $manager The AI manager instance.
		 */
		do_action( 'admin_coach_tours_register_ai_providers', $this );
	}

	/**
	 * Register an AI provider.
	 *
	 * @param AiProviderInterface $provider Provider instance.
	 */
	public function register_provider( AiProviderInterface $provider ): void {
		$this->providers[ $provider->get_id() ] = $provider;
	}

	/**
	 * Get all registered providers.
	 *
	 * @return array<string, AiProviderInterface>
	 */
	public function get_providers(): array {
		return $this->providers;
	}

	/**
	 * Get a specific provider.
	 *
	 * @param string $provider_id Provider ID.
	 * @return AiProviderInterface|null Provider or null.
	 */
	public function get_provider( string $provider_id ): ?AiProviderInterface {
		return $this->providers[ $provider_id ] ?? null;
	}

	/**
	 * Get the active provider.
	 *
	 * @return AiProviderInterface|null Active provider or null.
	 */
	public function get_active_provider(): ?AiProviderInterface {
		$settings   = $this->get_settings();
		$active_id  = $settings['active_provider'] ?? '';

		if ( $active_id && isset( $this->providers[ $active_id ] ) ) {
			$provider = $this->providers[ $active_id ];
			if ( $provider->is_configured() ) {
				return $provider;
			}
		}

		// Fall back to first configured provider.
		foreach ( $this->providers as $provider ) {
			if ( $provider->is_configured() ) {
				return $provider;
			}
		}

		return null;
	}

	/**
	 * Get AI settings.
	 *
	 * @return array Settings.
	 */
	public function get_settings(): array {
		$defaults = [
			'active_provider' => '',
			'enabled'         => false,
			'providers'       => [],
		];

		$settings = get_option( self::OPTION_NAME, [] );

		return wp_parse_args( $settings, $defaults );
	}

	/**
	 * Update AI settings.
	 *
	 * @param array $settings Settings to save.
	 * @return bool True on success.
	 */
	public function update_settings( array $settings ): bool {
		// Sanitize settings.
		$sanitized = [
			'active_provider' => sanitize_key( $settings['active_provider'] ?? '' ),
			'enabled'         => (bool) ( $settings['enabled'] ?? false ),
			'providers'       => [],
		];

		// Sanitize provider-specific settings.
		if ( isset( $settings['providers'] ) && is_array( $settings['providers'] ) ) {
			foreach ( $settings['providers'] as $provider_id => $provider_settings ) {
				$provider = $this->get_provider( $provider_id );
				if ( $provider ) {
					$schema = $provider->get_settings_schema();
					$sanitized['providers'][ $provider_id ] = $this->sanitize_provider_settings(
						$provider_settings,
						$schema
					);
				}
			}
		}

		return update_option( self::OPTION_NAME, $sanitized );
	}

	/**
	 * Sanitize provider settings based on schema.
	 *
	 * @param array $settings Provider settings.
	 * @param array $schema   Settings schema.
	 * @return array Sanitized settings.
	 */
	private function sanitize_provider_settings( array $settings, array $schema ): array {
		$sanitized = [];

		foreach ( $schema as $key => $config ) {
			if ( ! isset( $settings[ $key ] ) ) {
				if ( isset( $config['default'] ) ) {
					$sanitized[ $key ] = $config['default'];
				}
				continue;
			}

			$value = $settings[ $key ];
			$type  = $config['type'] ?? 'string';

			switch ( $type ) {
				case 'string':
					$sanitized[ $key ] = sanitize_text_field( $value );
					break;

				case 'secret':
					// Encrypt API keys.
					if ( ! empty( $value ) ) {
						$sanitized[ $key ] = $this->encryption->encrypt( $value );
					}
					break;

				case 'boolean':
					$sanitized[ $key ] = (bool) $value;
					break;

				case 'integer':
					$sanitized[ $key ] = (int) $value;
					break;

				case 'float':
					$sanitized[ $key ] = (float) $value;
					break;

				case 'select':
					if ( in_array( $value, $config['options'] ?? [], true ) ) {
						$sanitized[ $key ] = $value;
					} elseif ( isset( $config['default'] ) ) {
						$sanitized[ $key ] = $config['default'];
					}
					break;

				default:
					$sanitized[ $key ] = sanitize_text_field( $value );
			}
		}

		return $sanitized;
	}

	/**
	 * Check if AI is enabled and configured.
	 *
	 * @return bool True if AI is available.
	 */
	public function is_available(): bool {
		$settings = $this->get_settings();

		if ( ! ( $settings['enabled'] ?? false ) ) {
			return false;
		}

		return null !== $this->get_active_provider();
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
				__( 'AI is not configured or enabled.', 'admin-coach-tours' )
			);
		}

		$provider = $this->get_active_provider();

		if ( ! $provider ) {
			return new \WP_Error(
				'no_provider',
				__( 'No AI provider is configured.', 'admin-coach-tours' )
			);
		}

		return $provider->generate_step_draft( $element_context, $tour_context );
	}

	/**
	 * Suggest a completion condition.
	 *
	 * @param array $element_context Context about the target element.
	 * @return array|\WP_Error Suggested completion or error.
	 */
	public function suggest_completion( array $element_context ): array|\WP_Error {
		if ( ! $this->is_available() ) {
			return new \WP_Error(
				'ai_not_available',
				__( 'AI is not configured or enabled.', 'admin-coach-tours' )
			);
		}

		$provider = $this->get_active_provider();

		if ( ! $provider ) {
			return new \WP_Error(
				'no_provider',
				__( 'No AI provider is configured.', 'admin-coach-tours' )
			);
		}

		return $provider->suggest_completion( $element_context );
	}

	/**
	 * Get providers info for settings page.
	 *
	 * @return array Provider info.
	 */
	public function get_providers_info(): array {
		$info = [];

		foreach ( $this->providers as $id => $provider ) {
			$info[ $id ] = [
				'id'          => $id,
				'name'        => $provider->get_name(),
				'configured'  => $provider->is_configured(),
				'schema'      => $provider->get_settings_schema(),
			];
		}

		return $info;
	}
}
