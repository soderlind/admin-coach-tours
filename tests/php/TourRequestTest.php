<?php
/**
 * Test Tour Request.
 *
 * @package AdminCoachTours
 */

declare(strict_types=1);

namespace AdminCoachTours\Tests;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use AdminCoachTours\AI\TourRequest;

/**
 * Tour Request Test class.
 */
class TourRequestTest extends TestCase {

	/**
	 * Set up test.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		Functions\when( 'sanitize_key' )->alias(
			static fn( $str ) => preg_replace( '/[^a-z0-9_\-\/]/', '', strtolower( (string) $str ) )
		);
		Functions\when( 'sanitize_text_field' )->alias(
			static fn( $str ) => is_string( $str ) ? trim( strip_tags( $str ) ) : $str
		);
		Functions\when( 'absint' )->alias( static fn( $n ) => abs( (int) $n ) );
		Functions\when( 'get_user_locale' )->justReturn( 'en_US' );
	}

	/**
	 * Tear down test.
	 */
	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Build a stub REST request from a param map.
	 *
	 * @param array $params Parameters.
	 * @return \WP_REST_Request
	 */
	private function make_request( array $params ): \WP_REST_Request {
		$request = new \WP_REST_Request();
		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}
		return $request;
	}

	/**
	 * Test from_rest sanitizes and exposes every field.
	 */
	public function test_from_rest_exposes_sanitized_fields(): void {
		$request = $this->make_request(
			[
				'taskId'         => 'add-image',
				'query'          => '',
				'postType'       => 'post',
				'locale'         => 'nb_NO',
				'editorContext'  => [ 'editorBlocks' => [ [ 'name' => 'core/paragraph', 'isEmpty' => true ] ] ],
				'failureContext' => [ 'stepIndex' => 2, 'error' => 'boom' ],
			]
		);

		$tour_request = TourRequest::from_rest( $request );

		$this->assertSame( 'add-image', $tour_request->task_id() );
		$this->assertSame( '', $tour_request->query() );
		$this->assertSame( 'post', $tour_request->post_type() );
		$this->assertSame( 'nb_NO', $tour_request->locale() );
		$this->assertTrue( $tour_request->has_input() );
		$this->assertTrue( $tour_request->has_failure_context() );
		$this->assertCount( 1, $tour_request->editor_context()[ 'editorBlocks' ] );
		$this->assertSame( 2, $tour_request->failure_context()[ 'stepIndex' ] );
	}

	/**
	 * Test locale falls back to the WordPress user locale when empty.
	 */
	public function test_from_rest_defaults_locale(): void {
		$tour_request = TourRequest::from_rest(
			$this->make_request( [ 'query' => 'add a button' ] )
		);

		$this->assertSame( 'en_US', $tour_request->locale() );
	}

	/**
	 * Test has_input is false and failure context null when nothing is provided.
	 */
	public function test_empty_request_has_no_input(): void {
		$tour_request = TourRequest::from_rest( $this->make_request( [] ) );

		$this->assertFalse( $tour_request->has_input() );
		$this->assertFalse( $tour_request->has_failure_context() );
		$this->assertNull( $tour_request->failure_context() );
		$this->assertSame( [], $tour_request->editor_context() );
	}

	/**
	 * Test editor-context sanitization keeps blocks and their flags.
	 */
	public function test_sanitize_editor_context_handles_blocks(): void {
		$result = $this->invoke_sanitize_editor(
			[
				'editorBlocks' => [
					[ 'name' => 'core/paragraph', 'isEmpty' => true ],
					[ 'name' => 'core/image', 'isEmpty' => false ],
				],
			]
		);

		$this->assertCount( 2, $result[ 'editorBlocks' ] );
		$this->assertSame( 'core/paragraph', $result[ 'editorBlocks' ][ 0 ][ 'name' ] );
		$this->assertTrue( $result[ 'editorBlocks' ][ 0 ][ 'isEmpty' ] );
	}

	/**
	 * Test editor-context sanitization normalizes visible elements.
	 */
	public function test_sanitize_editor_context_handles_visible_elements(): void {
		$result = $this->invoke_sanitize_editor(
			[
				'visibleElements' => [
					'inserterOpen'      => true,
					'sidebarOpen'       => false,
					'selectedBlockType' => 'core/image',
				],
			]
		);

		$this->assertTrue( $result[ 'visibleElements' ][ 'inserterOpen' ] );
		$this->assertFalse( $result[ 'visibleElements' ][ 'sidebarOpen' ] );
		$this->assertSame( 'core/image', $result[ 'visibleElements' ][ 'selectedBlockType' ] );
	}

	/**
	 * Test editor-context sanitization keeps UI samples.
	 */
	public function test_sanitize_editor_context_handles_ui_samples(): void {
		$result = $this->invoke_sanitize_editor(
			[
				'uiSamples' => [
					'inserterButton' => [
						'selector' => '.editor-document-tools__inserter-toggle',
						'visible'  => true,
					],
				],
			]
		);

		$this->assertArrayHasKey( 'inserterButton', $result[ 'uiSamples' ] );
		$this->assertSame( '.editor-document-tools__inserter-toggle', $result[ 'uiSamples' ][ 'inserterButton' ][ 'selector' ] );
		$this->assertTrue( $result[ 'uiSamples' ][ 'inserterButton' ][ 'visible' ] );
	}

	/**
	 * Test availableBlocks are normalized, de-duplicated, and non-blocks dropped.
	 */
	public function test_sanitize_editor_context_handles_available_blocks(): void {
		$result = $this->invoke_sanitize_editor(
			[
				'availableBlocks' => [
					'core/paragraph',
					'CORE/Image',        // upper-cased -> normalized.
					'core/paragraph',    // duplicate.
					'not-a-block',       // no slash -> dropped.
					123,                 // non-string -> skipped.
					'my-plugin/<script>',// stripped to my-plugin/script.
				],
			]
		);

		$this->assertContains( 'core/paragraph', $result[ 'availableBlocks' ] );
		$this->assertContains( 'core/image', $result[ 'availableBlocks' ] );
		$this->assertContains( 'my-plugin/script', $result[ 'availableBlocks' ] );
		$this->assertNotContains( 'not-a-block', $result[ 'availableBlocks' ] );
		$this->assertSame(
			array_values( array_unique( $result[ 'availableBlocks' ] ) ),
			$result[ 'availableBlocks' ]
		);
	}

	/**
	 * Test available_blocks is empty when the client omits it.
	 */
	public function test_available_blocks_empty_when_absent(): void {
		$tour_request = TourRequest::from_rest(
			$this->make_request( [ 'taskId' => 'add-image' ] )
		);

		$this->assertSame( [], $tour_request->available_blocks() );
	}

	/**
	 * Invoke the private sanitize_editor_context helper.
	 *
	 * @param array $context Raw context.
	 * @return array
	 */
	private function invoke_sanitize_editor( array $context ): array {
		$reflection = new \ReflectionClass( TourRequest::class);
		$method     = $reflection->getMethod( 'sanitize_editor_context' );
		$method->setAccessible( true );
		return $method->invoke( null, $context );
	}
}
