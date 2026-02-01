/**
 * Watch for step completion conditions.
 *
 * Monitors DOM events and @wordpress/data store changes to detect
 * when a step's completion condition is satisfied.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { subscribe, select } from '@wordpress/data';

/**
 * @typedef {import('../types/step.js').Completion} Completion
 */

/**
 * Create a watcher that resolves when a condition is met.
 *
 * @param {Function} checkFn    Function that returns true when complete.
 * @param {number}   timeout    Timeout in ms (0 for no timeout).
 * @return {Promise<{success: boolean, timedOut?: boolean}>} Result.
 */
function createWatcher( checkFn, timeout = 0 ) {
	return new Promise( ( resolve ) => {
		let timeoutId = null;
		let checkInterval = null;
		let isResolved = false;

		const cleanup = () => {
			if ( timeoutId ) {
				clearTimeout( timeoutId );
			}
			if ( checkInterval ) {
				clearInterval( checkInterval );
			}
		};

		const complete = ( success, timedOut = false ) => {
			if ( isResolved ) {
				return;
			}
			isResolved = true;
			cleanup();
			resolve( { success, timedOut } );
		};

		// Set up timeout if specified.
		if ( timeout > 0 ) {
			timeoutId = setTimeout( () => {
				complete( false, true );
			}, timeout );
		}

		// Check periodically.
		const check = () => {
			try {
				if ( checkFn() ) {
					complete( true );
				}
			} catch {
				// Check function threw, continue watching.
			}
		};

		// Initial check.
		check();

		// If not immediately satisfied, poll.
		if ( ! isResolved ) {
			checkInterval = setInterval( check, 100 );
		}
	} );
}

/**
 * Watch for click on target element.
 * Includes a grace period to avoid catching clicks during setup.
 *
 * @param {HTMLElement} targetElement Target element.
 * @param {Object}      options       Options.
 * @return {Promise<Object>} Completion result.
 */
function watchClickTarget( targetElement, options = {} ) {
	return new Promise( ( resolve ) => {
		let isResolved = false;
		let isArmed = false; // Grace period flag.
		const { timeout = 0, gracePeriod = 300 } = options;
		let timeoutId = null;

		const cleanup = () => {
			targetElement.removeEventListener( 'click', handleClick, true );
			// Also try to remove from iframe document if applicable.
			if ( targetElement.ownerDocument !== document ) {
				targetElement.ownerDocument.removeEventListener(
					'click',
					handleClick,
					true
				);
			}
			if ( timeoutId ) {
				clearTimeout( timeoutId );
			}
		};

		const handleClick = ( event ) => {
			if ( isResolved ) {
				return;
			}

			// Ignore clicks during grace period.
			if ( ! isArmed ) {
				console.log(
					'[ACT watchClickTarget] Ignoring click during grace period'
				);
				return;
			}

			// Verify click is on target or within target.
			if (
				targetElement === event.target ||
				targetElement.contains( event.target )
			) {
				console.log(
					'[ACT watchClickTarget] Click detected on target:',
					targetElement.tagName
				);
				isResolved = true;
				cleanup();
				resolve( { success: true, event: 'click' } );
			}
		};

		// Add listener to the target element.
		targetElement.addEventListener( 'click', handleClick, {
			capture: true,
		} );

		// Also listen on the document (for iframe elements).
		if ( targetElement.ownerDocument !== document ) {
			targetElement.ownerDocument.addEventListener( 'click', handleClick, {
				capture: true,
			} );
		}

		// Arm the watcher after grace period.
		setTimeout( () => {
			isArmed = true;
			console.log(
				'[ACT watchClickTarget] Armed after grace period, watching:',
				targetElement.tagName,
				targetElement.className
			);
		}, gracePeriod );

		if ( timeout > 0 ) {
			timeoutId = setTimeout( () => {
				if ( ! isResolved ) {
					isResolved = true;
					cleanup();
					resolve( { success: false, timedOut: true } );
				}
			}, timeout );
		}
	} );
}

/**
 * Watch for DOM value change on target element.
 *
 * @param {HTMLElement} targetElement Target element.
 * @param {Object}      options       Options.
 * @return {Promise<Object>} Completion result.
 */
