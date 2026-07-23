<?php
/**
 * Tour generator.
 *
 * Deep module that owns the whole tour-generation pipeline behind a single
 * interface: `generate(TourRequest): array|WP_Error`. It resolves the cache,
 * retrieves grounding context, assembles the system prompt, calls the AI, and
 * caches the result. The REST controller is a thin adapter over this.
 *
 * @package AdminCoachTours
 * @since   0.5.0
 */

declare(strict_types=1);

namespace AdminCoachTours\AI;

/**
 * Tour generator.
 */
class TourGenerator {

	/**
	 * Cache key version. Bump when prompt instructions change to invalidate.
	 *
	 * @var string
	 */
	private const CACHE_VERSION = '2';

	/**
	 * AI manager.
	 *
	 * @var AiManager
	 */
	private AiManager $ai;

	/**
	 * Constructor.
	 *
	 * @param AiManager $ai AI manager (injected for testability).
	 */
	public function __construct( AiManager $ai ) {
		$this->ai = $ai;
	}

	/**
	 * Generate a tour for the given request.
	 *
	 * @param TourRequest $request Sanitized request.
	 * @return array|\WP_Error `[ 'tour' => array, 'cached' => bool ]` or error.
	 */
	public function generate( TourRequest $request ): array|\WP_Error {
		if ( ! $this->ai->is_available() ) {
			return new \WP_Error(
				'ai_not_available',
				__( 'AI is not configured or enabled.', 'admin-coach-tours' ),
				[ 'status' => 503 ]
			);
		}

		if ( ! $request->has_input() ) {
			return new \WP_Error(
				'missing_input',
				__( 'Please provide a task or question.', 'admin-coach-tours' ),
				[ 'status' => 400 ]
			);
		}

		// Cache lookup — skipped on contextual retries.
		$cache_key = null;
		if ( ! $request->has_failure_context() ) {
			$cache_key = $this->cache_key( $request );
			$cached    = $this->get_cached( $cache_key );

			if ( false !== $cached ) {
				return [
					'tour'   => $cached,
					'cached' => true,
				];
			}
		}

		$system_prompt = $this->build_system_prompt( $request );

		$tour = $this->ai->generate_tour( $system_prompt, $request->query() );

		if ( is_wp_error( $tour ) ) {
			return $tour;
		}

		if ( null !== $cache_key ) {
			$this->cache( $cache_key, $tour );
		}

		return [
			'tour'   => $tour,
			'cached' => false,
		];
	}

	/**
	 * Assemble the full system prompt from grounding + editor + failure context.
	 *
	 * @param TourRequest $request Sanitized request.
	 * @return string
	 */
	private function build_system_prompt( TourRequest $request ): string {
		$task         = '' !== $request->task_id() ? TaskPrompts::get_task( $request->task_id() ) : null;
		$search_query = $task ? ( $task[ 'description' ] ?? $request->task_id() ) : $request->query();

		$context_data      = GutenbergKnowledgeBase::get_relevant_context( $search_query, 5 );
		$gutenberg_context = GutenbergKnowledgeBase::format_context_for_prompt( $context_data );

		return TaskPrompts::get_system_prompt(
			$request->task_id(),
			$request->query(),
			$gutenberg_context,
			$request->post_type(),
			$request->editor_context(),
			$request->failure_context(),
			$request->locale()
		);
	}

	/**
	 * Build a cache key from the cache-significant parts of the request.
	 *
	 * @param TourRequest $request Sanitized request.
	 * @return string
	 */
	private function cache_key( TourRequest $request ): string {
		$editor_context = $request->editor_context();

		$key_data = [
			'version'   => self::CACHE_VERSION,
			'task'      => $request->task_id(),
			'query'     => $request->query(),
			'post_type' => $request->post_type(),
		];

		if ( ! empty( $editor_context[ 'editorBlocks' ] ) ) {
			$key_data[ 'blocks' ] = array_map(
				static function ( $block ) {
					return $block[ 'name' ] . ( ! empty( $block[ 'isEmpty' ] ) ? ':empty' : '' );
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

		if ( ! empty( $editor_context[ 'uiSamples' ][ 'emptyBlockPlaceholder' ][ 'visible' ] ) ) {
			$key_data[ 'hasPlaceholder' ] = true;
		}

		return 'act_tour_' . md5( (string) wp_json_encode( $key_data ) );
	}

	/**
	 * Read a cached tour.
	 *
	 * @param string $cache_key Cache key.
	 * @return array|false
	 */
	private function get_cached( string $cache_key ) {
		$cached = get_transient( $cache_key );

		if ( false !== $cached && is_array( $cached ) ) {
			return $cached;
		}

		return false;
	}

	/**
	 * Cache a generated tour.
	 *
	 * @param string $cache_key Cache key.
	 * @param array  $tour      Tour data.
	 * @return void
	 */
	private function cache( string $cache_key, array $tour ): void {
		$expiration = apply_filters( 'admin_coach_tours_cache_expiration', DAY_IN_SECONDS );
		set_transient( $cache_key, $tour, $expiration );
	}
}
