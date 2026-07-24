# AI Architecture

This document explains how Admin Coach Tours uses AI to generate interactive tutorials for the WordPress block editor.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              User Request                                   │
│                    ("Help me add an image" or custom query)                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PupilLauncher (React)                             │
│  • Gathers editor context (blocks, UI state, selectors)                     │
│  • Tracks last request for retry functionality                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Redux Store (requestAiTour)                         │
│  • Dispatches REQUEST_AI_TOUR with context (+ locale, failureContext)       │
│  • Task list fetched via the store control (fetchAiTasks → /ai/tasks)       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REST API: POST /ai/generate-tour                         │
│                    AiController.php (thin HTTP adapter)                     │
│  • TourRequest::from_rest() sanitizes the full input surface                │
│  • Delegates to TourGenerator; maps results/errors to HTTP                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TourGenerator (deep module)                              │
│  • Cache lookup (skips on retry)                                            │
│  • Retrieval (RAG) + prompt assembly + validation                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
          ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
          │ Gutenberg   │    │   Task      │    │  Editor     │
          │ Knowledge   │    │  Prompts    │    │  Context    │
          │ Base (RAG)  │    │             │    │             │
          └─────────────┘    └─────────────┘    └─────────────┘
                    │                 │                 │
                    └─────────────────┴─────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  WordPress AI Connector (via AiManager)                     │
│  • wp_get_connectors() detects configured AI provider connectors            │
│  • wp_ai_client_prompt(...)->generate_text() performs generation            │
│  • Provider/model resolved from options + filters                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Generated Tour (JSON)                             │
│  { title, steps: [{ id, target, content, completion, preconditions }] }     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TourRunner (React)                                │
│  • Resolves element targets                                                 │
│  • Applies highlights                                                       │
│  • Watches for completion                                                   │
│  • Reports failures for retry learning                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. AI Connector & backend modules (`php/AI/`, `php/Rest/`)

As of 0.5.0 the plugin no longer bundles its own providers. It uses the
**WordPress 7 AI Connector** — the site owner configures an AI provider once in
WordPress, and the plugin calls it without managing API keys.

| Module | Responsibility |
|--------|----------------|
| `AiManager` | Thin orchestrator over `wp_get_connectors()` / `wp_ai_client_prompt()`. Detects configured connectors, resolves provider/model, calls `generate_text()`, parses JSON (tolerating code fences), validates output. |
| `TourRequest` | Immutable value object; `from_rest()` owns all input sanitization (including `editorContext`/`failureContext`). |
| `TourGenerator` | Deep module `generate(TourRequest): array\|WP_Error` — owns caching, RAG retrieval, prompt assembly, the AI call, and validation. |
| `TourSchema` | Single source of truth for the allowed locator / precondition / completion types, shared by the prompt schema and output validation. |
| `AiController` | Thin HTTP adapter: build `TourRequest`, call `TourGenerator`, map results/errors to HTTP. |

