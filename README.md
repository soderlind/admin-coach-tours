# Admin Coach Tours

Interactive guided tours for WordPress admin interfaces.

## Description

Admin Coach Tours enables **Educators** to create interactive guided tours within wp-admin (Gutenberg block editor) and allows **Pupils** to run these tours with a guided overlay experience.

### Features

- **Educator Mode**: Create and edit tours directly in the block editor
  - Pick UI elements as tour step targets
  - Reorder, add, and delete steps with drag-and-drop
  - AI-powered step draft generation (optional)
  - Define completion conditions for each step

- **Pupil Mode**: Run tours with an interactive overlay
  - Visual highlighting of target elements
  - Progress tracking with step-by-step navigation
  - Repeat steps until confident
  - Automatic progression on completion

## Requirements

- WordPress 6.8+
- PHP 8.3+
- sodium extension (for API key encryption)

## Installation

1. Upload the `admin-coach-tours` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu
3. Navigate to **Tours** in the admin menu

## Usage

### Creating a Tour (Educator)

1. Go to **Tours → Add New**
2. Open the Tour Editor sidebar panel
3. Click **Add Step** to create a new step
4. Use the **Pick Target** button to select a UI element
5. Configure the step content and completion type
6. Save the tour

### Running a Tour (Pupil)

1. Tours appear automatically based on their scope settings
2. Click **Start Tour** to begin
3. Follow the highlighted elements
4. Complete each step's action to progress
5. Click **Done** when finished

### AI Features (Optional)

1. Go to **Tours → Settings**
2. Enable AI Features
3. Configure your AI provider (OpenAI, Azure OpenAI, or Anthropic)
4. Add your API key (and endpoint URL for Azure OpenAI)
5. Use the **AI Draft** button when editing steps

## Step Completion Types

| Type | Description |
|------|-------------|
| `clickTarget` | Complete when the target element is clicked |
| `domValueChanged` | Complete when an input value changes |
| `wpData` | Complete when a @wordpress/data store state changes |
| `manual` | User manually clicks "Done" |
| `elementAppear` | Complete when a specific element appears |
| `elementDisappear` | Complete when a specific element disappears |
| `customEvent` | Complete when a custom DOM event fires |

## Preconditions

Preconditions ensure the UI is in the correct state before showing a step:

- `ensureEditor` - Ensure specific editor type is active
- `ensureSidebarOpen` - Open the sidebar
- `ensureSidebarClosed` - Close the sidebar
- `selectSidebarTab` - Select a specific sidebar tab
- `openInserter` - Open the block inserter
- `closeInserter` - Close the block inserter
- `selectBlock` - Select a specific block
- `focusElement` - Focus a specific element
- `scrollIntoView` - Scroll element into view
- `openModal` - Open a modal
- `closeModal` - Close a modal

## REST API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wp-json/admin-coach-tours/v1/tours` | List tours |
| POST | `/wp-json/admin-coach-tours/v1/tours` | Create tour |
| GET | `/wp-json/admin-coach-tours/v1/tours/{id}` | Get tour |
| PUT | `/wp-json/admin-coach-tours/v1/tours/{id}` | Update tour |
| DELETE | `/wp-json/admin-coach-tours/v1/tours/{id}` | Delete tour |
| POST | `/wp-json/admin-coach-tours/v1/ai/generate-draft` | Generate AI draft |
| GET | `/wp-json/admin-coach-tours/v1/ai/status` | Get AI status |

### Query Parameters

Tours can be filtered by:

- `post_type` - Filter by post type scope
- `editor` - Filter by editor type (`block` or `classic`)
- `status` - Filter by status (`publish`, `draft`, `any`)

## Development

### Setup

```bash
composer install
npm install
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run start
```

### Testing

```bash
# PHP tests
composer test

# JavaScript tests
npm run test

# Watch mode
npm run test:watch
```

### Linting

```bash
# PHP
composer lint

# JavaScript
npm run lint
```

## File Structure

```
admin-coach-tours/
├── admin-coach-tours.php    # Main plugin file
├── php/
│   ├── AI/                  # AI integration
│   ├── Cpt/                 # Custom post type
│   ├── Rest/                # REST API endpoints
│   ├── Security/            # Capabilities & encryption
│   ├── Settings/            # Settings page
│   ├── Storage/             # Data repository
│   └── Validation/          # Schema validation
├── assets/
│   ├── js/
│   │   ├── educator/        # Educator UI components
│   │   ├── pupil/           # Pupil UI components
│   │   ├── runtime/         # Core runtime utilities
│   │   ├── store/           # @wordpress/data store
│   │   └── types/           # Type definitions
│   └── css/                 # Stylesheets
└── tests/
    ├── php/                 # PHPUnit tests
    ├── js/                  # Vitest tests
    └── fixtures/            # Test fixtures
```

## Hooks

### Actions

- `act_tour_started` - Fired when a tour starts
- `act_tour_completed` - Fired when a tour completes
- `act_step_completed` - Fired when a step completes

### Filters

- `act_tour_data` - Filter tour data before display
- `act_step_data` - Filter step data before display
- `act_ai_providers` - Register additional AI providers
- `act_locator_types` - Register additional locator types
- `act_completion_types` - Register additional completion types

## Capabilities

| Capability | Description | Default Roles |
|------------|-------------|---------------|
| `act_edit_tours` | Create and edit tours | Administrator, Editor |
| `act_run_tours` | Run tours | All logged-in users |
| `act_use_ai` | Use AI features | Administrator |

## Security

- API keys are encrypted using libsodium
- All REST endpoints require authentication
- Nonce verification on all AJAX requests
- Capability checks on all operations
- Input sanitization and output escaping

## License

GPL v2 or later

## Credits

Built with:
- [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts)
- [@wordpress/data](https://www.npmjs.com/package/@wordpress/data)
- [@dnd-kit](https://dndkit.com/)
