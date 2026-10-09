"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardPanel,
	CardPanelEmpty,
	CardTitle,
} from "@crm/ui/components/card";
import { Spinner } from "@crm/ui/components/spinner";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TaskTable } from "@/components/crm/tasks/task-table";
import { plural } from "@/lib/plural";
import { groupTasks, TASK_BUCKET_LABEL, TASKS } from "@/lib/tasks";
import { useTRPC } from "@/lib/trpc/client";

export function TasksList() {
	const trpc = useTRPC();
	const [now] = useState(() => new Date());

	const tasks = useQuery(
		trpc.activities.myTasks.queryOptions({
			window: "all",
			limit: TASKS.listLimit,
		}),
	);

	if (!tasks.data) {
		return (
			<div className="flex flex-1 justify-center py-12">
				<Spinner />
			</div>
		);
	}

	const groups = groupTasks(tasks.data, now);

	if (groups.length === 0) {
		return (
			<Card>
				<CardPanel>
					<CardPanelEmpty>
						Nic otwartego. Nowe zadanie dodasz w zakładce Activity deala albo
						firmy.
					</CardPanelEmpty>
				</CardPanel>
			</Card>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{groups.map((group) => (
				<Card key={group.bucket} className="min-w-0">
					<CardHeader>
						<CardTitle>{TASK_BUCKET_LABEL[group.bucket]}</CardTitle>
						<CardDescription>
							{plural(group.tasks.length, "zadanie", "zadania", "zadań")}
						</CardDescription>
					</CardHeader>
					<TaskTable tasks={group.tasks} now={now} />
				</Card>
			))}

			{tasks.data.length === TASKS.listLimit ? (
				<p className="text-muted-foreground text-xs">
					Widać {TASKS.listLimit} najbliższych zadań. Starsze i dalsze są w
					zakładkach Activity.
				</p>
			) : null}
		</div>
	);
}
