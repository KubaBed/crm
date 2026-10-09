"use client";

import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import type { ReactNode } from "react";
import { LocalDateTime, LocalRelativeDate } from "@/components/local-date-time";
import { type TaskBucket, taskBucket } from "@/lib/tasks";

const LATER_OPTIONS: Intl.DateTimeFormatOptions = {
	day: "numeric",
	month: "short",
};

const DUE_TONE = {
	overdue: "error",
	today: "warning",
	upcoming: "info",
	later: "neutral",
	undated: "neutral",
} satisfies Record<TaskBucket, StatusTone>;

function dueText(dueAt: string | null, bucket: TaskBucket): ReactNode {
	if (!dueAt) return "Bez terminu";
	if (bucket === "later") {
		return <LocalDateTime date={dueAt} options={LATER_OPTIONS} />;
	}
	return <LocalRelativeDate date={dueAt} />;
}

export function TaskDue({
	dueAt,
	now,
	children,
}: {
	dueAt: string | null;
	now: Date;
	children?: ReactNode;
}) {
	const bucket = taskBucket(dueAt, now);
	const text = dueText(dueAt, bucket);

	return (
		<StatusIndicator
			tone={DUE_TONE[bucket]}
			label={
				children ? (
					<>
						{text} · {children}
					</>
				) : (
					text
				)
			}
		/>
	);
}
