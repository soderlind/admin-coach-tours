<?php
/**
 * PHPUnit Bootstrap.
 *
 * @package AdminCoachTours
 */

declare(strict_types=1);

// Load Composer autoloader.
require_once dirname( __DIR__, 2 ) . '/vendor/autoload.php';

// Configure Brain Monkey.
use Brain\Monkey;

Monkey\setUp();

// Define constants.
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', '/var/www/html/' );
}

if ( ! defined( 'ACT_VERSION' ) ) {
	define( 'ACT_VERSION', '0.1.0' );
}

if ( ! defined( 'ACT_PLUGIN_DIR' ) ) {
	define( 'ACT_PLUGIN_DIR', dirname( __DIR__, 2 ) . '/' );
}

// Define WP stubs for testing.
if ( ! class_exists( 'WP_Error' ) ) {
	// phpcs:ignore PEAR.NamingConventions.ValidClassName.Invalid, Generic.Files.OneObjectStructurePerFile.MultipleFound
	class WP_Error {
		protected $code;
		protected $message;
		protected $data;

		public function __construct( $code = '', $message = '', $data = '' ) {
			$this->code    = $code;
			$this->message = $message;
			$this->data    = $data;
		}

		public function get_error_code() {
			return $this->code;
		}

		public function get_error_message() {
			return $this->message;
		}

		public function get_error_data() {
			return $this->data;
		}
	}
}

if ( ! class_exists( 'WP_REST_Request' ) ) {
	// phpcs:ignore PEAR.NamingConventions.ValidClassName.Invalid, Generic.Files.OneObjectStructurePerFile.MultipleFound
	class WP_REST_Request {
		protected $params = [];

		public function get_param( $key ) {
			return $this->params[ $key ] ?? null;
		}

		public function set_param( $key, $value ) {
			$this->params[ $key ] = $value;
		}

		public function has_param( $key ) {
			return isset( $this->params[ $key ] );
		}
	}
}

if ( ! function_exists( 'is_wp_error' ) ) {
	function is_wp_error( $thing ) {
		return $thing instanceof WP_Error;
	}
}

if ( ! function_exists( 'get_current_user_id' ) ) {
	function get_current_user_id() {
		return 1;
	}
}

if ( ! function_exists( 'wp_parse_args' ) ) {
	function wp_parse_args( $args, $defaults = [] ) {
		if ( is_object( $args ) ) {
			$parsed = get_object_vars( $args );
		} elseif ( is_array( $args ) ) {
			$parsed = $args;
		} else {
			parse_str( $args, $parsed );
		}
		return array_merge( $defaults, $parsed );
	}
}
