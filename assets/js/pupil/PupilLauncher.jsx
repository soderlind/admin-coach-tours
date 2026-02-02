/**
 * Pupil Launcher Component.
 *
 * Provides AI-powered tour generation for pupils with a dropdown of
 * predefined tasks and optional freeform chat.
 *
 * @package AdminCoachTours
 * @since   0.3.0
 */

import { useState, useEffect, useCallback, useRef, createPortal } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Dashicon } from '@wordpress/components';

const STORE_NAME = 'admin-coach-tours';

/**
 * Icons for task categories.
 */
const CATEGORY_ICONS = {
	media: '🖼️',
	content: '📝',
	layout: '📐',
	formatting: '✨',
	default: '📚',
};

/**
 * Pupil Launcher component.
 *
 * @return {JSX.Element|null} Launcher UI or null if hidden.
 */
export default function PupilLauncher() {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ tasks, setTasks ] = useState( [] );
	const [ isTasksLoading, setIsTasksLoading ] = useState( false );
	const [ tasksError, setTasksError ] = useState( null );
	const [ chatQuery, setChatQuery ] = useState( '' );
	const [ activeTab, setActiveTab ] = useState( 'tasks' );
	const [ localLoading, setLocalLoading ] = useState( false );
	// Track last request for retry functionality.
	const [ lastRequest, setLastRequest ] = useState( null );
	const inputRef = useRef( null );

	// Get state from store.
	const {
		storeLoading,
		aiTourError,
		isPlaying,
		aiAvailable,
		lastFailureContext,
	} = useSelect( ( select ) => {
		const store = select( STORE_NAME );
		return {
			storeLoading: store.isAiTourLoading?.() ?? false,
			aiTourError: store.getAiTourError?.() ?? null,
			isPlaying: store.getCurrentTour() !== null,
			// Check if AI is available from localized data.
			aiAvailable: window.adminCoachTours?.aiAvailable ?? false,
			// Failure context for contextual retry.
			lastFailureContext: store.getLastFailureContext?.() ?? null,
		};
	}, [] );

	// Combine local and store loading state.
	// Local state ensures immediate render before React batches updates.
	const isAiTourLoading = localLoading || storeLoading;

	// Clear local loading only when tour starts playing (not before).
	useEffect( () => {
		if ( isPlaying && localLoading ) {
			setLocalLoading( false );
		}
	}, [ isPlaying, localLoading ] );

	// Auto-open panel when there's an AI tour error (e.g., tour failed during playback).
	useEffect( () => {
		if ( aiTourError && ! isPlaying && ! isOpen ) {
			setIsOpen( true );
		}
	}, [ aiTourError, isPlaying, isOpen ] );

	// Get dispatch actions.
	const { requestAiTour, clearEphemeralTour, setAiTourError, setLastFailureContext } = useDispatch( STORE_NAME );

	/**
	 * Fetch available tasks when launcher opens.
	 */
	useEffect( () => {
		if ( isOpen && tasks.length === 0 && ! isTasksLoading ) {
			setIsTasksLoading( true );
			setTasksError( null );

			apiFetch( { path: '/admin-coach-tours/v1/ai/tasks' } )
				.then( ( response ) => {
					if ( response.available && response.tasks ) {
						setTasks( response.tasks );
					} else {
						setTasksError( __( 'AI is not available.', 'admin-coach-tours' ) );
					}
				} )
				.catch( ( error ) => {
					setTasksError( error.message || __( 'Failed to load tasks.', 'admin-coach-tours' ) );
				} )
				.finally( () => {
					setIsTasksLoading( false );
				} );
		}
	}, [ isOpen, tasks.length, isTasksLoading ] );

	/**
	 * Focus input when chat tab opens.
	 */
	useEffect( () => {
		if ( activeTab === 'chat' && inputRef.current ) {
			inputRef.current.focus();
		}
	}, [ activeTab ] );

	/**
	 * Handle task selection.
	 */
	const handleTaskClick = useCallback(
		( taskId ) => {
			// Set local loading immediately to show overlay before React batches updates.
			setLocalLoading( true );
			setIsOpen( false );
			const postType = window.adminCoachTours?.postType || 'post';
			// Track request for retry.
			setLastRequest( { type: 'task', taskId, postType } );
			requestAiTour( taskId, '', postType );
		},
		[ requestAiTour ]
	);

	/**
	 * Handle freeform chat submission.
	 */
	const handleChatSubmit = useCallback(
		( e ) => {
			e.preventDefault();
			if ( ! chatQuery.trim() ) {
				return;
			}

			// Set local loading immediately to show overlay before React batches updates.
			setLocalLoading( true );
			setIsOpen( false );
			const postType = window.adminCoachTours?.postType || 'post';
			const query = chatQuery.trim();
			// Track request for retry.
			setLastRequest( { type: 'chat', query, postType } );
			requestAiTour( '', query, postType );
			setChatQuery( '' );
		},
		[ chatQuery, requestAiTour ]
	);

	/**
	 * Retry last failed request.
	 * Passes failure context to AI so it can learn from the error.
	 */
	const handleRetry = useCallback( () => {
		if ( ! lastRequest ) {
			return;
		}

		// Clear error and retry.
		setAiTourError( null );
		setLocalLoading( true );
		setIsOpen( false );

		// Pass failure context so AI can generate better selectors.
		if ( lastRequest.type === 'task' ) {
			requestAiTour( lastRequest.taskId, '', lastRequest.postType, lastFailureContext );
		} else if ( lastRequest.type === 'chat' ) {
			requestAiTour( '', lastRequest.query, lastRequest.postType, lastFailureContext );
		}

		// Clear failure context after passing it.
		setLastFailureContext( null );
	}, [ lastRequest, lastFailureContext, requestAiTour, setAiTourError, setLastFailureContext ] );

	/**
	 * Dismiss error and clear last request.
	 */
	const handleDismissError = useCallback( () => {
		setAiTourError( null );
		setLastRequest( null );
		setLastFailureContext( null );
		setLocalLoading( false );
	}, [ setAiTourError, setLastFailureContext ] );

	/**
	 * Retry loading tasks.
	 */
	const handleRetryTasks = useCallback( () => {
		setTasksError( null );
		setTasks( [] ); // Clear to trigger re-fetch.
	}, [] );

	/**
	 * Toggle launcher open/closed.
	 */
	const toggleLauncher = useCallback( () => {
		setIsOpen( ( prev ) => ! prev );
	}, [] );

	/**
	 * Close launcher.
	 */
	const closeLauncher = useCallback( () => {
		setIsOpen( false );
	}, [] );

	// Show configuration prompt if AI is not available.
	if ( ! aiAvailable ) {
		return (
			<div className="act-pupil-launcher">
				<button
					className="act-pupil-launcher__fab"
					onClick={ toggleLauncher }
					aria-expanded={ isOpen }
					aria-label={ __( 'Open AI Coach', 'admin-coach-tours' ) }
				>
					<span className="act-pupil-launcher__icon">💡</span>
				</button>

				{ isOpen && (
					<div className="act-pupil-launcher__panel">
						<div className="act-pupil-launcher__header">
							<h3>{ __( 'AI Coach', 'admin-coach-tours' ) }</h3>
							<button
								className="act-pupil-launcher__close"
								onClick={ closeLauncher }
								aria-label={ __( 'Close', 'admin-coach-tours' ) }
							>
								×
							</button>
						</div>
						<div className="act-pupil-launcher__content">
							<div className="act-pupil-launcher__not-configured">
								<p>{ __( 'AI is not configured yet.', 'admin-coach-tours' ) }</p>
								<p>
									{ __( 'Go to ', 'admin-coach-tours' ) }
									<a href="/wp-admin/tools.php?page=admin-coach-tours">
										{ __( 'Tools → Coach Tours', 'admin-coach-tours' ) }
									</a>
									{ __( ' to add your API key.', 'admin-coach-tours' ) }
								</p>
							</div>
						</div>
					</div>
				) }
			</div>
		);
	}

	// Group tasks by category.
	const tasksByCategory = tasks.reduce( ( acc, task ) => {
		const category = task.category || 'other';
		if ( ! acc[ category ] ) {
			acc[ category ] = [];
		}
		acc[ category ].push( task );
		return acc;
	}, {} );

	// Render loading overlay via portal (always available, even when tour is playing).
	// This must be outside the isPlaying guard to persist during the transition.
	const loadingOverlay = isAiTourLoading && createPortal(
		<div className="act-ai-loading-overlay">
			<div className="act-ai-loading-overlay__content">
				<div className="act-ai-loading-overlay__spinner" />
				<h2 className="act-ai-loading-overlay__title">
					{ __( 'Creating your guided tour...', 'admin-coach-tours' ) }
				</h2>
				<p className="act-ai-loading-overlay__text">
					{ __( 'AI is analyzing the editor and generating step-by-step instructions.', 'admin-coach-tours' ) }
				</p>
				<p className="act-ai-loading-overlay__hint">
					{ __( 'This usually takes a few seconds.', 'admin-coach-tours' ) }
				</p>
			</div>
		</div>,
		document.body
	);

	// Don't render launcher UI if a tour is playing, but keep the overlay.
	if ( isPlaying ) {
		return loadingOverlay || null;
	}

	return (
		<>
			{ /* Full-screen AI Loading Overlay */ }
			{ loadingOverlay }

			<div className="act-pupil-launcher">
				{ /* Floating Action Button */ }
				<button
					className="act-pupil-launcher__fab"
					onClick={ toggleLauncher }
					aria-expanded={ isOpen }
					aria-label={ __( 'Open AI Coach', 'admin-coach-tours' ) }
					disabled={ isAiTourLoading }
				>
					{ isAiTourLoading ? (
						<span className="act-pupil-launcher__spinner" />
					) : (
						<span className="act-pupil-launcher__icon">💡</span>
					) }
				</button>

				{ /* Dropdown Panel */ }
				{ isOpen && (
					<div className="act-pupil-launcher__panel">
					{ /* AI Loading Overlay */ }
					{ isAiTourLoading && (
						<div className="act-pupil-launcher__ai-loading">
							<div className="act-pupil-launcher__ai-loading-spinner" />
							<span className="act-pupil-launcher__ai-loading-text">
								{ __( 'Creating your tour...', 'admin-coach-tours' ) }
							</span>
							<span className="act-pupil-launcher__ai-loading-hint">
								{ __( 'AI is generating step-by-step instructions', 'admin-coach-tours' ) }
							</span>
						</div>
					) }

					<div className="act-pupil-launcher__header">
						<h3>{ __( 'What would you like to learn?', 'admin-coach-tours' ) }</h3>
						<button
							className="act-pupil-launcher__close"
							onClick={ closeLauncher }
							aria-label={ __( 'Close', 'admin-coach-tours' ) }
						>
							×
						</button>
					</div>

					{ /* Tabs */ }
					<div className="act-pupil-launcher__tabs">
						<button
							className={ `act-pupil-launcher__tab ${ activeTab === 'tasks' ? 'is-active' : '' }` }
							onClick={ () => setActiveTab( 'tasks' ) }
						>
							{ __( 'Common Tasks', 'admin-coach-tours' ) }
						</button>
						<button
							className={ `act-pupil-launcher__tab ${ activeTab === 'chat' ? 'is-active' : '' }` }
							onClick={ () => setActiveTab( 'chat' ) }
						>
							{ __( 'Ask a Question', 'admin-coach-tours' ) }
						</button>
					</div>

					{ /* Content */ }
					<div className="act-pupil-launcher__content">
						{ /* AI Tour Error with Retry */ }
						{ aiTourError && (
							<div className="act-pupil-launcher__error">
								<p className="act-pupil-launcher__error-message">
									{ aiTourError }
								</p>
								<p className="act-pupil-launcher__error-hint">
									{ __( 'This might be a temporary issue.', 'admin-coach-tours' ) }
								</p>
								<div className="act-pupil-launcher__error-actions">
									{ lastRequest && (
										<button
											className="act-pupil-launcher__retry-btn"
											onClick={ handleRetry }
											disabled={ isAiTourLoading }
										>
											{ __( 'Try Again', 'admin-coach-tours' ) }
										</button>
									) }
									<button
										className="act-pupil-launcher__dismiss-btn"
										onClick={ handleDismissError }
									>
										{ __( 'Dismiss', 'admin-coach-tours' ) }
									</button>
								</div>
							</div>
						) }

						{ /* Tasks Loading Error with Retry */ }
						{ tasksError && ! aiTourError && (
							<div className="act-pupil-launcher__error">
								<p className="act-pupil-launcher__error-message">
									{ tasksError }
								</p>
								<div className="act-pupil-launcher__error-actions">
									<button
										className="act-pupil-launcher__retry-btn"
										onClick={ handleRetryTasks }
									>
										{ __( 'Try Again', 'admin-coach-tours' ) }
									</button>
								</div>
							</div>
						) }

						{ /* Tasks Tab */ }
						{ activeTab === 'tasks' && ! tasksError && (
							<div className="act-pupil-launcher__tasks">
								{ isTasksLoading && (
									<div className="act-pupil-launcher__loading">
										{ __( 'Loading tasks...', 'admin-coach-tours' ) }
									</div>
								) }

								{ ! isTasksLoading && Object.entries( tasksByCategory ).map( ( [ category, categoryTasks ] ) => (
									<div key={ category } className="act-pupil-launcher__category">
										<h4>
											<span className="act-pupil-launcher__category-icon">
												{ CATEGORY_ICONS[ category ] || CATEGORY_ICONS.default }
											</span>
											{ category.charAt( 0 ).toUpperCase() + category.slice( 1 ) }
										</h4>
										<div className="act-pupil-launcher__task-list">
											{ categoryTasks.map( ( task ) => (
												<button
													key={ task.id }
													className="act-pupil-launcher__task"
													onClick={ () => handleTaskClick( task.id ) }
													disabled={ isAiTourLoading }
												>
													<span className="act-pupil-launcher__task-icon">
														{ task.icon ? (
															<Dashicon icon={ task.icon } />
														) : '📌' }
													</span>
													<span className="act-pupil-launcher__task-label">
														{ task.label }
													</span>
												</button>
											) ) }
										</div>
									</div>
								) ) }
							</div>
						) }

						{ /* Chat Tab */ }
						{ activeTab === 'chat' && (
							<div className="act-pupil-launcher__chat">
								<p className="act-pupil-launcher__chat-hint">
									{ __( 'Ask about the WordPress editor:', 'admin-coach-tours' ) }
								</p>
								<form onSubmit={ handleChatSubmit }>
									<input
										ref={ inputRef }
										type="text"
										className="act-pupil-launcher__chat-input"
										value={ chatQuery }
										onChange={ ( e ) => setChatQuery( e.target.value ) }
										placeholder={ __( 'e.g., How do I add a gallery?', 'admin-coach-tours' ) }
										disabled={ isAiTourLoading }
									/>
									<button
										type="submit"
										className="act-pupil-launcher__chat-submit"
										disabled={ isAiTourLoading || ! chatQuery.trim() }
									>
										{ isAiTourLoading
											? __( 'Generating...', 'admin-coach-tours' )
											: __( 'Get Tour', 'admin-coach-tours' ) }
									</button>
								</form>
								<p className="act-pupil-launcher__chat-note">
									{ __( 'AI will create a step-by-step tour to guide you.', 'admin-coach-tours' ) }
								</p>
							</div>
						) }
					</div>
				</div>
			) }
			</div>
		</>
	);
}
