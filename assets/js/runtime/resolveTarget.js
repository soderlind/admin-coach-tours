/**
 * Resolve target element using locator bundle.
 *
 * Tries locators in weighted order, applies constraints, and handles
 * disambiguation of multiple matches.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

/**
 * @typedef {import('../types/step.js').Target} Target
 * @typedef {import('../types/step.js').Locator} Locator
 * @typedef {import('../types/step.js').ResolutionResult} ResolutionResult
 */

/**
 * Check if an element is visible.
 *
 * @param {HTMLElement} element Element to check.
 * @return {boolean} True if visible.
 */
function isElementVisible( element ) {
	if ( ! element ) {
		return false;
	}

	// Check if element is in DOM.
	if ( ! element.isConnected ) {
		return false;
	}

	// Check computed styles.
	const style = window.getComputedStyle( element );
	if (
		style.display === 'none' ||
		style.visibility === 'hidden' ||
		style.opacity === '0'
	) {
		return false;
	}

	// Check if element has dimensions.
	const rect = element.getBoundingClientRect();
	if ( rect.width === 0 && rect.height === 0 ) {
		return false;
	}

	return true;
}

/**
 * Check if element is within a container.
 *
 * @param {HTMLElement} element           Element to check.
 * @param {string}      containerSelector Container CSS selector.
 * @return {boolean} True if within container.
 */
function isWithinContainer( element, containerSelector ) {
	if ( ! containerSelector ) {
		return true;
	}

	const container = document.querySelector( containerSelector );
	if ( ! container ) {
		return false;
	}

	return container.contains( element );
}

/**
 * Find elements by CSS selector.
 *
 * @param {string} selector CSS selector.
 * @return {HTMLElement[]} Matching elements.
 */
function findByCSS( selector ) {
	try {
		return Array.from( document.querySelectorAll( selector ) );
	} catch {
		return [];
	}
}

/**
 * Find elements by role and optional accessible name.
 *
 * @param {string} value Role value, optionally with name: "role:name".
 * @return {HTMLElement[]} Matching elements.
 */
function findByRole( value ) {
	const [ role, name ] = value.split( ':' ).map( ( s ) => s.trim() );

	// Find elements with explicit role attribute.
	const withExplicitRole = Array.from(
		document.querySelectorAll( `[role="${ role }"]` )
	);

	// Find elements with implicit roles (basic mapping).
	const implicitRoleMap = {
		button: 'button, input[type="button"], input[type="submit"]',
		textbox: 'input[type="text"], input:not([type]), textarea',
		link: 'a[href]',
		checkbox: 'input[type="checkbox"]',
		radio: 'input[type="radio"]',
		listbox: 'select',
		option: 'option',
		heading: 'h1, h2, h3, h4, h5, h6',
		img: 'img[alt]',
		navigation: 'nav',
		main: 'main',
		complementary: 'aside',
		banner: 'header',
		contentinfo: 'footer',
		search: '[role="search"]',
		form: 'form',
		region: 'section[aria-label], section[aria-labelledby]',
		tab: '[role="tab"]',
		tabpanel: '[role="tabpanel"]',
		tablist: '[role="tablist"]',
		menu: '[role="menu"]',
		menuitem: '[role="menuitem"]',
		dialog: 'dialog, [role="dialog"]',
	};

	let withImplicitRole = [];
	if ( implicitRoleMap[ role ] ) {
		withImplicitRole = Array.from(
			document.querySelectorAll( implicitRoleMap[ role ] )
		);
	}

	const allMatches = [ ...withExplicitRole, ...withImplicitRole ];

	// Filter by name if provided.
	if ( name ) {
		return allMatches.filter( ( el ) => {
			const accessibleName = getAccessibleName( el );
			return (
				accessibleName &&
				accessibleName.toLowerCase().includes( name.toLowerCase() )
			);
		} );
	}

	return allMatches;
}

/**
 * Get accessible name for an element.
 *
 * @param {HTMLElement} element Element.
 * @return {string} Accessible name.
 */
