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
 * Get the editor iframe's document if available.
 *
 * @return {Document|null} The iframe document or null.
 */
function getEditorIframeDocument() {
	const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
	return iframe?.contentDocument || null;
}

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

	// Search in the element's own document (handles iframe elements).
	const ownerDoc = element.ownerDocument || document;
	const container = ownerDoc.querySelector( containerSelector );
	if ( ! container ) {
		return false;
	}

	return container.contains( element );
}

/**
 * Find elements by CSS selector.
 *
 * @param {string}   selector CSS selector.
 * @param {Document} doc      Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByCSS( selector, doc = document ) {
	try {
		return Array.from( doc.querySelectorAll( selector ) );
	} catch {
		return [];
	}
}

/**
 * Find elements by role and optional accessible name.
 *
 * @param {string}   value Role value, optionally with name: "role:name".
 * @param {Document} doc   Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByRole( value, doc = document ) {
	const [ role, name ] = value.split( ':' ).map( ( s ) => s.trim() );

	// Find elements with explicit role attribute.
	const withExplicitRole = Array.from(
		doc.querySelectorAll( `[role="${ role }"]` )
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
			doc.querySelectorAll( implicitRoleMap[ role ] )
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
 * @param {string}   testId Test ID value.
 * @param {Document} doc    Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByTestId( testId, doc = document ) {
	return Array.from(
		doc.querySelectorAll( `[data-testid="${ testId }"]` )
	);
}

/**
 * Find elements by data attribute.
 *
 * @param {string}   value Data attribute in format "attr:value" or just "attr".
 * @param {Document} doc   Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByDataAttribute( value, doc = document ) {
	const [ attr, attrValue ] = value.split( ':' ).map( ( s ) => s.trim() );
	const selector = attrValue
		? `[data-${ attr }="${ attrValue }"]`
		: `[data-${ attr }]`;

	try {
		return Array.from( doc.querySelectorAll( selector ) );
	} catch {
		return [];
	}
}

/**
 * Find elements by aria-label.
 *
 * @param {string}   label Aria label text (partial match).
 * @param {Document} doc   Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByAriaLabel( label, doc = document ) {
	const allWithLabel = Array.from(
		doc.querySelectorAll( '[aria-label]' )
	);

	return allWithLabel.filter( ( el ) => {
		const elLabel = el.getAttribute( 'aria-label' );
		return elLabel && elLabel.toLowerCase().includes( label.toLowerCase() );
	} );
}

/**
 * Find elements by contextual selector (ancestor > descendant).
 *
 * @param {string}   value Contextual selector string.
 * @param {Document} doc   Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByContextual( value, doc = document ) {
	// Format: "container >> target" or standard CSS.
	const parts = value.split( '>>' ).map( ( s ) => s.trim() );

	if ( parts.length === 2 ) {
		const [ containerSel, targetSel ] = parts;
		const container = doc.querySelector( containerSel );
		if ( ! container ) {
			return [];
		}
		return Array.from( container.querySelectorAll( targetSel ) );
	}

	// Fall back to CSS.
	return findByCSS( value );
}

/**
 * Find elements using WordPress block editor data store.
 *
 * Value formats:
 * - "first" - First block in the editor
 * - "last" - Last block in the editor
 * - "selected" - Currently selected block
 * - "type:core/paragraph" - First block of type
 * - "type:core/paragraph:2" - Third block of type (0-indexed)
 * - "nth:0" - Block at index 0
 * - "inserted" - Block inserted by insertBlock precondition (default marker)
 * - "inserted:myMarker" - Block inserted with specific marker ID
 *
 * @param {string}   value Block selector value.
 * @param {Document} doc   Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByWpBlock( value, doc = document ) {
	// Check for inserted block first (uses global map from preconditions).
	if ( value === 'inserted' || value.startsWith( 'inserted:' ) ) {
		const markerId =
			value === 'inserted'
				? 'act-inserted-block'
				: value.substring( 9 );

		const insertedBlocks = window.__actInsertedBlocks;
		console.log(
			'[ACT findByWpBlock] Looking for inserted block, markerId:',
			markerId,
			'map exists:',
			!! insertedBlocks,
			'has key:',
			insertedBlocks?.has?.( markerId )
		);
		
		if ( insertedBlocks?.has?.( markerId ) ) {
			const clientId = insertedBlocks.get( markerId );
			console.log(
				'[ACT findByWpBlock] Looking for inserted block:',
				markerId,
				'clientId:',
				clientId
			);
			
			// Search in both main doc and iframe for the element.
			let element = doc.querySelector( `[data-block="${ clientId }"]` );
			
			// If not found in provided doc, try iframe.
			if ( ! element ) {
				const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
				const iframeDoc = iframe?.contentDocument;
				if ( iframeDoc && iframeDoc !== doc ) {
					element = iframeDoc.querySelector( `[data-block="${ clientId }"]` );
					console.log( '[ACT findByWpBlock] Searched iframe, found:', !! element );
				}
			}
			
			// If still not found, try main document.
			if ( ! element && doc !== document ) {
				element = document.querySelector( `[data-block="${ clientId }"]` );
				console.log( '[ACT findByWpBlock] Searched main doc, found:', !! element );
			}
			
			if ( element ) {
				console.log( '[ACT findByWpBlock] Found inserted block element' );
				return [ element ];
			}
		}
		console.log(
			'[ACT findByWpBlock] Inserted block not found for marker:',
			markerId,
			'Available markers:',
			insertedBlocks ? Array.from( insertedBlocks.keys() ) : 'none'
		);
		return [];
	}

	// Access WordPress data store.
	const wpData = window.wp?.data;
	if ( ! wpData ) {
		console.log( '[ACT findByWpBlock] wp.data not available' );
		return [];
	}

	const blockEditor = wpData.select( 'core/block-editor' );
	if ( ! blockEditor ) {
		console.log( '[ACT findByWpBlock] core/block-editor store not available' );
		return [];
	}

	const blocks = blockEditor.getBlocks();
	console.log( '[ACT findByWpBlock] Found', blocks.length, 'blocks in editor' );

	let targetClientId = null;

	if ( value === 'first' ) {
		targetClientId = blocks[ 0 ]?.clientId;
	} else if ( value === 'last' ) {
		targetClientId = blocks[ blocks.length - 1 ]?.clientId;
	} else if ( value === 'selected' ) {
		targetClientId = blockEditor.getSelectedBlockClientId();
	} else if ( value.startsWith( 'type:' ) ) {
		// Find block by type, optionally with index.
		const parts = value.substring( 5 ).split( ':' );
		const blockType = parts[ 0 ];
		const index = parts[ 1 ] ? parseInt( parts[ 1 ], 10 ) : 0;

		const matchingBlocks = blocks.filter( ( b ) => b.name === blockType );
		console.log( '[ACT findByWpBlock] Looking for type:', blockType, '- found', matchingBlocks.length );
		targetClientId = matchingBlocks[ index ]?.clientId;
	} else if ( value.startsWith( 'nth:' ) ) {
		const index = parseInt( value.substring( 4 ), 10 );
		targetClientId = blocks[ index ]?.clientId;
	}

	if ( ! targetClientId ) {
		console.log( '[ACT findByWpBlock] No matching block found for:', value );
		return [];
	}

	console.log( '[ACT findByWpBlock] Target clientId:', targetClientId );

	// Find the DOM element by data-block attribute.
	const element = doc.querySelector( `[data-block="${ targetClientId }"]` );
	if ( element ) {
		console.log( '[ACT findByWpBlock] Found element:', element.tagName );
		return [ element ];
	}

	console.log( '[ACT findByWpBlock] Element not found in DOM' );
	return [];
}

/**
 * Find elements using a locator.
 *
 * @param {Locator}  locator Locator object.
 * @param {Document} doc     Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByLocator( locator, doc = document ) {
	switch ( locator.type ) {
		case 'css':
			return findByCSS( locator.value, doc );
		case 'role':
			return findByRole( locator.value, doc );	case 'testid':		case 'testId':
			return findByTestId( locator.value, doc );	case 'dataattribute':		case 'dataAttribute':
			return findByDataAttribute( locator.value, doc );	case 'arialabel':		case 'ariaLabel':
			return findByAriaLabel( locator.value, doc );
		case 'contextual':
			return findByContextual( locator.value, doc );
		case 'wpBlock':
		case 'wpblock':
			return findByWpBlock( locator.value, doc );
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
	console.log( '[ACT resolveTarget] Starting resolution', target );
	
	if ( ! target || ! target.locators || target.locators.length === 0 ) {
		console.log( '[ACT resolveTarget] No locators provided' );
		return {
			success: false,
			error: 'No locators provided',
		};
	}

	const constraints = target.constraints || {};
	console.log( '[ACT resolveTarget] Constraints:', constraints );

	// Determine which document to search in.
	// Auto-detect iframe if withinContainer is an iframe-only selector.
	const iframeOnlyContainers = [ '.editor-styles-wrapper', '.block-editor-block-list__layout' ];
	const shouldSearchIframe = constraints.inEditorIframe || 
		( constraints.withinContainer && iframeOnlyContainers.includes( constraints.withinContainer ) );

	console.log( '[ACT resolveTarget] shouldSearchIframe:', shouldSearchIframe );

	let searchDoc = document;
	if ( shouldSearchIframe ) {
		const iframeDoc = getEditorIframeDocument();
		console.log( '[ACT resolveTarget] iframeDoc:', iframeDoc ? 'found' : 'NOT FOUND' );
		if ( ! iframeDoc ) {
			return {
				success: false,
				error: 'Editor iframe not found',
			};
		}
		searchDoc = iframeDoc;
	}

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

	console.log( '[ACT resolveTarget] Trying', primaryLocators.length, 'primary +', fallbackLocators.length, 'fallback locators' );

	// Try each locator.
	for ( const locator of [ ...primaryLocators, ...fallbackLocators ] ) {
		let elements = findByLocator( locator, searchDoc );
		console.log( '[ACT resolveTarget] Locator', locator.type, ':', locator.value.substring( 0, 50 ), '-> found', elements.length, 'raw matches' );

		// Apply visibility constraint.
		if ( constraints.visible !== false ) {
			elements = elements.filter( isElementVisible );
			console.log( '[ACT resolveTarget]   After visibility filter:', elements.length );
		}

		// Apply container constraint.
		if ( constraints.withinContainer ) {
			elements = elements.filter( ( el ) =>
				isWithinContainer( el, constraints.withinContainer )
			);
			console.log( '[ACT resolveTarget]   After container filter:', elements.length );
		}

		if ( elements.length === 0 ) {
			continue;
		}

		// Handle multiple matches.
		if ( elements.length === 1 ) {
			console.log( '[ACT resolveTarget] SUCCESS! Found element with', locator.type );
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

	console.log( '[ACT resolveTarget] FAILED - No matching element found after trying all locators' );
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
