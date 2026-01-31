/**
 * Educator Sidebar Panel.
 *
 * Main sidebar panel for tour authoring in the block editor.
 * Only loads when editing an act_tour post type.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	Button,
	Notice,
	Spinner,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { help, check, seen } from '@wordpress/icons';

import StepList from './StepList.tsx';
import StepEditor from './StepEditor.tsx';
import PickerOverlay from './PickerOverlay.jsx';

const STORE_NAME = 'admin-coach-tours';

/**
 * Educator Sidebar component.
 *
 * @return {JSX.Element|null} Sidebar component or null if not on act_tour.
 */
export default function EducatorSidebar() {
	const [ savingError, setSavingError ] = useState( null );
	const [ isSavingSteps, setIsSavingSteps ] = useState( false );
	const [ saveSuccess, setSaveSuccess ] = useState( false );

	// Get data from editor store.
	const { postType, postId, postTitle, postStatus, isSaving } = useSelect(
		( select ) => {
			const editorStore = select( 'core/editor' );

			return {
				postType: editorStore?.getCurrentPostType?.() || '',
				postId: editorStore?.getCurrentPostId?.() || 0,
				postTitle:
					editorStore?.getEditedPostAttribute?.( 'title' ) || '',
				postStatus:
					editorStore?.getEditedPostAttribute?.( 'status' ) ||
					'draft',
				isSaving: editorStore?.isSavingPost?.() || false,
			};
		},
		[]
	);

	// Get data from our store.
	const { currentTour, selectedStep, isPickerActive, isLoading } = useSelect(
		( select ) => {
			const store = select( STORE_NAME );

			return {
				currentTour: store.getCurrentTour(),
				selectedStep: store.getSelectedStep(),
				isPickerActive: store.isPickerActive(),
				isLoading: store.isToursLoading(),
			};
		},
		[]
	);

	// Get dispatch actions.
	const {
		setCurrentTour,
		saveTour,
		startPicking,
		stopPicking,
		selectStep,
	} = useDispatch( STORE_NAME );

	// Get interface dispatch for opening sidebar (works in newer WP).
	const { enableComplementaryArea } = useDispatch( 'core/interface' );

	// Auto-set current tour when editing an act_tour post.
	useEffect( () => {
		if ( postType === 'act_tour' && postId && postId !== currentTour?.id ) {
			setCurrentTour( postId );
		}
	}, [ postType, postId, currentTour?.id, setCurrentTour ] );

	// Auto-open sidebar when editing an act_tour.
	useEffect( () => {
		if ( postType === 'act_tour' ) {
			// Small delay to ensure sidebar is registered.
			const timer = setTimeout( () => {
				enableComplementaryArea(
					'core',
					'admin-coach-tours-educator/admin-coach-tours-sidebar'
				);
			}, 100 );
			return () => clearTimeout( timer );
		}
	}, [ postType, enableComplementaryArea ] );

	// Don't render if not editing an act_tour.
	if ( postType !== 'act_tour' ) {
		return null;
	}

	/**
	 * Handle saving tour steps.
	 */
	const handleSaveSteps = async () => {
		if ( ! currentTour?.id ) {
			return;
		}

		setIsSavingSteps( true );
		setSavingError( null );
		setSaveSuccess( false );

		try {
			const tourData = {
				steps: currentTour.steps || [],
			};

			await saveTour( currentTour.id, tourData );
			setSaveSuccess( true );

			// Clear success message after 3 seconds.
			setTimeout( () => setSaveSuccess( false ), 3000 );
		} catch ( error ) {
			setSavingError(
				error.message ||
					__( 'Failed to save steps.', 'admin-coach-tours' )
			);
		} finally {
			setIsSavingSteps( false );
		}
	};

	/**
	 * Handle starting to pick an element for a step.
	 */
	const handleStartPicking = useCallback( () => {
		startPicking();
	}, [ startPicking ] );

	/**
	 * Handle canceling picking.
	 */
	const handleCancelPicking = useCallback( () => {
		stopPicking();
	}, [ stopPicking ] );

	/**
	 * Handle testing the tour (preview mode).
	 * Opens a new post in the tour's target post type with the tour parameter.
	 */
	const handleTestTour = useCallback( () => {
		if ( currentTour?.id ) {
			// Get the first configured post type for this tour.
			const targetPostTypes = currentTour.postTypes || [ 'post' ];
			const targetPostType = targetPostTypes[ 0 ] || 'post';

			// Build the URL to create a new post of that type with the tour parameter.
			// Use URLSearchParams to properly encode parameters.
			const adminUrl = new URL( window.location.origin + '/wp-admin/post-new.php' );
			if ( targetPostType !== 'post' ) {
				adminUrl.searchParams.set( 'post_type', targetPostType );
			}
			adminUrl.searchParams.set( 'act_tour', currentTour.id.toString() );

			console.log( '[ACT Educator] Opening test URL:', adminUrl.toString() );

			// Open in new tab for testing.
			window.open( adminUrl.toString(), '_blank' );
		}
	}, [ currentTour?.id, currentTour?.postTypes ] );

	// Show loading state.
	if ( isLoading && ! currentTour ) {
		return (
			<>
				<PluginSidebar
					name="admin-coach-tours-sidebar"
					title={ __( 'Tour Steps', 'admin-coach-tours' ) }
					icon={ help }
				>
					<div className="act-educator-sidebar">
						<PanelBody>
							<Flex
								justify="center"
								style={ { padding: '24px' } }
							>
								<Spinner />
							</Flex>
						</PanelBody>
					</div>
				</PluginSidebar>
			</>
		);
	}

	const steps = currentTour?.steps || [];

	return (
		<>
			<PluginSidebarMoreMenuItem
				target="admin-coach-tours-sidebar"
				icon={ help }
			>
				{ __( 'Tour Steps', 'admin-coach-tours' ) }
			</PluginSidebarMoreMenuItem>

			<PluginSidebar
				name="admin-coach-tours-sidebar"
				title={ __( 'Tour Steps', 'admin-coach-tours' ) }
				icon={ help }
			>
				<div className="act-educator-sidebar">
					<PanelBody
						title={ __( 'Tour Info', 'admin-coach-tours' ) }
						initialOpen={ false }
					>
						<Flex justify="space-between" align="center">
							<FlexItem>
								<strong>
									{ postTitle ||
										__(
											'Untitled Tour',
											'admin-coach-tours'
										) }
								</strong>
							</FlexItem>
							<FlexItem>
								<span
									className={ `act-tour-status${
										postStatus === 'publish'
											? ' act-tour-status--published'
											: ''
									}` }
								>
									{ postStatus === 'publish'
										? __(
												'Published',
												'admin-coach-tours'
										  )
										: __( 'Draft', 'admin-coach-tours' ) }
								</span>
							</FlexItem>
						</Flex>
						<p
							className="act-help-text"
							style={ { marginTop: '8px' } }
						>
							{ __(
								'Use the block editor canvas as a sandbox to create your tour steps. Pick elements from the editor to target them in your tour.',
								'admin-coach-tours'
							) }
						</p>
					</PanelBody>

					<PanelBody
						title={
							__( 'Steps', 'admin-coach-tours' ) +
							` (${ steps.length })`
						}
						initialOpen={ true }
					>
						{ savingError && (
							<Notice
								status="error"
								isDismissible={ true }
								onRemove={ () => setSavingError( null ) }
							>
								{ savingError }
							</Notice>
						) }

						{ saveSuccess && (
							<Notice status="success" isDismissible={ false }>
								{ __(
									'Steps saved successfully!',
									'admin-coach-tours'
								) }
							</Notice>
						) }

						<StepList
							tourId={ postId }
							steps={ steps }
							onEditStep={ ( step ) =>
								selectStep( step?.id ?? null )
							}
							onAddStep={ handleStartPicking }
						/>

						{ steps.length > 0 && (
							<div className="act-actions-footer">
								<Button
									variant="primary"
									icon={ check }
									onClick={ handleSaveSteps }
									isBusy={ isSavingSteps }
									disabled={ isSavingSteps || isSaving }
								>
									{ isSavingSteps
										? __(
												'Saving…',
												'admin-coach-tours'
										  )
										: __(
												'Save Steps',
												'admin-coach-tours'
										  ) }
								</Button>
								<Button
									variant="secondary"
									icon={ seen }
									onClick={ handleTestTour }
									disabled={ steps.length === 0 }
								>
									{ __( 'Test Tour', 'admin-coach-tours' ) }
								</Button>
							</div>
						) }
					</PanelBody>

					{ selectedStep && (
						<PanelBody
							title={ __( 'Edit Step', 'admin-coach-tours' ) }
							initialOpen={ true }
						>
							<StepEditor
								step={ selectedStep }
								tourId={ postId }
								postType="act_tour"
								onClose={ () => selectStep( null ) }
							/>
						</PanelBody>
					) }
				</div>
			</PluginSidebar>

			{ isPickerActive && (
				<PickerOverlay onCancel={ handleCancelPicking } />
			) }
		</>
	);
}
