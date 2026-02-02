/**
 * Coach Panel Component.
 *
 * Floating panel showing step content and navigation controls.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { useState, useEffect, useCallback, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Button,
	Spinner,
	Flex,
	FlexItem,
	FlexBlock,
} from '@wordpress/components';
import { arrowRight, close } from '@wordpress/icons';

/**
 * @typedef {import('../types/step.js').Step} Step
 */

/**
 * Coach Panel component.
 *
 * @param {Object}           props                          Component props.
 * @param {Step}             props.step                     Current step.
 * @param {number}           props.stepIndex                Current step index (0-based).
 * @param {number}           props.totalSteps               Total number of steps.
 * @param {string}           props.tourTitle                Tour title.
 * @param {HTMLElement|null} props.targetElement            Resolved target element.
 * @param {string|null}      props.resolutionError          Target resolution error.
 * @param {boolean}          props.isApplyingPreconditions  Whether preconditions are being applied.
 * @param {Function}         props.onContinue               Continue/complete handler.
 * @param {Function}         props.onRepeat                 Repeat step handler.
 * @param {Function}         props.onPrevious               Previous step handler.
 * @param {Function}         props.onNext                   Next step handler.
 * @param {Function}         props.onStop                   Stop tour handler.
 * @return {JSX.Element} Coach panel.
 */
