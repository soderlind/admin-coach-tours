<?php
/**
 * Test Task Prompts.
 *
 * @package AdminCoachTours
 */

declare(strict_types=1);

namespace AdminCoachTours\Tests;

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;
use AdminCoachTours\AI\TaskPrompts;

/**
 * Task Prompts Test class.
 */
class TaskPromptsTest extends TestCase {

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
	}

	/**
	 * Tear down test.
	 */
	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Test get_tasks returns array of tasks.
	 */
	public function test_get_tasks_returns_array(): void {
		$tasks = TaskPrompts::get_tasks();

		$this->assertIsArray( $tasks );
		$this->assertNotEmpty( $tasks );
	}

	/**
	 * Test each task has required fields.
	 */
	public function test_tasks_have_required_fields(): void {
		$required_fields = [ 'id', 'label', 'icon', 'category', 'description' ];
		$tasks           = TaskPrompts::get_tasks();

		foreach ( $tasks as $index => $task ) {
			foreach ( $required_fields as $field ) {
				$this->assertArrayHasKey( $field, $task, "Task $index missing field: $field" );
				$this->assertNotEmpty( $task[ $field ], "Task $index has empty field: $field" );
			}
		}
	}

	/**
	 * Test task IDs are unique.
	 */
	public function test_task_ids_are_unique(): void {
		$tasks = TaskPrompts::get_tasks();
		$ids   = array_column( $tasks, 'id' );

		$this->assertEquals( count( $ids ), count( array_unique( $ids ) ), 'Task IDs should be unique' );
	}

	/**
	 * Test get_task returns task by ID.
	 */
	public function test_get_task_returns_task_by_id(): void {
		$task = TaskPrompts::get_task( 'add-image' );

		$this->assertIsArray( $task );
		$this->assertEquals( 'add-image', $task[ 'id' ] );
	}

	/**
	 * Test get_task returns null for unknown ID.
	 */
	public function test_get_task_returns_null_for_unknown_id(): void {
		$task = TaskPrompts::get_task( 'non-existent-task' );

		$this->assertNull( $task );
	}

	/**
	 * Test get_tasks_by_category groups tasks.
	 */
	public function test_get_tasks_by_category_groups_tasks(): void {
		$grouped = TaskPrompts::get_tasks_by_category();

		$this->assertIsArray( $grouped );
		$this->assertNotEmpty( $grouped );

		// Check that each group is an array with a label and tasks.
		foreach ( $grouped as $category => $group ) {
			$this->assertArrayHasKey( 'label', $group );
			$this->assertArrayHasKey( 'tasks', $group );
			$this->assertIsArray( $group[ 'tasks' ] );
		}
	}

	/**
	 * Test get_system_prompt returns string.
	 */
	public function test_get_system_prompt_returns_string(): void {
		$prompt = TaskPrompts::get_system_prompt(
			'add-image',
			'',
			'Sample Gutenberg context',
			'post'
		);

		$this->assertIsString( $prompt );
		$this->assertNotEmpty( $prompt );
	}

	/**
	 * Test system prompt contains task context.
	 */
	public function test_system_prompt_contains_task_context(): void {
		$prompt = TaskPrompts::get_system_prompt(
			'add-image',
			'',
			'Sample Gutenberg context',
			'page'
		);

		$this->assertStringContainsString( 'add-image', $prompt );
		$this->assertStringContainsString( 'page', $prompt );
		$this->assertStringContainsString( 'Sample Gutenberg context', $prompt );
	}

	/**
	 * Test system prompt for freeform query.
	 */
	public function test_system_prompt_for_freeform_query(): void {
		$prompt = TaskPrompts::get_system_prompt(
			'',
			'How do I add a custom HTML block?',
			'Sample context',
			'post'
		);

		$this->assertStringContainsString( 'How do I add a custom HTML block?', $prompt );
		$this->assertStringContainsString( 'Freeform Query Guidelines', $prompt );
	}

	/**
	 * Test get_tour_schema returns valid JSON schema.
	 */
	public function test_get_tour_schema_returns_valid_schema(): void {
		$schema = TaskPrompts::get_tour_schema();

		$this->assertIsArray( $schema );
		$this->assertArrayHasKey( 'type', $schema );
		$this->assertEquals( 'object', $schema[ 'type' ] );
		$this->assertArrayHasKey( 'properties', $schema );
		$this->assertArrayHasKey( 'title', $schema[ 'properties' ] );
		$this->assertArrayHasKey( 'steps', $schema[ 'properties' ] );
	}

	/**
	 * Test predefined tasks include expected ones.
	 */
	public function test_predefined_tasks_include_expected(): void {
		$tasks    = TaskPrompts::get_tasks();
		$task_ids = array_column( $tasks, 'id' );
		$expected = [
			'add-image',
			'add-video',
			'embed-youtube',
			'add-heading',
			'create-list',
			'add-button',
		];

		foreach ( $expected as $expected_id ) {
			$this->assertContains( $expected_id, $task_ids, "Expected task '$expected_id' not found" );
		}
	}

	/**
	 * Test system prompt with locale includes language instructions.
	 */
	public function test_system_prompt_with_locale_includes_language_instructions(): void {
		// Mock format_code_lang to return a language name.
		Functions\when( 'format_code_lang' )->justReturn( 'Norwegian' );

		$prompt = TaskPrompts::get_system_prompt(
			'add-image',
			'',
			'Sample Gutenberg context',
			'post',
			'',
			'',
			'nb_NO'
		);

		$this->assertStringContainsString( 'Response Language', $prompt );
		$this->assertStringContainsString( 'Norwegian', $prompt );
		$this->assertStringContainsString( 'nb_NO', $prompt );
	}

	/**
	 * Test system prompt with English locale does not include language instructions.
	 */
	public function test_system_prompt_with_english_locale_no_language_instructions(): void {
		$prompt = TaskPrompts::get_system_prompt(
			'add-image',
			'',
			'Sample Gutenberg context',
			'post',
			'',
			'',
			'en_US'
		);

		$this->assertStringNotContainsString( 'Response Language', $prompt );
	}

	/**
	 * Test system prompt with empty locale does not include language instructions.
	 */
	public function test_system_prompt_with_empty_locale_no_language_instructions(): void {
		$prompt = TaskPrompts::get_system_prompt(
			'add-image',
			'',
			'Sample Gutenberg context',
			'post',
			'',
			'',
			''
		);

		$this->assertStringNotContainsString( 'Response Language', $prompt );
	}

	/**
	 * Test system prompt locale parameter is optional (backward compatible).
	 */
	public function test_system_prompt_locale_parameter_is_optional(): void {
		// Should not throw an error when called without locale parameter.
		$prompt = TaskPrompts::get_system_prompt(
			'add-image',
			'',
			'Sample Gutenberg context',
			'post'
		);

		$this->assertIsString( $prompt );
		$this->assertNotEmpty( $prompt );
	}
}
