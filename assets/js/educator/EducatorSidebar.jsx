/**
 * Educator Sidebar Panel.
 *
 * Main sidebar panel for tour authoring in the block editor.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
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
import { plus, help } from '@wordpress/icons';

import StepList from './StepList.jsx';
import StepEditor from './StepEditor.jsx';
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

	// Get data from store.
	const {
		tours,
		isLoading,
		currentTour,
		editingStep,
		isPicking,
		isPickerActive,
		currentPostType,
		editorType,
	} = useSelect( ( select ) => {
		const store = select( STORE_NAME );
		const editorStore = select( 'core/editor' );

		return {
			tours: store.getTours(),
			isLoading: store.isLoading(),
			currentTour: store.getCurrentTour(),
			editingStep: store.getEditingStep(),
			isPicking: store.isPicking(),
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
		startPicking,
		stopPicking,
		setEditingStep,
	} = useDispatch( STORE_NAME );

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
										label={ __( 'Tour Title', 'admin-coach-tours' ) }
										value={ newTourTitle }
										onChange={ setNewTourTitle }
										placeholder={ __( 'Enter tour title…', 'admin-coach-tours' ) }
									/>
									<TextareaControl
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
									<Flex>
										<FlexItem>
											<Button
												variant="primary"
												onClick={ handleCreateTour }
												disabled={ ! newTourTitle.trim() }
											>
												{ __( 'Create', 'admin-coach-tours' ) }
											</Button>
										</FlexItem>
										<FlexItem>
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
										</FlexItem>
									</Flex>
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
					<Flex justify="space-between" style={ { marginBottom: '12px' } }>
						<FlexBlock>
							<span className="act-tour-status">
								{ currentTour.status === 'publish'
									? __( 'Published', 'admin-coach-tours' )
									: __( 'Draft', 'admin-coach-tours' )
								}
							</span>
						</FlexBlock>
						<FlexItem>
							<Button
								variant="link"
								onClick={ () => setCurrentTour( null ) }
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
					<StepList
						steps={ currentTour.steps || [] }
						onEditStep={ setEditingStep }
						onAddStep={ handleStartPicking }
					/>
				</PanelBody>

				{ editingStep && (
					<PanelBody
						title={ __( 'Edit Step', 'admin-coach-tours' ) }
						initialOpen={ true }
					>
						<StepEditor
							step={ editingStep }
							tourId={ currentTour.id }
							onClose={ () => setEditingStep( null ) }
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

			{ ( isPicking || isPickerActive ) && (
				<PickerOverlay onCancel={ handleCancelPicking } />
			) }
		</>
	);
}