function watchDomValueChanged( targetElement, options = {} ) {
	return new Promise( ( resolve ) => {
		let isResolved = false;
		const { timeout = 0, expectedValue, attributeName = null } = options;
		let timeoutId = null;
		let observer = null;

		const cleanup = () => {
			if ( observer ) {
				observer.disconnect();
			}
			targetElement.removeEventListener( 'input', handleInput );
			targetElement.removeEventListener( 'change', handleChange );
			if ( timeoutId ) {
				clearTimeout( timeoutId );
			}
		};

		const getCurrentValue = () => {
			if ( attributeName ) {
				return targetElement.getAttribute( attributeName );
			}

			// For form elements.
			if ( 'value' in targetElement ) {
				return targetElement.value;
			}

			// For content editable.
			if ( targetElement.isContentEditable ) {
				return targetElement.textContent;
			}

			// For checkboxes/radios.
			if ( targetElement.type === 'checkbox' || targetElement.type === 'radio' ) {
				return targetElement.checked;
			}

			return targetElement.textContent;
		};

		const initialValue = getCurrentValue();

		const checkCompletion = () => {
			const currentValue = getCurrentValue();

			// If expected value specified, check for match.
			if ( expectedValue !== undefined ) {
				if ( currentValue === expectedValue ) {
					return true;
				}
				return false;
			}

			// Otherwise, just check if value changed.
			return currentValue !== initialValue;
		};

		const complete = () => {
			if ( isResolved ) {
				return;
			}
			if ( checkCompletion() ) {
				isResolved = true;
				cleanup();
				resolve( { success: true, event: 'valueChanged' } );
			}
		};

		const handleInput = () => complete();
		const handleChange = () => complete();

		// Listen for input/change events.
		targetElement.addEventListener( 'input', handleInput );
		targetElement.addEventListener( 'change', handleChange );

		// Also use MutationObserver for attribute changes.
		observer = new MutationObserver( () => complete() );
		observer.observe( targetElement, {
			attributes: true,
			characterData: true,
			subtree: true,
			childList: true,
		} );

		if ( timeout > 0 ) {
			timeoutId = setTimeout( () => {
				if ( ! isResolved ) {
					isResolved = true;
					cleanup();
					resolve( { success: false, timedOut: true } );
				}
			}, timeout );
		}
	} );
}

/**
 * Watch for @wordpress/data store state change.
 *
 * @param {Object} options Watcher options.
 * @return {Promise<Object>} Completion result.
 */
function watchWpDataChange( options = {} ) {
	const {
		storeName,
		selector,
		args = [],
		expectedValue,
		comparator = 'equals',
		timeout = 0,
	} = options;

	return new Promise( ( resolve ) => {
		let isResolved = false;
		let timeoutId = null;
		let unsubscribe = null;

		const cleanup = () => {
			if ( unsubscribe ) {
				unsubscribe();
			}
			if ( timeoutId ) {
				clearTimeout( timeoutId );
			}
		};

		const store = select( storeName );

		if ( ! store || ! store[ selector ] ) {
			resolve( {
				success: false,
				error: `Invalid store or selector: ${ storeName }.${ selector }`,
			} );
			return;
		}

		const checkValue = () => {
			try {
				const currentValue = store[ selector ]( ...args );

				switch ( comparator ) {
					case 'equals':
						return currentValue === expectedValue;

					case 'notEquals':
						return currentValue !== expectedValue;

					case 'truthy':
						return !! currentValue;

					case 'falsy':
						return ! currentValue;

					case 'contains':
						if ( Array.isArray( currentValue ) ) {
							return currentValue.includes( expectedValue );
						}
						if ( typeof currentValue === 'string' ) {
							return currentValue.includes( expectedValue );
						}
						return false;

					case 'greaterThan':
						return currentValue > expectedValue;

					case 'lessThan':
						return currentValue < expectedValue;

					case 'lengthEquals':
						return currentValue?.length === expectedValue;

					case 'lengthGreaterThan':
						return currentValue?.length > expectedValue;

					default:
						return currentValue === expectedValue;
				}
			} catch {
				return false;
			}
		};

		const complete = () => {
			if ( isResolved ) {
				return;
			}
			if ( checkValue() ) {
				isResolved = true;
				cleanup();
				resolve( { success: true, event: 'wpDataChanged' } );
			}
		};

		// Initial check.
		complete();

		// If not immediately satisfied, subscribe to changes.
		if ( ! isResolved ) {
			unsubscribe = subscribe( () => {
				complete();
			} );
		}

		if ( timeout > 0 ) {
			timeoutId = setTimeout( () => {
				if ( ! isResolved ) {
					isResolved = true;
					cleanup();
					resolve( { success: false, timedOut: true } );
				}
			}, timeout );
		}
	} );
}

/**
 * Watch for manual confirmation (user clicks continue).
 *
 * @param {Object} options Options.
 * @return {Object} Watcher with cancel capability.
 */
