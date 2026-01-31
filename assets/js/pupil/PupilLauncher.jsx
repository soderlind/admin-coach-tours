/**
 * Pupil Launcher Component.
 *
 * Provides AI-powered tour generation for pupils with a dropdown of
 * predefined tasks and optional freeform chat.
 *
 * @package AdminCoachTours
 * @since   0.3.0
 */

import { useState, useEffect, useCallback, useRef } from '@wordpress/element';
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
	const inputRef = useRef( null );

	// Get state from store.
	const {
		isAiTourLoading,
		aiTourError,
		isPlaying,
		aiAvailable,
	} = useSelect( ( select ) => {
		const store = select( STORE_NAME );
		return {
			isAiTourLoading: store.isAiTourLoading?.() ?? false,
			aiTourError: store.getAiTourError?.() ?? null,
			isPlaying: store.getCurrentTour() !== null,
			// Check if AI is available from localized data.
			aiAvailable: window.adminCoachTours?.aiAvailable ?? false,
		};
	}, [] );

	// Get dispatch actions.
	const { requestAiTour, clearEphemeralTour } = useDispatch( STORE_NAME );

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
			const postType = window.adminCoachTours?.postType || 'post';
			requestAiTour( taskId, '', postType );
			setIsOpen( false );
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

			const postType = window.adminCoachTours?.postType || 'post';
			requestAiTour( '', chatQuery.trim(), postType );
			setChatQuery( '' );
			setIsOpen( false );
		},
		[ chatQuery, requestAiTour ]
	);

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

	// Don't render if a tour is playing.
	if ( isPlaying ) {
		return null;
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

	return (
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
						{ /* Error Display */ }
						{ ( aiTourError || tasksError ) && (
							<div className="act-pupil-launcher__error">
								{ aiTourError || tasksError }
							</div>
						) }

						{ /* Tasks Tab */ }
						{ activeTab === 'tasks' && (
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
	);
}
