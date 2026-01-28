<?php
/**
 * AI Provider Interface.
 *
 * Defines the contract for AI providers.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare( strict_types=1 );

namespace AdminCoachTours\AI;

/**
 * AI Provider Interface.
 */
interface AiProviderInterface {

	/**
	 * Get the provider identifier.
	 *
	 * @return string Provider ID (e.g., 'openai', 'anthropic').
	 */
	public function get_id(): string;

	/**
	 * Get the provider display name.
	 *
	 * @return string Provider name.
	 */
	public function get_name(): string;

	/**
	 * Check if the provider is configured and ready to use.
	 *
	 * @return bool True if configured.
	 */
	public function is_configured(): bool;

	/**
	 * Generate a step draft using AI.
	 *
	 * @param array $element_context Context about the target element.
	 * @param array $tour_context    Context about the tour.
	 * @return array|\WP_Error Generated draft or error.
	 */
	public function generate_step_draft( array $element_context, array $tour_context ): array|\WP_Error;

	/**
	 * Suggest a completion condition based on element context.
	 *
	 * @param array $element_context Context about the target element.
	 * @return array|\WP_Error Suggested completion or error.
	 */
	public function suggest_completion( array $element_context ): array|\WP_Error;

	/**
	 * Get provider settings schema.
	 *
	 * @return array Settings schema for the provider.
	 */
	public function get_settings_schema(): array;

	/**
	 * Validate provider settings.
	 *
	 * @param array $settings Settings to validate.
	 * @return bool|\WP_Error True if valid, error otherwise.
	 */
	public function validate_settings( array $settings ): bool|\WP_Error;
}
