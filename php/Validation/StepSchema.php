<?php
/**
 * Step schema validation.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare(strict_types=1);

namespace AdminCoachTours\Validation;

use WP_Error;

/**
 * Validates step data against the defined schema.
 */
class StepSchema {

	/**
	 * Allowed locator types.
	 *
	 * @var array<string>
	 */
	public const LOCATOR_TYPES = [
		'css',
		'role',
		'testid',
		'dataattribute',
		'arialabel',
		'contextual',
	];

	/**
	 * Allowed precondition types.
	 *
	 * @var array<string>
	 */
	public const PRECONDITION_TYPES = [
		'ensureEditor',
		'ensureSidebarOpen',
		'ensureSidebarClosed',
		'selectSidebarTab',
		'openInserter',
		'closeInserter',
		'insertBlock',
	];

	/**
	 * Allowed completion types.
	 *
	 * @var array<string>
	 */
	public const COMPLETION_TYPES = [
		'clickTarget',
		'domValueChanged',
		'wpData',
		'manual',
	];

	/**
	 * Allowed recovery actions.
	 *
	 * @var array<string>
	 */
	public const RECOVERY_ACTIONS = [
		'reapplyPreconditions',
		'scrollIntoView',
		'waitAndRetry',
	];

	/**
	 * Allowed completion operators.
	 *
	 * @var array<string>
	 */
	public const COMPLETION_OPERATORS = [
		'equals',
		'notEquals',
		'contains',
		'exists',
		'changed',
	];

	/**
	 * Get the JSON Schema for a step.
	 *
	 * @return array JSON Schema definition.
	 */
	public static function get_json_schema(): array {
		return [
			'$schema'              => 'http://json-schema.org/draft-07/schema#',
			'type'                 => 'object',
			'required'             => [ 'id', 'order', 'title', 'target', 'completion' ],
			'additionalProperties' => false,
			'properties'           => [
				'id'            => [
					'type'        => 'string',
					'minLength'   => 1,
					'description' => 'Unique identifier for the step',
				],
				'order'         => [
					'type'        => 'integer',
					'minimum'     => 0,
					'description' => 'Display order of the step',
				],
				'title'         => [
					'type'        => 'string',
					'maxLength'   => 200,
					'description' => 'Short title for the step',
				],
				'instruction'   => [
					'type'        => 'string',
					'maxLength'   => 2000,
					'description' => 'Detailed instruction text (supports HTML)',
				],
				'hint'          => [
					'type'        => 'string',
					'maxLength'   => 500,
					'description' => 'Optional hint text',
				],
				'target'        => [
					'type'       => 'object',
					'required'   => [ 'locators' ],
					'properties' => [
						'locators'    => [
							'type'  => 'array',
							'items' => [
								'type'       => 'object',
								'required'   => [ 'type', 'value' ],
								'properties' => [
									'type'     => [
										'type' => 'string',
										'enum' => self::LOCATOR_TYPES,
									],
									'value'    => [
										'type'      => 'string',
										'minLength' => 1,
									],
									'weight'   => [
										'type'    => 'integer',
										'minimum' => 0,
										'maximum' => 100,
										'default' => 50,
									],
									'fallback' => [
										'type'    => 'boolean',
										'default' => false,
									],
								],
							],
						],
						'constraints' => [
							'type'       => 'object',
							'properties' => [
								'visible'         => [
									'type'    => 'boolean',
									'default' => true,
								],
								'withinContainer' => [
									'type' => 'string',
								],
								'index'           => [
									'type'    => 'integer',
									'minimum' => 0,
								],
							],
						],
					],
				],
				'preconditions' => [
					'type'    => 'array',
					'default' => [],
					'items'   => [
						'type'       => 'object',
						'required'   => [ 'type' ],
						'properties' => [
							'type'  => [
								'type' => 'string',
								'enum' => self::PRECONDITION_TYPES,
							],
							'value' => [
								'type' => 'string',
							],
						],
					],
				],
				'completion'    => [
					'type'       => 'object',
					'required'   => [ 'type' ],
					'properties' => [
						'type'     => [
							'type' => 'string',
							'enum' => self::COMPLETION_TYPES,
						],
						'store'    => [
							'type'        => 'string',
							'description' => 'wp.data store name for wpData completion',
						],
						'selector' => [
							'type'        => 'string',
							'description' => 'Selector function name for wpData completion',
						],
						'expected' => [
							'description' => 'Expected value for comparison',
						],
						'operator' => [
							'type'    => 'string',
							'enum'    => self::COMPLETION_OPERATORS,
							'default' => 'equals',
						],
					],
				],
				'recovery'      => [
					'type'    => 'array',
					'default' => [],
					'items'   => [
						'type'       => 'object',
						'required'   => [ 'action' ],
						'properties' => [
							'action'  => [
								'type' => 'string',
								'enum' => self::RECOVERY_ACTIONS,
							],
							'timeout' => [
								'type'    => 'integer',
								'minimum' => 0,
								'default' => 1000,
							],
						],
					],
				],
				'tags'          => [
					'type'    => 'array',
					'default' => [],
					'items'   => [
						'type' => 'string',
					],
				],
				'version'       => [
					'type'    => 'integer',
					'minimum' => 1,
					'default' => 1,
				],
			],
		];
	}

