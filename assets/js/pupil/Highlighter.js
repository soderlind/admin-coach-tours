/**
 * Highlighter Class.
 *
 * Manages visual highlighting of target elements during tour playback.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

/**
 * Default highlight styles.
 */
const DEFAULT_STYLES = {
	overlay: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		transition: 'all 0.3s ease',
	},
	spotlight: {
		boxShadow: '0 0 0 4px #007cba, 0 0 0 9999px rgba(0, 0, 0, 0.5)',
		borderRadius: '4px',
		transition: 'all 0.3s ease',
	},
	pulse: {
		animation: 'act-pulse 2s infinite',
	},
};

/**
 * CSS keyframes for pulse animation.
 */
const PULSE_KEYFRAMES = `
@keyframes act-pulse {
	0% {
		box-shadow: 0 0 0 4px #007cba, 0 0 0 9999px rgba(0, 0, 0, 0.5);
	}
	50% {
		box-shadow: 0 0 0 8px rgba(0, 124, 186, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5);
	}
	100% {
		box-shadow: 0 0 0 4px #007cba, 0 0 0 9999px rgba(0, 0, 0, 0.5);
	}
}
`;

/**
 * Highlighter class for managing element highlighting.
 */
export default class Highlighter {
	/**
	 * Constructor.
	 *
	 * @param {Object} options Configuration options.
	 */
	constructor( options = {} ) {
		this.options = {
			usePulse: true,
			overlayColor: 'rgba(0, 0, 0, 0.5)',
			highlightColor: '#007cba',
			transitionDuration: 300,
			...options,
		};

		this.spotlightElement = null;
		this.targetElement = null;
		this.resizeObserver = null;
		this.styleElement = null;

		this._init();
	}

	/**
	 * Initialize the highlighter.
	 *
	 * @private
	 */
	_init() {
		// Inject keyframes stylesheet.
		this.styleElement = document.createElement( 'style' );
		this.styleElement.textContent = PULSE_KEYFRAMES;
		document.head.appendChild( this.styleElement );

		// Create spotlight element.
		this.spotlightElement = document.createElement( 'div' );
		this.spotlightElement.className = 'act-highlighter-spotlight';
		this.spotlightElement.setAttribute( 'aria-hidden', 'true' );

		Object.assign( this.spotlightElement.style, {
			position: 'fixed',
			pointerEvents: 'none',
			zIndex: 9999980,
			...DEFAULT_STYLES.spotlight,
		} );

		// Hidden by default.
		this.spotlightElement.style.display = 'none';

		document.body.appendChild( this.spotlightElement );

		// Create resize observer.
		this.resizeObserver = new ResizeObserver( () => {
			this._updatePosition();
		} );
	}

	/**
	 * Highlight an element.
	 *
	 * @param {HTMLElement} element Element to highlight.
	 */
	highlight( element ) {
		if ( ! element || ! element.isConnected ) {
			this.clear();
			return;
		}

		// Clear previous target.
		if ( this.targetElement ) {
			this.resizeObserver.unobserve( this.targetElement );
		}

		this.targetElement = element;

		// Observe for size changes.
		this.resizeObserver.observe( element );

		// Update position.
		this._updatePosition();

		// Show spotlight.
		this.spotlightElement.style.display = 'block';

		// Apply pulse animation if enabled.
		if ( this.options.usePulse ) {
			this.spotlightElement.style.animation = 'act-pulse 2s infinite';
		}

		// Add scroll listener to update position.
		this._addScrollListeners();
	}

	/**
	 * Update spotlight position to match target.
	 *
	 * @private
	 */
	_updatePosition() {
		if ( ! this.targetElement || ! this.spotlightElement ) {
			return;
		}

		const rect = this.targetElement.getBoundingClientRect();

		// Add padding around the element.
		const padding = 4;

		// Check if element is inside an iframe and get iframe offset.
		let iframeOffset = { top: 0, left: 0 };
		const ownerDoc = this.targetElement.ownerDocument;
		if ( ownerDoc !== document ) {
			// Element is in an iframe - find the iframe element.
			const iframes = document.querySelectorAll( 'iframe' );
			for ( const iframe of iframes ) {
				if ( iframe.contentDocument === ownerDoc ) {
					const iframeRect = iframe.getBoundingClientRect();
					iframeOffset = {
						top: iframeRect.top,
						left: iframeRect.left,
					};
					break;
				}
			}
		}

		Object.assign( this.spotlightElement.style, {
			top: `${ rect.top + iframeOffset.top - padding }px`,
			left: `${ rect.left + iframeOffset.left - padding }px`,
			width: `${ rect.width + padding * 2 }px`,
			height: `${ rect.height + padding * 2 }px`,
		} );
	}