function getAccessibleName( element ) {
	// aria-label takes precedence.
	if ( element.getAttribute( 'aria-label' ) ) {
		return element.getAttribute( 'aria-label' );
	}

	// aria-labelledby.
	const labelledBy = element.getAttribute( 'aria-labelledby' );
	if ( labelledBy ) {
		const labelEl = document.getElementById( labelledBy );
		if ( labelEl ) {
			return labelEl.textContent?.trim() || '';
		}
	}

	// For inputs, check associated label.
	if ( element.id ) {
		const label = document.querySelector( `label[for="${ element.id }"]` );
		if ( label ) {
			return label.textContent?.trim() || '';
		}
	}

	// Check title attribute.
	if ( element.getAttribute( 'title' ) ) {
		return element.getAttribute( 'title' );
	}

	// Fall back to text content for buttons and links.
	if (
		element.tagName === 'BUTTON' ||
		element.tagName === 'A' ||
		element.getAttribute( 'role' ) === 'button'
	) {
		return element.textContent?.trim() || '';
	}

	// Check for value on inputs.
	if ( element.tagName === 'INPUT' && element.value ) {
		return element.value;
	}

	return '';
}

/**
 * Find elements by test ID (data-testid attribute).
 *
 * @param {string} testId Test ID value.
 * @return {HTMLElement[]} Matching elements.
 */
function findByTestId( testId ) {
	return Array.from(
		document.querySelectorAll( `[data-testid="${ testId }"]` )
	);
}

/**
 * Find elements by data attribute.
 *
 * @param {string} value Data attribute in format "attr:value" or just "attr".
 * @return {HTMLElement[]} Matching elements.
 */
function findByDataAttribute( value ) {
	const [ attr, attrValue ] = value.split( ':' ).map( ( s ) => s.trim() );
	const selector = attrValue
		? `[data-${ attr }="${ attrValue }"]`
		: `[data-${ attr }]`;

	try {
		return Array.from( document.querySelectorAll( selector ) );
	} catch {
		return [];
	}
}

/**
 * Find elements by aria-label.
 *
 * @param {string} label Aria label text (partial match).
 * @return {HTMLElement[]} Matching elements.
 */
function findByAriaLabel( label ) {
	const allWithLabel = Array.from(
		document.querySelectorAll( '[aria-label]' )
	);

	return allWithLabel.filter( ( el ) => {
		const elLabel = el.getAttribute( 'aria-label' );
		return elLabel && elLabel.toLowerCase().includes( label.toLowerCase() );
	} );
}

/**
 * Find elements by contextual selector (ancestor > descendant).
 *
 * @param {string} value Contextual selector string.
 * @return {HTMLElement[]} Matching elements.
 */
function findByContextual( value ) {
	// Format: "container >> target" or standard CSS.
	const parts = value.split( '>>' ).map( ( s ) => s.trim() );

	if ( parts.length === 2 ) {
		const [ containerSel, targetSel ] = parts;
		const container = document.querySelector( containerSel );
		if ( ! container ) {
			return [];
		}
		return Array.from( container.querySelectorAll( targetSel ) );
	}

	// Fall back to CSS.
	return findByCSS( value );
}

/**
 * Find elements using a locator.
 *
 * @param {Locator} locator Locator object.
 * @return {HTMLElement[]} Matching elements.
 */
function findByLocator( locator ) {
	switch ( locator.type ) {
		case 'css':
			return findByCSS( locator.value );
		case 'role':
			return findByRole( locator.value );
		case 'testId':
			return findByTestId( locator.value );
		case 'dataAttribute':
			return findByDataAttribute( locator.value );
		case 'ariaLabel':
			return findByAriaLabel( locator.value );
		case 'contextual':
			return findByContextual( locator.value );
		default:
			return [];
	}
}

/**
 * Calculate specificity score for an element based on how well it matches.
 *
 * @param {HTMLElement} element    Element to score.
 * @param {Locator}     locator    Locator used.
 * @param {Object}      constraints Target constraints.
 * @return {number} Specificity score (higher is better).
 */
function calculateSpecificity( element, locator, constraints ) {
	let score = locator.weight || 50;

	// Bonus for ID-based selectors.
	if ( element.id ) {
		score += 20;
	}

	// Bonus for data-testid.
	if ( element.getAttribute( 'data-testid' ) ) {
		score += 15;
	}

	// Bonus for being within specified container.
	if (
		constraints?.withinContainer &&
		isWithinContainer( element, constraints.withinContainer )
	) {
		score += 10;
	}

	// Bonus for visibility.
	if ( isElementVisible( element ) ) {
		score += 5;
	}

	return score;
}

