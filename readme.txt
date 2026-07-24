=== Admin Coach Tours ===
Contributors: PerS
Tags: gutenberg, block editor, tutorial, guided tour, ai, learning
Requires at least: 7.0
Tested up to: 6.9
Requires PHP: 8.3
Stable tag: 0.5.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AI-powered interactive tutorials for the WordPress block editor. Get step-by-step guided tours to learn any task.

== Description ==

Admin Coach Tours helps WordPress users learn the block editor through AI-generated step-by-step tutorials. Click **"Help me..."** in the editor, select a task or ask a question, and get an interactive guided tour tailored to your needs.

= Features =

* **AI-Generated Tours** — On-demand tutorials created by AI based on your request
* **Ready-made Task Library** — 20+ common tasks like adding images, videos, headings, paragraphs, and more
* **Freeform Questions** — Ask anything about the block editor
* **Interactive Overlay** — Visual highlighting guides you through each step
* **Smart Block Targeting** — Accurately identifies and highlights the correct elements
* **Automatic Progression** — Tours advance when you complete each action
* **Localized AI Responses** — Tours are generated in your WordPress language

= Predefined Tasks =

**Text & Content:**
* Add a paragraph
* Add a heading
* Create a list
* Add a quote
* Create a table
* Format text (bold, italic, links)
* Add a code block
* Add a separator
* Add a details/accordion

**Media:**
* Add an image
* Add a video
* Create a gallery
* Add a cover image
* Add audio
* Add a file download

**Design & Layout:**
* Add a button
* Create columns
* Group blocks in a container
* Add spacing

**Embeds:**
* Embed a YouTube video
* Embed from a URL

= Requirements =

* WordPress 7.0 or later
* PHP 8.3 or later
* At least one WordPress AI provider connector configured

== Installation ==

= From a release zip (recommended) =

1. Download `admin-coach-tours.zip` from the latest GitHub release: https://github.com/soderlind/admin-coach-tours/releases/latest
2. In wp-admin, go to Plugins > Add New > Upload Plugin, choose the zip, and click Install Now.
3. Activate the plugin.
4. Go to **Tools → Coach Tours** to enable AI features.

= From source =

1. `git clone https://github.com/soderlind/admin-coach-tours.git`
2. `composer install --no-dev` and `npm ci && npm run build`
3. Copy the folder into `wp-content/plugins/` and activate it.

= Updates =

The plugin updates itself from GitHub releases — new versions appear under Plugins and Dashboard > Updates like any other plugin.

= Configure AI Provider =

1. Configure at least one WordPress AI provider connector
2. Navigate to **Tools → Coach Tours**
3. Enable AI Features
4. Optionally choose a preferred provider and model override
5. Save settings

== Usage ==

= Getting Help in the Editor =

1. Open any post or page in the block editor
2. Click the **"Help me..."** button (bottom-right corner)
3. Choose from:
   * **Common Tasks** — Select from predefined tutorials
   * **Ask a Question** — Type any question about the block editor
4. Follow the highlighted steps to complete the task
5. Each step auto-advances when you perform the action

= Tour Controls =

* **Previous/Next** — Navigate between steps
* **Continue** — Move to the next step manually
* **Finish** — Complete the tour
* Close button — Exit the tour at any time

== Frequently Asked Questions ==

= What AI providers are supported? =

Admin Coach Tours uses the WordPress AI connector, so it works with whatever AI provider connectors you have configured in WordPress (for example, an Azure AI Foundry or OpenAI connector). Configure at least one connector, then enable AI features in the plugin.

= Are API keys stored securely? =

This plugin does not store API keys. Keys are managed by the WordPress AI connector you configure; the plugin only calls the connector.

= Do I need to create my own tours? =

No! The AI generates tours on-demand based on your request. You can also create custom tours manually using the Educator mode.

= What languages are supported? =

The AI will generate tour instructions in your WordPress language. The plugin includes Norwegian (Bokmål) translations, and additional languages can be added.

= Can I use this on a multisite network? =

Yes, the plugin can be activated network-wide or on individual sites.

== Screenshots ==

1. The "Help me..." launcher button in the block editor
2. Task selection panel with predefined tasks and freeform question input
3. Interactive tour overlay highlighting the current step
4. AI Settings page for configuring your provider

== Changelog ==

= 0.5.0 =
* Changed: Reworked the AI layer to use the WordPress 7 AI Connector (wp_get_connectors / wp_ai_client_prompt); removed bundled providers and API-key encryption. Now requires WordPress 7.0+ and at least one configured AI provider connector.
* Changed: Refactored the AI tour-generation flow into deep modules; the REST controller is now a thin adapter.
* Changed: Slimmed the settings page to connector status, an enable toggle, and an optional provider/model override.
* Changed: Reordered task categories (Text first) and expanded the task list (Paragraph, Code, Separator, Details, Audio, File, Group, Spacer, Embed-from-URL).
* Added: Coach panel shows the "/command" as a header above the instruction.
* Added: Self-updates from GitHub releases via the WordPress Plugin GitHub Updater, plus release-zip build workflows.
* Added: Refocus the current block when a tour closes.
* Added: Finish the tour by clicking the highlighted block on the last step.
* Added: Hide the launcher when the editor is in code editor mode.
* Added: Stop the tour with a clear message when a different block than expected is inserted.
* Fixed: generate-tour REST route rejected null editorContext/failureContext.
* Fixed: wpBlock "selected" now falls back to the last-selected block so multi-step tours don't fail on confirmation steps.
* Fixed: Removed the arrow "Next" button that let users skip ahead before a block existed.
* Fixed: Tour copy no longer uses positional words ("below"/"above").

= 0.4.0 =
* Added: Localized AI responses - tours are now generated in the user's WordPress language
* Added: Language detection using WordPress format_code_lang() for accurate language names
* Added: wp_set_script_translations for pupil mode scripts
* Added: Norwegian (Bokmål) translation with full coverage
* Added: i18n npm scripts for translation workflow (make-pot, update-po, make-mo, make-json)
* Added: PHPUnit tests for locale functionality
* Fixed: Try Again button now properly reopens the launcher panel after tour failure
* Improved: Error messages now show the expected block type when selecting the wrong element

= 0.3.9 =
* Fixed: Cache key null error in AiController
* Improved: Coach panel modal is now larger and more readable

= 0.3.8 =
* Improved: Better error handling when user selects wrong block type
* Added: Block type detection from locators for clearer error messages

= 0.3.7 =
* Improved: Coach panel modal is now larger and more readable
* Improved: Better typography with larger font sizes
* Added: Gradient header background for better visual hierarchy

= 0.3.6 =
* Fixed: Tour transition race conditions
* Improved: Empty paragraph targeting for / quick inserter tours

= 0.3.0 =
* Added: AI-powered tour generation
* Added: Support for OpenAI, Azure OpenAI, and Anthropic providers
* Added: Predefined task library with 12 common tasks
* Added: Freeform question input

= 0.2.0 =
* Added: Educator mode for creating custom tours
* Added: Step editor with target picker
* Added: Tour testing functionality

= 0.1.0 =
* Initial release
* Basic tour runner with step-by-step overlay
* REST API for tour management

== Upgrade Notice ==

= 0.3.9 =
Tours now respect your WordPress language setting. Upgrade to get AI-generated instructions in your preferred language.

= 0.3.0 =
Major update with AI-powered tour generation. Configure your AI provider in Tools → Coach Tours.