function createManualWatcher( options = {} ) {
	const { timeout = 0 } = options;
	let resolveFn = null;
	let timeoutId = null;
	let isResolved = false;

	const promise = new Promise( ( resolve ) => {
		resolveFn = resolve;

		if ( timeout > 0 ) {
			timeoutId = setTimeout( () => {
				if ( ! isResolved ) {
					isResolved = true;
					resolve( { success: false, timedOut: true } );
				}
			}, timeout );
		}
	} );

	return {
		promise,
		confirm: () => {
			if ( ! isResolved ) {
				isResolved = true;
				if ( timeoutId ) {
					clearTimeout( timeoutId );
				}
				resolveFn( { success: true, event: 'manual' } );
			}
		},
		cancel: () => {
			if ( ! isResolved ) {
				isResolved = true;
				if ( timeoutId ) {
					clearTimeout( timeoutId );
				}
				resolveFn( { success: false, cancelled: true } );
			}
		},
	};
}

/**
 * Watch for element to appear in DOM.
 * Tracks the last appeared block for scoping in subsequent steps.
 * IMPORTANT: Waits for a NEW element, not just any existing match.
 *
 * @param {string} selector CSS selector.
 * @param {Object} options  Options.
 * @return {Promise<Object>} Completion result.
 */
function watchElementAppear( selector, options = {} ) {
	const { timeout = 0 } = options;

	// Helper to get all matching elements with their clientIds.
	const getMatchingClientIds = () => {
		const clientIds = new Set();
		
		// Check main document.
		document.querySelectorAll( selector ).forEach( ( el ) => {
			let clientId = el.getAttribute( 'data-block' );
			if ( ! clientId ) {
				const wrapper = el.closest( '[data-block]' );
				clientId = wrapper?.getAttribute( 'data-block' );
			}
			if ( clientId ) {
				clientIds.add( clientId );
			}
		} );

		// Check iframe.
		const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
		iframe?.contentDocument?.querySelectorAll( selector ).forEach( ( el ) => {
			let clientId = el.getAttribute( 'data-block' );
			if ( ! clientId ) {
				const wrapper = el.closest( '[data-block]' );
				clientId = wrapper?.getAttribute( 'data-block' );
			}
			if ( clientId ) {
				clientIds.add( clientId );
			}
		} );

		return clientIds;
	};

	// Capture existing elements BEFORE watching.
	const existingClientIds = getMatchingClientIds();
	console.log( '[ACT watchElementAppear] Existing matches:', existingClientIds.size, 'for selector:', selector );

	return createWatcher( () => {
		// Get current matches and look for NEW ones.
		const currentClientIds = getMatchingClientIds();
		
		for ( const clientId of currentClientIds ) {
			if ( ! existingClientIds.has( clientId ) ) {
				// Found a NEW element! Store it for later retrieval.
				window.__actNewlyAppearedBlockClientId = clientId;
				console.log( '[ACT watchElementAppear] NEW element appeared:', clientId );
				return true;
			}
		}
		return false;
	}, timeout ).then( ( result ) => {
		// Track the block that appeared for scoping in next step.
		if ( result.success && window.__actNewlyAppearedBlockClientId ) {
			window.__actLastAppearedBlockClientId = window.__actNewlyAppearedBlockClientId;
			console.log( '[ACT watchElementAppear] Tracked appeared block:', window.__actLastAppearedBlockClientId );
			delete window.__actNewlyAppearedBlockClientId;
		}

		return {
			...result,
			event: result.success ? 'elementAppeared' : null,
		};
	} );
}

/**
 * Watch for element to disappear from DOM.
 *
 * @param {string} selector CSS selector.
 * @param {Object} options  Options.
 * @return {Promise<Object>} Completion result.
 */
function watchElementDisappear( selector, options = {} ) {
	const { timeout = 0 } = options;

	return createWatcher( () => {
		const element = document.querySelector( selector );
		return element === null;
	}, timeout ).then( ( result ) => ( {
		...result,
		event: result.success ? 'elementDisappeared' : null,
	} ) );
}

/**
 * Watch for a custom event to be dispatched.
 *
 * @param {string} eventName Custom event name.
 * @param {Object} options   Options.
 * @return {Promise<Object>} Completion result.
 */
function watchCustomEvent( eventName, options = {} ) {
	const { timeout = 0, target = document } = options;

	return new Promise( ( resolve ) => {
		let isResolved = false;
		let timeoutId = null;

		const cleanup = () => {
			target.removeEventListener( eventName, handleEvent );
			if ( timeoutId ) {
				clearTimeout( timeoutId );
			}
		};

		const handleEvent = ( event ) => {
			if ( isResolved ) {
				return;
			}
			isResolved = true;
			cleanup();
			resolve( { success: true, event: eventName, detail: event.detail } );
		};

		target.addEventListener( eventName, handleEvent, { once: true } );

		if ( timeout > 0 ) {
			timeoutId = setTimeout( () => {
				if ( ! isResolved ) {
					isResolved = true;
					cleanup();
					resolve( { success: false, timedOut: true } );
				}
			}, timeout );
		}
	} );
}

