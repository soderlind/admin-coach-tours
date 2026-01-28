## Plan: Admin Coach Tours MVP WordPress Plugin

Build a WordPress plugin enabling Educators to author interactive tours in Gutenberg and Pupils to run them with guided overlays, completion gating, and AI-assisted step drafting. Uses `@wordpress/data` store, captures locator bundles up to 3 ancestor levels prioritizing `data-*`/`id`, includes minimal AI settings page with sodium-encrypted keys, and REST-level tour scope filtering.

**Plugin:** Admin Coach Tours | **Slug:** `admin-coach-tours`

### Steps

1. **Scaffold plugin foundation** — Create [admin-coach-tours.php](admin-coach-tours.php) with plugin header (WP 6.8+, PHP 8.3+), PSR-4 autoloader via Composer, namespace `AdminCoachTours`, and bootstrap hooking into `plugins_loaded`; create [composer.json](composer.json) with `brain/monkey`, `phpunit/phpunit`, `wp-coding-standards/wpcs`; create [package.json](package.json) with `@wordpress/scripts`, `vitest@^4.0`, `@wordpress/eslint-plugin`; configure [phpcs.xml](phpcs.xml) for WordPress-Extra ruleset.

2. **Implement data model & storage** — Register `act_tour` CPT in [php/Cpt/ToursCpt.php](php/Cpt/ToursCpt.php) with `editor` and `post_types` scope meta fields; define Step JSON schema in [php/Validation/StepSchema.php](php/Validation/StepSchema.php) with `id`, `order`, `title`, `instruction`, `hint`, `target{locators[],constraints}`, `preconditions[]`, `completion{}`, `recovery[]`, `tags[]`, `version`; implement versioned save/load with migration support in [php/Storage/TourRepository.php](php/Storage/TourRepository.php) storing steps as `_act_steps` post meta.

3. **Create @wordpress/data store** — Implement [assets/js/store/index.js](assets/js/store/index.js) registering `admin-coach-tours` store via `createReduxStore`; create [assets/js/store/reducer.js](assets/js/store/reducer.js) managing `tours`, `currentTourId`, `currentStepIndex`, `mode` (educator/pupil), `completionSatisfied`, `isPickerActive`; create [assets/js/store/actions.js](assets/js/store/actions.js) with `loadTour`, `startTour`, `nextStep`, `repeatStep`, `skipStep`, `endTour`, `setCompletionSatisfied`, `activatePicker`; create [assets/js/store/selectors.js](assets/js/store/selectors.js) with `getCurrentTour`, `getCurrentStep`, `isCompletionSatisfied`, `getMode`.

4. **Build locator bundle & runtime resolver** — Implement [assets/js/runtime/resolveTarget.js](assets/js/runtime/resolveTarget.js) trying locators in weighted order (CSS → role+name → contextual), applying constraints (`visible`, `withinContainer`), disambiguating multiple matches via specificity score; capture bundles in [assets/js/runtime/captureLocatorBundle.js](assets/js/runtime/captureLocatorBundle.js) extracting `id`, `data-*`, role/aria, and CSS path up to 3 ancestor levels; define types in [assets/js/types/step.js](assets/js/types/step.js) using JSDoc typedefs.

5. **Implement preconditions & completion watchers** — Create [assets/js/runtime/applyPreconditions.js](assets/js/runtime/applyPreconditions.js) with enum handlers: `ensureEditor('block')`, `ensureSidebarOpen`, `selectSidebarTab('post'|'block')`, `openInserter`, `closeInserter` using `wp.data.dispatch('core/edit-post')`; create [assets/js/runtime/watchCompletion.js](assets/js/runtime/watchCompletion.js) returning unsubscribe function, supporting `clickTarget` (event listener), `domValueChanged` (MutationObserver), `wpData` (wp.data.subscribe) completions; create [assets/js/runtime/wpStoreHelpers.js](assets/js/runtime/wpStoreHelpers.js) wrapping common `wp.data` operations.

6. **Build Educator UI panel** — Create [assets/js/educator/EducatorSidebar.jsx](assets/js/educator/EducatorSidebar.jsx) using `PluginSidebar` from `@wordpress/editor`; create [assets/js/educator/StepList.jsx](assets/js/educator/StepList.jsx) with drag/drop reorder via `@wordpress/components` `Draggable`; create [assets/js/educator/StepEditor.jsx](assets/js/educator/StepEditor.jsx) with `TextControl`, `TextareaControl` for title/instruction/hint and "Pick Target" button; create [assets/js/educator/PickerOverlay.jsx](assets/js/educator/PickerOverlay.jsx) rendering full-screen overlay, highlighting hovered elements, capturing bundle on click; add "Test Step" action invoking resolver with success/failure feedback; add "Draft with AI" button calling REST endpoint and displaying structured suggestions for selective apply.

7. **Build Pupil UI overlay** — Create [assets/js/pupil/TourRunner.jsx](assets/js/pupil/TourRunner.jsx) orchestrating preconditions → resolve → highlight → watch completion flow with retry-once recovery; create [assets/js/pupil/CoachPanel.jsx](assets/js/pupil/CoachPanel.jsx) with step title/instruction/hint, Next button (disabled until `isCompletionSatisfied`), Repeat Step button (reapplies preconditions + re-highlights), Skip button (records skipped in progress); create [assets/js/pupil/Highlighter.js](assets/js/pupil/Highlighter.js) rendering spotlight overlay around target element with smooth transitions; show clear end-of-tour state with completion summary.

