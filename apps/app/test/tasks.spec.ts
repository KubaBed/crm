import { describe, expect, it } from "bun:test";
import { plural } from "@/lib/plural";
import { groupTasks, taskBucket } from "@/lib/tasks";

const NOW = new Date("2026-10-09T10:00:00.000Z");

describe("task buckets", () => {
	it("keeps a task due earlier today in today, not overdue", () => {
		expect(taskBucket("2026-10-09T06:00:00.000Z", NOW)).toBe("today");
	});

	it("marks a task from a previous Warsaw day as overdue", () => {
		expect(taskBucket("2026-10-08T21:30:00.000Z", NOW)).toBe("overdue");
	});

	it("reads days in Warsaw time, not UTC", () => {
		expect(taskBucket("2026-10-09T22:30:00.000Z", NOW)).toBe("upcoming");
	});

	it("separates the next seven days from later", () => {
		expect(taskBucket("2026-10-16T08:00:00.000Z", NOW)).toBe("upcoming");
		expect(taskBucket("2026-10-17T08:00:00.000Z", NOW)).toBe("later");
	});

	it("puts a task with no due date last", () => {
		expect(taskBucket(null, NOW)).toBe("undated");
		const groups = groupTasks(
			[
				{ dueAt: null },
				{ dueAt: "2026-10-20T08:00:00.000Z" },
				{ dueAt: "2026-10-01T08:00:00.000Z" },
			],
			NOW,
		);
		expect(groups.map((group) => group.bucket)).toEqual([
			"overdue",
			"later",
			"undated",
		]);
	});
});

describe("plural", () => {
	it("picks the Polish form for the count", () => {
		expect(plural(1, "zadanie", "zadania", "zadań")).toBe("1 zadanie");
		expect(plural(3, "zadanie", "zadania", "zadań")).toBe("3 zadania");
		expect(plural(5, "zadanie", "zadania", "zadań")).toBe("5 zadań");
		expect(plural(12, "zadanie", "zadania", "zadań")).toBe("12 zadań");
		expect(plural(22, "zadanie", "zadania", "zadań")).toBe("22 zadania");
		expect(plural(0, "deal", "deale", "deali")).toBe("0 deali");
	});
});
