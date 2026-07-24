<?php
/**
 * Tour schema.
 *
 * Single source of truth for the shape of an AI-generated tour: the allowed
 * locator, precondition, and completion types. Both the prompt contract
 * (TaskPrompts::get_tour_schema) and the output validation
 * (AiManager::validate_and_sanitize_tour) derive from these constants, so the
 * shape can never drift between the two.
 *
 * @package AdminCoachTours
 * @since   0.5.0
 */

declare(strict_types=1);

namespace AdminCoachTours\AI;

/**
 * Tour schema constants.
 */
final class TourSchema {

	/**
	 * Allowed locator types for a step target.
	 *
	 * @var array<int, string>
	 */
	public const LOCATOR_TYPES = [
		'css',
		'role',
		'testId',
		'dataAttribute',
		'ariaLabel',
		'contextual',
		'wpBlock',
	];

	/**
	 * Allowed precondition types for a step.
	 *
	 * @var array<int, string>
	 */
	public const PRECONDITION_TYPES = [
		'ensureEditor',
		'ensureSidebarOpen',
		'ensureSidebarClosed',
		'selectSidebarTab',
		'openInserter',
		'closeInserter',
		'selectBlock',
		'focusElement',
		'scrollIntoView',
		'openModal',
		'closeModal',
		'insertBlock',
	];

	/**
	 * Allowed completion types for a step.
	 *
	 * @var array<int, string>
	 */
	public const COMPLETION_TYPES = [
		'clickTarget',
		'domValueChanged',
		'manual',
		'wpData',
		'elementAppear',
		'elementDisappear',
		'customEvent',
	];
}
