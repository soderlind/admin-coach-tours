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
│  • Dispatches REQUEST_AI_TOUR with context                                  │
│  • Passes failureContext on retry for AI learning                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REST API: POST /ai/generate-tour                         │
│                         (AiController.php)                                  │
│  • Sanitizes inputs                                                         │
│  • Checks cache (skips on retry)                                            │
│  • Builds system prompt                                                     │
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
│                        AI Provider (generate_tour)                          │
│  • OpenAI (gpt-4o)                                                          │
│  • Azure OpenAI                                                             │
│  • Anthropic (claude-3-5-sonnet)                                            │
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

### 1. AI Providers (`php/AI/`)

The plugin supports multiple AI providers through a common interface:

| Provider | Class | Model |
|----------|-------|-------|
| OpenAI | `OpenAiProvider.php` | gpt-4o |
| Azure OpenAI | `AzureOpenAiProvider.php` | Configurable |
| Anthropic | `AnthropicProvider.php` | claude-3-5-sonnet |

All providers implement `AiProviderInterface` with the key method:

```php
public function generate_tour(string $system_prompt, string $user_message = ''): array|\WP_Error;
```

**Provider Registration:**
```php
// Custom providers can be added via filter
add_filter('act_ai_providers', function($providers) {
    $providers['my-provider'] = new MyCustomProvider();
    return $providers;
});
```

### 2. Task Prompts (`php/AI/TaskPrompts.php`)

Defines 12 predefined tasks with optimized prompts:

| Category | Tasks |
|----------|-------|
| Media | add-image, add-video, add-gallery, add-cover |
| Text | add-heading, create-list, add-quote, add-table, format-text |
| Design | add-button, add-columns |
| Embed | embed-youtube |

Each task includes:
- **ID**: Unique identifier
- **Label**: Human-readable name
- **Category**: For UI grouping
- **Task-specific instructions**: Optimized step patterns

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

## System Prompt Structure

The AI receives a comprehensive prompt built from multiple sources:

```
┌────────────────────────────────────────────────────────┐
│  1. BASE INSTRUCTIONS                                  │
│     • Role definition                                  │
│     • Tour JSON format specification                   │
│     • Locator types (css, ariaLabel, wpBlock, etc.)   │
│     • Completion types (clickTarget, manual, etc.)    │
│     • Precondition types (openInserter, insertBlock)  │
│     • Selector reliability rules                       │
├────────────────────────────────────────────────────────┤
│  2. CURRENT CONTEXT                                    │
│     • Post type (post, page, etc.)                    │
│     • Task ID or "freeform"                           │
├────────────────────────────────────────────────────────┤
│  3. EDITOR STATE (from frontend)                       │
│     • Blocks in editor with targeting options         │
│     • Visible UI elements                             │
│     • Available starting points                       │
├────────────────────────────────────────────────────────┤
│  4. FAILURE CONTEXT (on retry only)                    │
│     • Which step failed                               │
│     • Selectors that didn't work                      │
│     • Instructions to use different approach          │
├────────────────────────────────────────────────────────┤
│  5. GUTENBERG REFERENCE (RAG)                          │
│     • Relevant block definitions                      │
│     • Proven selectors                                │
│     • UI element patterns                             │
├────────────────────────────────────────────────────────┤
│  6. TASK-SPECIFIC INSTRUCTIONS                         │
│     • Optimized step patterns for this task           │
│     • Known working selectors                         │
│     • Common pitfalls to avoid                        │
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

### First Step Targeting Rule

When generating tours to **add** a block, the AI is instructed to:

1. **ALWAYS target an empty paragraph** for the first step
2. **NEVER target existing content blocks** (images, headings, etc.)
3. Look for blocks marked `(empty, SELECTED)` in the editor state
4. Use `wpBlock: "selected"` for the first step

This ensures the tour teaches users to add *new* content rather than accidentally modifying existing content.

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

## Caching

Tours are cached to avoid redundant API calls:

- **Cache Key**: Hash of (taskId, query, postType, editorContext version)
- **TTL**: 1 hour (3600 seconds)
- **Cache Invalidation**: Version key changes when prompts are updated
- **Skip Cache**: When retry includes failure context

```php
// Cache key generation
$cache_key = 'act_tour_' . md5(serialize([
    $task_id,
    $query,
    $post_type,
    self::get_cache_version()
]));
```

## Security

### API Key Storage
- Keys encrypted with libsodium before storage
- `Encryption` class handles encrypt/decrypt
- Keys never logged or exposed in errors

### Input Sanitization
- All user inputs sanitized before use
- Editor context validated and sanitized
- Failure context sanitized before inclusion in prompt

### Capability Checks
- `act_use_ai` capability required for AI features
- REST endpoints verify authentication

## Extending the AI

### Custom Provider

```php
add_filter('act_ai_providers', function($providers) {
    $providers['my-provider'] = new class implements AiProviderInterface {
        public function get_id(): string { return 'my-provider'; }
        public function get_name(): string { return 'My Provider'; }
        public function is_configured(): bool { /* check config */ }
        public function generate_tour(string $system_prompt, string $user_message = ''): array|\WP_Error {
            // Call your AI API
            // Return ['title' => '...', 'steps' => [...]]
        }
        // ... implement other interface methods
    };
    return $providers;
});
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
| `php/AI/AiManager.php` | Singleton managing provider registration and selection |
| `php/AI/AiProviderInterface.php` | Contract for AI providers |
| `php/AI/OpenAiProvider.php` | OpenAI implementation |
| `php/AI/AzureOpenAiProvider.php` | Azure OpenAI implementation |
| `php/AI/AnthropicProvider.php` | Anthropic Claude implementation |
| `php/AI/TaskPrompts.php` | Task definitions and system prompts |
| `php/AI/GutenbergKnowledgeBase.php` | RAG context from static docs |
| `php/AI/data/gutenberg-blocks.json` | Block and UI element definitions |
| `php/Rest/AiController.php` | REST API endpoints for AI |
| `assets/js/runtime/gatherEditorContext.js` | Frontend context gathering |
| `assets/js/store/actions.js` | Redux actions including `requestAiTour` |
| `assets/js/store/controls.js` | Redux controls for API calls |
| `assets/js/pupil/PupilLauncher.jsx` | UI for requesting tours |
| `assets/js/pupil/TourRunner.jsx` | Tour execution and failure handling |
