<?php
/**
 * Task Prompts.
 *
 * Defines predefined tasks with system prompts for AI tour generation.
 *
 * @package AdminCoachTours
 * @since   0.3.0
 */

declare( strict_types=1 );

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
			if ( $task['id'] === $task_id ) {
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
		$tasks    = self::get_tasks();
		$grouped  = [];
		$labels   = [
			'media'  => __( 'Media', 'admin-coach-tours' ),
			'text'   => __( 'Text & Content', 'admin-coach-tours' ),
			'embed'  => __( 'Embeds', 'admin-coach-tours' ),
			'design' => __( 'Design & Layout', 'admin-coach-tours' ),
		];

		foreach ( $tasks as $task ) {
			$category = $task['category'] ?? 'other';
			if ( ! isset( $grouped[ $category ] ) ) {
				$grouped[ $category ] = [
					'label' => $labels[ $category ] ?? ucfirst( $category ),
					'tasks' => [],
				];
			}
			$grouped[ $category ]['tasks'][] = $task;
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
	 * @return string The system prompt.
	 */
	public static function get_system_prompt( string $task_id, string $user_query, string $gutenberg_context, string $post_type, string $editor_context = '' ): string {
		$task = self::get_task( $task_id );

		// Base system prompt.
		$system_prompt = <<<PROMPT
You are an expert WordPress Gutenberg editor tutor. Your job is to create step-by-step interactive tours that guide users through tasks in the WordPress block editor.

## Your Role
- Create clear, concise instructions for each step
- Guide users to the exact UI elements they need to interact with
- Use the provided Gutenberg knowledge base for accurate selectors and workflows
- Keep tours focused and efficient (typically 3-7 steps)

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
4. Keep instructions friendly and encouraging.
5. Use HTML in content field for formatting (<p>, <strong>, <em>, <ul>, <li>).
6. Generate unique IDs for each step (use descriptive slugs like "open-inserter", "select-block").
7. CRITICAL: Only use valid CSS selectors. Never use :contains(), :has(), or jQuery pseudo-selectors.
8. Use the exact selectors from the Gutenberg Reference section - they are tested and working.
9. For the block inserter button, use: .editor-document-tools__inserter-toggle
10. For block items in inserter: .block-editor-block-types-list button.editor-block-list-item-[blockname]

## PREFERRED: Teaching Users the "/" Quick Inserter
When adding blocks, PREFER teaching users the natural "/" workflow over using insertBlock preconditions:
1. If there's an empty block placeholder visible, guide users to click it first
2. Teach them to type "/" followed by the block name (e.g., "/image", "/video")
3. This teaches a transferable skill they can use without the tour

The empty block placeholder appears as "Type / to choose a block" in the editor. Use selector:
- .block-editor-default-block-appender__content (in iframe, constraints.inEditorIframe=true)

Only use insertBlock precondition when the "/" workflow isn't practical (e.g., complex nested blocks).

## Current Context
- Post Type: {$post_type}
- Task: {$task_id}

{$editor_context}

## Gutenberg Reference
{$gutenberg_context}

PROMPT;

		// Add task-specific instructions.
		if ( $task ) {
			$task_instructions = self::get_task_instructions( $task_id );
			$system_prompt    .= "\n\n## Task-Specific Instructions\n" . $task_instructions;
		} else {
			// Freeform query - add scope constraint.
			$system_prompt .= <<<PROMPT


## Freeform Query Guidelines
The user has asked a custom question. You should:
1. Only respond if the query is about the WordPress block editor or content creation
2. If the query is unrelated to editing (e.g., about WordPress settings, plugins, hosting, security), return an error response:
   {"error": "scope", "message": "I can only help with tasks in the WordPress editor."}
3. For valid queries, create a tour that accomplishes what the user asked

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
Create a tour that guides the user to add an image using the "/" quick inserter.

RECOMMENDED APPROACH - Teach the natural workflow:
- Step 1: Click on the empty block placeholder ("Type / to choose a block") in the editor
  - Target: .block-editor-default-block-appender__content (constraints.inEditorIframe=true)
  - Content: "Click here where it says 'Type / to choose a block'"
  - Completion: clickTarget
- Step 2: Instruct user to type "/image" to search for the image block
  - Target the same placeholder or the active paragraph
  - Content: "Type <strong>/image</strong> to quickly find the Image block"
  - Completion: manual (user clicks Continue after typing)
- Step 3: Select the Image block from the dropdown
  - Target: button[role="option"] or .components-autocomplete__result (in main document, NOT iframe)
  - Content: "Click on the Image block to insert it"
  - Completion: elementAppear with selector [data-type="core/image"]
- Step 4: Show how to upload an image
  - Target: .block-editor-media-placeholder (constraints.inEditorIframe=true)
  - Content: "Now you can upload an image, choose from media library, or paste a URL"
  - Completion: manual

IMPORTANT CSS SELECTORS:
- Empty block placeholder (in iframe): .block-editor-default-block-appender__content
- Quick inserter dropdown: .components-autocomplete__results (NOT in iframe)
- Image block in quick inserter: button[role="option"]
- Image placeholder (in iframe): .block-editor-media-placeholder
- Upload button (in iframe): .components-form-file-upload button
- Block itself (in iframe): [data-type="core/image"]

Keep it educational - teach skills they can reuse!
INST,

			'add-video'     => <<<'INST'
Create a tour that guides the user to add a video using the "/" quick inserter.

RECOMMENDED APPROACH - Teach the natural workflow:
- Step 1: Click on the empty block placeholder in the editor
  - Target: .block-editor-default-block-appender__content (constraints.inEditorIframe=true)
- Step 2: Instruct user to type "/video"
  - Content: "Type <strong>/video</strong> to find the Video block"
  - Completion: manual
- Step 3: Select the Video block from the dropdown
  - Target: button[role="option"] (NOT in iframe)
- Step 4: Show the video upload options
  - Target: .block-editor-media-placeholder (constraints.inEditorIframe=true)

IMPORTANT CSS SELECTORS:
- Empty block placeholder (in iframe): .block-editor-default-block-appender__content
- Video placeholder (in iframe): .block-editor-media-placeholder
INST,

			'embed-youtube' => <<<'INST'
Create a tour that guides the user to embed a YouTube video.

Steps should include:
1. Open the block inserter (precondition: openInserter)
2. Search for "YouTube" - target the search input
3. Select the YouTube embed block
4. Show where to paste the YouTube URL

IMPORTANT CSS SELECTORS:
- Search input: .components-search-control__input
- YouTube block: .block-editor-block-types-list button.editor-block-list-item-embed-youtube
INST,

			'add-heading'   => <<<'INST'
Create a tour that guides the user to add a heading.
Steps should include:
1. Open the block inserter (or use /heading shortcut)
2. Select the Heading block
3. Explain heading levels (H2, H3, etc.)
4. Show how to change heading level if needed
INST,

			'create-list'   => <<<'INST'
Create a tour that guides the user to create a list.
Steps should include:
1. Open the block inserter
2. Select the List block
3. Explain how to add list items (Enter key)
4. Show how to switch between bulleted and numbered
INST,

			'add-button'    => <<<'INST'
Create a tour that guides the user to add a button.
Steps should include:
1. Open the block inserter
2. Search for and select the Buttons block
3. Show where to type button text
4. Explain how to add a link to the button
INST,

			'add-columns'   => <<<'INST'
Create a tour that guides the user to create a columns layout.
Steps should include:
1. Open the block inserter
2. Select the Columns block
3. Choose a column variation (2 columns, 3 columns, etc.)
4. Explain how to add content to each column
INST,

			'add-gallery'   => <<<'INST'
Create a tour that guides the user to create an image gallery.
Steps should include:
1. Open the block inserter
2. Select the Gallery block
3. Show how to select multiple images
4. Explain gallery arrangement options
INST,

			'format-text'   => <<<'INST'
Create a tour that guides the user through text formatting.
Steps should include:
1. Show how to select text in a paragraph
2. Explain the formatting toolbar (Bold, Italic)
3. Show how to add a link (Cmd/Ctrl+K or link button)
4. Mention keyboard shortcuts
INST,

			'add-quote'     => <<<'INST'
Create a tour that guides the user to add a quote block.
Steps should include:
1. Open the block inserter
2. Select the Quote block
3. Show where to type the quote text
4. Explain the citation field
INST,

			'add-table'     => <<<'INST'
Create a tour that guides the user to create a table.
Steps should include:
1. Open the block inserter
2. Select the Table block
3. Set the number of rows and columns
4. Show how to enter data in cells
INST,

			'add-cover'     => <<<'INST'
Create a tour that guides the user to add a cover image.
Steps should include:
1. Open the block inserter
2. Select the Cover block
3. Upload or select a background image
4. Show where to add overlay text
INST,
		];

		return $instructions[ $task_id ] ?? 'Create a helpful tour that accomplishes the selected task.';
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
