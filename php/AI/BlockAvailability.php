<?php
/**
 * Block availability.
 *
 * Small helper that decides whether a block may appear in a generated tour,
 * given the set of blocks the current editor reports as insertable. A site can
 * disable core blocks (via `allowed_block_types_all`, unregistration, etc.);
 * when that happens the block must be excluded from tours.
 *
 * @package AdminCoachTours
 * @since   0.5.1
 */

declare(strict_types=1);

namespace AdminCoachTours\AI;

/**
 * Resolves block availability for tour generation.
 */
final class BlockAvailability {

	/**
	 * Maps knowledge-base block names to the block that is actually inserted
	 * from the top level (variations and inner blocks are reached through a
	 * parent). Availability is checked against the parent.
	 *
	 * @var array<string, string>
	 */
	private const INSERTABLE_ALIAS = [
		'core/button' => 'core/buttons',
		'core/column' => 'core/columns',
		'core/row'    => 'core/group',
		'core/stack'  => 'core/group',
	];

	/**
	 * Resolve the block whose insertability governs the given block.
	 *
	 * @param string $block Block name (e.g. `core/button`).
	 * @return string Insertable block name (e.g. `core/buttons`).
	 */
	public static function normalize( string $block ): string {
		return self::INSERTABLE_ALIAS[ $block ] ?? $block;
	}

	/**
	 * Whether a block is available for use in a tour.
	 *
	 * An empty `$available` list means the editor did not report availability
	 * (e.g. an older client), so every block is treated as available to avoid
	 * false negatives.
	 *
	 * @param string        $block     Block name to check.
	 * @param array<string> $available Insertable block names from the editor.
	 * @return bool
	 */
	public static function is_available( string $block, array $available ): bool {
		if ( empty( $available ) ) {
			return true;
		}

		return in_array( self::normalize( $block ), $available, true );
	}

	/**
	 * Filter a list of candidate blocks down to those that are disabled.
	 *
	 * @param array<string> $candidates Block names to test.
	 * @param array<string> $available  Insertable block names from the editor.
	 * @return array<string> Disabled block names (empty when availability is unknown).
	 */
	public static function disabled_from( array $candidates, array $available ): array {
		if ( empty( $available ) ) {
			return [];
		}

		$disabled = array_filter(
			$candidates,
			static fn( string $block ): bool => ! self::is_available( $block, $available )
		);

		return array_values( array_unique( $disabled ) );
	}
}
