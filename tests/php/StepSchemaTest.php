<?php
/**
 * Test Step Schema.
 *
 * @package AdminCoachTours
 */

declare(strict_types=1);

namespace AdminCoachTours\Tests;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use AdminCoachTours\Validation\StepSchema;

/**
 * Step Schema Test class.
 */
class StepSchemaTest extends TestCase {

	/**
	 * Set up test.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		Functions\stubTranslationFunctions();
		Functions\stubEscapeFunctions();
	}

	/**
	 * Tear down test.
	 */
	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Test validate with valid step.
	 */
	public function test_validate_with_valid_step(): void {
		$step = [
			'id'         => 'step-1',
			'order'      => 0,
			'title'      => 'Test Step',
			'content'    => 'This is the content.',
			'target'     => [
				'locators' => [
					[
						'type'     => 'css',
						'value'    => '.my-button',
						'priority' => 1,
					],
				],
			],
			'completion' => [
				'type' => 'manual',
			],
		];

		$result = StepSchema::validate( $step );

		$this->assertTrue( $result );
	}

	/**
	 * Test validate with missing ID.
	 */
	public function test_validate_requires_id(): void {
		$step = [
			'title'   => 'Test Step',
			'content' => 'Content',
			'target'  => [
				'locators' => [
					[
						'type'     => 'css',
						'value'    => '.button',
						'priority' => 1,
					],
				],
			],
		];

		$result = StepSchema::validate( $step );

		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	/**
	 * Test validate with empty target.
	 */
	public function test_validate_requires_target(): void {
		$step = [
			'id'      => 'step-1',
			'title'   => 'Test Step',
			'content' => 'Content',
		];

		$result = StepSchema::validate( $step );

		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	/**
	 * Test validate with invalid locator type.
	 */
	public function test_validate_rejects_invalid_locator_type(): void {
		$step = [
			'id'     => 'step-1',
			'target' => [
				'locators' => [
					[
						'type'     => 'invalid-type',
						'value'    => 'something',
						'priority' => 1,
					],
				],
			],
		];

		$result = StepSchema::validate( $step );

		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	/**
	 * Test validate with invalid completion type.
	 */
	public function test_validate_rejects_invalid_completion_type(): void {
		$step = [
			'id'         => 'step-1',
			'target'     => [
				'locators' => [
					[
						'type'     => 'css',
						'value'    => '.button',
						'priority' => 1,
					],
				],
			],
			'completion' => [
				'type' => 'invalid-completion',
			],
		];

		$result = StepSchema::validate( $step );

		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	/**
	 * Test get_json_schema returns valid schema structure.
	 */
	public function test_get_json_schema_returns_valid_structure(): void {
		$schema = StepSchema::get_json_schema();

		$this->assertIsArray( $schema );
		$this->assertArrayHasKey( 'type', $schema );
		$this->assertEquals( 'object', $schema[ 'type' ] );
		$this->assertArrayHasKey( 'properties', $schema );
		$this->assertArrayHasKey( 'id', $schema[ 'properties' ] );
		$this->assertArrayHasKey( 'target', $schema[ 'properties' ] );
	}
}
