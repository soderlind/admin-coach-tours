/**
 * Educator Sidebar Panel.
 *
 * Main sidebar panel for tour authoring in the block editor.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	Button,
	TextControl,
	TextareaControl,
	SelectControl,
	Notice,
	Spinner,
	Flex,
	FlexItem,
	FlexBlock,
} from '@wordpress/components';
import { plus, help, check } from '@wordpress/icons';

import StepList from './StepList.tsx';
import StepEditor from './StepEditor.tsx';
import PickerOverlay from './PickerOverlay.jsx';

const STORE_NAME = 'admin-coach-tours';

/**
 * Educator Sidebar component.
 *
 * @return {JSX.Element} Sidebar component.
 */
export default function EducatorSidebar() {
	const [ showNewTourForm, setShowNewTourForm ] = useState( false );
	const [ newTourTitle, setNewTourTitle ] = useState( '' );
	const [ newTourDescription, setNewTourDescription ] = useState( '' );
	const [ savingError, setSavingError ] = useState( null );
	const [ isSavingSteps, setIsSavingSteps ] = useState( false );
	const [ saveSuccess, setSaveSuccess ] = useState( false );

	// Get data from store.
	const {
		tours,
		isLoading,
		currentTour,
		selectedStep,
		isPickerActive,
		currentPostType,
		editorType,
	} = useSelect( ( select ) => {
		const store = select( STORE_NAME );
		const editorStore = select( 'core/editor' );

		return {
			tours: store.getTours(),
			isLoading: store.isToursLoading(),
			currentTour: store.getCurrentTour(),
			selectedStep: store.getSelectedStep(),
			isPickerActive: store.isPickerActive(),
			currentPostType: editorStore?.getCurrentPostType?.() || 'post',
			editorType: 'block', // Currently only block editor supported.
		};
	}, [] );

	// Get dispatch actions.
	const {
		setCurrentTour,
		createTour,
		updateTour,
		saveTour,
		startPicking,
		stopPicking,
		selectStep,
	} = useDispatch( STORE_NAME );

	/**
	 * Handle saving tour steps.
	 */
	const handleSaveSteps = useCallback( async () => {
		if ( ! currentTour?.id ) {
			return;
		}

		setIsSavingSteps( true );
		setSavingError( null );
		setSaveSuccess( false );

		try {
			// Build tour data with current steps.
			const tourData = {
				steps: currentTour.steps || [],
			};

			await saveTour( currentTour.id, tourData );
			setSaveSuccess( true );

			// Clear success message after 3 seconds.
			setTimeout( () => setSaveSuccess( false ), 3000 );
		} catch ( error ) {
			setSavingError(
				error.message || __( 'Failed to save steps.', 'admin-coach-tours' )
			);
		} finally {
			setIsSavingSteps( false );
		}
	}, [ currentTour?.id, currentTour?.steps, saveTour ] );

	/**
	 * Handle creating a new tour.
	 */
	const handleCreateTour = useCallback( async () => {
		if ( ! newTourTitle.trim() ) {
			return;
		}

		setSavingError( null );

		try {
			const tourData = {
				title: newTourTitle.trim(),
				description: newTourDescription.trim(),
				postTypes: [ currentPostType ],
				editors: [ editorType ],
				status: 'draft',
			};

			const result = await createTour( tourData );

			if ( result?.id ) {
				setCurrentTour( result.id );
				setShowNewTourForm( false );
				setNewTourTitle( '' );
				setNewTourDescription( '' );
			}
		} catch ( error ) {
			setSavingError( error.message || __( 'Failed to create tour.', 'admin-coach-tours' ) );
		}
	}, [ newTourTitle, newTourDescription, currentPostType, editorType, createTour, setCurrentTour ] );

	/**
	 * Handle selecting a tour.
	 *
	 * @param {number} tourId Tour ID.
	 */
	const handleSelectTour = useCallback(
		( tourId ) => {
			setCurrentTour( tourId );
			setShowNewTourForm( false );
		},
		[ setCurrentTour ]
	);

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
	 * Render tour selector when no tour is selected.
	 *
	 * @return {JSX.Element} Tour selector.
	 */
	const renderTourSelector = () => {
		const tourOptions = [
			{ value: '', label: __( '— Select a tour —', 'admin-coach-tours' ) },
			...tours.map( ( tour ) => ( {
				value: tour.id.toString(),
				label: tour.title || __( 'Untitled Tour', 'admin-coach-tours' ),
			} ) ),
		];

		return (
			<PanelBody
				title={ __( 'Select Tour', 'admin-coach-tours' ) }
				initialOpen={ true }
			>
				{ isLoading ? (
					<Flex justify="center">
						<Spinner />
					</Flex>
				) : (
					<>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Edit Existing Tour', 'admin-coach-tours' ) }
							value=""
							options={ tourOptions }
							onChange={ ( value ) => {
								if ( value ) {
									handleSelectTour( parseInt( value, 10 ) );
								}
							} }
						/>

						<div style={ { marginTop: '16px' } }>
							{ ! showNewTourForm ? (
								<Button
									variant="primary"
									icon={ plus }
									onClick={ () => setShowNewTourForm( true ) }
								>
									{ __( 'Create New Tour', 'admin-coach-tours' ) }
								</Button>
							) : (
								<div className="act-new-tour-form">
									<TextControl
										__next40pxDefaultSize
										__nextHasNoMarginBottom
										label={ __( 'Tour Title', 'admin-coach-tours' ) }
										value={ newTourTitle }
										onChange={ setNewTourTitle }
										placeholder={ __( 'Enter tour title…', 'admin-coach-tours' ) }
									/>
									<TextareaControl
										__nextHasNoMarginBottom
										label={ __( 'Description', 'admin-coach-tours' ) }
										value={ newTourDescription }
										onChange={ setNewTourDescription }
										placeholder={ __( 'Optional description…', 'admin-coach-tours' ) }
									/>
									{ savingError && (
										<Notice
											status="error"
											isDismissible={ false }
										>
											{ savingError }
										</Notice>
									) }
									<div className="act-button-group">
										<Button
											variant="primary"
											onClick={ handleCreateTour }
											disabled={ ! newTourTitle.trim() }
										>
											{ __( 'Create', 'admin-coach-tours' ) }
										</Button>
										<Button
											variant="tertiary"
											onClick={ () => {
												setShowNewTourForm( false );
												setNewTourTitle( '' );
												setNewTourDescription( '' );
												setSavingError( null );
											} }
										>
											{ __( 'Cancel', 'admin-coach-tours' ) }
										</Button>
									</div>
								</div>
							) }
						</div>
					</>
				) }
			</PanelBody>
		);
	};

	/**
	 * Render tour editor when a tour is selected.
	 *
	 * @return {JSX.Element} Tour editor.
	 */
	const renderTourEditor = () => {
		if ( ! currentTour ) {
			return null;
		}

		return (
			<>
				<PanelBody
					title={ currentTour.title || __( 'Untitled Tour', 'admin-coach-tours' ) }
					initialOpen={ true }
				>
					<Flex justify="space-between" align="center">
						<FlexItem>
							<span className={ `act-tour-status${ currentTour.status === 'publish' ? ' act-tour-status--published' : '' }` }>
								{ currentTour.status === 'publish'
									? __( 'Published', 'admin-coach-tours' )
									: __( 'Draft', 'admin-coach-tours' )
								}
							</span>
						</FlexItem>
						<FlexItem>
							<Button
								variant="link"
								onClick={ () => setCurrentTour( null ) }
								size="small"
							>
								{ __( 'Switch Tour', 'admin-coach-tours' ) }
							</Button>
						</FlexItem>
					</Flex>

					{ currentTour.description && (
						<p className="act-tour-description">
							{ currentTour.description }
						</p>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Steps', 'admin-coach-tours' ) }
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
						<Notice
							status="success"
							isDismissible={ false }
						>
							{ __( 'Steps saved successfully!', 'admin-coach-tours' ) }
						</Notice>
					) }

					<StepList
						tourId={ currentTour.id }
						steps={ currentTour.steps || [] }
						onEditStep={ ( step ) => selectStep( step?.id ?? null ) }
						onAddStep={ handleStartPicking }
					/>

					{ ( currentTour.steps?.length > 0 ) && (
						<div className="act-actions-footer">
							<Button
								variant="primary"
								icon={ check }
								onClick={ handleSaveSteps }
								isBusy={ isSavingSteps }
								disabled={ isSavingSteps }
							>
								{ isSavingSteps
									? __( 'Saving…', 'admin-coach-tours' )
									: __( 'Save Steps', 'admin-coach-tours' )
								}
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
							tourId={ currentTour.id }
							postType={ currentPostType }
							onClose={ () => selectStep( null ) }
						/>
					</PanelBody>
				) }
			</>
		);
	};

	return (
		<>
			<PluginSidebarMoreMenuItem
				target="admin-coach-tours-sidebar"
				icon={ help }
			>
				{ __( 'Admin Coach Tours', 'admin-coach-tours' ) }
			</PluginSidebarMoreMenuItem>

			<PluginSidebar
				name="admin-coach-tours-sidebar"
				title={ __( 'Admin Coach Tours', 'admin-coach-tours' ) }
				icon={ help }
			>
				<div className="act-educator-sidebar">
					{ ! currentTour ? renderTourSelector() : renderTourEditor() }
				</div>
			</PluginSidebar>

			{ isPickerActive && (
				<PickerOverlay onCancel={ handleCancelPicking } />
			) }
		</>
	);
}
