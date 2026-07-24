<?php
/**
 * Test Tour Generator.
 *
 * @package AdminCoachTours
 */

declare(strict_types=1);

namespace AdminCoachTours\Tests;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use AdminCoachTours\AI\AiManager;
use AdminCoachTours\AI\TourGenerator;
use AdminCoachTours\AI\TourRequest;

/**
 * Tour Generator Test class.
 */
class TourGeneratorTest extends TestCase {

	/**
	 * Set up test.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		Functions\stubTranslationFunctions();

		// AI enabled + connector configured by default.
		Functions\when( 'get_option' )->alias(
			static fn( $name, $default = false ) => 'act_ai_enabled' === $name ? true : $default
		);
		Functions\when( 'apply_filters' )->alias(
			static function ( $hook, $value = null ) {
				return 'admin_coach_tours_ai_connector_configured' === $hook ? true : $value;
			}
		);

		Functions\when( 'sanitize_key' )->alias(
			static fn( $str ) => preg_replace( '/[^a-z0-9_\-\/]/', '', strtolower( (string) $str ) )
		);
		Functions\when( 'sanitize_text_field' )->alias(
			static fn( $str ) => is_string( $str ) ? trim( strip_tags( $str ) ) : $str
		);
		Functions\when( 'absint' )->alias( static fn( $n ) => abs( (int) $n ) );
		Functions\when( 'get_user_locale' )->justReturn( 'en_US' );
		Functions\when( 'wp_json_encode' )->alias( static fn( $d, $o = 0 ) => json_encode( $d, (int) $o ) );
	}

	/**
	 * Tear down test.
	 */
	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Build a TourRequest from a param map.
	 *
	 * @param array $params Parameters.
	 * @return TourRequest
	 */
	private function make_request( array $params ): TourRequest {
		$request = new \WP_REST_Request();
		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}
		return TourRequest::from_rest( $request );
	}

	/**
	 * Test generation is refused when AI is unavailable.
	 */
	public function test_generate_refused_when_unavailable(): void {
		Functions\when( 'get_option' )->alias(
			static fn( $name, $default = false ) => 'act_ai_enabled' === $name ? false : $default
		);

		$generator = new TourGenerator( AiManager::get_instance() );
		$result    = $generator->generate( $this->make_request( [ 'taskId' => 'add-image' ] ) );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'ai_not_available', $result->get_error_code() );
	}

	/**
	 * Test generation requires a task or query.
	 */
	public function test_generate_requires_input(): void {
		$generator = new TourGenerator( AiManager::get_instance() );
		$result    = $generator->generate( $this->make_request( [] ) );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'missing_input', $result->get_error_code() );
	}

	/**
	 * Test the cache key is stable for identical requests.
	 */
	public function test_cache_key_is_consistent(): void {
		$request = $this->make_request(
			[
				'taskId'        => 'add-image',
				'postType'      => 'post',
				'editorContext' => [ 'editorBlocks' => [ [ 'name' => 'core/paragraph', 'isEmpty' => true ] ] ],
			]
		);

		$key1 = $this->cache_key( $request );
		$key2 = $this->cache_key( $request );

		$this->assertSame( $key1, $key2 );
		$this->assertStringStartsWith( 'act_tour_', $key1 );
	}

	/**
	 * Test the cache key differs for different tasks and post types.
	 */
	public function test_cache_key_differs_for_different_inputs(): void {
		$editor = [ 'editorContext' => [ 'editorBlocks' => [ [ 'name' => 'core/paragraph', 'isEmpty' => true ] ] ] ];

		$key1 = $this->cache_key( $this->make_request( [ 'taskId' => 'add-image', 'postType' => 'post' ] + $editor ) );
		$key2 = $this->cache_key( $this->make_request( [ 'taskId' => 'add-video', 'postType' => 'post' ] + $editor ) );
		$key3 = $this->cache_key( $this->make_request( [ 'taskId' => 'add-image', 'postType' => 'page' ] + $editor ) );

		$this->assertNotEquals( $key1, $key2 );
		$this->assertNotEquals( $key1, $key3 );
	}

	/**
	 * Test the cache key reflects the empty-placeholder state.
	 */
	public function test_cache_key_includes_placeholder_status(): void {
		$with = $this->make_request(
			[ 'taskId' => 'add-image', 'editorContext' => [ 'uiSamples' => [ 'emptyBlockPlaceholder' => [ 'visible' => true ] ] ] ]
		);
		$without = $this->make_request(
			[ 'taskId' => 'add-image', 'editorContext' => [ 'uiSamples' => [ 'emptyBlockPlaceholder' => [ 'visible' => false ] ] ] ]
		);

		$this->assertNotEquals( $this->cache_key( $with ), $this->cache_key( $without ) );
	}

	/**
	 * Invoke the private cache_key method.
	 *
	 * @param TourRequest $request Request.
	 * @return string
	 */
	private function cache_key( TourRequest $request ): string {
		$generator  = new TourGenerator( AiManager::get_instance() );
		$reflection = new \ReflectionClass( TourGenerator::class);
		$method     = $reflection->getMethod( 'cache_key' );
		$method->setAccessible( true );
		return $method->invoke( $generator, $request );
	}
}
