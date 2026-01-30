# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
