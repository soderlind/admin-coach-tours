<?php
/**
 * Settings Page.
 *
 * Provides admin settings page for plugin configuration.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare( strict_types=1 );

namespace AdminCoachTours\Settings;

use AdminCoachTours\AI\AiManager;
use AdminCoachTours\Security\Encryption;

/**
 * Settings Page class.
 */
class SettingsPage {

	/**
	 * Option group name.
	 *
	 * @var string
	 */
	public const OPTION_GROUP = 'admin_coach_tours_settings';

	/**
	 * Menu slug.
	 *
	 * @var string
	 */
	public const MENU_SLUG = 'admin-coach-tours-settings';

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Tracks which option names are sensitive (need encryption).
	 *
	 * @var array<string, bool>
	 */
	private array $sensitive_options = [];

	/**
	 * Encryption helper.
	 *
	 * @var Encryption|null
	 */
	private ?Encryption $encryption = null;

	/**
	 * Get singleton instance.
	 *
	 * @return self
	 */
	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->encryption = new Encryption();
	}

	/**
	 * Initialize settings.
	 */
	public static function init(): void {
		$instance = self::get_instance();
		add_action( 'admin_menu', [ $instance, 'add_menu_page' ] );
		add_action( 'admin_init', [ $instance, 'register_settings' ] );
		add_action( 'admin_enqueue_scripts', [ $instance, 'enqueue_scripts' ] );
	}

	/**
	 * Add menu page.
	 */
	public function add_menu_page(): void {
		add_submenu_page(
			'tools.php',
			__( 'Admin Coach Tours', 'admin-coach-tours' ),
			__( 'Coach Tours', 'admin-coach-tours' ),
			'manage_options',
			self::MENU_SLUG,
			[ $this, 'render_page' ]
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings(): void {
		// General section.
		add_settings_section(
			'act_general',
			__( 'General Settings', 'admin-coach-tours' ),
			'__return_null',
			self::MENU_SLUG
		);

		register_setting(
			self::OPTION_GROUP,
			'act_enable_pupil_mode',
			[
				'type'              => 'boolean',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'default'           => true,
			]
		);

		add_settings_field(
			'act_enable_pupil_mode',
			__( 'Enable Pupil Mode', 'admin-coach-tours' ),
			[ $this, 'render_checkbox_field' ],
			self::MENU_SLUG,
			'act_general',
			[
				'name'        => 'act_enable_pupil_mode',
				'description' => __( 'Allow users to run tours in pupil mode.', 'admin-coach-tours' ),
			]
		);

		// AI section.
		add_settings_section(
			'act_ai',
			__( 'AI Settings', 'admin-coach-tours' ),
			[ $this, 'render_ai_section' ],
			self::MENU_SLUG
		);

		register_setting(
			self::OPTION_GROUP,
			'act_ai_enabled',
			[
				'type'              => 'boolean',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'default'           => false,
			]
		);

		add_settings_field(
			'act_ai_enabled',
			__( 'Enable AI Features', 'admin-coach-tours' ),
			[ $this, 'render_checkbox_field' ],
			self::MENU_SLUG,
			'act_ai',
			[
				'name'        => 'act_ai_enabled',
				'description' => __( 'Enable AI-powered step draft generation.', 'admin-coach-tours' ),
			]
		);

		register_setting(
			self::OPTION_GROUP,
			'act_ai_provider',
			[
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_key',
				'default'           => 'openai',
			]
		);

		add_settings_field(
			'act_ai_provider',
			__( 'AI Provider', 'admin-coach-tours' ),
			[ $this, 'render_provider_field' ],
			self::MENU_SLUG,
			'act_ai'
		);

		// Provider-specific settings.
		$ai_manager = AiManager::get_instance();

		foreach ( $ai_manager->get_providers() as $provider ) {
			$provider_id = $provider->get_id();
			$schema      = $provider->get_settings_schema();

			foreach ( $schema as $field_id => $field_config ) {
				$option_name = "act_ai_{$provider_id}_{$field_id}";

				// Track sensitive fields for encryption.
				if ( ! empty( $field_config['sensitive'] ) ) {
					$this->sensitive_options[ $option_name ] = true;
				}

				register_setting(
					self::OPTION_GROUP,
					$option_name,
					[
						'type'              => $field_config['type'] ?? 'string',
						'sanitize_callback' => [ $this, 'sanitize_provider_field' ],
						'default'           => $field_config['default'] ?? '',
					]
				);

				add_settings_field(
					$option_name,
					$field_config['label'] ?? $field_id,
					[ $this, 'render_provider_setting_field' ],
					self::MENU_SLUG,
					'act_ai',
					[
						'provider'   => $provider_id,
						'field_id'   => $field_id,
						'field'      => $field_config,
						'name'       => $option_name,
					]
				);
			}
		}
	}

	/**
	 * Enqueue scripts.
	 *
	 * @param string $hook Current admin page.
	 */
	public function enqueue_scripts( string $hook ): void {
		// Settings page is now under Tools menu.
		if ( 'tools_page_' . self::MENU_SLUG !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'admin-coach-tours-settings',
			\AdminCoachTours\PLUGIN_URL . 'assets/css/settings.css',
			[],
			\AdminCoachTours\VERSION
		);

		wp_enqueue_script(
			'admin-coach-tours-settings',
			\AdminCoachTours\PLUGIN_URL . 'build/settings.js',
			[ 'jquery' ],
			\AdminCoachTours\VERSION,
			true
		);
	}

	/**
	 * Render page.
	 */
	public function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions.', 'admin-coach-tours' ) );
		}

		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

			<?php settings_errors(); ?>

			<form method="post" action="options.php" id="act-settings-form">
				<?php
				settings_fields( self::OPTION_GROUP );
				do_settings_sections( self::MENU_SLUG );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	/**
	 * Render AI section description.
	 */
	public function render_ai_section(): void {
		echo '<p>' . esc_html__(
			'Configure AI providers for generating step drafts and completion suggestions.',
			'admin-coach-tours'
		) . '</p>';

		$ai_manager = AiManager::get_instance();

		if ( ! $ai_manager->is_available() ) {
			echo '<div class="notice notice-warning inline"><p>';
			esc_html_e( 'No AI provider is currently configured. Add an API key below to enable AI features.', 'admin-coach-tours' );
			echo '</p></div>';
		}
	}

	/**
	 * Render checkbox field.
	 *
	 * @param array $args Field arguments.
	 */
	public function render_checkbox_field( array $args ): void {
		$name  = $args['name'];
		$value = get_option( $name, false );
		$desc  = $args['description'] ?? '';

		?>
		<label>
			<input
				type="checkbox"
				name="<?php echo esc_attr( $name ); ?>"
				value="1"
				<?php checked( $value ); ?>
			/>
			<?php echo esc_html( $desc ); ?>
		</label>
		<?php
	}

	/**
	 * Render provider field.
	 */
	public function render_provider_field(): void {
		$ai_manager = AiManager::get_instance();
		$providers  = $ai_manager->get_providers();
		$current    = get_option( 'act_ai_provider', 'openai' );

		?>
		<select name="act_ai_provider" id="act_ai_provider">
			<?php foreach ( $providers as $provider ) : ?>
				<option
					value="<?php echo esc_attr( $provider->get_id() ); ?>"
					<?php selected( $current, $provider->get_id() ); ?>
				>
					<?php echo esc_html( $provider->get_name() ); ?>
					<?php if ( $provider->is_configured() ) : ?>
						(<?php esc_html_e( 'configured', 'admin-coach-tours' ); ?>)
					<?php endif; ?>
				</option>
			<?php endforeach; ?>
		</select>
		<p class="description">
			<?php esc_html_e( 'Select the AI provider to use for generating step drafts.', 'admin-coach-tours' ); ?>
		</p>
		<?php
	}

	/**
	 * Render provider setting field.
	 *
	 * @param array $args Field arguments.
	 */
	public function render_provider_setting_field( array $args ): void {
		$provider_id = $args['provider'];
		$field       = $args['field'];
		$name        = $args['name'];
		$type        = $field['type'] ?? 'text';
		$options     = $field['options'] ?? [];
		$desc        = $field['description'] ?? '';
		$value       = get_option( $name, $field['default'] ?? '' );

		// Mask sensitive values.
		$is_sensitive = $field['sensitive'] ?? false;

		if ( $is_sensitive && ! empty( $value ) ) {
			$display_value = str_repeat( '•', 20 );
		} else {
			$display_value = $value;
		}

		$wrapper_class = "act-provider-field act-provider-{$provider_id}";

		echo '<div class="' . esc_attr( $wrapper_class ) . '" data-provider="' . esc_attr( $provider_id ) . '">';

		if ( 'select' === $type && ! empty( $options ) ) {
			echo '<select name="' . esc_attr( $name ) . '" id="' . esc_attr( $name ) . '">';
			foreach ( $options as $opt_value => $opt_label ) {
				printf(
					'<option value="%s" %s>%s</option>',
					esc_attr( $opt_value ),
					selected( $value, $opt_value, false ),
					esc_html( $opt_label )
				);
			}
			echo '</select>';
		} else {
			$input_type = 'password' === $type ? 'password' : 'text';

			if ( $is_sensitive ) {
				// Show a masked field with option to reveal/update.
				printf(
					'<input type="%s" name="%s" id="%s" class="regular-text act-sensitive-field" value="" placeholder="%s" autocomplete="off" />',
					esc_attr( $input_type ),
					esc_attr( $name ),
					esc_attr( $name ),
					! empty( $value ) ? esc_attr__( 'Leave empty to keep current', 'admin-coach-tours' ) : ''
				);

				if ( ! empty( $value ) ) {
					echo '<span class="act-field-status dashicons dashicons-yes-alt" title="' . esc_attr__( 'API key is set', 'admin-coach-tours' ) . '"></span>';
				}
			} else {
				printf(
					'<input type="%s" name="%s" id="%s" class="regular-text" value="%s" />',
					esc_attr( $input_type ),
					esc_attr( $name ),
					esc_attr( $name ),
					esc_attr( $display_value )
				);
			}
		}

		if ( ! empty( $desc ) ) {
			echo '<p class="description">' . esc_html( $desc ) . '</p>';
		}

		echo '</div>';
	}

	/**
	 * Sanitize provider field.
	 *
	 * @param mixed $value Field value.
	 * @return mixed Sanitized value.
	 */
	public function sanitize_provider_field( $value ) {
		// Get the option name from the filter.
		$filter_name = current_filter();
		$option_name = '';

		if ( preg_match( '/^sanitize_option_(.+)$/', $filter_name, $matches ) ) {
			$option_name = $matches[1];
		}

		// Keep existing value if empty (for sensitive fields).
		if ( '' === $value && ! empty( $option_name ) ) {
			$existing = get_option( $option_name );
			if ( ! empty( $existing ) ) {
				return $existing;
			}
		}

		// Sanitize.
		$value = sanitize_text_field( $value );

		// Encrypt sensitive fields.
		if ( ! empty( $option_name ) && ! empty( $this->sensitive_options[ $option_name ] ) && ! empty( $value ) ) {
			$value = $this->encryption->encrypt( $value );
		}

		return $value;
	}
}
