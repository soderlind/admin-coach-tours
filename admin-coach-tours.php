<?php
/**
 * Admin Coach Tours
 *
 * @package     AdminCoachTours
 * @author      Per Soderlind
 * @copyright   2026 Per Soderlind
 * @license     GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name: Admin Coach Tours
 * Plugin URI:  https://developer.developer.developer.developer.developer.developer.developer.developer
 * Description: Interactive guided tours for WordPress admin, enabling educators to create step-by-step tutorials and pupils to learn with guided overlays.
 * Version:     0.1.0
 * Requires at least: 6.8
 * Requires PHP: 8.3
 * Author:      Per Soderlind
 * Author URI:  https://developer.developer.developer.developer.developer.developer.developer.developer
 * Text Domain: admin-coach-tours
 * Domain Path: /languages
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

declare(strict_types=1);

namespace AdminCoachTours;

// Prevent direct access.
defined( 'ABSPATH' ) || exit;

/**
 * Plugin version.
 */
const VERSION = '0.1.0';

/**
 * Plugin slug.
 */
const SLUG = 'admin-coach-tours';

/**
 * Plugin base path.
 */
define( 'AdminCoachTours\PLUGIN_PATH', plugin_dir_path( __FILE__ ) );

/**
 * Plugin base URL.
 */
define( 'AdminCoachTours\PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Plugin basename.
 */
define( 'AdminCoachTours\PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Minimum WordPress version.
 */
const MIN_WP_VERSION = '6.8';

/**
 * Minimum PHP version.
 */
const MIN_PHP_VERSION = '8.3';

/**
 * Composer autoloader.
 */
if ( file_exists( PLUGIN_PATH . 'vendor/autoload.php' ) ) {
	require_once PLUGIN_PATH . 'vendor/autoload.php';
}

/**
 * Check plugin requirements before initialization.
 *
 * @return bool True if requirements are met, false otherwise.
 */
function check_requirements(): bool {
	$errors = [];

	// Check PHP version.
	if ( version_compare( PHP_VERSION, MIN_PHP_VERSION, '<' ) ) {
		$errors[] = sprintf(
			/* translators: 1: Required PHP version, 2: Current PHP version */
			__( 'Admin Coach Tours requires PHP %1$s or higher. You are running PHP %2$s.', 'admin-coach-tours' ),
			MIN_PHP_VERSION,
			PHP_VERSION
		);
	}

	// Check WordPress version.
	global $wp_version;
	if ( version_compare( $wp_version, MIN_WP_VERSION, '<' ) ) {
		$errors[] = sprintf(
			/* translators: 1: Required WordPress version, 2: Current WordPress version */
			__( 'Admin Coach Tours requires WordPress %1$s or higher. You are running WordPress %2$s.', 'admin-coach-tours' ),
			MIN_WP_VERSION,
			$wp_version
		);
	}

	// Check sodium extension.
	if ( ! function_exists( 'sodium_crypto_secretbox' ) ) {
		$errors[] = __( 'Admin Coach Tours requires the PHP Sodium extension for secure API key storage.', 'admin-coach-tours' );
	}

	if ( ! empty( $errors ) ) {
		add_action(
			'admin_notices',
			function () use ( $errors ) {
				foreach ( $errors as $error ) {
					printf(
						'<div class="notice notice-error"><p>%s</p></div>',
						esc_html( $error )
					);
				}
			}
		);
		return false;
	}

	return true;
}

/**
 * Initialize the plugin.
 *
 * @return void
 */
function init(): void {
	// Check requirements.
	if ( ! check_requirements() ) {
		return;
	}

	// Load text domain.
	load_plugin_textdomain(
		'admin-coach-tours',
		false,
		dirname( PLUGIN_BASENAME ) . '/languages'
	);

	// Initialize components.
	$initializers = [
		Cpt\ToursCpt::class,
		Security\Capabilities::class,
		Rest\Routes::class,
		Admin\SettingsPage::class,
	];

	foreach ( $initializers as $class ) {
		if ( class_exists( $class ) && method_exists( $class, 'init' ) ) {
			$class::init();
		}
	}

	// Enqueue editor assets.
	add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\enqueue_editor_assets' );

	// Enqueue admin assets (for settings page).
	add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\\enqueue_admin_assets' );
}

/**
 * Enqueue block editor assets.
 *
 * @return void
 */
function enqueue_editor_assets(): void {
	$asset_file = PLUGIN_PATH . 'build/editor/index.asset.php';

	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;

	wp_enqueue_script(
		'admin-coach-tours-editor',
		PLUGIN_URL . 'build/editor/index.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);

	wp_enqueue_style(
		'admin-coach-tours-editor',
		PLUGIN_URL . 'build/editor/index.css',
		[ 'wp-components' ],
		$asset['version']
	);

	// Localize script with REST info and nonce.
	wp_localize_script(
		'admin-coach-tours-editor',
		'adminCoachToursData',
		[
			'restUrl'   => rest_url( 'admin-coach-tours/v1/' ),
			'nonce'     => wp_create_nonce( 'wp_rest' ),
			'canEdit'   => current_user_can( 'edit_act_tours' ),
			'canRun'    => current_user_can( 'run_act_tours' ),
			'postTypes' => get_post_types( [ 'show_in_rest' => true ], 'names' ),
		]
	);

	wp_set_script_translations(
		'admin-coach-tours-editor',
		'admin-coach-tours',
		PLUGIN_PATH . 'languages'
	);
}

/**
 * Enqueue admin assets for settings page.
 *
 * @param string $hook_suffix The current admin page hook suffix.
 * @return void
 */
function enqueue_admin_assets( string $hook_suffix ): void {
	// Only load on our settings page.
	if ( 'tools_page_admin-coach-tours' !== $hook_suffix ) {
		return;
	}

	wp_enqueue_style(
		'admin-coach-tours-admin',
		PLUGIN_URL . 'assets/css/admin.css',
		[],
		VERSION
	);
}

/**
 * Plugin activation hook.
 *
 * @return void
 */
function activate(): void {
	// Register CPT to flush rewrite rules.
	if ( class_exists( Cpt\ToursCpt::class ) ) {
		Cpt\ToursCpt::register_post_type();
	}
	flush_rewrite_rules();

	// Set default options.
	$defaults = [
		'act_ai_provider'       => 'openai',
		'act_ai_api_key'        => '',
		'act_allow_post_content' => false,
	];

	foreach ( $defaults as $option => $value ) {
		if ( false === get_option( $option ) ) {
			add_option( $option, $value );
		}
	}
}

/**
 * Plugin deactivation hook.
 *
 * @return void
 */
function deactivate(): void {
	flush_rewrite_rules();
}

// Register activation/deactivation hooks.
register_activation_hook( __FILE__, __NAMESPACE__ . '\\activate' );
register_deactivation_hook( __FILE__, __NAMESPACE__ . '\\deactivate' );

// Initialize plugin on plugins_loaded.
add_action( 'plugins_loaded', __NAMESPACE__ . '\\init' );
