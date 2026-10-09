import { zonedDay } from "@crm/ui/lib/format";

const DAY_MS = 86_400_000;

export const TASKS = {
	upcomingDays: 7,
	overviewLimit: 6,
	listLimit: 100,
} as const;

export const TASK_BUCKETS = [
	"overdue",
	"today",
	"upcoming",
	"later",
	"undated",
] as const;

export type TaskBucket = (typeof TASK_BUCKETS)[number];

export const TASK_BUCKET_LABEL = {
	overdue: "Zaległe",
	today: "Dziś",
	upcoming: `Najbliższe ${TASKS.upcomingDays} dni`,
	later: "Później",
	undated: "Bez terminu",
} satisfies Record<TaskBucket, string>;

export function taskBucket(dueAt: string | null, now: Date): TaskBucket {
	if (!dueAt) return "undated";
	const day = zonedDay(new Date(dueAt));
	const today = zonedDay(now);
	if (day < today) return "overdue";
	if (day === today) return "today";
	const horizon = zonedDay(
		new Date(now.getTime() + TASKS.upcomingDays * DAY_MS),
	);
	return day <= horizon ? "upcoming" : "later";
}

export function groupTasks<T extends { dueAt: string | null }>(
	tasks: T[],
	now: Date,
): { bucket: TaskBucket; tasks: T[] }[] {
	const groups = new Map<TaskBucket, T[]>();
	for (const task of tasks) {
		const bucket = taskBucket(task.dueAt, now);
		groups.set(bucket, [...(groups.get(bucket) ?? []), task]);
	}
	return TASK_BUCKETS.flatMap((bucket) => {
		const group = groups.get(bucket);
		return group ? [{ bucket, tasks: group }] : [];
	});
}
