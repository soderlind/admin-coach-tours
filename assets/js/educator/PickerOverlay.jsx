/**
 * Picker Overlay Component.
 *
 * Full-page overlay that allows educators to pick a UI element as a tour step target.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useCallback, useEffect, useRef } from '@wordpress/element';
import { createPortal } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { close, check } from '@wordpress/icons';

import { captureLocatorBundle, captureElementContext } from '../runtime/captureLocatorBundle.js';

const STORE_NAME = 'admin-coach-tours';

/**
 * Elements to exclude from picking.
 */
const EXCLUDED_SELECTORS = [
	'.act-picker-overlay',
	'.act-picker-highlight',
	'.act-picker-toolbar',
	'.edit-post-sidebar',
	'#adminmenumain',
	'#wpadminbar',
	'.components-popover',
	'.components-modal__screen-overlay',
	'iframe[name="editor-canvas"]', // Exclude iframe itself; pick elements inside
];

/**
 * Get the editor iframe element if present.
 *
 * @return {HTMLIFrameElement|null} The editor iframe or null.
 */
function getEditorIframe() {
	// WordPress 6.8+ uses an iframe for the block editor content.
	return document.querySelector( 'iframe[name="editor-canvas"]' );
}

/**
 * Check if element should be excluded from picking.
 *
 * @param {HTMLElement} element Element to check.
 * @return {boolean} True if excluded.
 */
function isExcluded( element ) {
	// Check if element matches any excluded selectors.
	for ( const selector of EXCLUDED_SELECTORS ) {
		if ( element.matches( selector ) ) {
			return true;
		}
		// Check if any ancestor matches.
		if ( element.closest( selector ) ) {
			return true;
		}
	}
	return false;
}

/**
 * Picker Overlay component.
 *
 * @param {Object}   props          Component props.
 * @param {Function} props.onCancel Cancel handler.
 * @return {JSX.Element|null} Overlay portal.
 */