	/**
	 * Validate a step against the schema.
	 *
	 * @param array $step Step data to validate.
	 * @return true|WP_Error True if valid, WP_Error with details if invalid.
	 */
	public static function validate( array $step ): true|WP_Error {
		$errors = [];

		// Required fields.
		$required = [ 'id', 'order', 'title', 'target', 'completion' ];
		foreach ( $required as $field ) {
			if ( ! isset( $step[ $field ] ) ) {
				$errors[] = sprintf(
					/* translators: %s: field name */
					__( 'Missing required field: %s', 'admin-coach-tours' ),
					$field
				);
			}
		}

		if ( ! empty( $errors ) ) {
			return new WP_Error( 'invalid_step', implode( '; ', $errors ), [ 'status' => 400 ] );
		}

		// Validate id.
		if ( ! is_string( $step[ 'id' ] ) || empty( $step[ 'id' ] ) ) {
			$errors[] = __( 'Step id must be a non-empty string', 'admin-coach-tours' );
		}

		// Validate order.
		if ( ! is_int( $step[ 'order' ] ) || $step[ 'order' ] < 0 ) {
			$errors[] = __( 'Step order must be a non-negative integer', 'admin-coach-tours' );
		}

		// Validate title.
		if ( ! is_string( $step[ 'title' ] ) ) {
			$errors[] = __( 'Step title must be a string', 'admin-coach-tours' );
		}

		// Validate target.
		$target_result = self::validate_target( $step[ 'target' ] );
		if ( is_wp_error( $target_result ) ) {
			$errors[] = $target_result->get_error_message();
		}

		// Validate completion.
		$completion_result = self::validate_completion( $step[ 'completion' ] );
		if ( is_wp_error( $completion_result ) ) {
			$errors[] = $completion_result->get_error_message();
		}

		// Validate optional preconditions.
		if ( isset( $step[ 'preconditions' ] ) ) {
			$preconditions_result = self::validate_preconditions( $step[ 'preconditions' ] );
			if ( is_wp_error( $preconditions_result ) ) {
				$errors[] = $preconditions_result->get_error_message();
			}
		}

		// Validate optional recovery.
		if ( isset( $step[ 'recovery' ] ) ) {
			$recovery_result = self::validate_recovery( $step[ 'recovery' ] );
			if ( is_wp_error( $recovery_result ) ) {
				$errors[] = $recovery_result->get_error_message();
			}
		}

		if ( ! empty( $errors ) ) {
			return new WP_Error( 'invalid_step', implode( '; ', $errors ), [ 'status' => 400 ] );
		}

		return true;
	}

	/**
	 * Validate target structure.
	 *
	 * @param mixed $target Target data.
	 * @return true|WP_Error
	 */
	private static function validate_target( mixed $target ): true|WP_Error {
		if ( ! is_array( $target ) ) {
			return new WP_Error( 'invalid_target', __( 'Target must be an object', 'admin-coach-tours' ) );
		}

		if ( ! isset( $target[ 'locators' ] ) || ! is_array( $target[ 'locators' ] ) ) {
			return new WP_Error( 'invalid_target', __( 'Target must have a locators array', 'admin-coach-tours' ) );
		}

		// Empty locators is allowed for draft steps.
		if ( empty( $target[ 'locators' ] ) ) {
			return true;
		}

		foreach ( $target[ 'locators' ] as $i => $locator ) {
			if ( ! is_array( $locator ) ) {
				return new WP_Error(
					'invalid_locator',
					sprintf(
						/* translators: %d: locator index */
						__( 'Locator at index %d must be an object', 'admin-coach-tours' ),
						$i
					)
				);
			}

			// Normalize type to lowercase for comparison (sanitize_key will lowercase it).
			$locator_type = isset( $locator[ 'type' ] ) ? strtolower( $locator[ 'type' ] ) : '';
			if ( empty( $locator_type ) || ! in_array( $locator_type, self::LOCATOR_TYPES, true ) ) {
				return new WP_Error(
					'invalid_locator_type',
					sprintf(
						/* translators: %d: locator index */
						__( 'Invalid locator type at index %d', 'admin-coach-tours' ),
						$i
					)
				);
			}

			if ( ! isset( $locator[ 'value' ] ) || ! is_string( $locator[ 'value' ] ) || empty( $locator[ 'value' ] ) ) {
				return new WP_Error(
					'invalid_locator_value',
					sprintf(
						/* translators: %d: locator index */
						__( 'Locator value at index %d must be a non-empty string', 'admin-coach-tours' ),
						$i
					)
				);
			}
		}

		return true;
	}

