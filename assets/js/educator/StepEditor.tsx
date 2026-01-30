/**
 * Step Editor Component.
 *
 * Form for editing step properties: title, content, target, completion, etc.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Button,
	TextControl,
	TextareaControl,
	SelectControl,
	Notice,
	Spinner,
	Flex,
	FlexItem,
	FlexBlock,
	BaseControl,
} from '@wordpress/components';
import { pin, starFilled, check, close } from '@wordpress/icons';

import { getAvailableCompletions } from '../runtime/watchCompletion.js';
import { testTargetResolution } from '../runtime/resolveTarget.js';
import type {
	Step,
	StepEditorProps,
	CompletionType,
	AiStepDraft,
	ResolutionResult,
} from '../types/index';

const STORE_NAME = 'admin-coach-tours';

/**
 * Completion type info from runtime.
 */
interface CompletionTypeInfo {
	type: string;
	label: string;
	description?: string;
	params?: Array< {
		name: string;
		description?: string;
		required?: boolean;
	} >;
}

/**
 * Step Editor component.
 */
export default function StepEditor( {
	step,
	tourId,
	postType,
	onClose,
}: StepEditorProps ): JSX.Element {
	// Local state for form fields.
	const [ title, setTitle ] = useState< string >( step.title || '' );
	const [ content, setContent ] = useState< string >( step.content || '' );
	const [ completionType, setCompletionType ] = useState< string >(
		step.completion?.type || 'manual'
	);
	const [ completionParams, setCompletionParams ] = useState<
		Record< string, unknown >
	>( ( step.completion?.params as Record< string, unknown > ) || {} );
	const [ isSaving, setIsSaving ] = useState< boolean >( false );
	const [ saveError, setSaveError ] = useState< string | null >( null );
	const [ targetTestResult, setTargetTestResult ] = useState<
		ResolutionResult | null
	>( null );

	// Get AI draft state.
	const { aiDraft, isAiDrafting, aiDraftError } = useSelect( ( select ) => {
		const store = select( STORE_NAME ) as {
			getAiDraft: () => AiStepDraft | null;
			isAiDrafting: () => boolean;
			getAiDraftError: () => string | null;
		};
		return {
			aiDraft: store.getAiDraft(),
			isAiDrafting: store.isAiDrafting(),
			aiDraftError: store.getAiDraftError(),
		};
	}, [] );

	// Get dispatch actions.
	const { updateStep, requestAiDraft, clearAiDraft, startPicking } =
		useDispatch( STORE_NAME );

	// Get completion types.
	const completionTypes: CompletionTypeInfo[] = getAvailableCompletions();

	/**
	 * Test target resolution.
	 */
	const handleTestTarget = useCallback( () => {
		if ( step.target ) {
			const result = testTargetResolution( step.target );
			setTargetTestResult( result );

			// Clear after a few seconds.
			setTimeout( () => setTargetTestResult( null ), 5000 );
		}
	}, [ step.target ] );

	/**
	 * Handle save.
	 */
	const handleSave = useCallback( async () => {
		setIsSaving( true );
		setSaveError( null );

		try {
			await updateStep( tourId, step.id, {
				title: title.trim(),
				content: content.trim(),
				completion: {
					type: completionType as CompletionType,
					params: completionParams,
				},
			} );

			onClose();
		} catch ( error ) {
			setSaveError(
				( error as Error ).message ||
					__( 'Failed to save step.', 'admin-coach-tours' )
			);
		} finally {
			setIsSaving( false );
		}
	}, [
		tourId,
		step.id,
		title,
		content,
		completionType,
		completionParams,
		updateStep,
		onClose,
	] );

	/**
	 * Handle requesting AI draft.
	 */
	const handleRequestAiDraft = useCallback( () => {
		if ( step.target ) {
			// Build element context from step data.
			const elementContext = {
				selector: step.target,
				stepId: step.id,
				existingTitle: title,
				existingContent: content,
			};
			requestAiDraft( elementContext, postType );
		}
	}, [ step.id, step.target, title, content, postType, requestAiDraft ] );

	/**
	 * Apply AI draft to form.
	 */
	const handleApplyAiDraft = useCallback( () => {
		if ( aiDraft ) {
			if ( aiDraft.title ) {
				setTitle( aiDraft.title );
			}
			if ( aiDraft.content ) {
				setContent( aiDraft.content );
			}
			if ( aiDraft.suggestedCompletion ) {
				setCompletionType( aiDraft.suggestedCompletion.type );
				setCompletionParams(
					( aiDraft.suggestedCompletion as unknown as Record<
						string,
						unknown
					> ) || {}
				);
			}
			clearAiDraft();
		}
	}, [ aiDraft, clearAiDraft ] );

	/**
	 * Handle re-picking target.
	 */
	const handleRepickTarget = useCallback( () => {
		startPicking( step.id );
	}, [ step.id, startPicking ] );

	/**
	 * Update completion params.
	 */
	const updateCompletionParam = useCallback(
		( key: string, value: unknown ) => {
			setCompletionParams( ( prev ) => ( {
				...prev,
				[ key ]: value,
			} ) );
		},
		[]
	);

	// Get current completion type info.
	const currentCompletionInfo = completionTypes.find(
		( ct ) => ct.type === completionType
	);

	return (
		<div className="act-step-editor">
			{ saveError && (
				<Notice status="error" isDismissible={ false }>
					{ saveError }
				</Notice>
			) }

			{ /* Target section */ }
			<BaseControl
				__nextHasNoMarginBottom
				label={ __( 'Target Element', 'admin-coach-tours' ) }
				className="act-step-editor-target"
			>
				<div className="act-target-info">
					{ step.target?.locators?.length > 0 ? (
						<>
							<code className="act-target-selector">
								{ step.target.locators[ 0 ].value }
							</code>
							<Flex gap={ 2 } style={ { marginTop: '8px' } }>
								<FlexItem>
									<Button
										variant="secondary"
										size="small"
										icon={ pin }
										onClick={ handleTestTarget }
									>
										{ __( 'Test', 'admin-coach-tours' ) }
									</Button>
								</FlexItem>
								<FlexItem>
									<Button
										variant="tertiary"
										size="small"
										onClick={ handleRepickTarget }
									>
										{ __( 'Re-pick', 'admin-coach-tours' ) }
									</Button>
								</FlexItem>
							</Flex>
							{ targetTestResult && (
								<Notice
									status={
										targetTestResult.success
											? 'success'
											: 'error'
									}
									isDismissible={ false }
									className="act-target-test-result"
								>
									{ targetTestResult.success
										? __(
												'Target found successfully!',
												'admin-coach-tours'
										  )
										: __(
												'Target not found. Consider re-picking.',
												'admin-coach-tours'
										  ) }
								</Notice>
							) }
						</>
					) : (
						<Button
							variant="primary"
							icon={ pin }
							onClick={ handleRepickTarget }
						>
							{ __( 'Pick Target Element', 'admin-coach-tours' ) }
						</Button>
					) }
				</div>
			</BaseControl>

			{ /* Title */ }
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Step Title', 'admin-coach-tours' ) }
				value={ title }
				onChange={ setTitle }
				placeholder={ __(
					'e.g., Click the Add Block button',
					'admin-coach-tours'
				) }
			/>

			{ /* Content */ }
			<TextareaControl
				__nextHasNoMarginBottom
				label={ __( 'Step Content', 'admin-coach-tours' ) }
				value={ content }
				onChange={ setContent }
				placeholder={ __(
					'Explain what the user should do and why…',
					'admin-coach-tours'
				) }
				rows={ 4 }
			/>

			{ /* AI Draft */ }
			{ step.target && (
				<BaseControl
					__nextHasNoMarginBottom
					label={ __( 'AI Assistance', 'admin-coach-tours' ) }
					className="act-ai-draft-section"
				>
					{ isAiDrafting ? (
						<Flex align="center" gap={ 2 }>
							<Spinner />
							<span>
								{ __(
									'Generating draft…',
									'admin-coach-tours'
								) }
							</span>
						</Flex>
					) : aiDraft ? (
						<div className="act-ai-draft">
							<div className="act-ai-draft-preview">
								<strong>{ aiDraft.title }</strong>
								<p>
									{ aiDraft.content?.substring( 0, 100 ) }…
								</p>
							</div>
							<Flex gap={ 2 }>
								<FlexItem>
									<Button
										variant="primary"
										size="small"
										icon={ check }
										onClick={ handleApplyAiDraft }
									>
										{ __( 'Apply', 'admin-coach-tours' ) }
									</Button>
								</FlexItem>
								<FlexItem>
									<Button
										variant="tertiary"
										size="small"
										icon={ close }
										onClick={ () => clearAiDraft() }
									>
										{ __( 'Dismiss', 'admin-coach-tours' ) }
									</Button>
								</FlexItem>
							</Flex>
						</div>
					) : (
						<Button
							variant="secondary"
							icon={ starFilled }
							onClick={ handleRequestAiDraft }
						>
							{ __( 'Generate with AI', 'admin-coach-tours' ) }
						</Button>
					) }
					{ aiDraftError && (
						<Notice status="error" isDismissible={ false }>
							{ aiDraftError }
						</Notice>
					) }
				</BaseControl>
			) }

			{ /* Completion Type */ }
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Completion Condition', 'admin-coach-tours' ) }
				value={ completionType }
				options={ completionTypes.map( ( ct ) => ( {
					value: ct.type,
					label: ct.label,
				} ) ) }
				onChange={ ( value: string ) => {
					setCompletionType( value );
					setCompletionParams( {} );
				} }
				help={ currentCompletionInfo?.description }
			/>

			{ /* Completion Params */ }
			{ currentCompletionInfo?.params &&
				currentCompletionInfo.params.length > 0 && (
					<div className="act-completion-params">
						{ currentCompletionInfo.params.map( ( param ) => (
							<TextControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								key={ param.name }
								label={ param.name }
								value={
									( completionParams[ param.name ] as string ) ||
									''
								}
								onChange={ ( value: string ) =>
									updateCompletionParam( param.name, value )
								}
								help={ param.description }
								required={ param.required }
							/>
						) ) }
					</div>
				) }

			{ /* Actions */ }
			<div className="act-step-editor-actions">
				<Flex justify="flex-end" gap={ 2 }>
					<FlexItem>
						<Button variant="tertiary" onClick={ onClose }>
							{ __( 'Cancel', 'admin-coach-tours' ) }
						</Button>
					</FlexItem>
					<FlexItem>
						<Button
							variant="primary"
							onClick={ handleSave }
							isBusy={ isSaving }
							disabled={ isSaving || ! title.trim() }
						>
							{ __( 'Save Step', 'admin-coach-tours' ) }
						</Button>
					</FlexItem>
				</Flex>
			</div>
		</div>
	);
}