export default function CoachPanel( {
	step,
	stepIndex,
	totalSteps,
	tourTitle,
	targetElement,
	resolutionError,
	isApplyingPreconditions,
	onContinue,
	onRepeat,
	onPrevious,
	onNext,
	onStop,
} ) {
	const [ position, setPosition ] = useState( { x: 20, y: 20 } );
	const [ isDragging, setIsDragging ] = useState( false );
	const [ dragOffset, setDragOffset ] = useState( { x: 0, y: 0 } );
	const [ positionKey, setPositionKey ] = useState( 0 ); // Force repositioning.
	const panelRef = useRef( null );

	const isFirstStep = stepIndex === 0;
	const isLastStep = stepIndex === totalSteps - 1;
	const isManualCompletion = step?.completion?.type === 'manual';

	/**
	 * Position panel relative to target element.
	 */
	useEffect( () => {
		if ( ! targetElement || isDragging ) {
			return;
		}

		const calculatePosition = () => {
			if ( ! targetElement?.isConnected ) {
				return;
			}

			const rect = targetElement.getBoundingClientRect();

			// For elements in iframes, adjust rect to main window coordinates.
			const ownerDoc = targetElement.ownerDocument;
			let iframeOffset = { top: 0, left: 0 };
			if ( ownerDoc !== document ) {
				const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
				if ( iframe ) {
					const iframeRect = iframe.getBoundingClientRect();
					iframeOffset = { top: iframeRect.top, left: iframeRect.left };
				}
			}

			const adjustedRect = {
				top: rect.top + iframeOffset.top,
				bottom: rect.bottom + iframeOffset.top,
				left: rect.left + iframeOffset.left,
				right: rect.right + iframeOffset.left,
			};

			const panelWidth = 320;
			const panelHeight = 200;
			const padding = 20;

			let x, y;

			// Try to position to the right of the element.
			if ( adjustedRect.right + panelWidth + padding < window.innerWidth ) {
				x = adjustedRect.right + padding;
				y = adjustedRect.top;
			}
			// Try to position to the left.
			else if ( adjustedRect.left - panelWidth - padding > 0 ) {
				x = adjustedRect.left - panelWidth - padding;
				y = adjustedRect.top;
			}
			// Try below.
			else if ( adjustedRect.bottom + panelHeight + padding < window.innerHeight ) {
				x = Math.max( padding, adjustedRect.left );
				y = adjustedRect.bottom + padding;
			}
			// Try above.
			else if ( adjustedRect.top - panelHeight - padding > 0 ) {
				x = Math.max( padding, adjustedRect.left );
				y = adjustedRect.top - panelHeight - padding;
			}
			// Default to bottom-right corner.
			else {
				x = window.innerWidth - panelWidth - padding;
				y = window.innerHeight - panelHeight - padding;
			}

			// Ensure panel stays within viewport.
			x = Math.max( padding, Math.min( x, window.innerWidth - panelWidth - padding ) );
			y = Math.max( padding, Math.min( y, window.innerHeight - panelHeight - padding ) );

			setPosition( { x, y } );
		};

		// Initial positioning.
		calculatePosition();

		// Listen to scroll and resize events.
		const handleScroll = () => {
			if ( ! isDragging ) {
				calculatePosition();
			}
		};

		// Add listeners to main window.
		window.addEventListener( 'scroll', handleScroll, { passive: true } );
		window.addEventListener( 'resize', handleScroll, { passive: true } );

		// Also listen to iframe window if element is inside iframe.
		const ownerDoc = targetElement.ownerDocument;
		const ownerWin = ownerDoc?.defaultView;
		if ( ownerWin && ownerWin !== window ) {
			ownerWin.addEventListener( 'scroll', handleScroll, { passive: true } );
		}

		return () => {
			window.removeEventListener( 'scroll', handleScroll );
			window.removeEventListener( 'resize', handleScroll );
			if ( ownerWin && ownerWin !== window ) {
				try {
					ownerWin.removeEventListener( 'scroll', handleScroll );
				} catch ( e ) {
					// Window may be inaccessible.
				}
			}
		};
	}, [ targetElement, isDragging, positionKey ] );

	/**
	 * Handle drag start.
	 */
	const handleDragStart = useCallback( ( event ) => {
		if ( event.target.closest( 'button' ) ) {
			return; // Don't drag when clicking buttons.
		}

		setIsDragging( true );
		const rect = panelRef.current.getBoundingClientRect();
		setDragOffset( {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		} );
	}, [] );

	/**
	 * Handle drag move.
	 */
	const handleDragMove = useCallback(
		( event ) => {
			if ( ! isDragging ) {
				return;
			}

			const x = event.clientX - dragOffset.x;
			const y = event.clientY - dragOffset.y;

			// Keep panel within viewport.
			const panelRect = panelRef.current.getBoundingClientRect();
			const maxX = window.innerWidth - panelRect.width;
			const maxY = window.innerHeight - panelRect.height;

			setPosition( {
				x: Math.max( 0, Math.min( x, maxX ) ),
				y: Math.max( 0, Math.min( y, maxY ) ),
			} );
		},
		[ isDragging, dragOffset ]
	);

	/**
	 * Handle drag end.
	 */
	const handleDragEnd = useCallback( () => {
		setIsDragging( false );
	}, [] );

	// Set up drag listeners.
	useEffect( () => {
		if ( isDragging ) {
			document.addEventListener( 'mousemove', handleDragMove );
			document.addEventListener( 'mouseup', handleDragEnd );

			return () => {
				document.removeEventListener( 'mousemove', handleDragMove );
				document.removeEventListener( 'mouseup', handleDragEnd );
			};
		}
	}, [ isDragging, handleDragMove, handleDragEnd ] );

	/**
	 * Render step content.
	 */
	const renderContent = () => {
		if ( isApplyingPreconditions ) {
			return (
				<div className="act-panel-loading">
					<Spinner />
					<span>{ __( 'Preparing…', 'admin-coach-tours' ) }</span>
				</div>
			);
		}

		if ( resolutionError ) {
			return (
				<div className="act-panel-error">
					<p>
						{ __(
							'Could not find the target element. The UI may have changed.',
							'admin-coach-tours'
						) }
					</p>
					<Button variant="secondary" onClick={ onRepeat }>
						{ __( 'Try Again', 'admin-coach-tours' ) }
					</Button>
				</div>
			);
		}

		return (
			<>
				{ step?.content && (
					<div
						className="act-panel-content"
						dangerouslySetInnerHTML={ { __html: step.content } }
					/>
				) }
			</>
		);
	};

	/**
	 * Render navigation controls.
	 */
	const renderControls = () => {
		return (
			<div className="act-panel-controls">
				<Flex justify="flex-end" align="center">
					<FlexItem>
						{ isManualCompletion || isLastStep ? (
							<Button
								variant="primary"
								onClick={ onContinue }
								disabled={ isApplyingPreconditions || !! resolutionError }
								size="small"
							>
								{ isLastStep
									? __( 'Finish', 'admin-coach-tours' )
									: __( 'Continue', 'admin-coach-tours' ) }
							</Button>
						) : (
							<Button
								icon={ arrowRight }
								label={ __( 'Next', 'admin-coach-tours' ) }
								onClick={ onNext }
								disabled={ isApplyingPreconditions || !! resolutionError }
								size="small"
							/>
						) }
					</FlexItem>
				</Flex>
			</div>
		);
	};

	return (
		<div
			ref={ panelRef }
			className="act-coach-panel"
			style={ {
				position: 'fixed',
				top: position.y,
				left: position.x,
				width: '360px',
				maxHeight: '450px',
				backgroundColor: '#fff',
				borderRadius: '12px',
				boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
				zIndex: 9999990,
				display: 'flex',
				flexDirection: 'column',
				cursor: isDragging ? 'grabbing' : 'default',
			} }
			onMouseDown={ handleDragStart }
		>
			{ /* Header */ }
			<div
				className="act-panel-header"
				style={ {
					padding: '16px 20px',
					borderBottom: '1px solid #e0e0e0',
					cursor: 'grab',
					userSelect: 'none',
					background: 'linear-gradient(to bottom, #fafafa, #fff)',
					borderRadius: '12px 12px 0 0',
				} }
			>
				<Flex justify="space-between" align="flex-start">
					<FlexBlock>
						<strong
							className="act-panel-title"
							style={ {
								fontSize: '16px',
								lineHeight: '1.4',
								display: 'block',
								marginBottom: '6px',
								color: '#1e1e1e',
							} }
						>
							{ step?.title ||
								__( 'Step', 'admin-coach-tours' ) + ` ${ stepIndex + 1 }` }
						</strong>
						<div
							className="act-panel-progress"
							style={ {
								fontSize: '13px',
								color: '#757575',
								fontWeight: '500',
							} }
						>
							{ `${ stepIndex + 1 } / ${ totalSteps }` }
							{ tourTitle && ` • ${ tourTitle }` }
						</div>
					</FlexBlock>
					<FlexItem>
						<Button
							icon={ close }
							label={ __( 'Close tour', 'admin-coach-tours' ) }
							onClick={ onStop }
							size="small"
						/>
					</FlexItem>
				</Flex>
			</div>

			{ /* Body */ }
			<div
				className="act-panel-body"
				style={ {
					padding: '20px',
					flex: 1,
					overflow: 'auto',
					fontSize: '14px',
					lineHeight: '1.6',
					color: '#1e1e1e',
				} }
			>
				{ renderContent() }
			</div>

			{ /* Footer */ }
			<div
				className="act-panel-footer"
				style={ {
					padding: '14px 20px',
					borderTop: '1px solid #e0e0e0',
					background: '#fafafa',
					borderRadius: '0 0 12px 12px',
				} }
			>
				{ renderControls() }
			</div>
		</div>
	);
}
