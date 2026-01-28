/**
 * JSDoc type definitions for AI-related data structures.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

/**
 * Element context sent to AI for step drafting.
 * Minimized to avoid sending sensitive data.
 *
 * @typedef {Object} AiElementContext
 * @property {string}   tagName       - Element tag name (lowercase).
 * @property {string}   [role]        - ARIA role if present.
 * @property {string}   [id]          - Element ID if present.
 * @property {string[]} [classNames]  - Relevant class names (filtered).
 * @property {string}   [textContent] - Trimmed text content (max 200 chars).
 * @property {string}   [placeholder] - Placeholder text for inputs.
 * @property {string}   [label]       - Associated label text.
 * @property {Object}   [dataAttrs]   - Relevant data-* attributes.
 * @property {Object}   [ancestors]   - Parent element context (up to 3 levels).
 */

/**
 * Request payload for AI step drafting.
 *
 * @typedef {Object} AiDraftStepRequest
 * @property {AiElementContext} elementContext - Context about the target element.
 * @property {string}           postType       - Current post type being edited.
 * @property {Object[]}         [existingSteps] - Summary of existing steps for context.
 * @property {string}           [userHint]     - Optional user-provided hint about the step.
 */

/**
 * Suggested locator from AI.
 *
 * @typedef {Object} AiSuggestedLocator
 * @property {string} type   - Locator type (css, role, testId, etc.).
 * @property {string} value  - The locator value.
 * @property {number} weight - Suggested weight (0-100).
 */

/**
 * Suggested completion rule from AI.
 *
 * @typedef {Object} AiSuggestedCompletion
 * @property {string} type     - Completion type.
 * @property {string} [store]    - wp.data store for wpData type.
 * @property {string} [selector] - Selector for wpData type.
 * @property {*}      [expected] - Expected value.
 * @property {string} [operator] - Comparison operator.
 * @property {string} rationale  - Explanation of why this completion is suggested.
 */

/**
 * Response from AI step drafting endpoint.
 *
 * @typedef {Object} AiStepDraftOutput
 * @property {string}                title           - Suggested step title.
 * @property {string}                instruction     - Suggested instruction text.
 * @property {string}                [hint]          - Suggested hint text.
 * @property {AiSuggestedLocator[]}  locators        - Suggested locator strategies.
 * @property {AiSuggestedCompletion} completion      - Suggested completion rule.
 * @property {string[]}              [preconditions] - Suggested precondition types.
 * @property {string[]}              [tags]          - Suggested tags.
 * @property {string}                reasoning       - AI's reasoning for suggestions.
 */

/**
 * Error response from AI endpoints.
 *
 * @typedef {Object} AiErrorResponse
 * @property {string} code    - Error code.
 * @property {string} message - Human-readable error message.
 * @property {Object} [data]  - Additional error data.
 */

/**
 * AI provider configuration.
 *
 * @typedef {Object} AiProviderConfig
 * @property {string} id          - Provider identifier (openai, anthropic).
 * @property {string} name        - Display name.
 * @property {string} model       - Model identifier.
 * @property {number} maxTokens   - Maximum tokens for response.
 * @property {number} temperature - Temperature setting (0-2).
 */

// Export empty object to make this a module.
export {};
