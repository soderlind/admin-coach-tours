/**
 * Step List Component.
 *
 * Displays sortable list of tour steps with drag-and-drop reordering.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Button,
	Flex,
	FlexItem,
	FlexBlock,
} from '@wordpress/components';
import { pencil, trash, plus } from '@wordpress/icons';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Step, StepListProps, SortableStepItemProps } from '../types/index';

const STORE_NAME = 'admin-coach-tours';

/**
 * Sortable step item component.
 */
function SortableStepItem( {
	step,
	onEdit,
	onDelete,
}: SortableStepItemProps ): JSX.Element {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable( { id: step.id } );

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString( transform ),
		transition: transition ?? undefined,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={ setNodeRef }
			style={ style }
			className={ `act-step-item ${ isDragging ? 'is-dragging' : '' }` }
		>
			<Flex align="center" gap={ 2 }>
				<FlexItem>
					<button
						type="button"
						className="act-step-drag-handle"
						{ ...attributes }
						{ ...listeners }
						aria-label={ __( 'Drag to reorder', 'admin-coach-tours' ) }
					>
						<span
							className="dashicons dashicons-move"
							style={ { width: 20, height: 20 } }
						/>
					</button>
				</FlexItem>

				<FlexItem className="act-step-order">
					<span className="act-step-number">{ step.order + 1 }</span>
				</FlexItem>

				<FlexBlock className="act-step-content">
					<div className="act-step-title">
						{ step.title || __( 'Untitled Step', 'admin-coach-tours' ) }
					</div>
					{ step.target?.locators?.length > 0 && (
						<div className="act-step-target-info">
							<code>
								{ step.target.locators[ 0 ].value.substring( 0, 30 ) }
								{ step.target.locators[ 0 ].value.length > 30 ? '…' : '' }
							</code>
						</div>
					) }
				</FlexBlock>

				<FlexItem className="act-step-actions">
					<Button
						icon={ pencil }
						label={ __( 'Edit step', 'admin-coach-tours' ) }
						onClick={ () => onEdit( step ) }
						size="small"
					/>
					<Button
						icon={ trash }
						label={ __( 'Delete step', 'admin-coach-tours' ) }
						onClick={ () => onDelete( step.id ) }
						size="small"
						isDestructive
					/>
				</FlexItem>
			</Flex>
		</div>
	);
}

/**
 * Step List component.
 */
export default function StepList( {
	tourId,
	steps = [],
	onEditStep,
	onAddStep,
}: StepListProps ): JSX.Element {
	const { reorderSteps, deleteStep } = useDispatch( STORE_NAME );

	// Configure drag sensors.
	const sensors = useSensors(
		useSensor( PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		} ),
		useSensor( KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		} )
	);

	/**
	 * Handle drag end.
	 */
	const handleDragEnd = useCallback(
		( event: DragEndEvent ) => {
			const { active, over } = event;

			if ( active.id !== over?.id ) {
				const oldIndex = steps.findIndex(
					( s: Step ) => s.id === active.id
				);
				const newIndex = steps.findIndex(
					( s: Step ) => s.id === over?.id
				);

				if ( oldIndex !== -1 && newIndex !== -1 ) {
					const newOrder = arrayMove(
						steps.map( ( s: Step ) => s.id ),
						oldIndex,
						newIndex
					);
					reorderSteps( tourId, newOrder );
				}
			}
		},
		[ tourId, steps, reorderSteps ]
	);

	/**
	 * Handle delete step.
	 */
	const handleDeleteStep = useCallback(
		( stepId: string ) => {
			if (
				window.confirm(
					__(
						'Are you sure you want to delete this step?',
						'admin-coach-tours'
					)
				)
			) {
				deleteStep( tourId, stepId );
			}
		},
		[ tourId, deleteStep ]
	);

	if ( steps.length === 0 ) {
		return (
			<div className="act-step-list-empty">
				<p>
					{ __(
						'No steps yet. Click the button below to add your first step.',
						'admin-coach-tours'
					) }
				</p>
				<Button variant="primary" icon={ plus } onClick={ onAddStep }>
					{ __( 'Add First Step', 'admin-coach-tours' ) }
				</Button>
			</div>
		);
	}

	// Sort steps by order.
	const sortedSteps = [ ...steps ].sort(
		( a: Step, b: Step ) => a.order - b.order
	);

	return (
		<div className="act-step-list">
			<DndContext
				sensors={ sensors }
				collisionDetection={ closestCenter }
				onDragEnd={ handleDragEnd }
			>
				<SortableContext
					items={ sortedSteps.map( ( s: Step ) => s.id ) }
					strategy={ verticalListSortingStrategy }
				>
					{ sortedSteps.map( ( step: Step ) => (
						<SortableStepItem
							key={ step.id }
							step={ step }
							onEdit={ onEditStep }
							onDelete={ handleDeleteStep }
						/>
					) ) }
				</SortableContext>
			</DndContext>

			<div className="act-step-list-footer act-button-group">
				<Button variant="secondary" icon={ plus } onClick={ onAddStep }>
					{ __( 'Add Step', 'admin-coach-tours' ) }
				</Button>
			</div>
		</div>
	);
}