/**
 * Create a completion watcher based on completion configuration.
 *
 * @param {Completion}       completion    Completion configuration.
 * @param {HTMLElement|null} targetElement Resolved target element (if available).
 * @return {Object} Watcher object with promise and cancel method.
 */
export function watchCompletion( completion, targetElement = null ) {
	if ( ! completion || ! completion.type ) {
		// Default to manual completion.
		return createManualWatcher();
	}

	const { type, params = {} } = completion;
	const timeout = completion.timeout || 0;

	switch ( type ) {
		case 'clickTarget':
			if ( ! targetElement ) {
				return {
					promise: Promise.resolve( {
						success: false,
						error: 'No target element for clickTarget',
					} ),
					cancel: () => {},
				};
			}
			return {
				promise: watchClickTarget( targetElement, { timeout } ),
				cancel: () => {}, // Click listeners are removed when promise resolves.
			};

		case 'domValueChanged':
			if ( ! targetElement ) {
				return {
					promise: Promise.resolve( {
						success: false,
						error: 'No target element for domValueChanged',
					} ),
					cancel: () => {},
				};
			}
			return {
				promise: watchDomValueChanged( targetElement, {
					timeout,
					...params,
				} ),
				cancel: () => {},
			};

		case 'wpData':
			return {
				promise: watchWpDataChange( { timeout, ...params } ),
				cancel: () => {},
			};

		case 'manual':
			return createManualWatcher( { timeout } );

		case 'elementAppear':
			return {
				promise: watchElementAppear( params.selector, { timeout } ),
				cancel: () => {},
			};

		case 'elementDisappear':
			return {
				promise: watchElementDisappear( params.selector, { timeout } ),
				cancel: () => {},
			};

		case 'customEvent':
			return {
				promise: watchCustomEvent( params.eventName, { timeout } ),
				cancel: () => {},
			};

		default:
			return createManualWatcher( { timeout } );
	}
}

/**
 * Get available completion types with descriptions.
 *
 * @return {Object[]} Array of completion type info.
 */
export function getAvailableCompletions() {
	return [
		{
			type: 'clickTarget',
			label: 'Click Target',
			description: 'Complete when user clicks the target element',
			requiresTarget: true,
			params: [],
		},
		{
			type: 'domValueChanged',
			label: 'Value Changed',
			description: 'Complete when element value changes',
			requiresTarget: true,
			params: [
				{
					name: 'expectedValue',
					type: 'string',
					optional: true,
					description: 'Expected value (if not set, any change completes)',
				},
				{
					name: 'attributeName',
					type: 'string',
					optional: true,
					description: 'Attribute to watch (defaults to value/textContent)',
				},
			],
		},
		{
			type: 'wpData',
			label: 'Store Change',
			description: 'Complete when @wordpress/data store value changes',
			requiresTarget: false,
			params: [
				{
					name: 'storeName',
					type: 'string',
					required: true,
					description: 'Store name (e.g., core/block-editor)',
				},
				{
					name: 'selector',
					type: 'string',
					required: true,
					description: 'Selector function name',
				},
				{
					name: 'args',
					type: 'array',
					optional: true,
					description: 'Arguments for selector',
				},
				{
					name: 'expectedValue',
					type: 'any',
					optional: true,
					description: 'Expected value',
				},
				{
					name: 'comparator',
					type: 'string',
					optional: true,
					description: 'equals, notEquals, truthy, falsy, contains, greaterThan, lessThan',
				},
			],
		},
		{
			type: 'manual',
			label: 'Manual',
			description: 'Complete when user clicks continue button',
			requiresTarget: false,
			params: [],
		},
		{
			type: 'elementAppear',
			label: 'Element Appears',
			description: 'Complete when an element appears in DOM',
			requiresTarget: false,
			params: [
				{
					name: 'selector',
					type: 'string',
					required: true,
					description: 'CSS selector for element',
				},
			],
		},
		{
			type: 'elementDisappear',
			label: 'Element Disappears',
			description: 'Complete when an element is removed from DOM',
			requiresTarget: false,
			params: [
				{
					name: 'selector',
					type: 'string',
					required: true,
					description: 'CSS selector for element',
				},
			],
		},
		{
			type: 'customEvent',
			label: 'Custom Event',
			description: 'Complete when a custom event is dispatched',
			requiresTarget: false,
			params: [
				{
					name: 'eventName',
					type: 'string',
					required: true,
					description: 'Custom event name',
				},
			],
		},
	];
}

export default watchCompletion;
