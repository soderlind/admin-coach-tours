# Admin Coach Tours

[![Version](https://img.shields.io/badge/version-0.3.6-blue.svg)](https://github.com/soderlind/admin-coach-tours)
[![WordPress](https://img.shields.io/badge/WordPress-6.8%2B-blue.svg)](https://wordpress.org)
[![PHP](https://img.shields.io/badge/PHP-8.3%2B-purple.svg)](https://php.net)
[![License](https://img.shields.io/badge/license-GPL--2.0--or--later-green.svg)](https://www.gnu.org/licenses/gpl-2.0.html)

>NOTE: This plugin is currently in beta. 

AI-powered interactive tutorials for the WordPress block editor.

## Overview

Admin Coach Tours helps WordPress users learn the block editor through AI-generated step-by-step tutorials. Click **"Help me..."** in the editor, select a task or ask a question, and get an interactive guided tour tailored to your needs.



https://github.com/user-attachments/assets/f74c34d9-58ba-49fc-a13e-05f8eb98c0ce



## Features

- **AI-Generated Tours** — On-demand tutorials created by AI based on your request
- **12 Predefined Tasks** — Common tasks like adding images, videos, headings, and more
- **Freeform Questions** — Ask anything about the block editor
- **Interactive Overlay** — Visual highlighting guides you through each step
- **Smart Block Targeting** — Accurately identifies and highlights the correct elements
- **Automatic Progression** — Tours advance when you complete each action

## Requirements

- WordPress 6.8+
- PHP 8.3+
- sodium extension (for API key encryption)
- AI provider API key (OpenAI, Azure OpenAI, or Anthropic)

## Installation

1. Upload `admin-coach-tours` to `/wp-content/plugins/`
2. Activate the plugin
3. Go to **Tools → Coach Tours** to configure AI

## Setup

### Configure AI Provider

1. Navigate to **Tours → Settings**
2. Enable AI Features
3. Select your provider:
   - **OpenAI** — Add your API key
   - **Azure OpenAI** — Add your API key and endpoint URL
   - **Anthropic** — Add your API key
4. Save settings

## Usage

### Getting Help in the Editor

1. Open any post or page in the block editor
2. Click the **"Help me..."** button (bottom-right)
3. Choose from the options:

**Common Tasks:**
| Category | Tasks |
|----------|-------|
| Media | Add image, Add video, Create gallery, Add cover |
| Text | Add heading, Create list, Add quote, Create table |
| Design | Add button, Create columns |
| Embed | Embed YouTube |

**Or Ask a Question:**
Type any question about the block editor and press Enter.

4. Follow the highlighted steps to complete the task
5. Each step auto-advances when you perform the action

### Tour Controls

- **Previous/Next** — Navigate between steps
- **Skip** — Skip a step you already know
- **Stop** — Exit the tour at any time

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

- API keys encrypted with libsodium
- All endpoints require authentication
- Capability checks on all operations
- Input sanitization and output escaping

## License

GPL v2 or later — see [LICENSE](LICENSE) for details.

## Credits

- Built with [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts) and [@wordpress/data](https://www.npmjs.com/package/@wordpress/data)
- AI integration supports OpenAI, Azure OpenAI, and Anthropic
- RAG knowledge base includes pedagogical content from [Learn WordPress](https://learn.wordpress.org/learning-pathway/user/) courses
