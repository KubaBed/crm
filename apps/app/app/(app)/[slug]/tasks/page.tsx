import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellLoading,
	PageShellTitle,
} from "@/components/page-shell";
import { requireSession } from "@/lib/session";
import { TASKS } from "@/lib/tasks";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { TasksList } from "./tasks-list";

export const metadata: Metadata = {
	title: "Zadania",
};

export default function TasksPage() {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Zadania</PageShellTitle>
					<PageShellDescription>
						Wszystko, co jest otwarte, od najpilniejszego. Kliknij zadanie, żeby
						otworzyć deal albo firmę.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<Tasks />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Tasks() {
	await requireSession();

	const queryClient = getServerQueryClient();
	await queryClient.prefetchQuery(
		getServerTrpc().activities.myTasks.queryOptions({
			window: "all",
			limit: TASKS.listLimit,
		}),
	);

	return (
		<HydrateClient>
			<TasksList />
		</HydrateClient>
	);
}