export default function PickerOverlay( { onCancel } ) {
	const [ hoveredElement, setHoveredElement ] = useState( null );
	const [ highlightRect, setHighlightRect ] = useState( null );
	const overlayRef = useRef( null );

	// Get picking state.
	const { pickingStepId, currentTourId } = useSelect( ( select ) => {
		const store = select( STORE_NAME );
		return {
			pickingStepId: store.getPickingStepId?.() || null,
			currentTourId: store.getCurrentTourId?.() || null,
		};
	}, [] );

	// Get dispatch actions.
	const { stopPicking, addStep, updateStep } = useDispatch( STORE_NAME );

	// Track if element is from iframe.
	const iframeElementRef = useRef( false );

	/**
	 * Handle mouse move - track hovered element.
	 *
	 * @param {MouseEvent} event      Mouse event.
	 * @param {boolean}    fromIframe Whether event is from iframe.
	 */
	const handleMouseMove = useCallback(
		( event, fromIframe = false ) => {
			let targetElement = null;

			if ( fromIframe ) {
				// Event is from iframe - use event.target directly.
				targetElement = event.target;
				if ( targetElement && ! isExcluded( targetElement ) ) {
					iframeElementRef.current = true;

					// Get iframe to calculate position offset.
					const iframe = getEditorIframe();
					if ( iframe ) {
						const iframeRect = iframe.getBoundingClientRect();
						const elRect = targetElement.getBoundingClientRect();

						setHoveredElement( targetElement );
						setHighlightRect( {
							top: iframeRect.top + elRect.top,
							left: iframeRect.left + elRect.left,
							width: elRect.width,
							height: elRect.height,
						} );
					}
				}
			} else {
				// Event is from main document.
				const elementsAtPoint = document.elementsFromPoint(
					event.clientX,
					event.clientY
				);

				// Find first non-excluded element.
				targetElement = elementsAtPoint.find( ( el ) => {
					// Skip our overlay elements.
					if ( el.closest( '.act-picker-overlay' ) ) {
						return false;
					}
					// Skip excluded elements.
					if ( isExcluded( el ) ) {
						return false;
					}
					// Skip the iframe itself - we handle its contents separately.
					if ( el.tagName === 'IFRAME' && el.name === 'editor-canvas' ) {
						return false;
					}
					return true;
				} );

				if ( targetElement && targetElement !== hoveredElement ) {
					iframeElementRef.current = false;
					setHoveredElement( targetElement );

					// Get element rect for highlight.
					const rect = targetElement.getBoundingClientRect();
					setHighlightRect( {
						top: rect.top,
						left: rect.left,
						width: rect.width,
						height: rect.height,
					} );
				}
			}
		},
		[ hoveredElement ]
	);

	/**
	 * Handle click - capture the element.
	 */
	const handleClick = useCallback(
		( event ) => {
			// Prevent default and stop propagation.
			event.preventDefault();
			event.stopPropagation();

			if ( ! hoveredElement ) {
				return;
			}

			// Capture locator bundle from element.
			const inIframe = iframeElementRef.current;
			const target = captureLocatorBundle( hoveredElement, { inEditorIframe: inIframe } );
			const elementContext = captureElementContext( hoveredElement );

			// Create step data.
			const stepData = {
				target,
				elementContext, // For AI drafting.
				completion: {
					type: 'clickTarget',
					params: {},
				},
			};

			if ( pickingStepId ) {
				// Updating existing step.
				updateStep( currentTourId, pickingStepId, { target } );
			} else {
				// Adding new step.
				addStep( currentTourId, stepData );
			}

			// Stop picking mode.
			stopPicking();
		},
		[ hoveredElement, pickingStepId, currentTourId, addStep, updateStep, stopPicking ]
	);

	/**
	 * Handle escape key.
	 */
	const handleKeyDown = useCallback(
		( event ) => {
			if ( event.key === 'Escape' ) {
				stopPicking();
				onCancel?.();
			}
		},
		[ stopPicking, onCancel ]
	);

	// Use refs to store latest handlers so we don't need to re-attach listeners.
	const handlersRef = useRef( {
		handleMouseMove,
		handleClick,
		handleKeyDown,
	} );

	// Update refs when handlers change.
	useEffect( () => {
		handlersRef.current = {
			handleMouseMove,
			handleClick,
			handleKeyDown,
		};
	}, [ handleMouseMove, handleClick, handleKeyDown ] );

	// Set up event listeners for main document and iframe.
	useEffect( () => {
		// Stable wrappers that use refs.
		const onMouseMove = ( event ) =>
			handlersRef.current.handleMouseMove( event, false );
		const onClick = ( event ) => handlersRef.current.handleClick( event );
		const onKeyDown = ( event ) => handlersRef.current.handleKeyDown( event );

		const onIframeMouseMove = ( event ) =>
			handlersRef.current.handleMouseMove( event, true );
		const onIframeClick = ( event ) => {
			event.preventDefault();
			event.stopPropagation();
			handlersRef.current.handleClick( event );
		};

		// Main document listeners.
		document.addEventListener( 'mousemove', onMouseMove, true );
		document.addEventListener( 'click', onClick, true );
		document.addEventListener( 'keydown', onKeyDown, true );

		// Prevent scroll while picking.
		document.body.style.overflow = 'hidden';

		// Track iframe doc for cleanup.
		let iframeDoc = null;
		let pollInterval = null;

		/**
		 * Attempt to attach listeners to iframe.
		 */
		const attachIframeListeners = () => {
			const iframe = getEditorIframe();
			if ( iframe?.contentDocument && iframe.contentDocument !== iframeDoc ) {
				// Remove old listeners if doc changed.
				if ( iframeDoc ) {
					iframeDoc.removeEventListener(
						'mousemove',
						onIframeMouseMove,
						true
					);
					iframeDoc.removeEventListener( 'click', onIframeClick, true );
					iframeDoc.removeEventListener( 'keydown', onKeyDown, true );
				}

				iframeDoc = iframe.contentDocument;
				iframeDoc.addEventListener( 'mousemove', onIframeMouseMove, true );
				iframeDoc.addEventListener( 'click', onIframeClick, true );
				iframeDoc.addEventListener( 'keydown', onKeyDown, true );
			}
		};

		// Initial attempt.
		attachIframeListeners();

		// Poll for iframe (it may load after mount).
		pollInterval = setInterval( attachIframeListeners, 500 );

		return () => {
			document.removeEventListener( 'mousemove', onMouseMove, true );
			document.removeEventListener( 'click', onClick, true );
			document.removeEventListener( 'keydown', onKeyDown, true );
			document.body.style.overflow = '';

			if ( pollInterval ) {
				clearInterval( pollInterval );
			}

			if ( iframeDoc ) {
				iframeDoc.removeEventListener( 'mousemove', onIframeMouseMove, true );
				iframeDoc.removeEventListener( 'click', onIframeClick, true );
				iframeDoc.removeEventListener( 'keydown', onKeyDown, true );
			}
		};
	}, [] ); // Empty deps - uses refs for stable handlers

	// Render highlight box.
	const renderHighlight = () => {
		if ( ! highlightRect ) {
			return null;
		}

		return (
			<div
				className="act-picker-highlight"
				style={ {
					position: 'fixed',
					top: highlightRect.top,
					left: highlightRect.left,
					width: highlightRect.width,
					height: highlightRect.height,
					border: '2px solid #007cba',
					backgroundColor: 'rgba(0, 124, 186, 0.1)',
					pointerEvents: 'none',
					zIndex: 9999999,
					boxSizing: 'border-box',
				} }
			/>
		);
	};

	// Render element info.
	const renderElementInfo = () => {
		if ( ! hoveredElement ) {
			return null;
		}

		const tag = hoveredElement.tagName.toLowerCase();
		const id = hoveredElement.id;
		const classes = Array.from( hoveredElement.classList )
			.slice( 0, 3 )
			.join( '.' );

		let info = tag;
		if ( id ) {
			info += `#${ id }`;
		} else if ( classes ) {
			info += `.${ classes }`;
		}

		return (
			<div
				className="act-picker-element-info"
				style={ {
					position: 'fixed',
					bottom: '80px',
					left: '50%',
					transform: 'translateX(-50%)',
					backgroundColor: 'rgba(0, 0, 0, 0.8)',
					color: '#fff',
					padding: '8px 16px',
					borderRadius: '4px',
					fontFamily: 'monospace',
					fontSize: '13px',
					maxWidth: '80%',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					zIndex: 9999999,
				} }
			>
				{ info }
			</div>
		);
	};

	// Render toolbar.
	const renderToolbar = () => {
		return (
			<div
				className="act-picker-toolbar"
				style={ {
					position: 'fixed',
					bottom: '20px',
					left: '50%',
					transform: 'translateX(-50%)',
					display: 'flex',
					gap: '12px',
					backgroundColor: '#fff',
					padding: '12px 20px',
					borderRadius: '8px',
					boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
					zIndex: 9999999,
					pointerEvents: 'auto', // Make toolbar clickable
				} }
			>
				<span style={ { alignSelf: 'center', fontWeight: 500 } }>
					{ __( 'Click an element to select it as target', 'admin-coach-tours' ) }
				</span>
				<Button
					variant="tertiary"
					icon={ close }
					onClick={ () => {
						stopPicking();
						onCancel?.();
					} }
				>
					{ __( 'Cancel', 'admin-coach-tours' ) }
				</Button>
			</div>
		);
	};

	// Render overlay portal.
	const overlayContent = (
		<div
			ref={ overlayRef }
			className="act-picker-overlay"
			style={ {
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 9999998,
				cursor: 'crosshair',
				pointerEvents: 'none', // Let events pass through to iframe
			} }
		>
			{ renderHighlight() }
			{ renderElementInfo() }
			{ renderToolbar() }
		</div>
	);

	// Use portal to render at document body level.
	return createPortal( overlayContent, document.body );
}
