<?php
/**
 * Test Tour Repository.
 *
 * @package AdminCoachTours
 */

declare(strict_types=1);

namespace AdminCoachTours\Tests;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use AdminCoachTours\Storage\TourRepository;
use AdminCoachTours\Validation\StepSchema;

/**
 * Tour Repository Test class.
 */
class TourRepositoryTest extends TestCase {

	/**
	 * Set up test.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		// Mock WordPress functions.
		Functions\stubTranslationFunctions();
		Functions\stubEscapeFunctions();

		// Mock $wpdb global for save_steps.
		global $wpdb;
		$wpdb = new class () {
			public string $postmeta = 'wp_postmeta';
			public function delete( $table, $where, $format ): bool {
				return true;
			}
			public function insert( $table, $data, $format ): bool {
				return true;
			}
		};
	}

	/**
	 * Tear down test.
	 */
	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Test get returns WP_Error for invalid ID.
	 */
	public function test_get_returns_error_for_invalid_id(): void {
		Functions\when( 'get_post' )->justReturn( null );

		$result = TourRepository::get( 999 );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertEquals( 'tour_not_found', $result->get_error_code() );
	}

	/**
	 * Test get returns tour data for valid ID.
	 */
	public function test_get_returns_tour_data_for_valid_id(): void {
		$mock_post = (object) [
			'ID'                => 1,
			'post_title'        => 'Test Tour',
			'post_content'      => 'Test description',
			'post_status'       => 'publish',
			'post_type'         => 'act_tour',
			'post_author'       => 1,
			'post_date_gmt'     => '2026-01-30 12:00:00',
			'post_modified_gmt' => '2026-01-30 12:00:00',
		];

		Functions\when( 'get_post' )->justReturn( $mock_post );
		Functions\when( 'get_post_meta' )->alias(
			function ( $post_id, $key, $single ) {
				return match ( $key ) {
					'_act_schema_version' => 1,
					// Current schema version - no migration needed.
					'_act_editor'         => 'block',
					'_act_post_types'     => [ 'post', 'page' ],
					'_act_steps'          => '[]',
					default               => '',
				};
			}
		);

		$result = TourRepository::get( 1 );

		$this->assertIsArray( $result );
		$this->assertEquals( 1, $result[ 'id' ] );
		$this->assertEquals( 'Test Tour', $result[ 'title' ] );
		$this->assertEquals( 'publish', $result[ 'status' ] );
	}

	/**
	 * Test get returns WP_Error for wrong post type.
	 */
	public function test_get_returns_error_for_wrong_post_type(): void {
		$mock_post = (object) [
			'ID'         => 1,
			'post_title' => 'Test Post',
			'post_type'  => 'post',
		];

		Functions\when( 'get_post' )->justReturn( $mock_post );

		$result = TourRepository::get( 1 );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertEquals( 'tour_not_found', $result->get_error_code() );
	}

	/**
	 * Test create returns tour ID on success.
	 */
	public function test_create_returns_tour_id_on_success(): void {
		Functions\when( 'wp_insert_post' )->justReturn( 123 );
		Functions\when( 'is_wp_error' )->justReturn( false );
		Functions\when( 'update_post_meta' )->justReturn( true );
		Functions\when( 'sanitize_key' )->returnArg();
		Functions\when( 'sanitize_text_field' )->returnArg();
		Functions\when( 'sanitize_textarea_field' )->returnArg();
		Functions\when( 'wp_kses_post' )->returnArg();
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\when( 'wp_cache_delete' )->justReturn( true );

		$result = TourRepository::create(
			[
				'title' => 'New Tour',
			]
		);

		$this->assertEquals( 123, $result );
	}

	/**
	 * Test create returns WP_Error on failure.
	 */
	public function test_create_returns_error_on_failure(): void {
		$error = new \WP_Error( 'insert_failed', 'Insert failed' );

		Functions\when( 'wp_insert_post' )->justReturn( $error );
		Functions\when( 'is_wp_error' )->justReturn( true );
		Functions\when( 'sanitize_text_field' )->returnArg();
		Functions\when( 'sanitize_textarea_field' )->returnArg();
		Functions\when( 'sanitize_key' )->returnArg();

		$result = TourRepository::create(
			[
				'title' => 'New Tour',
			]
		);

		$this->assertInstanceOf( \WP_Error::class, $result );
	}
}
