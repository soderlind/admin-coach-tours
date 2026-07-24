<?php
/**
 * Test Block Availability.
 *
 * @package AdminCoachTours
 */

declare(strict_types=1);

namespace AdminCoachTours\Tests;

use PHPUnit\Framework\TestCase;
use AdminCoachTours\AI\BlockAvailability;

/**
 * Block Availability Test class.
 */
class BlockAvailabilityTest extends TestCase {

	/**
	 * Test normalize maps inner/variation blocks to their insertable parent.
	 */
	public function test_normalize_maps_to_insertable_parent(): void {
		$this->assertSame( 'core/buttons', BlockAvailability::normalize( 'core/button' ) );
		$this->assertSame( 'core/columns', BlockAvailability::normalize( 'core/column' ) );
		$this->assertSame( 'core/group', BlockAvailability::normalize( 'core/row' ) );
		$this->assertSame( 'core/group', BlockAvailability::normalize( 'core/stack' ) );
		$this->assertSame( 'core/paragraph', BlockAvailability::normalize( 'core/paragraph' ) );
	}

	/**
	 * Test empty availability list treats every block as available.
	 */
	public function test_unknown_availability_allows_everything(): void {
		$this->assertTrue( BlockAvailability::is_available( 'core/audio', [] ) );
	}

	/**
	 * Test a block present in the availability list is available.
	 */
	public function test_available_block_is_available(): void {
		$this->assertTrue( BlockAvailability::is_available( 'core/image', [ 'core/image', 'core/paragraph' ] ) );
	}

	/**
	 * Test a block missing from the availability list is unavailable.
	 */
	public function test_missing_block_is_unavailable(): void {
		$this->assertFalse( BlockAvailability::is_available( 'core/audio', [ 'core/image', 'core/paragraph' ] ) );
	}

	/**
	 * Test availability is resolved through the insertable parent.
	 */
	public function test_child_block_available_when_parent_available(): void {
		$this->assertTrue( BlockAvailability::is_available( 'core/button', [ 'core/buttons' ] ) );
		$this->assertFalse( BlockAvailability::is_available( 'core/button', [ 'core/paragraph' ] ) );
	}

	/**
	 * Test disabled_from returns only unavailable blocks.
	 */
	public function test_disabled_from_returns_unavailable(): void {
		$disabled = BlockAvailability::disabled_from(
			[ 'core/image', 'core/audio', 'core/file' ],
			[ 'core/image' ]
		);

		$this->assertContains( 'core/audio', $disabled );
		$this->assertContains( 'core/file', $disabled );
		$this->assertNotContains( 'core/image', $disabled );
	}

	/**
	 * Test disabled_from returns nothing when availability is unknown.
	 */
	public function test_disabled_from_empty_when_availability_unknown(): void {
		$this->assertSame(
			[],
			BlockAvailability::disabled_from( [ 'core/image', 'core/audio' ], [] )
		);
	}
}
