"use client";

import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { type ReactNode, useId } from "react";
import { cn } from "@crm/ui/lib/utils";

export type KanbanColumn<TItem> = {
	id: string;
	header: ReactNode;
	items: TItem[];
	empty?: ReactNode;
};

export function Kanban<TItem>({
	columns,
	getItemId,
	getItemLabel,
	renderItem,
	onItemClick,
	onMove,
	className,
}: {
	columns: KanbanColumn<TItem>[];
	getItemId: (item: TItem) => string;
	getItemLabel: (item: TItem) => string;
	renderItem: (item: TItem) => ReactNode;
	onItemClick?: (item: TItem) => void;
	onMove?: (itemId: string, toColumnId: string) => void;
	className?: string;
}) {
	const id = useId();
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor),
	);

	const columnOf = new Map(
		columns.flatMap((column) =>
			column.items.map((item) => [getItemId(item), column.id] as const),
		),
	);

	const onDragEnd = (event: DragEndEvent) => {
		const itemId = String(event.active.id);
		const to = event.over ? String(event.over.id) : null;
		if (!to || columnOf.get(itemId) === to) return;
		onMove?.(itemId, to);
	};

	return (
		<DndContext id={id} sensors={sensors} onDragEnd={onDragEnd}>
			<div
				className={cn(
					"flex min-h-0 flex-1 items-start gap-3 overflow-x-auto pb-2",
					className,
				)}
			>
				{columns.map((column) => (
					<KanbanLane
						key={column.id}
						id={column.id}
						header={column.header}
						empty={column.items.length === 0 ? column.empty : undefined}
					>
						{column.items.map((item) => (
							<KanbanCard
								key={getItemId(item)}
								id={getItemId(item)}
								label={getItemLabel(item)}
								draggable={onMove !== undefined}
								onClick={onItemClick ? () => onItemClick(item) : undefined}
							>
								{renderItem(item)}
							</KanbanCard>
						))}
					</KanbanLane>
				))}
			</div>
		</DndContext>
	);
}

function KanbanLane({
	id,
	header,
	empty,
	children,
}: {
	id: string;
	header: ReactNode;
	empty?: ReactNode;
	children: ReactNode;
}) {
	const { setNodeRef, isOver } = useDroppable({ id });

	return (
		<section
			ref={setNodeRef}
			data-slot="kanban-lane"
			className={cn(
				"flex w-72 shrink-0 flex-col gap-2 rounded-lg border bg-muted/40 p-2 transition-colors",
				isOver && "border-ring bg-muted",
			)}
		>
			<div className="px-1.5 pt-1 pb-0.5">{header}</div>
			<div className="flex flex-col gap-2">
				{children}
				{empty ? (
					<div className="px-1.5 py-6 text-center text-muted-foreground text-xs">
						{empty}
					</div>
				) : null}
			</div>
		</section>
	);
}

function KanbanCard({
	id,
	label,
	draggable,
	onClick,
	children,
}: {
	id: string;
	label: string;
	draggable: boolean;
	onClick?: () => void;
	children: ReactNode;
}) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({ id, disabled: !draggable });

	return (
		<div
			ref={setNodeRef}
			data-slot="kanban-card"
			style={{ transform: CSS.Translate.toString(transform) }}
			className={cn(
				"relative rounded-lg border bg-card p-3 text-sm transition-colors hover:border-ring/60",
				draggable && "cursor-grab active:cursor-grabbing",
				onClick && !draggable && "cursor-pointer",
				isDragging && "z-20 opacity-90",
			)}
			onClick={onClick}
			{...attributes}
			{...listeners}
			aria-label={label}
		>
			{children}
		</div>
	);
}
