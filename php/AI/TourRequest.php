<?php
/**
 * Tour request.
 *
 * Value object that owns the full input surface of a tour-generation request.
 * It is the seam between the HTTP layer and the tour-generation implementation:
 * `from_rest()` sanitizes every field (including editorContext and
 * failureContext, which are not declared in the REST route schema), and the
 * generator consumes the validated result.
 *
 * @package AdminCoachTours
 * @since   0.5.0
 */

declare(strict_types=1);

namespace AdminCoachTours\AI;

/**
 * Immutable, sanitized tour-generation request.
 */
final class TourRequest {

	/**
	 * Constructor.
	 *
	 * @param string     $task_id         Predefined task ID (may be empty).
	 * @param string     $query           Freeform query (may be empty).
	 * @param string     $post_type       Current post type.
	 * @param string     $locale          Resolved WordPress locale.
	 * @param array      $editor_context  Sanitized editor context.
	 * @param array|null $failure_context Sanitized failure context, or null.
	 */
	private function __construct(
		private readonly string $task_id,
		private readonly string $query,
		private readonly string $post_type,
		private readonly string $locale,
		private readonly array $editor_context,
		private readonly ?array $failure_context
	) {}

	/**
	 * Build a sanitized request from a REST request.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return self
	 */
	public static function from_rest( \WP_REST_Request $request ): self {
		$task_id   = sanitize_key( $request->get_param( 'taskId' ) ?? '' );
		$query     = sanitize_text_field( $request->get_param( 'query' ) ?? '' );
		$post_type = sanitize_key( $request->get_param( 'postType' ) ?? 'post' );
		$locale    = sanitize_text_field( $request->get_param( 'locale' ) ?? '' );

		if ( '' === $locale ) {
			$locale = get_user_locale();
		}

		$raw_editor     = $request->get_param( 'editorContext' );
		$editor_context = is_array( $raw_editor ) ? self::sanitize_editor_context( $raw_editor ) : [];

		$raw_failure     = $request->get_param( 'failureContext' );
		$failure_context = is_array( $raw_failure ) ? self::sanitize_failure_context( $raw_failure ) : null;

		return new self( $task_id, $query, $post_type, $locale, $editor_context, $failure_context );
	}

	/**
	 * Task ID.
	 *
	 * @return string
	 */
	public function task_id(): string {
		return $this->task_id;
	}

	/**
	 * Freeform query.
	 *
	 * @return string
	 */
	public function query(): string {
		return $this->query;
	}

	/**
	 * Post type.
	 *
	 * @return string
	 */
	public function post_type(): string {
		return $this->post_type;
	}

	/**
	 * Resolved locale.
	 *
	 * @return string
	 */
	public function locale(): string {
		return $this->locale;
	}

	/**
	 * Sanitized editor context.
	 *
	 * @return array
	 */
	public function editor_context(): array {
		return $this->editor_context;
	}

	/**
	 * Block names the editor reported as insertable.
	 *
	 * Empty when the client did not report availability.
	 *
	 * @return array<string>
	 */
	public function available_blocks(): array {
		$available = $this->editor_context[ 'availableBlocks' ] ?? [];

		return is_array( $available ) ? $available : [];
	}

	/**
	 * Sanitized failure context, or null when not retrying.
	 *
	 * @return array|null
	 */
	public function failure_context(): ?array {
		return $this->failure_context;
	}

	/**
	 * Whether this request carries failure context (a contextual retry).
	 *
	 * @return bool
	 */
	public function has_failure_context(): bool {
		return ! empty( $this->failure_context );
	}

	/**
	 * Whether the request has a task or a query to act on.
	 *
	 * @return bool
	 */
	public function has_input(): bool {
		return '' !== $this->task_id || '' !== $this->query;
	}

	/**
	 * Sanitize editor context from the frontend.
	 *
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

		// Blocks the editor reports as insertable (used to exclude disabled blocks).
		if ( isset( $context[ 'availableBlocks' ] ) && is_array( $context[ 'availableBlocks' ] ) ) {
			$available = [];
			foreach ( array_slice( $context[ 'availableBlocks' ], 0, 200 ) as $name ) {
				if ( ! is_string( $name ) ) {
					continue;
				}
				$clean = preg_replace( '/[^a-z0-9\/_-]/', '', strtolower( $name ) );
				if ( '' !== $clean && str_contains( $clean, '/' ) ) {
					$available[] = $clean;
				}
			}
			if ( ! empty( $available ) ) {
				$sanitized[ 'availableBlocks' ] = array_values( array_unique( $available ) );
			}
		}

		// Visible elements.
		if ( isset( $context[ 'visibleElements' ] ) && is_array( $context[ 'visibleElements' ] ) ) {
			$ve                             = $context[ 'visibleElements' ];
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
			$samples                  = $context[ 'uiSamples' ];
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
	 * Sanitize failure context from the frontend.
	 *
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
}
