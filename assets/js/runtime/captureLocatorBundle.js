/**
 * Capture locator bundle from a DOM element.
 *
 * Extracts multiple locator strategies from an element, prioritizing
 * stable identifiers (id, data-*) over generated classes.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

/**
 * @typedef {import('../types/step.js').Locator} Locator
 * @typedef {import('../types/step.js').Target} Target
 */

/**
 * List of class name patterns to ignore (typically generated).
 */
const IGNORED_CLASS_PATTERNS = [
	/^css-/i, // CSS-in-JS.
	/^sc-/i, // styled-components.
	/^emotion-/i, // Emotion.
	/^_/i, // Underscore prefixed (often generated).
	/^jsx-/i, // CSS Modules.
	/^styles?__/i, // Common generated pattern.
	/^[a-z]{1,2}[0-9]+/i, // Short hash-like.
	/^[0-9]/i, // Starts with number.
	/^svelte-/i, // Svelte.
];

/**
 * Check if a class name appears to be generated/unstable.
 *
 * @param {string} className Class name to check.
 * @return {boolean} True if likely generated.
 */
function isGeneratedClassName( className ) {
	// Very short class names are often generated.
	if ( className.length <= 3 ) {
		return true;
	}

	// Check against known patterns.
	return IGNORED_CLASS_PATTERNS.some( ( pattern ) =>
		pattern.test( className )
	);
}

/**
 * Filter class names to keep only stable ones.
 *
 * @param {string[]} classNames Array of class names.
 * @return {string[]} Filtered class names.
 */
function filterStableClassNames( classNames ) {
	return classNames.filter( ( cn ) => ! isGeneratedClassName( cn ) );
}

/**
 * Get relevant data attributes from an element.
 *
 * @param {HTMLElement} element Element to inspect.
 * @return {Object} Object of data attributes.
 */
function getDataAttributes( element ) {
	const dataAttrs = {};
	const attrs = element.attributes;

	for ( let i = 0; i < attrs.length; i++ ) {
		const attr = attrs[ i ];
		if ( attr.name.startsWith( 'data-' ) ) {
			// Skip some common non-useful data attrs.
			const name = attr.name.slice( 5 );
			if (
				! [ 'reactid', 'react-checksum', 'v-' ].some( ( skip ) =>
					name.startsWith( skip )
				)
			) {
				dataAttrs[ name ] = attr.value;
			}
		}
	}

	return dataAttrs;
}

/**
 * Get ARIA role for an element (explicit or implicit).
 *
 * @param {HTMLElement} element Element to check.
 * @return {string|null} Role or null.
 */
function getRole( element ) {
	// Explicit role.
	if ( element.getAttribute( 'role' ) ) {
		return element.getAttribute( 'role' );
	}

	// Implicit roles based on tag.
	const tag = element.tagName.toLowerCase();
	const type = element.getAttribute( 'type' );

	const implicitRoles = {
		button: 'button',
		a: element.hasAttribute( 'href' ) ? 'link' : null,
		input: {
			text: 'textbox',
			search: 'searchbox',
			email: 'textbox',
			url: 'textbox',
			tel: 'textbox',
			password: 'textbox',
			checkbox: 'checkbox',
			radio: 'radio',
			submit: 'button',
			button: 'button',
			reset: 'button',
			range: 'slider',
		},
		textarea: 'textbox',
		select: 'listbox',
		option: 'option',
		img: element.hasAttribute( 'alt' ) ? 'img' : null,
		nav: 'navigation',
		main: 'main',
		header: 'banner',
		footer: 'contentinfo',
		aside: 'complementary',
		form: 'form',
		h1: 'heading',
		h2: 'heading',
		h3: 'heading',
		h4: 'heading',
		h5: 'heading',
		h6: 'heading',
		ul: 'list',
		ol: 'list',
		li: 'listitem',
		table: 'table',
		dialog: 'dialog',
	};

	if ( tag === 'input' && implicitRoles.input[ type ] ) {
		return implicitRoles.input[ type ];
	}

	return implicitRoles[ tag ] || null;
}

