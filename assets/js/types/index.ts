/**
 * TypeScript type definitions for Admin Coach Tours.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

// ============================================================================
// Locator Types
// ============================================================================

/**
 * Locator types for targeting elements.
 */
export type LocatorType =
	| 'css'
	| 'role'
	| 'testId'
	| 'dataAttribute'
	| 'ariaLabel'
	| 'contextual'
	| 'wpBlock';

/**
 * A single locator strategy for finding an element.
 */
export interface Locator {
	/** The type of locator strategy. */
	type: LocatorType;
	/** The locator value (selector, role name, etc.). */
	value: string;
	/** Priority weight (0-100). Higher = preferred. Default 50. */
	weight?: number;
	/** If true, only use when primary locators fail. */
	fallback?: boolean;
}

/**
 * Constraints for target element resolution.
 */
export interface TargetConstraints {
	/** Element must be visible. Default true. */
	visible?: boolean;
	/** CSS selector for container element must be within. */
	withinContainer?: string;
	/** When multiple matches, use the nth (0-based). */
	index?: number;
}

/**
 * Target configuration with multiple locator strategies.
 */
export interface Target {
	/** Array of locator strategies, tried in weight order. */
	locators: Locator[];
	/** Optional constraints for resolution. */
	constraints?: TargetConstraints;
}

// ============================================================================
// Precondition Types
// ============================================================================

/**
 * Precondition types.
 */
export type PreconditionType =
	| 'ensureEditor'
	| 'ensureSidebarOpen'
	| 'ensureSidebarClosed'
	| 'selectSidebarTab'
	| 'openInserter'
	| 'closeInserter'
	| 'selectBlock'
	| 'focusElement'
	| 'scrollIntoView'
	| 'openModal'
	| 'closeModal';

/**
 * A precondition that must be met before step execution.
 */
export interface Precondition {
	/** The type of precondition. */
	type: PreconditionType;
	/** Optional value (e.g., 'block' for ensureEditor). */
	value?: string;
}

// ============================================================================
// Completion Types
// ============================================================================

/**
 * Completion types.
 */
export type CompletionType =
	| 'clickTarget'
	| 'domValueChanged'
	| 'wpData'
	| 'manual'
	| 'elementAppear'
	| 'elementDisappear'
	| 'customEvent';

/**
 * Comparison operators for completion checks.
 */
export type CompletionOperator =
	| 'equals'
	| 'notEquals'
	| 'contains'
	| 'exists'
	| 'changed';

/**
 * Completion rule defining when a step is considered complete.
 */
export interface Completion {
	/** The type of completion check. */
	type: CompletionType;
	/** For wpData: the wp.data store name. */
	store?: string;
	/** For wpData: the selector function name. */
	selector?: string;
	/** Expected value for comparison. */
	expected?: unknown;
	/** Comparison operator. Default 'equals'. */
	operator?: CompletionOperator;
	/** Additional parameters for completion. */
	params?: Record< string, unknown >;
}

// ============================================================================
// Recovery Types
// ============================================================================

/**
 * Recovery action types.
 */
export type RecoveryAction =
	| 'reapplyPreconditions'
	| 'scrollIntoView'
	| 'waitAndRetry';

/**
 * Recovery action configuration.
 */
export interface Recovery {
	/** The recovery action to take. */
	action: RecoveryAction;
	/** Timeout in ms for waitAndRetry. Default 1000. */
	timeout?: number;
}

// ============================================================================
// Step Types
// ============================================================================

/**
 * Element context captured when picking.
 */
export interface ElementContext {
	/** Element tag name (lowercase). */
	tagName: string;
	/** ARIA role if present. */
	role?: string;
	/** Element ID if present. */
	id?: string;
	/** Relevant class names (filtered). */
	classNames?: string[];
	/** Trimmed text content (max 200 chars). */
	textContent?: string;
	/** Placeholder text for inputs. */
	placeholder?: string;
	/** Associated label text. */
	label?: string;
	/** Relevant data-* attributes. */
	dataAttrs?: Record< string, string >;
}

/**
 * A single step in a tour.
 */
export interface Step {
	/** Unique identifier for the step. */
	id: string;
	/** Display order (0-based). */
	order: number;
	/** Short title for the step. */
	title: string;
	/** Detailed instruction text (supports HTML). */
	instruction?: string;
	/** Content alias for instruction. */
	content?: string;
	/** Optional hint text. */
	hint?: string;
	/** Target element configuration. */
	target: Target;
	/** Preconditions to apply before this step. */
	preconditions?: Precondition[];
	/** Completion rule for this step. */
	completion: Completion;
	/** Recovery actions if target not found. */
	recovery?: Recovery[];
	/** Optional tags for categorization. */
	tags?: string[];
	/** Step schema version. Default 1. */
	version?: number;
	/** Element context for AI drafting. */
	elementContext?: ElementContext;
}

// ============================================================================
// Tour Types
// ============================================================================

/**
 * Editor types supported.
 */
