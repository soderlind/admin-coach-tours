<?php
/**
 * Task Prompts.
 *
 * Defines predefined tasks with system prompts for AI tour generation.
 *
 * @package AdminCoachTours
 * @since   0.3.0
 */

declare(strict_types=1);

namespace AdminCoachTours\AI;

/**
 * Task Prompts class.
 */
class TaskPrompts {

	/**
	 * Get all available tasks.
	 *
	 * @return array List of task definitions.
	 */
	public static function get_tasks(): array {
		$tasks = [
			[
				'id'          => 'add-image',
				'label'       => __( 'Add an image', 'admin-coach-tours' ),
				'icon'        => 'format-image',
				'category'    => 'media',
				'description' => __( 'Learn how to add an image to your post or page.', 'admin-coach-tours' ),
			],
			[
				'id'          => 'add-video',
				'label'       => __( 'Add a video', 'admin-coach-tours' ),
				'icon'        => 'video-alt3',
				'category'    => 'media',
				'description' => __( 'Learn how to upload or embed a video.', 'admin-coach-tours' ),
			],
			[
				'id'          => 'embed-youtube',
				'label'       => __( 'Embed a YouTube video', 'admin-coach-tours' ),
				'icon'        => 'youtube',
				'category'    => 'embed',
				'description' => __( 'Learn how to embed a YouTube video in your content.', 'admin-coach-tours' ),
			],
			[
				'id'          => 'add-heading',
				'label'       => __( 'Add a heading', 'admin-coach-tours' ),
				'icon'        => 'heading',
				'category'    => 'text',
				'description' => __( 'Learn how to add headings to structure your content.', 'admin-coach-tours' ),
			],
			[
				'id'          => 'create-list',
				'label'       => __( 'Create a list', 'admin-coach-tours' ),
				'icon'        => 'list-view',
				'category'    => 'text',
				'description' => __( 'Learn how to create bulleted or numbered lists.', 'admin-coach-tours' ),
			],
			[
				'id'          => 'add-button',
				'label'       => __( 'Add a button', 'admin-coach-tours' ),
				'icon'        => 'button',
				'category'    => 'design',
				'description' => __( 'Learn how to add a call-to-action button.', 'admin-coach-tours' ),
			],
			[
				'id'          => 'add-columns',
				'label'       => __( 'Create columns layout', 'admin-coach-tours' ),
				'icon'        => 'columns',
				'category'    => 'design',
				'description' => __( 'Learn how to create a multi-column layout.', 'admin-coach-tours' ),
			],
			[
				'id'          => 'add-gallery',
				'label'       => __( 'Create an image gallery', 'admin-coach-tours' ),
				'icon'        => 'format-gallery',
				'category'    => 'media',
				'description' => __( 'Learn how to create a gallery of images.', 'admin-coach-tours' ),
			],
			[
				'id'          => 'format-text',
				'label'       => __( 'Format text (bold, italic, links)', 'admin-coach-tours' ),
				'icon'        => 'editor-bold',
				'category'    => 'text',
				'description' => __( 'Learn how to format text with bold, italic, and links.', 'admin-coach-tours' ),
			],
			[
				'id'          => 'add-quote',
				'label'       => __( 'Add a quote block', 'admin-coach-tours' ),
				'icon'        => 'format-quote',
				'category'    => 'text',
				'description' => __( 'Learn how to add a stylized quote to your content.', 'admin-coach-tours' ),
			],
			[
				'id'          => 'add-table',
				'label'       => __( 'Create a table', 'admin-coach-tours' ),
				'icon'        => 'editor-table',
				'category'    => 'text',
				'description' => __( 'Learn how to add a table for structured data.', 'admin-coach-tours' ),
			],
			[
				'id'          => 'add-cover',
				'label'       => __( 'Add a cover image', 'admin-coach-tours' ),
				'icon'        => 'cover-image',
				'category'    => 'media',
				'description' => __( 'Learn how to add a cover image with text overlay.', 'admin-coach-tours' ),
			],
		];

		/**
		 * Filter the available tasks.
		 *
		 * @since 0.3.0
		 * @param array $tasks List of task definitions.
		 */
		return apply_filters( 'act_ai_tasks', $tasks );
	}