/**
 * Get accessible name for an element.
 *
 * @param {HTMLElement} element Element to check.
 * @return {string|null} Accessible name or null.
 */
function getAccessibleName( element ) {
	// aria-label.
	if ( element.getAttribute( 'aria-label' ) ) {
		return element.getAttribute( 'aria-label' );
	}

	// aria-labelledby.
	const labelledBy = element.getAttribute( 'aria-labelledby' );
	if ( labelledBy ) {
		const labelEl = document.getElementById( labelledBy );
		if ( labelEl ) {
			return labelEl.textContent?.trim() || null;
		}
	}

	// Associated label.
	if ( element.id ) {
		const label = document.querySelector( `label[for="${ element.id }"]` );
		if ( label ) {
			return label.textContent?.trim() || null;
		}
	}

	// Title attribute.
	if ( element.getAttribute( 'title' ) ) {
		return element.getAttribute( 'title' );
	}

	// Text content for buttons/links.
	const tag = element.tagName.toLowerCase();
	if (
		tag === 'button' ||
		tag === 'a' ||
		element.getAttribute( 'role' ) === 'button'
	) {
		const text = element.textContent?.trim();
		if ( text && text.length < 100 ) {
			return text;
		}
	}

	return null;
}

/**
 * Generate a CSS selector path for an element.
 *
 * @param {HTMLElement} element    Element to generate path for.
 * @param {number}      maxDepth   Maximum ancestor depth.
 * @return {string} CSS selector path.
 */
function generateCSSPath( element, maxDepth = 3 ) {
	const parts = [];
	let current = element;
	let depth = 0;

	while ( current && current !== document.body && depth < maxDepth ) {
		const tag = current.tagName.toLowerCase();

		// If element has ID, use it (most specific).
		if ( current.id && depth === 0 ) {
			parts.unshift( `#${ CSS.escape( current.id ) }` );
			break;
		}

		// Build selector for this element.
		let selector = tag;

		// Add stable classes.
		const classes = Array.from( current.classList );
		const stableClasses = filterStableClassNames( classes );
		if ( stableClasses.length > 0 ) {
			// Use first 2 stable classes max.
			selector += stableClasses
				.slice( 0, 2 )
				.map( ( c ) => `.${ CSS.escape( c ) }` )
				.join( '' );
		}

		// Add relevant attributes for uniqueness.
		const dataTestId = current.getAttribute( 'data-testid' );
		if ( dataTestId && depth === 0 ) {
			selector = `[${ 'data-testid' }="${ dataTestId }"]`;
		} else {
			const type = current.getAttribute( 'type' );
			if ( type && tag === 'input' ) {
				selector += `[type="${ type }"]`;
			}

			const name = current.getAttribute( 'name' );
			if ( name && [ 'input', 'select', 'textarea' ].includes( tag ) ) {
				selector += `[name="${ name }"]`;
			}
		}

		// Add nth-child if needed for disambiguation.
		if ( current.parentElement && depth === 0 ) {
			const siblings = Array.from(
				current.parentElement.children
			).filter( ( el ) => el.tagName === current.tagName );
			if ( siblings.length > 1 ) {
				const index = siblings.indexOf( current ) + 1;
				selector += `:nth-of-type(${ index })`;
			}
		}

		parts.unshift( selector );

		current = current.parentElement;
		depth++;
	}

	return parts.join( ' > ' );
}

/**
 * Find the nearest landmark or semantic container.
 *
 * @param {HTMLElement} element Element to search from.
 * @param {number}      maxDepth Maximum depth to search.
 * @return {Object|null} Container info or null.
 */
