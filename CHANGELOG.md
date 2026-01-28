# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.1.0]: https://github.com/persoderlind/admin-coach-tours/releases/tag/v0.1.0