	/**
	 * Get a specific task by ID.
	 *
	 * @param string $task_id The task ID.
	 * @return array|null Task definition or null if not found.
	 */
	public static function get_task( string $task_id ): ?array {
		$tasks = self::get_tasks();
		foreach ( $tasks as $task ) {
			if ( $task[ 'id' ] === $task_id ) {
				return $task;
			}
		}
		return null;
	}

	/**
	 * Get tasks grouped by category.
	 *
	 * @return array Tasks grouped by category.
	 */
	public static function get_tasks_by_category(): array {
		$tasks   = self::get_tasks();
		$grouped = [];
		$labels  = [
			'media'  => __( 'Media', 'admin-coach-tours' ),
			'text'   => __( 'Text & Content', 'admin-coach-tours' ),
			'embed'  => __( 'Embeds', 'admin-coach-tours' ),
			'design' => __( 'Design & Layout', 'admin-coach-tours' ),
		];

		foreach ( $tasks as $task ) {
			$category = $task[ 'category' ] ?? 'other';
			if ( ! isset( $grouped[ $category ] ) ) {
				$grouped[ $category ] = [
					'label' => $labels[ $category ] ?? ucfirst( $category ),
					'tasks' => [],
				];
			}
			$grouped[ $category ][ 'tasks' ][] = $task;
		}

		return $grouped;
	}