function findNearestContainer( element, maxDepth = 5 ) {
	const landmarks = [
		'main',
		'nav',
		'aside',
		'header',
		'footer',
		'section',
		'article',
		'form',
		'dialog',
	];

	const landmarkRoles = [
		'main',
		'navigation',
		'complementary',
		'banner',
		'contentinfo',
		'region',
		'form',
		'dialog',
		'search',
	];

	let current = element.parentElement;
	let depth = 0;

	while ( current && current !== document.body && depth < maxDepth ) {
		const tag = current.tagName.toLowerCase();
		const role = current.getAttribute( 'role' );

		// Check for landmark element or role.
		if ( landmarks.includes( tag ) || landmarkRoles.includes( role ) ) {
			let selector = tag;

			if ( current.id ) {
				selector = `#${ CSS.escape( current.id ) }`;
			} else if ( role ) {
				selector = `[${ 'role' }="${ role }"]`;
			} else if ( current.classList.length > 0 ) {
				const stableClasses = filterStableClassNames(
					Array.from( current.classList )
				);
				if ( stableClasses.length > 0 ) {
					selector += `.${ CSS.escape( stableClasses[ 0 ] ) }`;
				}
			}

			return {
				element: current,
				selector,
				type: role || tag,
			};
		}

		// Check for common container patterns.
		const commonContainers = [
			'edit-post-sidebar',
			'block-editor',
			'editor-styles-wrapper',
			'components-popover',
			'components-modal',
			'interface-interface-skeleton',
		];

		for ( const containerClass of commonContainers ) {
			if ( current.classList.contains( containerClass ) ) {
				return {
					element: current,
					selector: `.${ containerClass }`,
					type: 'editor-region',
				};
			}
		}

		current = current.parentElement;
		depth++;
	}

	return null;
}

/**
 * Capture a complete locator bundle from an element.
 *
 * @param {HTMLElement} element Target element.
 * @return {Target} Target configuration with locators and constraints.
 */
export function captureLocatorBundle( element ) {
	const locators = [];
	const constraints = {
		visible: true,
	};

	// 1. data-testid (highest priority).
	const testId = element.getAttribute( 'data-testid' );
	if ( testId ) {
		locators.push( {
			type: 'testId',
			value: testId,
			weight: 100,
			fallback: false,
		} );
	}

	// 2. ID-based CSS selector.
	if ( element.id ) {
		locators.push( {
			type: 'css',
			value: `#${ CSS.escape( element.id ) }`,
			weight: 95,
			fallback: false,
		} );
	}

	// 3. Role + accessible name.
	const role = getRole( element );
	const accessibleName = getAccessibleName( element );
	if ( role ) {
		const roleValue = accessibleName
			? `${ role }:${ accessibleName }`
			: role;
		locators.push( {
			type: 'role',
			value: roleValue,
			weight: 80,
			fallback: false,
		} );
	}

	// 4. Data attributes.
	const dataAttrs = getDataAttributes( element );
	for ( const [ key, value ] of Object.entries( dataAttrs ) ) {
		// Skip testid (already handled) and common non-useful ones.
		if ( key === 'testid' || key === 'reactid' ) {
			continue;
		}

		// Prioritize block-related and wp-specific data attrs.
		const weight = key.startsWith( 'wp-' ) || key === 'block' ? 85 : 70;

		locators.push( {
			type: 'dataAttribute',
			value: value ? `${ key }:${ value }` : key,
			weight,
			fallback: false,
		} );

		// Only add first 2 data attribute locators.
		if ( locators.filter( ( l ) => l.type === 'dataAttribute' ).length >= 2 ) {
			break;
		}
	}

	// 5. CSS path (medium priority).
	const cssPath = generateCSSPath( element, 3 );
	if ( cssPath ) {
		locators.push( {
			type: 'css',
			value: cssPath,
			weight: 60,
			fallback: false,
		} );
	}

	// 6. aria-label (fallback - not recommended as primary).
	const ariaLabel = element.getAttribute( 'aria-label' );
	if ( ariaLabel ) {
		locators.push( {
			type: 'ariaLabel',
			value: ariaLabel,
			weight: 40,
			fallback: true, // Mark as fallback due to i18n concerns.
		} );
	}

	// 7. Contextual selector with container.
	const container = findNearestContainer( element );
	if ( container ) {
		constraints.withinContainer = container.selector;

		// Generate simpler selector within container.
		const tag = element.tagName.toLowerCase();
		const stableClasses = filterStableClassNames(
			Array.from( element.classList )
		);
		let innerSelector = tag;

		if ( stableClasses.length > 0 ) {
			innerSelector += `.${ CSS.escape( stableClasses[ 0 ] ) }`;
		}

		locators.push( {
			type: 'contextual',
			value: `${ container.selector } >> ${ innerSelector }`,
			weight: 50,
			fallback: true,
		} );
	}

	// Ensure we have at least one locator.
	if ( locators.length === 0 ) {
		// Last resort: tag + nth-child.
		const tag = element.tagName.toLowerCase();
		const parent = element.parentElement;
		if ( parent ) {
			const siblings = Array.from( parent.children );
			const index = siblings.indexOf( element ) + 1;
			locators.push( {
				type: 'css',
				value: `${ tag }:nth-child(${ index })`,
				weight: 10,
				fallback: true,
			} );
		}
	}

	// Sort by weight descending.
	locators.sort( ( a, b ) => ( b.weight || 50 ) - ( a.weight || 50 ) );

	return {
		locators,
		constraints,
	};
}

