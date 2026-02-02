# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.9] - 2026-02-02

### Fixed

- **"Try Again" button now works after tour failure**: When a tour fails, the launcher panel auto-opens showing the error with working "Try Again" and "Dismiss" buttons
- **AI-powered retry**: Clicking "Try Again" sends failure context to AI so it can generate better selectors

### Improved

- **Clearer error messages**: When tour fails due to wrong block selection, error now says "Could not find the Image block. Make sure to insert or select the correct block, then try again."

## [0.3.8] - 2026-02-02

### Improved

- **Better error messages for wrong element selection**: When a tour step fails because the expected block type isn't found, the error now tells the user which block type is needed (e.g., "Please insert or select an Image block first")

## [0.3.7] - 2026-02-02

### Changed

- **Improved coach panel design**: Larger, more readable modal with 360px width, 16px header title, better spacing, subtle gradient header, and enhanced shadow
- **Better typography**: 14px body text with 1.6 line height for comfortable reading

### Fixed

- **Cache key null error**: Fixed fatal error when retrying AI tour generation with failure context (cache_tour was called with null cache_key)

## [0.3.6] - 2026-02-02

### Added

- **Error handling with retry**: Added "Try Again" and "Dismiss" buttons when AI tour generation fails
- **Retry for tasks loading errors**: Added retry button when tasks fail to load
- **Contextual retry for AI learning**: When a tour fails and user retries, the failure context (failed step, selectors that didn't work) is sent to AI so it can generate better selectors
- **Failure context in store**: New `lastFailureContext` state, `setLastFailureContext` action, and `getLastFailureContext` selector
- **Tour failure escalation**: If step retry fails, the entire tour is marked as failed with detailed context for the next attempt

### Changed

- **Skip cache on retry**: When retrying with failure context, cache is bypassed to get a fresh AI response
- **requestAiTour accepts failureContext**: Fourth parameter allows passing previous failure details

## [0.3.5] - 2026-02-01

### Added

- **Block tracking for multi-block pages**: Track newly inserted blocks via `__actLastAppearedBlockClientId` to correctly scope tours when multiple blocks of the same type exist
- **NEW element detection in watchElementAppear**: Only trigger on newly inserted blocks, ignoring existing ones
- **Cross-frame scroll handling**: Both highlight and CoachPanel now listen to iframe scroll events
- **Cache versioning**: Added version key to cache to invalidate stale AI responses when prompts change

### Fixed

- **Block scoping issue**: When adding a second image/video block, tour now correctly highlights the NEW block instead of an existing one
- **Highlight positioning after scroll**: Scroll element into view first, then apply highlight after 350ms delay
- **CoachPanel follows scroll**: Modal repositions correctly when iframe content scrolls
- **Blinking overlay**: Skip re-highlighting same element; only apply animation once per cycle
- **Proper scroll listener cleanup**: Track and clean up all scroll listeners including iframe windows

### Changed

- **Task prompts updated**: Use `[data-type="core/image"]` instead of `.block-editor-media-placeholder` for tighter highlight fit
- **Specificity scoring**: +100 bonus for elements within the tracked/selected block

## [0.3.4] - 2026-01-31

### Changed

- **Simplified tour controls**: Removed non-functional Pause button from UI
- **Cleaner control layout**: Removed Repeat button (kept "Try Again" for errors only)

### Fixed

- **Empty paragraph detection**: Fixed detection of WordPress 6.x RichTextData objects
  - Tours now correctly select existing empty paragraphs instead of appending new ones
  - Handles RichText `length`, `toString()`, and `toJSON()` methods

## [0.3.3] - 2026-01-31

### Added

- **Full-screen loading overlay**: Shows animated overlay during AI tour generation
  - Displays while AI is analyzing the editor and generating steps
  - Uses local state to work around React 18 automatic batching
  - Portal-rendered to document.body for proper z-index layering

### Changed

- **Updated dependencies**: Major version updates for WordPress packages
  - `@wordpress/block-editor` 14 → 15
  - `@wordpress/components` 29 → 32
  - `@wordpress/icons` 10 → 11 (icon renames: `edit` → `pencil`)
  - `@wordpress/i18n` 5 → 6
  - And other minor updates

### Fixed

- Loading overlay now persists during tour initialization (React 18 batching workaround)
- StepList icon updated from removed `edit` to `pencil` icon

## [0.3.2] - 2026-01-31

### Added

- **Dynamic block targeting**: AI now receives real DOM selectors discovered from the live editor
  - `gatherEditorContext` collects block-level DOM info (clientId, data-type, editable selectors)
  - AI prompt includes targeting options for each block (wpBlock, CSS selectors)
  - More reliable tours that adapt to different WordPress versions
- **Block focus on selection**: When selecting a block for tour, focus is set on the editable element
  - Scroll into view and set cursor position for immediate typing

### Changed

- **Removed "Previous" button**: Going backwards in AI tours doesn't work well because steps change editor state
  - Example: Inserting an image replaces the paragraph placeholder, can't go back
  - Tours now only allow forward progression

### Fixed

- Block selection now properly focuses the editable element
- AI uses discovered selectors instead of hardcoded ones

## [0.3.1] - 2026-01-31

### Added

- **Editor context for AI tours**: Gather current editor state to help AI generate accurate selectors
  - Collects visible blocks, UI state (inserter/sidebar), and verified CSS selectors
  - Detects empty block placeholder as priority starting point for block insertion
  - Sends context to AI for more reliable tour generation
- **Tour caching**: Cache AI-generated tours using WordPress transients
  - Cache key based on task, query, post type, and editor context
  - 24-hour cache expiration (filterable via `admin_coach_tours_cache_expiration`)
  - Instant response for repeated requests with same context
- **Dashicon support**: Task icons now render as proper WordPress Dashicons

### Changed

- **Preferred "/" workflow**: AI now teaches users the natural "/" quick inserter instead of auto-inserting blocks
  - Guides users to click empty placeholder and type "/image", "/video", etc.
  - Teaches transferable skills users can apply without tours
- Updated task instructions for add-image, add-video to use placeholder-first approach

### Fixed

- Task icons displayed as text instead of Dashicons
- AI prompt now emphasizes teaching over automation

## [0.3.0] - 2026-01-31

### Added

- **AI-generated tours**: Major feature pivot to AI-first pupil experience
  - Pupils can select from 12 predefined tasks (add image, add video, embed YouTube, etc.)
  - Freeform chat option for custom questions about the Gutenberg editor
  - AI generates complete step-by-step tours on demand
- **Gutenberg Knowledge Base**: RAG-style context injection for AI prompts
  - Static JSON with block definitions, selectors, workflows, and UI elements
  - `GutenbergKnowledgeBase.php` for relevance-based context retrieval
- **TaskPrompts system**: Predefined task definitions with system prompts
  - 12 tasks across 4 categories: media, content, layout, formatting
  - Comprehensive tour JSON schema for structured AI output
- **PupilLauncher component**: Floating action button with dropdown panel
  - Tab interface for "Common Tasks" and "Ask a Question"
  - Real-time loading states and error handling
- **Ephemeral tours**: AI-generated tours are in-memory only
  - New store actions: `requestAiTour`, `receiveEphemeralTour`, `clearEphemeralTour`
  - Tours automatically start after generation

### Changed

- **Educator mode hidden**: CPT menu removed from admin (functional but not visible)
- Tours focus shifted from educator-created to AI-generated
- Pupil script now receives `aiAvailable` flag for conditional rendering
- Updated version references throughout codebase

### REST API

- `GET /admin-coach-tours/v1/ai/tasks` - List available predefined tasks
- `POST /admin-coach-tours/v1/ai/generate-tour` - Generate tour from task ID or freeform query

## [0.2.1] - 2026-01-30

### Added

- **CPT-based educator mode**: Tour authoring now uses the `act_tour` block editor
  - Educator sidebar auto-opens when editing Coach Tours
  - Asset loading split: educator on `act_tour`, pupil on other post types

### Changed

- Picker overlay uses 60fps throttling and CSS transitions for smooth highlighting
- AI draft generation now receives full element context (tag name, ARIA labels, text content)

### Fixed

- Fixed store not registered error by importing store in educator entry point
- Fixed picker click not capturing elements (use ref instead of stale state)
- Fixed `setCurrentTour` not creating tour in store before setting as current
- Fixed AI providers reading from wrong option keys (`act_ai_*` individual options)
- Fixed API key encryption not applied when saving settings
- Fixed element context not saved when updating existing step target

## [0.2.0] - 2026-01-30

### Added

- **`wpBlock` locator type**: Target blocks directly using WordPress data layer
  - Values: `first`, `last`, `selected`, `type:blockName`, `type:blockName:index`, `inserted:markerId`
- **`insertBlock` precondition**: Insert blocks before step execution
  - Automatically reuses previously inserted blocks when navigating back/forward
  - Prevents duplicate blocks from accumulating during navigation
- **Educator sidebar styling**: New `educator.css` with polished UI
  - Button groups for side-by-side layouts
  - Step item cards with drag handles
  - Tour status badges
  - Responsive design for narrow sidebars
- **Pupil mode CSS**: Dedicated `pupil.css` for tour overlay styling
- **TypeScript types**: Full type definitions in `assets/js/types/index.ts`
- **StepEditor component**: Form for editing step properties (TypeScript)
- **StepList component**: Sortable step list with @dnd-kit (TypeScript)
- **Educator guide documentation**: `docs/EDUCATOR-GUIDE.md` with best practices

### Changed

- Step validation now allows empty locators and titles for draft steps
- Completion types are now properly preserved through sanitization (fixed camelCase handling)
- Block editor iframe detection improved for Gutenberg 6.8+
- Better element context capture for AI drafting

### Fixed

- Fixed `sanitize_key()` lowercasing precondition types (now maps back to camelCase)
- Fixed step persistence losing data on save (direct DB write to bypass sanitize_callback)
- Fixed race condition with `clickTarget` completion firing too early
- Fixed block reuse when navigating backward in tour steps
- Fixed editor iframe detection for iframed Gutenberg editor

## [0.1.1] - 2026-01-28

### Added

- Azure OpenAI provider support with endpoint URL, deployment name, and API version configuration

### Fixed

- Fixed undefined constant `ACT_VERSION` error in SettingsPage (now uses `\AdminCoachTours\VERSION`)
- Fixed static method call errors in `Routes::init()` and `SettingsPage::init()`
- Fixed `TourRepository::get_instance()` undefined method error (now uses static methods)
- Fixed Tours menu not appearing (corrected CPT registration with `show_in_menu => true` and standard capabilities)

## [0.1.0] - 2026-01-28

### Added

- Initial MVP release
- **Educator Mode**: Create and edit tours in the Gutenberg block editor
  - Sidebar panel for tour management
  - Step list with drag-and-drop reordering (@dnd-kit)
  - Element picker overlay for target selection
  - Step editor with title, content, completion type configuration
  - AI-powered step draft generation (OpenAI/Anthropic)
- **Pupil Mode**: Run tours with interactive overlay
  - Floating draggable coach panel
  - Visual element highlighting with pulse animation
  - Progress tracking and step navigation
  - Repeat/pause/resume controls
  - Auto-advance on completion condition met
- **Data Model**
  - Custom post type `act_tour` for tour storage
  - JSON meta `_act_steps` for step data
  - Step schema validation
  - Tour repository with CRUD operations
- **@wordpress/data Store**
  - Store name: `admin-coach-tours`
  - Actions: fetchTours, startTour, nextStep, previousStep, requestAiDraft, etc.
  - Selectors for all state access
  - Async resolvers for API fetching
- **Locator System**
  - Multi-strategy element resolution (CSS, role, testId, dataAttribute, ariaLabel, contextual)
  - Weighted locator prioritization
  - Capture up to 3 ancestor levels
  - Stable class filtering (excludes generated classes)
- **Preconditions** (11 types)
  - ensureEditor, ensureSidebarOpen/Closed, selectSidebarTab
  - openInserter, closeInserter, selectBlock
  - focusElement, scrollIntoView, openModal, closeModal
- **Completion Watchers** (7 types)
  - clickTarget, domValueChanged, wpData, manual
  - elementAppear, elementDisappear, customEvent
- **AI Integration**
  - Provider-agnostic interface
  - OpenAI provider (gpt-4o-mini default)
  - Anthropic provider (claude-3-haiku default)
  - Encrypted API key storage (sodium)
- **REST API**
  - Tours CRUD endpoints
  - Steps management endpoints
  - AI draft generation endpoint
  - Capability-based permission checks
- **Settings Page**
  - Enable/disable pupil mode
  - AI provider selection
  - API key configuration (encrypted)
- **Security**
  - Custom capabilities (act_edit_tours, act_run_tours, act_use_ai)
  - Sodium encryption for sensitive data
  - Nonce verification on all requests
  - Input sanitization and output escaping
- **Testing**
  - PHPUnit tests with Brain Monkey
  - Vitest tests for JS runtime
  - GitHub Actions CI workflow
- **Documentation**
  - README with usage instructions
  - Example tour fixture

### Dependencies

- WordPress 6.8+
- PHP 8.3+
- sodium extension

[0.2.0]: https://github.com/persoderlind/admin-coach-tours/releases/tag/v0.2.0
[0.1.1]: https://github.com/persoderlind/admin-coach-tours/releases/tag/v0.1.1
[0.1.0]: https://github.com/persoderlind/admin-coach-tours/releases/tag/v0.1.0
