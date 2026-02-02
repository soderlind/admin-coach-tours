=== Admin Coach Tours ===
Contributors: PerS
Tags: gutenberg, block editor, tutorial, guided tour, ai, learning
Requires at least: 6.8
Tested up to: 6.9
Requires PHP: 8.3
Stable tag: 0.4.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AI-powered interactive tutorials for the WordPress block editor. Get step-by-step guided tours to learn any task.

== Description ==

Admin Coach Tours helps WordPress users learn the block editor through AI-generated step-by-step tutorials. Click **"Help me..."** in the editor, select a task or ask a question, and get an interactive guided tour tailored to your needs.

= Features =

* **AI-Generated Tours** — On-demand tutorials created by AI based on your request
* **12 Predefined Tasks** — Common tasks like adding images, videos, headings, and more
* **Freeform Questions** — Ask anything about the block editor
* **Interactive Overlay** — Visual highlighting guides you through each step
* **Smart Block Targeting** — Accurately identifies and highlights the correct elements
* **Automatic Progression** — Tours advance when you complete each action
* **Localized AI Responses** — Tours are generated in your WordPress language

= Predefined Tasks =

**Media:**
* Add an image
* Add a video
* Create a gallery
* Add a cover image

**Text & Content:**
* Add a heading
* Create a list
* Add a quote
* Create a table
* Add a button

**Design & Layout:**
* Create columns
* Add a group block

**Embeds:**
* Embed a YouTube video

= Requirements =

* WordPress 6.8 or later
* PHP 8.3 or later
* sodium extension (for API key encryption)
* AI provider API key (OpenAI, Azure OpenAI, or Anthropic)

== Installation ==

1. Upload the `admin-coach-tours` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to **Tools → Coach Tours** to configure your AI provider

= Configure AI Provider =

1. Navigate to **Tools → Coach Tours**
2. Enable AI Features
3. Select your provider:
   * **OpenAI** — Add your API key
   * **Azure OpenAI** — Add endpoint URL, API key, and deployment name
   * **Anthropic** — Add your API key
4. Save settings

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

Admin Coach Tours supports:
* OpenAI (GPT-4 and GPT-4o models)
* Azure OpenAI
* Anthropic (Claude models)

= Are API keys stored securely? =

Yes, all API keys are encrypted using PHP's sodium extension before being stored in the database.

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
