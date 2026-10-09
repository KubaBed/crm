"use client";

import { Checkbox } from "@crm/ui/components/checkbox";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	type RecordRef,
	type RecordView,
	useOpenRecord,
} from "@/components/crm/record-sheet/record-stack";
import { TaskDue } from "@/components/crm/tasks/task-due";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

export type TaskEntry = RouterOutputs["activities"]["myTasks"][number];

const CELL = "px-3 py-2.5 align-middle";

const COLUMNS: SimpleTableColumn[] = [
	{ id: "done", srLabel: "Zrobione", width: "w-10" },
	{ id: "task", header: "Zadanie" },
	{ id: "due", header: "Termin", width: "w-32", align: "right" },
];

const TASK_VIEW: RecordView = { tab: "activity", timeline: "upcoming" };

function taskRecord(task: TaskEntry): RecordRef | null {
	if (task.deal) return { kind: "deal", id: task.deal.id };
	if (task.company) return { kind: "company", id: task.company.id };
	if (task.contact) return { kind: "contact", id: task.contact.id };
	return null;
}

function taskContext(task: TaskEntry): string | null {
	if (task.deal) return task.deal.name;
	if (task.company) return task.company.name;
	if (task.contact) {
		return [task.contact.firstName, task.contact.lastName]
			.filter(Boolean)
			.join(" ");
	}
	return null;
}

export function TaskTable({
	tasks,
	now,
	variant = "default",
	surface,
}: {
	tasks: TaskEntry[];
	now: Date;
	variant?: "default" | "panel";
	surface?: "popover" | "page";
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const openRecord = useOpenRecord();

	const complete = useMutation(
		trpc.activities.complete.mutationOptions({
			onSuccess: (entry, variables) => {
				void cache.activity();
				if (!variables.completed) return;
				toast.success("Zadanie zrobione", {
					description: entry.subject ?? undefined,
					action: {
						label: "Cofnij",
						onClick: () =>
							complete.mutate({ id: variables.id, completed: false }),
					},
				});
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<SimpleTable
			variant={variant}
			surface={surface}
			columns={COLUMNS}
			className="table-fixed"
		>
			{tasks.map((task) => {
				const record = taskRecord(task);
				const context = taskContext(task);
				const open = record ? () => openRecord(record, TASK_VIEW) : undefined;
				const subject = task.subject ?? "Zadanie bez tytułu";

				return (
					<SimpleTableRow
						key={task.id}
						clickable={open !== undefined}
						onClick={open}
					>
						<TableCell
							className={CELL}
							onClick={(event) => event.stopPropagation()}
						>
							<Checkbox
								checked={false}
								disabled={complete.isPending}
								aria-label={`Oznacz jako zrobione: ${subject}`}
								onCheckedChange={() =>
									complete.mutate({ id: task.id, completed: true })
								}
							/>
						</TableCell>
						<TableCell className={CELL}>
							<span className="flex min-w-0 flex-col">
								{open ? (
									<button
										type="button"
										onClick={(event) => {
											event.stopPropagation();
											open();
										}}
										className="truncate text-left hover:underline"
									>
										{subject}
									</button>
								) : (
									<span className="truncate">{subject}</span>
								)}
								{context ? (
									<span className="truncate text-muted-foreground">
										{context}
									</span>
								) : null}
							</span>
						</TableCell>
						<TableCell className={`${CELL} text-right`}>
							<TaskDue dueAt={task.dueAt} now={now} />
						</TableCell>
					</SimpleTableRow>
				);
			})}
		</SimpleTable>
	);
}