	/**
	 * Get the system prompt for tour generation.
	 *
	 * @param string $task_id              The task ID or 'freeform' for custom queries.
	 * @param string $user_query           The user's query (for freeform).
	 * @param string $gutenberg_context    RAG context from GutenbergKnowledgeBase.
	 * @param string $post_type            The current post type.
	 * @param string $editor_context       Current editor state (blocks, UI elements).
	 * @param string $failure_context      Context from previous failed attempt (for retry).
	 * @return string The system prompt.
	 */
	public static function get_system_prompt( string $task_id, string $user_query, string $gutenberg_context, string $post_type, string $editor_context = '', string $failure_context = '' ): string {
		$task = self::get_task( $task_id );

		// Base system prompt.
		$system_prompt = <<<PROMPT
You are an expert WordPress Gutenberg editor tutor. Your job is to create step-by-step interactive tours that guide users through tasks in the WordPress block editor.

## Your Role
- Create clear, concise instructions for each step
- Guide users to the exact UI elements they need to interact with
- Use the provided Gutenberg knowledge base for accurate selectors and workflows
- Keep tours MINIMAL: use the fewest steps needed to accomplish the task

## CRITICAL: Tour Quality Rules
1. FEWER STEPS ARE BETTER - only include steps that require user action
2. NEVER add a step just to "explain" something - use the content field instead
3. COMBINE related actions: typing a command AND pressing Enter is ONE step, not two
4. The FINAL step should use completion type "manual" to confirm success
5. Skip obvious UI steps (e.g., don't make "click here first" a separate step if the element is already focused)
6. For "/ commands" workflow: Step 1 = type command + Enter, Step 2 = show the result. That's often enough!

## Tour Format
You must return a valid JSON object with this structure:
{
  "title": "Tour title describing the task",
  "steps": [
    {
      "id": "unique-step-id",
      "order": 0,
      "title": "Short step title",
      "content": "<p>Clear instruction in HTML. Tell the user exactly what to do.</p>",
      "target": {
        "locators": [
          { "type": "css", "value": "selector", "weight": 80 },
          { "type": "ariaLabel", "value": "label text", "weight": 60, "fallback": true }
        ],
        "constraints": {
          "visible": true,
          "inEditorIframe": false
        }
      },
      "preconditions": [],
      "completion": {
        "type": "clickTarget"
      }
    }
  ]
}

## Locator Types
- "css": CSS selector (most reliable). IMPORTANT: Use only valid CSS selectors. Do NOT use :contains() or other jQuery pseudo-selectors.
- "ariaLabel": Match aria-label attribute (good for buttons). Use exact or partial text match.
- "role": ARIA role with optional label (e.g., "button:Add block")
- "testId": data-testid attribute
- "wpBlock": Block targeting ("first", "last", "selected", "type:core/paragraph")

## CSS Selector Best Practices
- NEVER use :contains() - it's not valid CSS
- Prefer class-based selectors: .editor-block-list-item-image
- Use data attributes: [data-type="core/image"]
- Use aria-label for buttons: [aria-label="Toggle block inserter"]
- Combine selectors for specificity: button.components-button
- Use the selectors from the Gutenberg Reference below

## Completion Types
- "clickTarget": Wait for user to click the target element
- "manual": User clicks Continue button
- "elementAppear": Wait for element to appear (needs params.selector)
- "elementDisappear": Wait for element to disappear
- "domValueChanged": Wait for input value to change
- "wpData": Wait for wp.data store change (needs params.storeName, selector, expectedValue)

## Precondition Types
- "ensureEditor": Make sure block editor is ready
- "openInserter": Open the block inserter panel
- "closeInserter": Close the block inserter panel
- "ensureSidebarOpen": Open settings sidebar
- "ensureSidebarClosed": Close settings sidebar
- "insertBlock": Insert a block (needs params.blockName, optional params.markerId)

## Important Guidelines
1. The editor canvas is inside an iframe with name="editor-canvas". Set constraints.inEditorIframe=true for elements inside the canvas (blocks, placeholders).
2. Always provide multiple locators with weights and fallbacks for reliability.
3. Use preconditions to set up the UI before each step (e.g., openInserter before searching for blocks).
4. SCOPING TO SELECTED BLOCK: When showing a step that targets elements INSIDE the just-inserted block (like .block-editor-media-placeholder), ALWAYS add "scopeToSelectedBlock": true to constraints. This ensures the tour highlights the correct block, not another block of the same type that may exist on the page.
4. Keep instructions friendly and encouraging.
5. Use HTML in content field for formatting (<p>, <strong>, <em>, <ul>, <li>).
6. Generate unique IDs for each step (use descriptive slugs like "open-inserter", "select-block").
7. CRITICAL: Only use valid CSS selectors. Never use :contains(), :has(), or jQuery pseudo-selectors.
8. USE THE TARGETING OPTIONS FROM "CURRENT EDITOR STATE" - they show real, working selectors for blocks on this page.
9. For the block inserter button, use: .editor-document-tools__inserter-toggle
10. For block items in inserter: .block-editor-block-types-list button.editor-block-list-item-[blockname]

## Selector Reliability Rules (CRITICAL)
Use ONLY these proven, stable selectors:

INSERTER PANEL:
- Button: .editor-document-tools__inserter-toggle
- Search: .components-search-control__input (NOT in iframe)
- Block list: .block-editor-block-types-list (NOT in iframe)
- Block item: .editor-block-list-item-{blockname} (e.g., .editor-block-list-item-image)

QUICK INSERTER (/ command):
- Autocomplete dropdown: .components-autocomplete__results (NOT in iframe!)
- Autocomplete button: .components-autocomplete__results button (NOT in iframe!)

BLOCKS IN EDITOR (inside iframe):
- Any block: [data-type="core/{blockname}"]
- Selected block: wpBlock: "selected"
- Rich text: .block-editor-rich-text__editable

AVOID .block-editor-media-placeholder - it has extra padding/height and creates oversized highlights.
Instead, target the BLOCK itself: [data-type="core/image"], [data-type="core/video"], etc.

TOOLBAR & CONTROLS:
- Block toolbar: .block-editor-block-toolbar
- Settings sidebar: .interface-complementary-area
- Publish: .editor-post-publish-button

AVOID these unreliable patterns:
- Dynamic class names with random strings
- Deeply nested selectors (more than 2-3 levels)
- IDs that look like UUIDs
- Selectors relying on specific DOM position

## DYNAMIC TARGETING - Use What's Available
The "CURRENT EDITOR STATE" section shows you the REAL blocks on the page with their targeting options.
- Look at which blocks are available and their targeting options
- For SELECTED blocks, prefer wpBlock: "selected" (most reliable)
- For specific blocks, use the clientId-based selector: wpBlock: "clientId:xxx"
- CSS selectors with [data-block="..."] are specific to that exact block
- After a step completes, the block may be deselected - use CSS or clientId targeting for subsequent steps

## PREFERRED: Teaching Users the "/" Quick Inserter
When adding blocks, PREFER teaching users the natural "/" workflow over using insertBlock preconditions:
1. An empty paragraph block will be automatically inserted and SELECTED before the tour starts
2. Guide users to click in the empty paragraph block, then type "/" followed by the block name
3. This teaches a transferable skill they can use without the tour

STEP TARGETING STRATEGY:
- Step 1: Use wpBlock: "selected" if the block shows as SELECTED in editor state
- Step 2+: Use the CSS selector from targeting options (e.g., [data-block="clientId"] .block-editor-rich-text__editable)
  because the tour system deselects blocks between steps

The quick inserter dropdown appears in the MAIN document (NOT in iframe):
- .components-autocomplete__results (constraints.inEditorIframe=false)
- .components-autocomplete__results button (to click an option)

Only use insertBlock precondition when the "/" workflow isn't practical (e.g., complex nested blocks).

## Current Context
- Post Type: {$post_type}
- Task: {$task_id}

{$editor_context}
{$failure_context}

## Gutenberg Reference
{$gutenberg_context}

PROMPT;

		// Add task-specific instructions.
		if ( $task ) {
			$task_instructions  = self::get_task_instructions( $task_id );
			$system_prompt     .= "\n\n## Task-Specific Instructions\n" . $task_instructions;
		} else {
			// Freeform query - add scope constraint.
			$system_prompt .= <<<PROMPT


## Freeform Query Guidelines
The user has asked a custom question. You should:
1. Only respond if the query is about the WordPress block editor or content creation
2. If the query is unrelated to editing (e.g., about WordPress settings, plugins, hosting, security), return an error response:
   {"error": "scope", "message": "I can only help with tasks in the WordPress editor."}
3. For valid queries, create a MINIMAL tour (3-5 steps maximum) that accomplishes what the user asked
4. Prefer the "/" quick inserter workflow over opening the inserter panel
5. Final step should always use manual completion

User Query: {$user_query}
PROMPT;
		}

		return $system_prompt;
	}

	/**
	 * Get task-specific instructions.
	 *
	 * @param string $task_id The task ID.
	 * @return string Task-specific instructions.
	 */
	private static function get_task_instructions( string $task_id ): string {
		$instructions = [
			'add-image'     => <<<'INST'
Guide the user to add an image using the "/" quick inserter.

PATTERN:
- Step 1: Target the empty paragraph, instruct user to type "/image" and press Enter
  - Completion: elementAppear for [data-type="core/image"] (inEditorIframe = true)
- Step 2: Target the ENTIRE image block using [data-type="core/image"] (NOT .block-editor-media-placeholder which is too large)
  - Use constraints: { "inEditorIframe": true, "scopeToSelectedBlock": true }
  - Explain the upload options: Upload, Media Library, Insert from URL
  - Completion: manual

SELECTORS:
- Step 1: wpBlock: "selected" or .block-editor-rich-text__editable
- Step 2: [data-type="core/image"] with scopeToSelectedBlock constraint
INST
			,

			'add-video'     => <<<'INST'
Guide the user to add a video using the "/" quick inserter.

PATTERN:
- Step 1: Target the empty paragraph, instruct user to type "/video" and press Enter
  - Completion: elementAppear for [data-type="core/video"] (inEditorIframe = true)
- Step 2: Target the ENTIRE video block using [data-type="core/video"] (NOT .block-editor-media-placeholder which is too large)
  - Use constraints: { "inEditorIframe": true, "scopeToSelectedBlock": true }
  - Explain the upload options: Upload, Media Library, Insert from URL
  - Completion: manual

SELECTORS:
- Step 1: wpBlock: "selected" or .block-editor-rich-text__editable
- Step 2: [data-type="core/video"] with scopeToSelectedBlock constraint
INST
			,

			'embed-youtube' => <<<'INST'
Guide the user to embed a YouTube video.

PATTERN:
- Step 1: Type "/youtube" and press Enter
  - Completion: elementAppear for [data-type="core/embed"] (inEditorIframe = true)
- Step 2: Show where to paste the URL
  - Completion: manual

SELECTORS: wpBlock: "selected", .wp-block-embed
INST
			,

			'add-heading'   => <<<'INST'
Guide the user to add a heading using the "/" quick inserter.

PATTERN:
- Step 1: Type "/heading" and press Enter
  - Completion: elementAppear for [data-type="core/heading"] (inEditorIframe = true)
- Step 2: Show the heading block, mention heading levels in content
  - Completion: manual

SELECTORS: wpBlock: "selected", [data-type="core/heading"]
INST
			,

			'create-list'   => <<<'INST'
Guide the user to create a list using the "/" quick inserter.

PATTERN:
- Step 1: Type "/list" and press Enter
  - Completion: elementAppear for [data-type="core/list"] (inEditorIframe = true)
- Step 2: Show the list, explain how to add items and switch list types
  - Completion: manual

SELECTORS: wpBlock: "selected", [data-type="core/list"]
INST
			,

			'add-button'    => <<<'INST'
Guide the user to add a button using the "/" quick inserter.

PATTERN:
- Step 1: Type "/button" and press Enter
  - Completion: elementAppear for [data-type="core/buttons"] (inEditorIframe = true)
- Step 2: Show the button, explain how to add text and link
  - Completion: manual

SELECTORS: wpBlock: "selected", [data-type="core/buttons"], [data-type="core/button"]
INST
			,

			'add-columns'   => <<<'INST'
Guide the user to create a columns layout.

PATTERN:
- Step 1: Type "/columns" and press Enter
  - Completion: elementAppear for [data-type="core/columns"] (inEditorIframe = true)
- Step 2: Show the variation picker, explain layout options
  - Completion: manual

SELECTORS: wpBlock: "selected", [data-type="core/columns"], .block-editor-block-variation-picker
INST
			,

			'add-gallery'   => <<<'INST'
Guide the user to create an image gallery.

PATTERN:
- Step 1: Type "/gallery" and press Enter
  - Completion: elementAppear for [data-type="core/gallery"] (inEditorIframe = true)
- Step 2: Target the ENTIRE gallery block using [data-type="core/gallery"] (NOT .block-editor-media-placeholder which is too large)
  - Use constraints: { "inEditorIframe": true, "scopeToSelectedBlock": true }
  - Explain multi-select in Media Library
  - Completion: manual

SELECTORS:
- Step 1: wpBlock: "selected" or .block-editor-rich-text__editable
- Step 2: [data-type="core/gallery"] with scopeToSelectedBlock constraint
INST
			,

			'format-text'   => <<<'INST'
Guide the user through text formatting. Requires existing text in a paragraph.

PATTERN:
- Step 1: Instruct user to select text in a paragraph
  - Completion: manual
- Step 2: Show the formatting toolbar, explain Bold/Italic/Link
  - Completion: manual

SELECTORS: paragraph from CURRENT EDITOR STATE, .block-editor-block-toolbar
INST
			,

			'add-quote'     => <<<'INST'
Guide the user to add a quote block.

PATTERN:
- Step 1: Type "/quote" and press Enter
  - Completion: elementAppear for [data-type="core/quote"] (inEditorIframe = true)
- Step 2: Show the quote block, explain citation field
  - Completion: manual

SELECTORS: wpBlock: "selected", [data-type="core/quote"]
INST
			,

			'add-table'     => <<<'INST'
Guide the user to create a table.

PATTERN:
- Step 1: Type "/table" and press Enter
  - Completion: elementAppear for [data-type="core/table"] (inEditorIframe = true)
- Step 2: Show table config, explain row/column setup
  - Completion: manual

SELECTORS: wpBlock: "selected", [data-type="core/table"]
INST
			,

			'add-cover'     => <<<'INST'
Guide the user to add a cover block.

PATTERN:
- Step 1: Type "/cover" and press Enter
  - Completion: elementAppear for [data-type="core/cover"] (inEditorIframe = true)
- Step 2: Target the ENTIRE cover block using [data-type="core/cover"] (NOT .block-editor-media-placeholder which is too large)
  - Use constraints: { "inEditorIframe": true, "scopeToSelectedBlock": true }
  - Explain background image and text overlay options
  - Completion: manual

SELECTORS:
- Step 1: wpBlock: "selected" or .block-editor-rich-text__editable
- Step 2: [data-type="core/cover"] with scopeToSelectedBlock constraint
INST
			,
		];

		return $instructions[ $task_id ] ?? 'Create a minimal tour using the "/" quick inserter pattern. Use elementAppear completion to wait for the block to appear, then show the result with manual completion.';
	}

	/**
	 * Get the JSON schema for tour generation response.
	 *
	 * @return array JSON Schema for structured output.
	 */
	public static function get_tour_schema(): array {
		return [
			'type'       => 'object',
			'properties' => [
				'title' => [
					'type'        => 'string',
					'description' => 'The title of the tour',
				],
				'steps' => [
					'type'  => 'array',
					'items' => [
						'type'       => 'object',
						'properties' => [
							'id'            => [ 'type' => 'string' ],
							'order'         => [ 'type' => 'integer' ],
							'title'         => [ 'type' => 'string' ],
							'content'       => [ 'type' => 'string' ],
							'target'        => [
								'type'       => 'object',
								'properties' => [
									'locators'    => [
										'type'  => 'array',
										'items' => [
											'type'       => 'object',
											'properties' => [
												'type'     => [ 'type' => 'string' ],
												'value'    => [ 'type' => 'string' ],
												'weight'   => [ 'type' => 'integer' ],
												'fallback' => [ 'type' => 'boolean' ],
											],
											'required'   => [ 'type', 'value' ],
										],
									],
									'constraints' => [
										'type'       => 'object',
										'properties' => [
											'visible'        => [ 'type' => 'boolean' ],
											'inEditorIframe' => [ 'type' => 'boolean' ],
										],
									],
								],
							],
							'preconditions' => [
								'type'  => 'array',
								'items' => [
									'type'       => 'object',
									'properties' => [
										'type'   => [ 'type' => 'string' ],
										'params' => [ 'type' => 'object' ],
									],
									'required'   => [ 'type' ],
								],
							],
							'completion'    => [
								'type'       => 'object',
								'properties' => [
									'type'   => [ 'type' => 'string' ],
									'params' => [ 'type' => 'object' ],
								],
								'required'   => [ 'type' ],
							],
						],
						'required'   => [ 'id', 'order', 'title', 'content', 'target', 'completion' ],
					],
				],
			],
			'required'   => [ 'title', 'steps' ],
		];
	}
}
