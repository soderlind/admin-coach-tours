<?php
/**
 * Test AI Controller.
 *
 * The controller is now a thin HTTP adapter; sanitization of editor/failure
 * context lives in TourRequest and cache/orchestration in TourGenerator, each
 * tested in their own files. This covers the element-context sanitization the
 * controller still owns, plus the endpoint surface.
 *
 * @package AdminCoachTours
 */

declare(strict_types=1);

namespace AdminCoachTours\Tests;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use AdminCoachTours\Rest\AiController;

/**
 * AI Controller Test class.
 */
class AiControllerTest extends TestCase {

	/**
	 * Set up test.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		Functions\stubTranslationFunctions();
		Functions\stubEscapeFunctions();
		Functions\when( 'apply_filters' )->returnArg();
	}

	/**
	 * Tear down test.
	 */
	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Test the REST endpoint surface exists.
	 */
	public function test_endpoint_methods_exist(): void {
		$this->assertTrue( method_exists( AiController::class, 'generate_draft' ) );
		$this->assertTrue( method_exists( AiController::class, 'get_status' ) );
		$this->assertTrue( method_exists( AiController::class, 'get_tasks' ) );
		$this->assertTrue( method_exists( AiController::class, 'generate_tour' ) );
	}

	/**
	 * Test sanitization of element context strips unsafe values.
	 */
	public function test_element_context_sanitization(): void {
		Functions\when( 'sanitize_key' )->alias(
			function ( $str ) {
				return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( $str ) );
			}
		);
		Functions\when( 'sanitize_html_class' )->alias(
			function ( $str ) {
				return preg_replace( '/[^a-zA-Z0-9_\-]/', '', $str );
			}
		);
		Functions\when( 'sanitize_text_field' )->alias(
			function ( $str ) {
				return strip_tags( $str );
			}
		);

		$reflection = new \ReflectionClass( AiController::class);
		$method     = $reflection->getMethod( 'sanitize_element_context' );
		$method->setAccessible( true );

		$dirty_context = [
			'tagName'     => 'BUTTON',
			'role'        => 'BUTTON',
			'textContent' => '<script>alert("xss")</script>Click me',
			'classNames'  => [ 'btn', 'btn-primary', 'wp-generated-class-123' ],
		];

		$result = $method->invoke( null, $dirty_context );

		$this->assertEquals( 'button', $result[ 'tagName' ] );
		$this->assertEquals( 'button', $result[ 'role' ] );
		$this->assertStringNotContainsString( '<script>', $result[ 'textContent' ] );
	}

	/**
	 * Test sanitize_element_context handles empty input.
	 */
	public function test_sanitize_element_context_handles_empty(): void {
		Functions\when( 'sanitize_key' )->returnArg();
		Functions\when( 'sanitize_html_class' )->returnArg();
		Functions\when( 'sanitize_text_field' )->returnArg();

		$reflection = new \ReflectionClass( AiController::class);
		$method     = $reflection->getMethod( 'sanitize_element_context' );
		$method->setAccessible( true );

		$result = $method->invoke( null, [] );

		$this->assertIsArray( $result );
	}
}
