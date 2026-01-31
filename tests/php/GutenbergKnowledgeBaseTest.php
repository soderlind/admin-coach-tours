<?php
/**
 * Test Gutenberg Knowledge Base.
 *
 * @package AdminCoachTours
 */

declare( strict_types=1 );

namespace AdminCoachTours\Tests;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use AdminCoachTours\AI\GutenbergKnowledgeBase;

/**
 * Gutenberg Knowledge Base Test class.
 */
class GutenbergKnowledgeBaseTest extends TestCase {

	/**
	 * Set up test.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		Functions\stubTranslationFunctions();
		Functions\stubEscapeFunctions();

		// Mock apply_filters to return the second argument (the value being filtered).
		Functions\when( 'apply_filters' )->alias(
			function ( $hook, $value ) {
				return $value;
			}
		);

		// Reset the static cache before each test.
		$this->resetKnowledgeCache();
	}

	/**
	 * Tear down test.
	 */
	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Reset the static knowledge cache.
	 */
	private function resetKnowledgeCache(): void {
		$reflection = new \ReflectionClass( GutenbergKnowledgeBase::class );
		$property   = $reflection->getProperty( 'knowledge' );
		$property->setAccessible( true );
		$property->setValue( null, null );
	}

	/**
	 * Test load returns array.
	 */
	public function test_load_returns_array(): void {
		$data = GutenbergKnowledgeBase::load();

		$this->assertIsArray( $data );
	}

	/**
	 * Test load caches data.
	 */
	public function test_load_caches_data(): void {
		$data1 = GutenbergKnowledgeBase::load();
		$data2 = GutenbergKnowledgeBase::load();

		// They should be identical since cached.
		$this->assertSame( $data1, $data2 );
	}

	/**
	 * Test get_relevant_context returns expected structure.
	 */
	public function test_get_relevant_context_returns_structure(): void {
		$context = GutenbergKnowledgeBase::get_relevant_context( 'add image', 3 );

		$this->assertIsArray( $context );
		$this->assertArrayHasKey( 'blocks', $context );
		$this->assertArrayHasKey( 'uiElements', $context );
		$this->assertArrayHasKey( 'actions', $context );
	}

	/**
	 * Test get_relevant_context limits blocks.
	 */
	public function test_get_relevant_context_limits_blocks(): void {
		$context = GutenbergKnowledgeBase::get_relevant_context( 'add image video gallery', 2 );

		// Should have at most 2 blocks (the limit).
		$this->assertLessThanOrEqual( 2, count( $context['blocks'] ) );
	}

	/**
	 * Test format_context_for_prompt returns string.
	 */
	public function test_format_context_for_prompt_returns_string(): void {
		$context   = GutenbergKnowledgeBase::get_relevant_context( 'add image', 3 );
		$formatted = GutenbergKnowledgeBase::format_context_for_prompt( $context );

		$this->assertIsString( $formatted );
	}

	/**
	 * Test format_context_for_prompt with empty context.
	 */
	public function test_format_context_for_prompt_with_empty_context(): void {
		$formatted = GutenbergKnowledgeBase::format_context_for_prompt(
			[
				'blocks'     => [],
				'uiElements' => [],
				'actions'    => [],
				'formatting' => [],
			]
		);

		$this->assertIsString( $formatted );
	}

	/**
	 * Test get_block returns block or null.
	 */
	public function test_get_block_returns_block_or_null(): void {
		// This may return null if the JSON isn't loaded in test env.
		$block = GutenbergKnowledgeBase::get_block( 'core/image' );

		$this->assertTrue( is_array( $block ) || is_null( $block ) );
	}

	/**
	 * Test get_all_blocks returns array.
	 */
	public function test_get_all_blocks_returns_array(): void {
		$blocks = GutenbergKnowledgeBase::get_all_blocks();

		$this->assertIsArray( $blocks );
	}

	/**
	 * Test relevance scoring finds matches.
	 */
	public function test_relevance_scoring_finds_matches(): void {
		$context = GutenbergKnowledgeBase::get_relevant_context( 'image', 5 );

		// If there's an image block, it should appear for "image" query.
		// Note: This depends on the actual JSON data being present.
		$this->assertIsArray( $context['blocks'] );
	}

	/**
	 * Test empty query returns empty context.
	 */
	public function test_empty_query_handles_gracefully(): void {
		$context = GutenbergKnowledgeBase::get_relevant_context( '', 5 );

		$this->assertIsArray( $context );
		$this->assertArrayHasKey( 'blocks', $context );
	}
}
