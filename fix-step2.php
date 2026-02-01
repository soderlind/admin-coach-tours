<?php
/**
 * Debug and fix step 2 completion type.
 * Run with: wp eval-file fix-step2.php --url=plugins.local/subsite17
 */

$raw = get_post_meta( 58, '_act_steps', true );
echo "Raw type: " . gettype( $raw ) . "\n";
echo "Raw value: " . print_r( $raw, true ) . "\n";

// If it's a string (JSON), decode it
if ( is_string( $raw ) ) {
	$steps = json_decode( $raw, true );
	echo "Decoded from JSON\n";
} else {
	$steps = $raw;
}

if ( ! is_array( $steps ) ) {
	echo "Steps is not an array after processing\n";
	return;
}

echo "Steps count: " . count( $steps ) . "\n";

if ( ! isset( $steps[ 1 ] ) ) {
	echo "Step 1 (index 1) not found\n";
	return;
}

echo "Before: Step 2 completion = " . json_encode( $steps[ 1 ][ 'completion' ] ) . "\n";

// Change step 2 completion from clickTarget to manual
$steps[ 1 ][ 'completion' ] = [
	'type'   => 'manual',
	'params' => [],
];

$result = update_post_meta( 58, '_act_steps', $steps );

echo "Update result: " . ( $result ? 'success' : 'no change needed' ) . "\n";
echo "After: Step 2 completion = " . json_encode( $steps[ 1 ][ 'completion' ] ) . "\n";