/**
 * Get element context for AI drafting.
 * Minimizes data sent while providing enough context.
 *
 * @param {HTMLElement} element Target element.
 * @return {Object} Minimal element context.
 */
export function captureElementContext( element ) {
	const context = {
		tagName: element.tagName.toLowerCase(),
	};

	// Role.
	const role = getRole( element );
	if ( role ) {
		context.role = role;
	}

	// ID (but not if it looks generated).
	if ( element.id && ! /^[a-z0-9_-]{20,}$/i.test( element.id ) ) {
		context.id = element.id;
	}

	// Stable class names.
	const stableClasses = filterStableClassNames(
		Array.from( element.classList )
	);
	if ( stableClasses.length > 0 ) {
		context.classNames = stableClasses.slice( 0, 5 );
	}

	// Text content (trimmed, limited).
	const text = element.textContent?.trim();
	if ( text && text.length <= 200 ) {
		context.textContent = text;
	} else if ( text ) {
		context.textContent = `${ text.slice( 0, 197 ) }...`;
	}

	// Placeholder for inputs.
	if ( element.placeholder ) {
		context.placeholder = element.placeholder;
	}

	// Associated label.
	const label = getAccessibleName( element );
	if ( label && label !== context.textContent ) {
		context.label = label;
	}

	// Relevant data attributes.
	const dataAttrs = getDataAttributes( element );
	const relevantDataKeys = Object.keys( dataAttrs ).filter(
		( key ) =>
			key.startsWith( 'wp-' ) ||
			key === 'block' ||
			key === 'type' ||
			key === 'testid'
	);
	if ( relevantDataKeys.length > 0 ) {
		context.dataAttrs = {};
		relevantDataKeys.forEach( ( key ) => {
			context.dataAttrs[ key ] = dataAttrs[ key ];
		} );
	}

	// Ancestor context (up to 3 levels).
	const ancestors = [];
	let current = element.parentElement;
	let depth = 0;

	while ( current && current !== document.body && depth < 3 ) {
		const ancestorInfo = {
			tagName: current.tagName.toLowerCase(),
		};

		const ancestorRole = getRole( current );
		if ( ancestorRole ) {
			ancestorInfo.role = ancestorRole;
		}

		if ( current.id && ! /^[a-z0-9_-]{20,}$/i.test( current.id ) ) {
			ancestorInfo.id = current.id;
		}

		const ancestorClasses = filterStableClassNames(
			Array.from( current.classList )
		);
		if ( ancestorClasses.length > 0 ) {
			ancestorInfo.classNames = ancestorClasses.slice( 0, 3 );
		}

		ancestors.push( ancestorInfo );

		current = current.parentElement;
		depth++;
	}

	if ( ancestors.length > 0 ) {
		context.ancestors = ancestors;
	}

	return context;
}

export default captureLocatorBundle;