	/**
	 * Validate completion rule.
	 *
	 * @param mixed $completion Completion data.
	 * @return true|WP_Error
	 */
	private static function validate_completion( mixed $completion ): true|WP_Error {
		if ( ! is_array( $completion ) ) {
			return new WP_Error( 'invalid_completion', __( 'Completion must be an object', 'admin-coach-tours' ) );
		}

		if ( ! isset( $completion[ 'type' ] ) || ! in_array( $completion[ 'type' ], self::COMPLETION_TYPES, true ) ) {
			return new WP_Error( 'invalid_completion_type', __( 'Invalid completion type', 'admin-coach-tours' ) );
		}

		// Validate wpData-specific fields.
		if ( 'wpData' === $completion[ 'type' ] ) {
			if ( empty( $completion[ 'store' ] ) ) {
				return new WP_Error(
					'invalid_wpdata_completion',
					__( 'wpData completion requires a store name', 'admin-coach-tours' )
				);
			}

			if ( empty( $completion[ 'selector' ] ) ) {
				return new WP_Error(
					'invalid_wpdata_completion',
					__( 'wpData completion requires a selector name', 'admin-coach-tours' )
				);
			}
		}

		if ( isset( $completion[ 'operator' ] ) && ! in_array( $completion[ 'operator' ], self::COMPLETION_OPERATORS, true ) ) {
			return new WP_Error( 'invalid_completion_operator', __( 'Invalid completion operator', 'admin-coach-tours' ) );
		}

		return true;
	}

	/**
	 * Validate preconditions array.
	 *
	 * @param mixed $preconditions Preconditions data.
	 * @return true|WP_Error
	 */
	private static function validate_preconditions( mixed $preconditions ): true|WP_Error {
		if ( ! is_array( $preconditions ) ) {
			return new WP_Error( 'invalid_preconditions', __( 'Preconditions must be an array', 'admin-coach-tours' ) );
		}

		foreach ( $preconditions as $i => $condition ) {
			if ( ! is_array( $condition ) ) {
				return new WP_Error(
					'invalid_precondition',
					sprintf(
						/* translators: %d: precondition index */
						__( 'Precondition at index %d must be an object', 'admin-coach-tours' ),
						$i
					)
				);
			}

			if ( ! isset( $condition[ 'type' ] ) || ! in_array( $condition[ 'type' ], self::PRECONDITION_TYPES, true ) ) {
				return new WP_Error(
					'invalid_precondition_type',
					sprintf(
						/* translators: %d: precondition index */
						__( 'Invalid precondition type at index %d', 'admin-coach-tours' ),
						$i
					)
				);
			}
		}

		return true;
	}

	/**
	 * Validate recovery array.
	 *
	 * @param mixed $recovery Recovery data.
	 * @return true|WP_Error
	 */
	private static function validate_recovery( mixed $recovery ): true|WP_Error {
		if ( ! is_array( $recovery ) ) {
			return new WP_Error( 'invalid_recovery', __( 'Recovery must be an array', 'admin-coach-tours' ) );
		}

		foreach ( $recovery as $i => $action ) {
			if ( ! is_array( $action ) ) {
				return new WP_Error(
					'invalid_recovery_action',
					sprintf(
						/* translators: %d: recovery action index */
						__( 'Recovery action at index %d must be an object', 'admin-coach-tours' ),
						$i
					)
				);
			}

			if ( ! isset( $action[ 'action' ] ) || ! in_array( $action[ 'action' ], self::RECOVERY_ACTIONS, true ) ) {
				return new WP_Error(
					'invalid_recovery_action_type',
					sprintf(
						/* translators: %d: recovery action index */
						__( 'Invalid recovery action type at index %d', 'admin-coach-tours' ),
						$i
					)
				);
			}
		}

		return true;
	}

	/**
	 * Validate an array of steps.
	 *
	 * @param array $steps Array of steps to validate.
	 * @return true|WP_Error True if all valid, WP_Error with first error if invalid.
	 */
	public static function validate_all( array $steps ): true|WP_Error {
		foreach ( $steps as $i => $step ) {
			$result = self::validate( $step );
			if ( is_wp_error( $result ) ) {
				return new WP_Error(
					'invalid_steps',
					sprintf(
						/* translators: 1: step index, 2: error message */
						__( 'Step %1$d: %2$s', 'admin-coach-tours' ),
						$i,
						$result->get_error_message()
					),
					[ 'status' => 400 ]
				);
			}
		}

		return true;
	}
}