	/**
	 * Add scroll listeners to update position.
	 *
	 * @private
	 */
	_addScrollListeners() {
		this._scrollHandler = () => {
			this._updatePosition();
		};

		// Listen to all scrollable ancestors.
		let parent = this.targetElement?.parentElement;
		while ( parent ) {
			if ( parent.scrollHeight > parent.clientHeight ) {
				parent.addEventListener( 'scroll', this._scrollHandler, {
					passive: true,
				} );
			}
			parent = parent.parentElement;
		}

		// Also listen to window scroll.
		window.addEventListener( 'scroll', this._scrollHandler, {
			passive: true,
		} );
		window.addEventListener( 'resize', this._scrollHandler, {
			passive: true,
		} );
	}

	/**
	 * Remove scroll listeners.
	 *
	 * @private
	 */
	_removeScrollListeners() {
		if ( ! this._scrollHandler ) {
			return;
		}

		let parent = this.targetElement?.parentElement;
		while ( parent ) {
			parent.removeEventListener( 'scroll', this._scrollHandler );
			parent = parent.parentElement;
		}

		window.removeEventListener( 'scroll', this._scrollHandler );
		window.removeEventListener( 'resize', this._scrollHandler );

		this._scrollHandler = null;
	}

	/**
	 * Clear highlighting.
	 */
	clear() {
		if ( this.targetElement ) {
			this.resizeObserver.unobserve( this.targetElement );
			this._removeScrollListeners();
			this.targetElement = null;
		}

		if ( this.spotlightElement ) {
			this.spotlightElement.style.display = 'none';
			this.spotlightElement.style.animation = 'none';
		}
	}

	/**
	 * Transition highlight to a new element.
	 *
	 * @param {HTMLElement} element New element to highlight.
	 * @return {Promise<void>} Promise that resolves when transition completes.
	 */
	async transitionTo( element ) {
		if ( ! this.targetElement ) {
			this.highlight( element );
			return;
		}

		// Smooth transition by updating position.
		if ( this.targetElement ) {
			this.resizeObserver.unobserve( this.targetElement );
			this._removeScrollListeners();
		}

		this.targetElement = element;

		if ( element && element.isConnected ) {
			this.resizeObserver.observe( element );
			this._addScrollListeners();

			// Animate to new position.
			await new Promise( ( resolve ) => {
				requestAnimationFrame( () => {
					this._updatePosition();
					setTimeout( resolve, this.options.transitionDuration );
				} );
			} );
		} else {
			this.clear();
		}
	}

	/**
	 * Set highlight style.
	 *
	 * @param {string} style Style name: 'default', 'success', 'warning', 'error'.
	 */
	setStyle( style ) {
		if ( ! this.spotlightElement ) {
			return;
		}

		const colors = {
			default: '#007cba',
			success: '#00a32a',
			warning: '#dba617',
			error: '#d63638',
		};

		const color = colors[ style ] || colors.default;

		this.spotlightElement.style.boxShadow = `0 0 0 4px ${ color }, 0 0 0 9999px rgba(0, 0, 0, 0.5)`;
	}

	/**
	 * Flash the highlight (for completion feedback).
	 *
	 * @return {Promise<void>} Promise that resolves when flash completes.
	 */
	async flash() {
		if ( ! this.spotlightElement ) {
			return;
		}

		// Quick flash to success color.
		this.setStyle( 'success' );

		await new Promise( ( resolve ) => {
			setTimeout( () => {
				this.setStyle( 'default' );
				resolve();
			}, 300 );
		} );
	}

	/**
	 * Destroy the highlighter and clean up.
	 */
	destroy() {
		this.clear();

		if ( this.resizeObserver ) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		if ( this.spotlightElement && this.spotlightElement.parentNode ) {
			this.spotlightElement.parentNode.removeChild( this.spotlightElement );
			this.spotlightElement = null;
		}

		if ( this.styleElement && this.styleElement.parentNode ) {
			this.styleElement.parentNode.removeChild( this.styleElement );
			this.styleElement = null;
		}
	}
}