/**
 * Resolve target element from a target configuration.
 *
 * @param {Target} target Target configuration.
 * @return {ResolutionResult} Resolution result.
 */
export function resolveTarget( target ) {
	if ( ! target || ! target.locators || target.locators.length === 0 ) {
		return {
			success: false,
			error: 'No locators provided',
		};
	}

	const constraints = target.constraints || {};

	// Sort locators by weight (descending), non-fallback first.
	const sortedLocators = [ ...target.locators ].sort( ( a, b ) => {
		// Non-fallback before fallback.
		if ( a.fallback !== b.fallback ) {
			return a.fallback ? 1 : -1;
		}
		// Higher weight first.
		return ( b.weight || 50 ) - ( a.weight || 50 );
	} );

	// Try non-fallback locators first.
	const primaryLocators = sortedLocators.filter( ( l ) => ! l.fallback );
	const fallbackLocators = sortedLocators.filter( ( l ) => l.fallback );

	// Try each locator.
	for ( const locator of [ ...primaryLocators, ...fallbackLocators ] ) {
		let elements = findByLocator( locator );

		// Apply visibility constraint.
		if ( constraints.visible !== false ) {
			elements = elements.filter( isElementVisible );
		}

		// Apply container constraint.
		if ( constraints.withinContainer ) {
			elements = elements.filter( ( el ) =>
				isWithinContainer( el, constraints.withinContainer )
			);
		}

		if ( elements.length === 0 ) {
			continue;
		}

		// Handle multiple matches.
		if ( elements.length === 1 ) {
			return {
				success: true,
				element: elements[ 0 ],
				usedLocator: locator,
			};
		}

		// Use index constraint if provided.
		if (
			typeof constraints.index === 'number' &&
			elements[ constraints.index ]
		) {
			return {
				success: true,
				element: elements[ constraints.index ],
				usedLocator: locator,
			};
		}

		// Disambiguate by specificity score.
		const scored = elements.map( ( el ) => ( {
			element: el,
			score: calculateSpecificity( el, locator, constraints ),
		} ) );

		scored.sort( ( a, b ) => b.score - a.score );

		// If top two have same score, it's ambiguous - but still return first.
		return {
			success: true,
			element: scored[ 0 ].element,
			usedLocator: locator,
		};
	}

	return {
		success: false,
		error: 'No matching element found',
	};
}

/**
 * Resolve target with recovery retry.
 *
 * @param {Target}        target     Target configuration.
 * @param {Function|null} recoveryFn Optional recovery function to run before retry.
 * @return {Promise<ResolutionResult>} Resolution result.
 */
export async function resolveTargetWithRecovery( target, recoveryFn = null ) {
	// First attempt.
	let result = resolveTarget( target );

	if ( result.success ) {
		return result;
	}

	// If recovery function provided, run it and retry once.
	if ( recoveryFn ) {
		try {
			await recoveryFn();

			// Wait a tick for DOM updates.
			await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );

			// Retry.
			result = resolveTarget( target );

			if ( result.success ) {
				return {
					...result,
					recovered: true,
				};
			}
		} catch ( error ) {
			// Recovery failed, return original error.
			return {
				success: false,
				error: `Recovery failed: ${ error.message }`,
			};
		}
	}

	return result;
}

/**
 * Test if a target can be resolved (for educator UI).
 *
 * @param {Target} target Target configuration.
 * @return {Object} Test result with details.
 */
export function testTargetResolution( target ) {
	const result = resolveTarget( target );

	return {
		success: result.success,
		element: result.element,
		usedLocator: result.usedLocator,
		error: result.error,
		elementInfo: result.element
			? {
					tagName: result.element.tagName.toLowerCase(),
					id: result.element.id || null,
					className: result.element.className || null,
					textContent:
						result.element.textContent?.slice( 0, 50 ) || null,
					rect: result.element.getBoundingClientRect(),
			  }
			: null,
	};
}

export default resolveTarget;
