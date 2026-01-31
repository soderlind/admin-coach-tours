<?php
/**
 * Gutenberg Knowledge Base.
 *
 * Provides RAG context from static Gutenberg documentation for AI prompts.
 *
 * @package AdminCoachTours
 * @since   0.3.0
 */

declare( strict_types=1 );

namespace AdminCoachTours\AI;

/**
 * Gutenberg Knowledge Base class.
 */
class GutenbergKnowledgeBase {

	/**
	 * Cached knowledge data.
	 *
	 * @var array|null
	 */
	private static ?array $knowledge = null;

	/**
	 * Get the path to the data file.
	 *
	 * @return string Path to the JSON file.
	 */
	private static function get_data_file_path(): string {
		return __DIR__ . '/data/gutenberg-blocks.json';
	}

	/**
	 * Load the knowledge base data.
	 *
	 * @return array The knowledge base data.
	 */
	public static function load(): array {
		if ( null !== self::$knowledge ) {
			return self::$knowledge;
		}

		$file_path = self::get_data_file_path();

		/**
		 * Filter the path to the Gutenberg knowledge base file.
		 *
		 * @since 0.3.0
		 * @param string $file_path Path to the JSON file.
		 */
		$file_path = apply_filters( 'act_gutenberg_knowledge_file', $file_path );

		if ( ! file_exists( $file_path ) ) {
			self::$knowledge = [];
			return self::$knowledge;
		}

		$json = file_get_contents( $file_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$data = json_decode( $json, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			self::$knowledge = [];
			return self::$knowledge;
		}

		/**
		 * Filter the Gutenberg knowledge base data.
		 *
		 * @since 0.3.0
		 * @param array $data The knowledge base data.
		 */
		self::$knowledge = apply_filters( 'act_gutenberg_knowledge', $data );

		return self::$knowledge;
	}

	/**
	 * Get relevant context for a query.
	 *
	 * Searches blocks, UI elements, and actions for relevant information.
	 *
	 * @param string $query      The user query or task.
	 * @param int    $max_blocks Maximum number of blocks to return.
	 * @return array Relevant context for the AI prompt.
	 */
	public static function get_relevant_context( string $query, int $max_blocks = 5 ): array {
		$knowledge = self::load();
		$query     = strtolower( $query );
		$context   = [
			'blocks'     => [],
			'uiElements' => [],
			'actions'    => [],
			'formatting' => [],
		];

		if ( empty( $knowledge ) ) {
			return $context;
		}

		// Score and collect relevant blocks.
		$scored_blocks = [];
		if ( isset( $knowledge['blocks'] ) ) {
			foreach ( $knowledge['blocks'] as $block_name => $block_data ) {
				$score = self::calculate_relevance_score( $query, $block_name, $block_data );
				if ( $score > 0 ) {
					$scored_blocks[] = [
						'name'  => $block_name,
						'data'  => $block_data,
						'score' => $score,
					];
				}
			}
		}

		// Sort by score and take top results.
		usort( $scored_blocks, fn( $a, $b ) => $b['score'] <=> $a['score'] );
		$scored_blocks = array_slice( $scored_blocks, 0, $max_blocks );

		foreach ( $scored_blocks as $block ) {
			$context['blocks'][ $block['name'] ] = $block['data'];
		}

		// Include relevant UI elements based on query.
		if ( isset( $knowledge['uiElements'] ) ) {
			$ui_keywords = [
				'inserter'     => [ 'insert', 'add', 'block', 'new', '+' ],
				'toolbar'      => [ 'toolbar', 'format', 'bold', 'italic', 'link', 'options' ],
				'sidebar'      => [ 'sidebar', 'settings', 'panel', 'options', 'configure' ],
				'topBar'       => [ 'save', 'publish', 'preview', 'update' ],
				'editorCanvas' => [ 'editor', 'canvas', 'content', 'write', 'edit' ],
			];

			foreach ( $ui_keywords as $element => $keywords ) {
				foreach ( $keywords as $keyword ) {
					if ( str_contains( $query, $keyword ) && isset( $knowledge['uiElements'][ $element ] ) ) {
						$context['uiElements'][ $element ] = $knowledge['uiElements'][ $element ];
						break;
					}
				}
			}
		}

		// Include relevant common actions.
		if ( isset( $knowledge['commonActions'] ) ) {
			$action_keywords = [
				'openInserter'   => [ 'insert', 'add', 'new block', 'open inserter' ],
				'searchBlocks'   => [ 'search', 'find block', 'look for' ],
				'selectBlock'    => [ 'select', 'click', 'choose' ],
				'deleteBlock'    => [ 'delete', 'remove', 'trash' ],
				'moveBlock'      => [ 'move', 'reorder', 'rearrange', 'drag' ],
				'duplicateBlock' => [ 'duplicate', 'copy', 'clone' ],
				'transformBlock' => [ 'transform', 'convert', 'change type' ],
			];

			foreach ( $action_keywords as $action => $keywords ) {
				foreach ( $keywords as $keyword ) {
					if ( str_contains( $query, $keyword ) && isset( $knowledge['commonActions'][ $action ] ) ) {
						$context['actions'][ $action ] = $knowledge['commonActions'][ $action ];
						break;
					}
				}
			}
		}

		// Include formatting info if relevant.
		if ( isset( $knowledge['formatting'] ) ) {
			$formatting_keywords = [ 'bold', 'italic', 'link', 'format', 'strikethrough', 'subscript', 'superscript' ];
			foreach ( $formatting_keywords as $keyword ) {
				if ( str_contains( $query, $keyword ) ) {
					$context['formatting'] = $knowledge['formatting'];
					break;
				}
			}
		}

		return $context;
	}

	/**
	 * Calculate relevance score for a block.
	 *
	 * @param string $query      The search query.
	 * @param string $block_name The block name (e.g., 'core/image').
	 * @param array  $block_data The block data.
	 * @return int Relevance score (0 = not relevant).
	 */
	private static function calculate_relevance_score( string $query, string $block_name, array $block_data ): int {
		$score = 0;

		// Check block name.
		$short_name = str_replace( 'core/', '', $block_name );
		if ( str_contains( $query, $short_name ) ) {
			$score += 10;
		}

		// Check display name.
		$display_name = strtolower( $block_data['name'] ?? '' );
		if ( str_contains( $query, $display_name ) ) {
			$score += 10;
		}

		// Check keywords.
		$keywords = $block_data['keywords'] ?? [];
		foreach ( $keywords as $keyword ) {
			if ( str_contains( $query, strtolower( $keyword ) ) ) {
				$score += 5;
			}
		}

		// Check category.
		$category = strtolower( $block_data['category'] ?? '' );
		if ( str_contains( $query, $category ) ) {
			$score += 3;
		}

		// Check description.
		$description = strtolower( $block_data['description'] ?? '' );
		$query_words = explode( ' ', $query );
		foreach ( $query_words as $word ) {
			if ( strlen( $word ) > 3 && str_contains( $description, $word ) ) {
				$score += 1;
			}
		}

		return $score;
	}

	/**
	 * Get all available blocks for reference.
	 *
	 * @return array List of block names and descriptions.
	 */
	public static function get_all_blocks(): array {
		$knowledge = self::load();
		$blocks    = [];

		if ( isset( $knowledge['blocks'] ) ) {
			foreach ( $knowledge['blocks'] as $block_name => $block_data ) {
				$blocks[ $block_name ] = [
					'name'        => $block_data['name'] ?? $block_name,
					'description' => $block_data['description'] ?? '',
					'category'    => $block_data['category'] ?? 'common',
				];
			}
		}

		return $blocks;
	}

	/**
	 * Get a specific block's full data.
	 *
	 * @param string $block_name Block name (e.g., 'core/image').
	 * @return array|null Block data or null if not found.
	 */
	public static function get_block( string $block_name ): ?array {
		$knowledge = self::load();
		return $knowledge['blocks'][ $block_name ] ?? null;
	}

	/**
	 * Format context for AI prompt inclusion.
	 *
	 * @param array $context The context from get_relevant_context().
	 * @return string Formatted context string.
	 */
	public static function format_context_for_prompt( array $context ): string {
		$output = [];

		if ( ! empty( $context['blocks'] ) ) {
			$output[] = '## Relevant Gutenberg Blocks';
			foreach ( $context['blocks'] as $block_name => $block_data ) {
				$output[] = sprintf(
					"\n### %s (`%s`)\n%s\n",
					$block_data['name'] ?? $block_name,
					$block_name,
					$block_data['description'] ?? ''
				);

				if ( ! empty( $block_data['selectors'] ) ) {
					$output[] = 'Selectors:';
					foreach ( $block_data['selectors'] as $key => $selector ) {
						$output[] = sprintf( '- %s: `%s`', $key, $selector );
					}
				}

				if ( ! empty( $block_data['workflows'] ) ) {
					$output[] = "\nWorkflows:";
					foreach ( $block_data['workflows'] as $workflow_name => $steps ) {
						$output[] = sprintf( '- %s: %s', $workflow_name, implode( ' → ', $steps ) );
					}
				}
			}
		}

		if ( ! empty( $context['uiElements'] ) ) {
			$output[] = "\n## UI Elements";
			foreach ( $context['uiElements'] as $element_name => $element_data ) {
				$output[] = sprintf(
					"\n### %s\n%s",
					ucfirst( $element_name ),
					$element_data['description'] ?? ''
				);
				if ( ! empty( $element_data['selectors'] ) ) {
					$output[] = 'Selectors:';
					foreach ( $element_data['selectors'] as $key => $selector ) {
						$output[] = sprintf( '- %s: `%s`', $key, $selector );
					}
				}
			}
		}

		if ( ! empty( $context['actions'] ) ) {
			$output[] = "\n## Common Actions";
			foreach ( $context['actions'] as $action_name => $action_data ) {
				$output[] = sprintf(
					"\n### %s\n%s\nSteps: %s",
					ucfirst( str_replace( '_', ' ', $action_name ) ),
					$action_data['description'] ?? '',
					implode( ' → ', $action_data['steps'] ?? [] )
				);
			}
		}

		if ( ! empty( $context['formatting'] ) ) {
			$output[] = "\n## Text Formatting";
			foreach ( $context['formatting'] as $format_name => $format_data ) {
				$output[] = sprintf(
					'- **%s**: %s%s',
					ucfirst( $format_name ),
					$format_data['description'] ?? '',
					isset( $format_data['shortcut'] ) ? sprintf( ' (Shortcut: %s)', $format_data['shortcut'] ) : ''
				);
			}
		}

		return implode( "\n", $output );
	}
}
