"use client";

import type { DealStage } from "@crm/db/enums";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { TaskDue } from "@/components/crm/tasks/task-due";
import { isClosedStage } from "@/lib/deal-stage";

export function NextStep({
	stage,
	nextTask,
}: {
	stage: DealStage;
	nextTask: { subject: string | null; dueAt: string | null } | null;
}) {
	if (nextTask) {
		return (
			<TaskDue dueAt={nextTask.dueAt} now={new Date()}>
				{nextTask.subject ?? "Zadanie"}
			</TaskDue>
		);
	}
	if (isClosedStage(stage)) return <EmptyCellValue />;
	return (
		<span className="truncate text-muted-foreground">
			Brak zaplanowanego kroku
		</span>
	);
}