**Availability:** AI is available when `act_ai_enabled` is on *and* at least one
AI provider connector is configured. Provider/model selection is resolved via
the `act_ai_provider` / `act_ai_model` options, overridable with filters (see
[Extending the AI](#extending-the-ai)).

```php
// Generation happens through the WordPress AI client:
$text = wp_ai_client_prompt( $user_message )
    ->using_system_instruction( $system_prompt )
    ->using_temperature( 0.7 )
    ->using_provider( $connector_id ) // optional
    ->generate_text();
```

### 2. Task Prompts (`php/AI/TaskPrompts.php`)

Defines the predefined tasks with optimized prompts. Categories are displayed
Text-first in the launcher:

| Category | Tasks |
|----------|-------|
| Text & Content | add-paragraph, add-heading, create-list, add-quote, add-table, format-text, add-code, add-separator, add-details |
| Media | add-image, add-video, add-gallery, add-cover, add-audio, add-file |
| Design & Layout | add-button, add-columns, add-group, add-spacer |
| Embed | embed-youtube, embed-url |

Each task includes:
- **ID**: Unique identifier
- **Label**: Human-readable name
- **Category**: For UI grouping
- **Task-specific instructions**: Optimized step patterns (falls back to a generic "/" quick-inserter pattern when a task has none)

### 3. Gutenberg Knowledge Base (`php/AI/GutenbergKnowledgeBase.php`)

Provides **Retrieval-Augmented Generation (RAG)** context from static documentation:

**Data Source:** `php/AI/data/gutenberg-blocks.json`

Contains:
- Block definitions with CSS selectors
- UI element selectors
- Common actions and their selectors
- Formatting toolbar options

**Relevance Scoring:**
- Searches by keywords in block names, descriptions, and categories
- Returns top N most relevant blocks
- Includes proven CSS selectors for each block

### 4. Editor Context Gathering (`assets/js/runtime/gatherEditorContext.js`)

Before each AI request, the frontend gathers real-time context:

```javascript
{
  editorBlocks: [
    {
      name: "core/paragraph",
      isEmpty: true,
      isSelected: true,
      clientId: "abc123",
      domInfo: {
        dataType: "core/paragraph",
        editableSelector: "[data-block='abc123'] .block-editor-rich-text__editable"
      }
    }
  ],
  availableBlocks: [ "core/paragraph", "core/heading", "core/image" ],
  visibleElements: {
    inserterOpen: false,
    sidebarOpen: true,
    hasSelectedBlock: true
  },
  uiSamples: {
    inserterButton: { selector: ".editor-document-tools__inserter-toggle", visible: true },
    emptyBlockPlaceholder: { selector: "[data-empty='true']", visible: true, inIframe: true }
  }
}
```

This context helps the AI:
- Target the correct elements
- Know which blocks already exist
- Detect if the user can use "/" quick insert
- Avoid blocks the site has disabled (see [Disabled blocks](#disabled-blocks))

### Disabled blocks

The frontend reports the `core/*` blocks the editor can actually insert
(`availableBlocks`), which reflects unregistered blocks and `allowedBlockTypes`
restrictions. The backend uses this to exclude disabled blocks from tours:

- `GutenbergKnowledgeBase` drops disabled blocks from the RAG context.
- The prompt lists disabled blocks under `DISABLED BLOCKS` with a hard rule
  never to reference them.
- A predefined task whose target block is disabled is refused up front with a
  `act_block_disabled` error (HTTP 409) instead of generating a broken tour.
- `BlockAvailability` resolves inner/variation blocks to their insertable
  parent (e.g. `core/button` → `core/buttons`). An empty `availableBlocks`
  (older client) disables nothing.

## System Prompt Structure

The AI receives a comprehensive prompt built from multiple sources:

```
┌────────────────────────────────────────────────────────┐
│  1. BASE INSTRUCTIONS                                  │
│     • Role definition                                  │
│     • Tour JSON format specification                   │
│     • Locator types (css, ariaLabel, wpBlock, etc.)    │
│     • Completion types (clickTarget, manual, etc.)     │
│     • Precondition types (openInserter, insertBlock)   │
│     • Selector reliability rules                       │
├────────────────────────────────────────────────────────┤
│  2. CURRENT CONTEXT                                    │
│     • Post type (post, page, etc.)                     │
│     • Task ID or "freeform"                            │
├────────────────────────────────────────────────────────┤
│  3. EDITOR STATE (from frontend)                       │
│     • Blocks in editor with targeting options          │
│     • Visible UI elements                              │
│     • Available starting points                        │
├────────────────────────────────────────────────────────┤
│  4. FAILURE CONTEXT (on retry only)                    │
│     • Which step failed                                │
│     • Selectors that didn't work                       │
│     • Instructions to use different approach           │
├────────────────────────────────────────────────────────┤
│  5. GUTENBERG REFERENCE (RAG)                          │
│     • Relevant block definitions                       │
│     • Proven selectors                                 │
│     • UI element patterns                              │
├────────────────────────────────────────────────────────┤
│  6. TASK-SPECIFIC INSTRUCTIONS                         │
│     • Optimized step patterns for this task            │
│     • Known working selectors                          │
│     • Common pitfalls to avoid                         │
└────────────────────────────────────────────────────────┘
```

## Tour JSON Format

The AI generates tours in this structure:

```json
{
  "title": "Add an Image",
  "steps": [
    {
      "id": "type-slash-image",
      "order": 0,
      "title": "Type /image",
      "content": "<p>Click in the empty paragraph and type <strong>/image</strong>, then press Enter.</p>",
      "target": {
        "locators": [
          { "type": "css", "value": "[data-empty='true']", "weight": 80 },
          { "type": "wpBlock", "value": "selected", "weight": 60, "fallback": true }
        ],
        "constraints": {
          "visible": true,
          "inEditorIframe": true
        }
      },
      "preconditions": [],
      "completion": {
        "type": "elementAppear",
        "params": { "selector": "[data-type='core/image']" }
      }
    },
    {
      "id": "upload-image",
      "order": 1,
      "title": "Upload your image",
      "content": "<p>Click <strong>Upload</strong> to select an image from your computer.</p>",
      "target": {
        "locators": [
          { "type": "css", "value": "[data-type='core/image']", "weight": 80 }
        ],
        "constraints": {
          "visible": true,
          "inEditorIframe": true,
          "scopeToSelectedBlock": true
        }
      },
      "preconditions": [],
      "completion": { "type": "manual" }
    }
  ]
}
```

### Locator Types

| Type | Description | Example |
|------|-------------|---------|
| `css` | CSS selector | `.editor-block-list-item-image` |
| `ariaLabel` | aria-label attribute | `Toggle block inserter` |
| `wpBlock` | Block targeting | `selected`, `first`, `type:core/paragraph` |
| `testId` | data-testid attribute | `publish-button` |
| `role` | ARIA role with label | `button:Add block` |

### Completion Types

| Type | Description |
|------|-------------|
| `clickTarget` | User clicks the highlighted element |
| `manual` | User clicks "Continue" button |
| `elementAppear` | Wait for element to appear (with `params.selector`) |
| `elementDisappear` | Wait for element to disappear |
| `domValueChanged` | Wait for input value to change |
| `wpData` | Wait for wp.data store change |

### Preconditions

| Type | Description |
|------|-------------|
| `ensureEditor` | Wait for editor to be ready |
| `openInserter` | Open the block inserter panel |
| `closeInserter` | Close the block inserter panel |
| `ensureSidebarOpen` | Open the settings sidebar |
| `insertBlock` | Insert a block (with `params.blockName`) |

## Contextual Retry (AI Learning)

When a tour fails and the user clicks "Try Again", the plugin sends failure context to help the AI learn:

```
⚠️ PREVIOUS ATTEMPT FAILED - PLEASE FIX:

The previous tour generation failed at step 2.
Step title: "Select the image block"
Error: Target element not found

The following selectors DID NOT WORK:
  ❌ css: ".block-editor-media-placeholder"
  ❌ ariaLabel: "Upload"

REQUIREMENTS FOR THIS RETRY:
1. Use DIFFERENT selectors than the ones that failed
2. Prefer more general, reliable selectors (aria-label, data-type attributes)
3. Consider if the step order is correct - maybe a precondition is missing
4. Double-check inEditorIframe constraint
```

**Flow:**
1. Tour fails at a step (target not found)
2. User clicks "Try Again" once → Step retries
3. If retry fails → `TourRunner` stores failure context in Redux
4. `PupilLauncher` passes failure context to `requestAiTour`
5. Backend includes failure context in AI prompt
6. AI generates tour avoiding the failed selectors

**Divergence abort:** if a step expects a specific block but the user inserted a
different one (e.g. asked for an Image, added a Gallery), retrying can't succeed.
`TourRunner` detects this and stops the tour with a clear message instead of the
"Try Again" loop.

## Caching

Tours are cached to avoid redundant API calls:

- **Cache Key**: Hash of (taskId, query, postType, cache-significant editorContext, version)
- **TTL**: 24 hours (`DAY_IN_SECONDS`), filterable via `admin_coach_tours_cache_expiration`
- **Cache Invalidation**: `TourGenerator::CACHE_VERSION` is bumped when prompts change
- **Skip Cache**: When the request includes failure context (a contextual retry)

Caching lives in `TourGenerator` (not the REST controller):

```php
// Cache key is built from the cache-significant parts of the TourRequest
$cache_key = 'act_tour_' . md5( wp_json_encode( $key_data ) );
```

## Security

### API Key Storage
- API keys are **owned by the WordPress AI connector**, not this plugin
- The plugin never stores, encrypts, logs, or exposes provider keys
- Legacy encrypted-key options from earlier versions are removed on upgrade/uninstall

### Input Sanitization
- All user inputs sanitized before use
- Editor context validated and sanitized
- Failure context sanitized before inclusion in prompt

### Capability Checks
- `act_use_ai` capability required for AI features
- REST endpoints verify authentication

## Extending the AI

### Provider / model selection

Providers are configured in WordPress as AI connectors. This plugin only
chooses which configured connector to use, overridable via filters:

```php
// Force a specific connector (provider) ID; '' = auto (first configured).
add_filter('admin_coach_tours_ai_provider_id', fn() => 'azure-ai-foundry');

// Force a specific model ID; '' = provider default.
add_filter('admin_coach_tours_ai_model', fn() => 'gpt-4.1');

// Override connector-availability detection (return bool, or null to defer).
add_filter('admin_coach_tours_ai_connector_configured', fn() => true);
```

### Custom Tasks

```php
add_filter('act_ai_tasks', function($tasks) {
    $tasks[] = [
        'id' => 'my-custom-task',
        'label' => 'Do something custom',
        'icon' => 'admin-generic',
        'category' => 'custom',
        'description' => 'Learn how to do something custom.',
    ];
    return $tasks;
});
```

### Custom Knowledge Base

```php
add_filter('act_gutenberg_knowledge', function($data) {
    $data['blocks'][] = [
        'name' => 'my-plugin/custom-block',
        'description' => 'A custom block from my plugin',
        'selector' => '[data-type="my-plugin/custom-block"]',
        'keywords' => ['custom', 'special'],
    ];
    return $data;
});
```

## Files Reference

| File | Purpose |
|------|---------|
| `php/AI/AiManager.php` | Orchestrator over the WordPress AI connector (`wp_get_connectors` / `wp_ai_client_prompt`) |
| `php/AI/TourRequest.php` | Immutable, sanitized tour-generation request (`from_rest`) |
| `php/AI/TourGenerator.php` | Deep module: cache, RAG, prompt assembly, AI call, validation |
| `php/AI/TourSchema.php` | Allowed locator/precondition/completion types (single source) |
| `php/AI/TaskPrompts.php` | Task definitions and system prompts |
| `php/AI/GutenbergKnowledgeBase.php` | RAG context from static docs |
| `php/AI/data/gutenberg-blocks.json` | Block and UI element definitions |
| `php/Rest/AiController.php` | Thin HTTP adapter for the AI REST endpoints |
| `assets/js/runtime/gatherEditorContext.js` | Frontend context gathering |
| `assets/js/store/actions.js` | Redux actions including `requestAiTour` and `fetchAiTasks` |
| `assets/js/store/controls.js` | Redux controls for API calls |
| `assets/js/pupil/PupilLauncher.jsx` | UI for requesting tours |
| `assets/js/pupil/TourRunner.jsx` | Tour execution and failure handling |
