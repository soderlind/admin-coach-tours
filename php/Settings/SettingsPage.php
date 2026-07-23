<?php
/**
 * Settings Page.
 *
 * Provides admin settings page for plugin configuration. AI provider API keys
 * are managed by the WordPress AI connector (wp_get_connectors), not here.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare(strict_types=1);

namespace AdminCoachTours\Settings;

use AdminCoachTours\AI\AiManager;

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
	private function __construct() {}

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
				'description' => __( 'Enable AI-powered tour and step draft generation.', 'admin-coach-tours' ),
			]
		);

		register_setting(
			self::OPTION_GROUP,
			'act_ai_provider',
			[
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			]
		);

		add_settings_field(
			'act_ai_provider',
			__( 'Preferred Provider', 'admin-coach-tours' ),
			[ $this, 'render_provider_field' ],
			self::MENU_SLUG,
			'act_ai'
		);

		register_setting(
			self::OPTION_GROUP,
			'act_ai_model',
			[
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			]
		);

		add_settings_field(
			'act_ai_model',
			__( 'Model Override', 'admin-coach-tours' ),
			[ $this, 'render_model_field' ],
			self::MENU_SLUG,
			'act_ai'
		);
	}

	/**
	 * Enqueue scripts.
	 *
	 * @param string $hook Current admin page.
	 */
	public function enqueue_scripts( string $hook ): void {
		// Settings page is under the Tools menu.
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
	 * Render AI section description and connector status.
	 */
	public function render_ai_section(): void {
		echo '<p>' . esc_html__(
			'AI features use the WordPress AI connector. Configure at least one AI provider connector in WordPress, then enable AI features below.',
			'admin-coach-tours'
		) . '</p>';

		$ai_manager = AiManager::get_instance();
		$connectors = $ai_manager->get_configured_connectors();

		if ( empty( $connectors ) ) {
			echo '<div class="notice notice-warning inline"><p>';
			esc_html_e( 'No configured AI provider connector was detected. AI features are unavailable until a connector is set up.', 'admin-coach-tours' );
			echo '</p></div>';
			return;
		}

		echo '<div class="notice notice-success inline"><p>';
		printf(
			/* translators: %s: comma-separated list of configured provider labels. */
			esc_html__( 'Configured AI providers: %s', 'admin-coach-tours' ),
			esc_html( implode( ', ', $connectors ) )
		);
		echo '</p></div>';
	}

	/**
	 * Render checkbox field.
	 *
	 * @param array $args Field arguments.
	 */
	public function render_checkbox_field( array $args ): void {
		$name  = $args[ 'name' ];
		$value = get_option( $name, false );
		$desc  = $args[ 'description' ] ?? '';

		?>
		<label>
			<input type="checkbox" name="<?php echo esc_attr( $name ); ?>" value="1" <?php checked( $value ); ?> />
			<?php echo esc_html( $desc ); ?>
		</label>
		<?php
	}

	/**
	 * Render the preferred-provider dropdown, populated from configured connectors.
	 */
	public function render_provider_field(): void {
		$ai_manager = AiManager::get_instance();
		$connectors = $ai_manager->get_configured_connectors();
		$current    = (string) get_option( 'act_ai_provider', '' );

		?>
		<select name="act_ai_provider" id="act_ai_provider">
			<option value="" <?php selected( $current, '' ); ?>>
				<?php esc_html_e( 'Auto (first configured)', 'admin-coach-tours' ); ?>
			</option>
			<?php foreach ( $connectors as $id => $label ) : ?>
				<option value="<?php echo esc_attr( $id ); ?>" <?php selected( $current, $id ); ?>>
					<?php echo esc_html( $label ); ?>
				</option>
			<?php endforeach; ?>
		</select>
		<p class="description">
			<?php esc_html_e( 'Choose which configured AI provider connector to use. Leave on Auto to use the first available.', 'admin-coach-tours' ); ?>
		</p>
		<?php
	}

	/**
	 * Render the optional model-override text field.
	 */
	public function render_model_field(): void {
		$current = (string) get_option( 'act_ai_model', '' );

		printf(
			'<input type="text" name="act_ai_model" id="act_ai_model" class="regular-text" value="%s" placeholder="%s" />',
			esc_attr( $current ),
			esc_attr__( 'Provider default', 'admin-coach-tours' )
		);
		echo '<p class="description">';
		esc_html_e( 'Optional model ID to use (e.g., a specific model name). Leave empty to use the provider default.', 'admin-coach-tours' );
		echo '</p>';
	}
}
