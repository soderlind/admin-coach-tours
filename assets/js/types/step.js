/**
 * JSDoc type definitions for step data structures.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

/**
 * Locator types for targeting elements.
 *
 * @typedef {'css'|'role'|'testId'|'dataAttribute'|'ariaLabel'|'contextual'} LocatorType
 */

/**
 * A single locator strategy for finding an element.
 *
 * @typedef {Object} Locator
 * @property {LocatorType} type     - The type of locator strategy.
 * @property {string}      value    - The locator value (selector, role name, etc.).
 * @property {number}      [weight] - Priority weight (0-100). Higher = preferred. Default 50.
 * @property {boolean}     [fallback] - If true, only use when primary locators fail.
 */

/**
 * Constraints for target element resolution.
 *
 * @typedef {Object} TargetConstraints
 * @property {boolean} [visible]         - Element must be visible. Default true.
 * @property {string}  [withinContainer] - CSS selector for container element must be within.
 * @property {number}  [index]           - When multiple matches, use the nth (0-based).
 */

/**
 * Target configuration with multiple locator strategies.
 *
 * @typedef {Object} Target
 * @property {Locator[]}         locators    - Array of locator strategies, tried in weight order.
 * @property {TargetConstraints} [constraints] - Optional constraints for resolution.
 */

/**
 * Precondition types.
 *
 * @typedef {'ensureEditor'|'ensureSidebarOpen'|'ensureSidebarClosed'|'selectSidebarTab'|'openInserter'|'closeInserter'} PreconditionType
 */

/**
 * A precondition that must be met before step execution.
 *
 * @typedef {Object} Precondition
 * @property {PreconditionType} type  - The type of precondition.
 * @property {string}           [value] - Optional value (e.g., 'block' for ensureEditor, 'post'|'block' for selectSidebarTab).
 */

/**
 * Completion types.
 *
 * @typedef {'clickTarget'|'domValueChanged'|'wpData'|'manual'} CompletionType
 */

/**
 * Comparison operators for completion checks.
 *
 * @typedef {'equals'|'notEquals'|'contains'|'exists'|'changed'} CompletionOperator
 */

/**
 * Completion rule defining when a step is considered complete.
 *
 * @typedef {Object} Completion
 * @property {CompletionType}     type     - The type of completion check.
 * @property {string}             [store]    - For wpData: the wp.data store name.
 * @property {string}             [selector] - For wpData: the selector function name.
 * @property {*}                  [expected] - Expected value for comparison.
 * @property {CompletionOperator} [operator] - Comparison operator. Default 'equals'.
 */

/**
 * Recovery action types.
 *
 * @typedef {'reapplyPreconditions'|'scrollIntoView'|'waitAndRetry'} RecoveryAction
 */

/**
 * Recovery action configuration.
 *
 * @typedef {Object} Recovery
 * @property {RecoveryAction} action  - The recovery action to take.
 * @property {number}         [timeout] - Timeout in ms for waitAndRetry. Default 1000.
 */

/**
 * A single step in a tour.
 *
 * @typedef {Object} Step
 * @property {string}         id            - Unique identifier for the step.
 * @property {number}         order         - Display order (0-based).
 * @property {string}         title         - Short title for the step.
 * @property {string}         [instruction] - Detailed instruction text (supports HTML).
 * @property {string}         [hint]        - Optional hint text.
 * @property {Target}         target        - Target element configuration.
 * @property {Precondition[]} [preconditions] - Preconditions to apply before this step.
 * @property {Completion}     completion    - Completion rule for this step.
 * @property {Recovery[]}     [recovery]    - Recovery actions if target not found.
 * @property {string[]}       [tags]        - Optional tags for categorization.
 * @property {number}         [version]     - Step schema version. Default 1.
 */

/**
 * A complete tour with all its steps.
 *
 * @typedef {Object} Tour
 * @property {number}   id            - Tour post ID.
 * @property {string}   title         - Tour title.
 * @property {string}   status        - Post status (draft, publish, etc.).
 * @property {string}   editor        - Editor scope (block, classic, site).
 * @property {string[]} postTypes     - Post types this tour applies to.
 * @property {Step[]}   steps         - Array of tour steps.
 * @property {number}   schemaVersion - Schema version number.
 * @property {number}   author        - Author user ID.
 * @property {string}   created       - Creation date (ISO 8601).
 * @property {string}   modified      - Last modified date (ISO 8601).
 */

/**
 * Resolution result from resolveTarget.
 *
 * @typedef {Object} ResolutionResult
 * @property {boolean}     success     - Whether resolution succeeded.
 * @property {HTMLElement} [element]   - The resolved element if successful.
 * @property {Locator}     [usedLocator] - The locator that succeeded.
 * @property {string}      [error]     - Error message if failed.
 * @property {boolean}     [recovered] - True if recovery was needed and succeeded.
 */

/**
 * Completion watcher result.
 *
 * @typedef {Object} CompletionWatcher
 * @property {Function} unsubscribe - Function to stop watching.
 * @property {Promise<boolean>} promise - Promise that resolves when completion is satisfied.
 */

// Export empty object to make this a module.
export {};
