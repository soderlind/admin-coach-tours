/**
 * Educator Entry Point.
 *
 * Registers the Educator sidebar plugin for the block editor.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { registerPlugin } from '@wordpress/plugins';

import EducatorSidebar from './EducatorSidebar.jsx';

// Register the educator plugin sidebar.
registerPlugin( 'admin-coach-tours-educator', {
	render: EducatorSidebar,
	icon: null, // Icon is set in the PluginSidebar component.
} );
