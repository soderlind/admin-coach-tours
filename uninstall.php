<?php
/**
 * Uninstall script for Admin Coach Tours.
 *
 * This file is called when the plugin is uninstalled via the WordPress admin.
 * It cleans up all plugin data including options, post meta, and custom posts.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

// Exit if not called by WordPress uninstaller.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Delete all plugin options.
 */
function act_delete_options(): void {
	$options = [
		'act_ai_enabled',
		'act_ai_provider',
		'act_ai_api_key',
		'act_ai_endpoint',
		'act_ai_model',
		'act_allow_post_content',
		'act_encryption_key',
	];

	foreach ( $options as $option ) {
		delete_option( $option );
	}
}

/**
 * Delete all custom posts of type act_tour.
 */
function act_delete_tours(): void {
	$tours = get_posts(
		[
			'post_type'      => 'act_tour',
			'posts_per_page' => -1,
			'post_status'    => 'any',
			'fields'         => 'ids',
		]
	);

	foreach ( $tours as $tour_id ) {
		wp_delete_post( $tour_id, true ); // Force delete (bypass trash).
	}
}

/**
 * Delete user meta related to the plugin.
 */
function act_delete_user_meta(): void {
	global $wpdb;

	// Delete all user meta starting with 'act_'.
	$wpdb->query(
		$wpdb->prepare(
			"DELETE FROM {$wpdb->usermeta} WHERE meta_key LIKE %s",
			'act_%'
		)
	);
}

/**
 * Clean up transients.
 */
function act_delete_transients(): void {
	global $wpdb;

	// Delete transients.
	$wpdb->query(
		$wpdb->prepare(
			"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
			'_transient_act_%',
			'_transient_timeout_act_%'
		)
	);
}

/**
 * Remove custom capabilities from roles.
 */
function act_remove_capabilities(): void {
	$capabilities = [
		'edit_act_tours',
		'edit_act_tour',
		'read_act_tour',
		'delete_act_tour',
		'edit_others_act_tours',
		'publish_act_tours',
		'read_private_act_tours',
		'delete_act_tours',
		'delete_others_act_tours',
		'delete_published_act_tours',
		'delete_private_act_tours',
		'edit_private_act_tours',
		'edit_published_act_tours',
		'create_act_tours',
		'run_act_tours',
		'use_act_ai',
	];

	$roles = [ 'administrator', 'editor' ];

	foreach ( $roles as $role_name ) {
		$role = get_role( $role_name );
		if ( $role ) {
			foreach ( $capabilities as $cap ) {
				$role->remove_cap( $cap );
			}
		}
	}
}

// Run cleanup.
act_delete_options();
act_delete_tours();
act_delete_user_meta();
act_delete_transients();
act_remove_capabilities();

// Clear any cached data.
wp_cache_flush();
