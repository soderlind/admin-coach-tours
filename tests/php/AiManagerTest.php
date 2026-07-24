<?php
/**
 * Test AI Manager.
 *
 * @package AdminCoachTours
 */

declare(strict_types=1);

namespace AdminCoachTours\Tests;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use AdminCoachTours\AI\AiManager;

/**
 * AI Manager Test class.
 */
class AiManagerTest extends TestCase {

	/**
	 * Set up test.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		Functions\stubTranslationFunctions();
		Functions\stubEscapeFunctions();

		// AI enabled by default; other options empty.
		Functions\when( 'get_option' )->alias(
			function ( $name, $default = false ) {
				if ( 'act_ai_enabled' === $name ) {
					return true;
				}
				return $default;
			}
		);

		// Connector reported as configured via the short-circuit filter.
		Functions\when( 'apply_filters' )->alias(
			function ( $hook, $value = null ) {
				if ( 'admin_coach_tours_ai_connector_configured' === $hook ) {
					return true;
				}
				return $value;
			}
		);

		Functions\when( 'is_wp_error' )->alias(
			static fn( $thing ) => $thing instanceof \WP_Error
		);
		Functions\when( 'wp_json_encode' )->alias(
			static fn( $data, $options = 0 ) => json_encode( $data, (int) $options )
		);
		Functions\when( 'sanitize_text_field' )->alias(
			static fn( $str ) => is_string( $str ) ? trim( strip_tags( $str ) ) : $str
		);
		Functions\when( 'sanitize_key' )->alias(
			static fn( $str ) => preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $str ) )
		);
		Functions\when( 'wp_kses_post' )->returnArg();
	}

	/**
	 * Tear down test.
	 */
	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Register a fake wp_ai_client_prompt returning the given text.
	 *
	 * @param string $response The canned AI response text.
	 */
	private function mock_ai_response( string $response ): void {
		Functions\when( 'wp_ai_client_prompt' )->alias(
			static function ( $prompt ) use ( $response ) {
				return new class( $response ) {
					/**
					 * Canned response.
					 *
					 * @var string
					 */
					private string $response;

					public function __construct( string $response ) {
						$this->response = $response;
					}

					public function using_system_instruction( $value ): self {
						return $this;
					}

					public function using_temperature( $value ): self {
						return $this;
					}

					public function using_max_tokens( $value ): self {
						return $this;
					}

					public function using_provider( $value ): self {
						return $this;
					}

					public function using_model( $value ): self {
						return $this;
					}

					public function generate_text() {
						return $this->response;
					}
				};
			}
		);
	}

	/**
	 * Test a step draft is parsed from a plain JSON response.
	 */
	public function test_generate_step_draft_parses_json(): void {
		$this->mock_ai_response(
			'{"title":"Click Publish","content":"<p>Publishes your post.</p>","suggestedCompletion":{"type":"clickTarget","params":{}}}'
		);

		$result = AiManager::get_instance()->generate_step_draft( [ 'tagName' => 'button' ] );

		$this->assertIsArray( $result );
		$this->assertSame( 'Click Publish', $result[ 'title' ] );
		$this->assertSame( 'clickTarget', $result[ 'suggestedCompletion' ][ 'type' ] );
	}

	/**
	 * Test JSON wrapped in Markdown code fences is still parsed.
	 */
	public function test_generate_step_draft_strips_code_fences(): void {
		$this->mock_ai_response(
			"```json\n{\"title\":\"Add a heading\",\"content\":\"Insert a heading block.\"}\n```"
		);

		$result = AiManager::get_instance()->generate_step_draft( [ 'tagName' => 'button' ] );

		$this->assertIsArray( $result );
		$this->assertSame( 'Add a heading', $result[ 'title' ] );
	}

	/**
	 * Test an unparseable response yields a parse_error WP_Error.
	 */
	public function test_generate_step_draft_returns_parse_error(): void {
		$this->mock_ai_response( 'Sorry, I cannot do that.' );

		$result = AiManager::get_instance()->generate_step_draft( [ 'tagName' => 'button' ] );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'parse_error', $result->get_error_code() );
	}

	/**
	 * Test a full tour response is validated and sanitized.
	 */
	public function test_generate_tour_validates_structure(): void {
		$tour = wp_json_encode(
			[
				'title' => 'Insert an Image',
				'steps' => [
					[
						'id'         => 'open-inserter',
						'order'      => 0,
						'title'      => 'Open the inserter',
						'content'    => '<p>Click the plus button.</p>',
						'target'     => [
							'locators' => [
								[
									'type'   => 'css',
									'value'  => '.editor-document-tools__inserter-toggle',
									'weight' => 80,
								],
								[
									'type'  => 'invalidType',
									'value' => 'should be dropped',
								],
							],
						],
						'completion' => [ 'type' => 'clickTarget' ],
					],
				],
			]
		);

		$this->mock_ai_response( $tour );

		$result = AiManager::get_instance()->generate_tour( 'system prompt' );

		$this->assertIsArray( $result );
		$this->assertSame( 'Insert an Image', $result[ 'title' ] );
		$this->assertCount( 1, $result[ 'steps' ] );
		// Invalid locator type is filtered out, leaving one valid locator.
		$this->assertCount( 1, $result[ 'steps' ][ 0 ][ 'target' ][ 'locators' ] );
		$this->assertSame( 'clickTarget', $result[ 'steps' ][ 0 ][ 'completion' ][ 'type' ] );
	}

	/**
	 * Test a scope error response yields an out_of_scope WP_Error.
	 */
	public function test_generate_tour_out_of_scope(): void {
		$this->mock_ai_response( '{"error":"scope","message":"Outside the editor."}' );

		$result = AiManager::get_instance()->generate_tour( 'system prompt', 'What is the weather?' );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'out_of_scope', $result->get_error_code() );
	}

	/**
	 * Test generation is refused when AI features are disabled.
	 */
	public function test_generate_step_draft_refused_when_disabled(): void {
		Functions\when( 'get_option' )->alias(
			static fn( $name, $default = false ) => 'act_ai_enabled' === $name ? false : $default
		);

		$result = AiManager::get_instance()->generate_step_draft( [ 'tagName' => 'button' ] );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'ai_not_available', $result->get_error_code() );
	}

	/**
	 * Test the completion heuristics without any AI call.
	 */
	public function test_suggest_completion_heuristics(): void {
		$manager = AiManager::get_instance();

		$this->assertSame(
			'clickTarget',
			$manager->suggest_completion( [ 'tagName' => 'button' ] )[ 'type' ]
		);
		$this->assertSame(
			'domValueChanged',
			$manager->suggest_completion( [ 'tagName' => 'input' ] )[ 'type' ]
		);
		$this->assertSame(
			'manual',
			$manager->suggest_completion( [ 'tagName' => 'div' ] )[ 'type' ]
		);
	}
}