8. **Implement AI integration layer** — Create [php/Ai/AiProviderInterface.php](php/Ai/AiProviderInterface.php) defining `generateText(string $prompt): string`, `generateJson(string $prompt, array $schema): array`, `embed(string $text): array` (stub); create [php/Ai/AiManager.php](php/Ai/AiManager.php) loading configured provider from options; implement [php/Ai/Providers/OpenAiProvider.php](php/Ai/Providers/OpenAiProvider.php) using `wp_remote_post` to OpenAI API with response_format json_schema; implement [php/Ai/Providers/AnthropicProvider.php](php/Ai/Providers/AnthropicProvider.php) using Claude API; validate responses in [php/Validation/AiStepDraftSchema.php](php/Validation/AiStepDraftSchema.php) against strict schema, retry once with repair prompt on validation failure.

9. **Create REST endpoints & security** — Register routes in [php/Rest/Routes.php](php/Rest/Routes.php) under namespace `admin-coach-tours/v1`; implement [php/Rest/AiController.php](php/Rest/AiController.php) with `POST /ai/draft-step` accepting `{elementContext, postType, existingSteps}`, stripping nonces/tokens before sending to AI, returning `AiStepDraftOutput`; implement [php/Rest/TourController.php](php/Rest/TourController.php) with `GET /tours` supporting `?post_type=&editor=` query params for REST-level scope filtering; add capability checks in [php/Security/Capabilities.php](php/Security/Capabilities.php) mapping `edit_act_tours` to `manage_options` and `run_act_tours` to `read`; verify nonces via `wp_verify_nonce` on mutation endpoints.

10. **Add minimal settings page** — Create [php/Admin/SettingsPage.php](php/Admin/SettingsPage.php) registering `admin-coach-tours` settings page under Tools menu; use `register_setting` for `act_ai_provider` (select: openai/anthropic), `act_ai_api_key` (encrypted), `act_allow_post_content` (checkbox); implement [php/Admin/Encryption.php](php/Admin/Encryption.php) using `sodium_crypto_secretbox` with key derived from `wp_salt('auth')` for encrypting/decrypting API keys at rest.

11. **Write tests & CI configuration** — Create [tests/js/resolveTarget.test.js](tests/js/resolveTarget.test.js) testing locator preference order, visibility constraints, multiple-match disambiguation, recovery retry; create [tests/js/watchCompletion.test.js](tests/js/watchCompletion.test.js) mocking `wp.data.subscribe` for `wpData` completions, testing `clickTarget` and `domValueChanged`; create [tests/php/TourRepositoryTest.php](tests/php/TourRepositoryTest.php) testing save/load with Brain Monkey mocking `update_post_meta`/`get_post_meta`; create [tests/php/AiControllerTest.php](tests/php/AiControllerTest.php) testing capability checks, nonce verification, schema validation, retry-on-invalid-json; add `scripts` in package.json: `"lint": "wp-scripts lint-js"`, `"test:js": "vitest"`, `"test": "npm run test:js && composer test"`; add `scripts` in composer.json: `"lint": "phpcs"`, `"test": "phpunit"`.

12. **Document & provide fixtures** — Create [README.md](README.md) with requirements (WP 6.8+, PHP 8.3+), setup commands (`composer install`, `npm install`, `npm run build`), manual verification checklist (5 items from acceptance criteria); create [tests/fixtures/example-tour.json](tests/fixtures/example-tour.json) with 3-step tour demonstrating full Step schema including locator bundles, preconditions, and completion rules.

### File Structure Summary

```
admin-coach-tours/
├── admin-coach-tours.php
├── composer.json
├── package.json
├── phpcs.xml
├── vitest.config.js
├── README.md
├── php/
│   ├── Admin/
│   │   ├── SettingsPage.php
│   │   └── Encryption.php
│   ├── Ai/
│   │   ├── AiProviderInterface.php
│   │   ├── AiManager.php
│   │   └── Providers/
│   │       ├── OpenAiProvider.php
│   │       └── AnthropicProvider.php
│   ├── Cpt/
│   │   └── ToursCpt.php
│   ├── Rest/
│   │   ├── Routes.php
│   │   ├── AiController.php
│   │   └── TourController.php
│   ├── Security/
│   │   └── Capabilities.php
│   ├── Storage/
│   │   └── TourRepository.php
│   └── Validation/
│       ├── StepSchema.php
│       └── AiStepDraftSchema.php
├── assets/js/
│   ├── editor/
│   │   └── index.jsx
│   ├── educator/
│   │   ├── EducatorSidebar.jsx
│   │   ├── StepList.jsx
│   │   ├── StepEditor.jsx
│   │   └── PickerOverlay.jsx
│   ├── pupil/
│   │   ├── TourRunner.jsx
│   │   ├── CoachPanel.jsx
│   │   └── Highlighter.js
│   ├── runtime/
│   │   ├── resolveTarget.js
│   │   ├── captureLocatorBundle.js
│   │   ├── applyPreconditions.js
│   │   ├── watchCompletion.js
│   │   └── wpStoreHelpers.js
│   ├── store/
│   │   ├── index.js
│   │   ├── reducer.js
│   │   ├── actions.js
│   │   └── selectors.js
│   └── types/
│       ├── step.js
│       └── ai.js
├── assets/css/
│   ├── educator.scss
│   └── pupil.scss
└── tests/
    ├── js/
    │   ├── resolveTarget.test.js
    │   └── watchCompletion.test.js
    ├── php/
    │   ├── bootstrap.php
    │   ├── TourRepositoryTest.php
    │   └── AiControllerTest.php
    └── fixtures/
        └── example-tour.json
```
