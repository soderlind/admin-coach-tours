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
];

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
	const { pickingStepId } = useSelect( ( select ) => {
		const store = select( STORE_NAME );
		return {
			pickingStepId: store.getPickingStepId?.() || null,
		};
	}, [] );

	// Get dispatch actions.
	const { stopPicking, addStep, updateStep } = useDispatch( STORE_NAME );

	/**
	 * Handle mouse move - track hovered element.
	 */
	const handleMouseMove = useCallback(
		( event ) => {
			// Get element under cursor, excluding our overlay.
			const elementsAtPoint = document.elementsFromPoint(
				event.clientX,
				event.clientY
			);

			// Find first non-excluded element.
			const targetElement = elementsAtPoint.find( ( el ) => {
				// Skip our overlay elements.
				if ( el.closest( '.act-picker-overlay' ) ) {
					return false;
				}
				// Skip excluded elements.
				if ( isExcluded( el ) ) {
					return false;
				}
				return true;
			} );

			if ( targetElement && targetElement !== hoveredElement ) {
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
			const target = captureLocatorBundle( hoveredElement );
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
				updateStep( pickingStepId, { target } );
			} else {
				// Adding new step.
				addStep( stepData );
			}

			// Stop picking mode.
			stopPicking();
		},
		[ hoveredElement, pickingStepId, addStep, updateStep, stopPicking ]
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

	// Set up event listeners.
	useEffect( () => {
		document.addEventListener( 'mousemove', handleMouseMove, true );
		document.addEventListener( 'click', handleClick, true );
		document.addEventListener( 'keydown', handleKeyDown, true );

		// Prevent scroll while picking.
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener( 'mousemove', handleMouseMove, true );
			document.removeEventListener( 'click', handleClick, true );
			document.removeEventListener( 'keydown', handleKeyDown, true );
			document.body.style.overflow = '';
		};
	}, [ handleMouseMove, handleClick, handleKeyDown ] );

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