export type EditorType = 'block' | 'classic' | 'site';

/**
 * Tour status.
 */
export type TourStatus = 'draft' | 'publish' | 'pending' | 'private';

/**
 * A complete tour with all its steps.
 */
export interface Tour {
	/** Tour post ID. */
	id: number;
	/** Tour title. */
	title: string;
	/** Tour description. */
	description?: string;
	/** Post status. */
	status: TourStatus;
	/** Editor scope. */
	editor: EditorType;
	/** Post types this tour applies to. */
	postTypes: string[];
	/** Array of tour steps. */
	steps: Step[];
	/** Schema version number. */
	schemaVersion?: number;
	/** Author user ID. */
	author?: number;
	/** Creation date (ISO 8601). */
	created?: string;
	/** Last modified date (ISO 8601). */
	modified?: string;
}

// ============================================================================
// Resolution Types
// ============================================================================

/**
 * Resolution result from resolveTarget.
 */
export interface ResolutionResult {
	/** Whether resolution succeeded. */
	success: boolean;
	/** The resolved element if successful. */
	element?: HTMLElement;
	/** The locator that succeeded. */
	usedLocator?: Locator;
	/** Error message if failed. */
	error?: string;
	/** True if recovery was needed and succeeded. */
	recovered?: boolean;
}

/**
 * Completion watcher result.
 */
export interface CompletionWatcher {
	/** Function to stop watching. */
	cancel: () => void;
	/** Promise that resolves when completion is satisfied. */
	promise: Promise< boolean >;
}

// ============================================================================
// AI Types
// ============================================================================

/**
 * Suggested completion rule from AI.
 */
export interface AiSuggestedCompletion {
	/** Completion type. */
	type: CompletionType;
	/** wp.data store for wpData type. */
	store?: string;
	/** Selector for wpData type. */
	selector?: string;
	/** Expected value. */
	expected?: unknown;
	/** Comparison operator. */
	operator?: CompletionOperator;
	/** Explanation of why this completion is suggested. */
	rationale?: string;
}

/**
 * Response from AI step drafting endpoint.
 */
export interface AiStepDraft {
	/** Suggested step title. */
	title: string;
	/** Suggested instruction text. */
	content: string;
	/** Suggested completion rule. */
	suggestedCompletion?: AiSuggestedCompletion;
}

// ============================================================================
// Store State Types
// ============================================================================

/**
 * Mode types.
 */
export type Mode = 'educator' | 'pupil' | null;

/**
 * Store state shape.
 */
export interface StoreState {
	/** Tour data keyed by ID. */
	tours: Record< number, Tour >;
	/** Tours loading state. */
	toursLoading: boolean;
	/** Tours error message. */
	toursError: string | null;

	/** Current tour ID. */
	currentTourId: number | null;
	/** Current step index. */
	currentStepIndex: number;

	/** Current mode. */
	mode: Mode;

	/** Completion tracking. */
	completionSatisfied: boolean;
	/** Skipped step IDs. */
	skippedSteps: string[];

	/** Educator mode: picker active. */
	isPickerActive: boolean;
	/** Educator mode: step being picked for. */
	pickingStepId: string | null;
	/** Educator mode: selected step ID. */
	selectedStepId: string | null;
	/** Educator mode: has pending changes. */
	pendingChanges: boolean;

	/** Pupil mode: tour progress. */
	tourProgress: Record< number, number >;
	/** Pupil mode: recovering from error. */
	isRecovering: boolean;
	/** Last error message. */
	lastError: string | null;

	/** Resolved target element info. */
	resolvedTarget: HTMLElement | null;
	/** Resolution attempts count. */
	resolutionAttempts: number;

	/** UI: sidebar open state. */
	sidebarOpen: boolean;
	/** AI: draft loading state. */
	aiDraftLoading: boolean;
	/** AI: draft error. */
	aiDraftError: string | null;
	/** AI: draft result. */
	aiDraftResult: AiStepDraft | null;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * StepList component props.
 */
export interface StepListProps {
	/** Tour ID. */
	tourId: number;
	/** Array of steps. */
	steps: Step[];
	/** Handler for editing a step. */
	onEditStep: ( step: Step ) => void;
	/** Handler for adding a step. */
	onAddStep: () => void;
}

/**
 * StepEditor component props.
 */
export interface StepEditorProps {
	/** Step to edit. */
	step: Step;
	/** Tour ID. */
	tourId: number;
	/** Current post type. */
	postType: string;
	/** Close handler. */
	onClose: () => void;
}

/**
 * PickerOverlay component props.
 */
export interface PickerOverlayProps {
	/** Cancel handler. */
	onCancel?: () => void;
}

/**
 * SortableStepItem component props.
 */
export interface SortableStepItemProps {
	/** Step data. */
	step: Step;
	/** Edit handler. */
	onEdit: ( step: Step ) => void;
	/** Delete handler. */
	onDelete: ( stepId: string ) => void;
}
