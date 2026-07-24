# Admin Coach Tours

[![Version](https://img.shields.io/badge/version-0.5.0-blue.svg)](https://github.com/soderlind/admin-coach-tours)
[![WordPress](https://img.shields.io/badge/WordPress-7.0%2B-blue.svg)](https://wordpress.org)
[![PHP](https://img.shields.io/badge/PHP-8.3%2B-purple.svg)](https://php.net)
[![License](https://img.shields.io/badge/license-GPL--2.0--or--later-green.svg)](https://www.gnu.org/licenses/gpl-2.0.html)

>NOTE: This plugin is currently in beta. 

AI-powered interactive tutorials for the WordPress block editor.

## Overview

Admin Coach Tours helps WordPress users learn the block editor through AI-generated step-by-step tutorials. Click **"Help me..."** in the editor, select a task or ask a question, and get an interactive guided tour tailored to your needs.

## Features

- **AI-Generated Tours** — On-demand tutorials created by AI based on your request
- **Ready-made Task Library** — 20+ common tasks like adding images, videos, headings, paragraphs, and more
- **Freeform Questions** — Ask anything about the block editor
- **Interactive Overlay** — Visual highlighting guides you through each step
- **Smart Block Targeting** — Accurately identifies and highlights the correct elements
- **Automatic Progression** — Tours advance when you complete each action

## Requirements

- WordPress 7.0+
- PHP 8.3+
- At least one WordPress AI provider connector configured

## Installation

### From a release zip (recommended)

1. Download `admin-coach-tours.zip` from the [latest release](https://github.com/soderlind/admin-coach-tours/releases/latest).
2. In wp-admin, go to **Plugins → Add New → Upload Plugin**, choose the zip, and click **Install Now**.
3. Activate the plugin.
4. Go to **Tools → Coach Tours** to enable AI.

### From source

```bash
git clone https://github.com/soderlind/admin-coach-tours.git
cd admin-coach-tours
composer install --no-dev
npm ci && npm run build
```

Copy the folder into `wp-content/plugins/` and activate it.

### Updates

The plugin updates itself from GitHub releases — new versions show up under **Plugins** and **Dashboard → Updates** like any other plugin (checked roughly every 6 hours).

## Setup

### Configure AI Provider

1. Configure at least one WordPress AI provider connector
2. Navigate to **Tools → Coach Tours**
3. Enable AI Features
4. Optionally choose a preferred provider and model override
5. Save settings

## Usage

### Getting Help in the Editor

1. Open any post or page in the block editor
2. Click the **"Help me..."** button (bottom-right)
3. Choose from the options:

**Common Tasks:**
| Category | Tasks |
|----------|-------|
| Text | Add paragraph, heading, list, quote, table; format text; code, separator, details |
| Media | Add image, video, gallery, cover, audio, file |
| Design | Add button, columns, group, spacer |
| Embed | Embed YouTube, embed from URL |

**Or Ask a Question:**
Type any question about the block editor and press Enter.

4. Follow the highlighted steps to complete the task
5. Each step auto-advances when you perform the action


## How It Works

1. **You ask** — Select a task or type a question
2. **AI generates** — The AI creates a custom tour with step-by-step instructions
3. **You follow** — Interactive overlay highlights each target element
4. **You learn** — Complete actions to progress through the tour

Tours are generated on-demand and not stored — each request creates a fresh, context-aware tutorial.

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wp-json/admin-coach-tours/v1/ai/tasks` | List available tasks |
| POST | `/wp-json/admin-coach-tours/v1/ai/tour` | Generate AI tour |
| GET | `/wp-json/admin-coach-tours/v1/ai/status` | Check AI availability |

## Development

### Setup

```bash
composer install
npm install
```

### Build

```bash
npm run build        # Production build
npm run start        # Development mode with watch
```

### Testing

```bash
composer test        # PHP tests
npm run test         # JavaScript tests
npm run test:watch   # Watch mode
```

### Linting

```bash
composer lint        # PHP (WPCS)
npm run lint         # JavaScript (ESLint)
```

### Architecture

See [docs/AI-ARCHITECTURE.md](docs/AI-ARCHITECTURE.md) for details on the AI tour generation architecture.

## Hooks

### Filters

| Filter | Description |
|--------|-------------|
| `act_ai_providers` | Register additional AI providers |
| `act_ai_tasks` | Modify available task definitions |
| `act_tour_data` | Filter tour data before display |

### Actions

| Action | Description |
|--------|-------------|
| `act_tour_started` | Fired when a tour starts |
| `act_tour_completed` | Fired when a tour completes |
| `act_step_completed` | Fired when a step completes |

## Capabilities

| Capability | Description | Default Roles |
|------------|-------------|---------------|
| `act_use_ai` | Use AI features | Administrator |
| `act_run_tours` | Run tours | All logged-in users |

## Security

- API keys are owned by the WordPress AI connector (not stored by this plugin)
- All endpoints require authentication
- Capability checks on all operations
- Input sanitization and output escaping

## License

GPL v2 or later — see [LICENSE](LICENSE) for details.

## Credits

- Built with [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts) and [@wordpress/data](https://www.npmjs.com/package/@wordpress/data)
- AI generation via the WordPress 7 AI Connector (`wp_get_connectors` / `wp_ai_client_prompt`)
- RAG knowledge base includes pedagogical content from [Learn WordPress](https://learn.wordpress.org/learning-pathway/user/) courses
