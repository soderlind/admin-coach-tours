<?php
/**
 * Fix tour 58 - change step 1 completion to domValueChanged.
 * Run with: wp eval-file fix-tour2.php --url=http://plugins.local/subsite17
 */

global $wpdb;
$table = $wpdb->prefix . 'postmeta';

// Get current steps
$current = $wpdb->get_var( $wpdb->prepare(
    "SELECT meta_value FROM $table WHERE post_id = %d AND meta_key = %s",
    58, '_act_steps'
) );

$steps = json_decode( $current, true );

if ( ! $steps ) {
    echo "No steps found!\n";
    exit;
}

// Change step 1 completion from clickTarget to domValueChanged
// This requires actual content to be typed before advancing
$steps[0]['completion'] = [
    'type' => 'domValueChanged',
    'params' => []
];

// Update step 1 instruction to be clearer
$steps[0]['instruction'] = 'Click on the title field and type a page title, then click Next.';

// Actually, for best UX, use 'manual' completion so user clicks Next when ready
// This gives users control over when to proceed
$steps[0]['completion'] = [
    'type' => 'manual',
    'params' => []
];

// Direct DB update
$result = $wpdb->update(
    $table,
    [ 'meta_value' => wp_json_encode( $steps ) ],
    [ 'post_id' => 58, 'meta_key' => '_act_steps' ],
    [ '%s' ],
    [ '%d', '%s' ]
);

echo "Update result: " . var_export( $result, true ) . "\n";
echo "Step 1 completion now: " . json_encode( $steps[0]['completion'] ) . "\n";
