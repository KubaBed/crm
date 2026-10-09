"use client";

import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardPanel,
	CardPanelEmpty,
	CardTitle,
} from "@crm/ui/components/card";
import { CardTableEmpty } from "@crm/ui/components/card-table";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	EntityLogo,
	type EntityLogoTone,
} from "@crm/ui/components/entity-logo";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Spinner } from "@crm/ui/components/spinner";
import { TableCell } from "@crm/ui/components/table";
import { formatMoneyCompact } from "@crm/ui/lib/format";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { type CSSProperties, type ReactNode, useState } from "react";
import { DealStageIndicator } from "@/components/crm/deal-stage";
import { RecordLink } from "@/components/crm/record-sheet/record-link";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { TaskTable } from "@/components/crm/tasks/task-table";
import { LocalRelativeTime } from "@/components/local-date-time";
import { activityLabel } from "@/lib/activity-presentation";
import { dealStageColor } from "@/lib/deal-stage";
import { plural } from "@/lib/plural";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { TASKS, type TaskBucket, taskBucket } from "@/lib/tasks";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { overviewParsers } from "./overview-search-params";
import { SalesDashboard } from "./sales-dashboard";

const CELL = "px-3 py-2.5 align-middle";
const OPEN_COLUMNS: SimpleTableColumn[] = [
	{ id: "deal", header: "Deal" },
	{
		id: "stage",
		header: "Etap",
		width: "w-32",
		className: "hidden lg:table-cell",
	},
	{
		id: "share",
		srLabel: "Udział w największym dealu",
		width: "w-20",
		className: "hidden sm:table-cell",
	},
	{ id: "value", header: "Wartość", width: "w-28", align: "right" },
];
const ACTIVITY_COLUMNS: SimpleTableColumn[] = [
	{ id: "activity", header: "Aktywność" },
	{
		id: "company",
		header: "Firma",
		width: "w-44",
		className: "hidden md:table-cell",
	},
	{
		id: "deal",
		header: "Deal",
		width: "w-48",
		className: "hidden lg:table-cell",
	},
	{
		id: "who",
		header: "Kto",
		width: "w-32",
		className: "hidden md:table-cell",
	},
	{ id: "when", header: "Kiedy", width: "w-28", align: "right" },
];
const SOON: ReadonlySet<TaskBucket> = new Set(["overdue", "today", "upcoming"]);

export function DashboardSummary() {
	const trpc = useTRPC();
	const openRecord = useOpenRecord();
	const workspaceUrl = useWorkspaceUrl();
	const [now] = useState(() => new Date());

	const [scope] = useQueryState(
		SEARCH_PARAM.overview.scope,
		overviewParsers[SEARCH_PARAM.overview.scope],
	);

	const summaryQuery = useQuery({
		...trpc.dashboard.summary.queryOptions({ scope }),
		placeholderData: (previous) => previous,
	});

	const tasksQuery = useQuery(
		trpc.activities.myTasks.queryOptions({
			window: "all",
			limit: TASKS.listLimit,
		}),
	);

	const summary = summaryQuery.data;

	if (!summary) {
		return (
			<div className="flex flex-1 justify-center py-12">
				<Spinner />
			</div>
		);
	}

	const { biggestOpen, recentActivity } = summary;

	const dueSoon = (tasksQuery.data ?? []).filter((task) =>
		SOON.has(taskBucket(task.dueAt, now)),
	);
	const overdueCount = dueSoon.filter(
		(task) => taskBucket(task.dueAt, now) === "overdue",
	).length;

	const mine = scope === "me";
	const largestOpenCents = biggestOpen[0]?.baseAmountCents ?? 0;

	return (
		<div className="flex flex-col gap-6">
			<SalesDashboard summary={summary} />

			<div className="grid gap-6 @3xl/page-content:grid-cols-2">
				<Card className="min-w-0">
					<CardHeader>
						<CardTitle>Deale w trakcie</CardTitle>
						<CardDescription>
							Największe otwarte deale i od kiedy stoją w etapie
						</CardDescription>
						<CardAction>
							<Button asChild variant="contrast" size="sm">
								<Link href={workspaceUrl("/deals")}>Lista deali</Link>
							</Button>
						</CardAction>
					</CardHeader>
					<CardPanel>
						{biggestOpen.length === 0 ? (
							<CardPanelEmpty>
								Nic otwartego. Czas dopełnić pipeline.
							</CardPanelEmpty>
						) : (
							<SimpleTable
								variant="panel"
								surface="page"
								columns={OPEN_COLUMNS}
							>
								{biggestOpen.map((deal) => (
									<SimpleTableRow
										key={deal.id}
										clickable
										onClick={() => openRecord({ kind: "deal", id: deal.id })}
									>
										<TableCell className={CELL}>
											<DealCell
												name={deal.name}
												company={deal.company}
												meta={<LocalRelativeTime date={deal.stageChangedAt} />}
											/>
										</TableCell>
										<TableCell className={`${CELL} hidden lg:table-cell`}>
											<DealStageIndicator stage={deal.stage} />
										</TableCell>
										<TableCell className={`${CELL} hidden sm:table-cell`}>
											<ValueMeter
												share={
													largestOpenCents > 0
														? ((deal.baseAmountCents ?? 0) / largestOpenCents) *
															100
														: 0
												}
												color={dealStageColor(deal.stage)}
											/>
										</TableCell>
										<TableCell className={`${CELL} text-right tabular-nums`}>
											{deal.amountCents === null ? (
												<EmptyCellValue />
											) : (
												formatMoneyCompact(deal.amountCents, deal.currency)
											)}
										</TableCell>
									</SimpleTableRow>
								))}
							</SimpleTable>
						)}
					</CardPanel>
				</Card>

				<Card className="min-w-0">
					<CardHeader>
						<CardTitle>Najbliższe zadania</CardTitle>
						<CardDescription>
							{dueSoon.length === 0
								? `Nic na najbliższe ${TASKS.upcomingDays} dni`
								: `${plural(dueSoon.length, "zadanie", "zadania", "zadań")} na ${TASKS.upcomingDays} dni${overdueCount > 0 ? `, zaległe: ${overdueCount}` : ""}`}
						</CardDescription>
						<CardAction>
							<Button asChild variant="contrast" size="sm">
								<Link href={workspaceUrl("/tasks")}>Wszystkie zadania</Link>
							</Button>
						</CardAction>
					</CardHeader>
					<CardPanel>
						{dueSoon.length === 0 ? (
							<CardPanelEmpty>Nic pilnego.</CardPanelEmpty>
						) : (
							<TaskTable
								tasks={dueSoon.slice(0, TASKS.overviewLimit)}
								now={now}
								variant="panel"
								surface="page"
							/>
						)}
					</CardPanel>
				</Card>
			</div>

			<Card className="min-w-0">
				<CardHeader>
					<CardTitle>
						{mine ? "Twoja ostatnia aktywność" : "Ostatnia aktywność"}
					</CardTitle>
					<CardDescription>
						{mine
							? "Notatki, zadania i zmiany etapów zapisane przez ciebie"
							: "Notatki, zadania i zmiany etapów w całym CRM"}
					</CardDescription>
					<CardAction>
						<Button asChild variant="contrast" size="sm">
							<Link href={workspaceUrl("/companies")}>Lista firm</Link>
						</Button>
					</CardAction>
				</CardHeader>
				{recentActivity.length === 0 ? (
					<CardTableEmpty>Jeszcze nic się nie wydarzyło.</CardTableEmpty>
				) : (
					<SimpleTable columns={ACTIVITY_COLUMNS}>
						{recentActivity.map((entry) => (
							<SimpleTableRow key={entry.id}>
								<TableCell className={CELL}>
									<span className="truncate">
										{entry.subject ?? activityLabel(entry.type)}
									</span>
								</TableCell>
								<TableCell className={`${CELL} hidden md:table-cell`}>
									{entry.company ? (
										<RecordLink kind="company" id={entry.company.id}>
											{entry.company.name}
										</RecordLink>
									) : (
										<EmptyCellValue />
									)}
								</TableCell>
								<TableCell className={`${CELL} hidden lg:table-cell`}>
									{entry.deal ? (
										<RecordLink kind="deal" id={entry.deal.id}>
											{entry.deal.name}
										</RecordLink>
									) : (
										<EmptyCellValue />
									)}
								</TableCell>
								<TableCell
									className={`${CELL} hidden truncate text-muted-foreground md:table-cell`}
								>
									{entry.createdBy.name}
								</TableCell>
								<TableCell
									className={`${CELL} text-right text-muted-foreground`}
								>
									<LocalRelativeTime date={entry.createdAt} />
								</TableCell>
							</SimpleTableRow>
						))}
					</SimpleTable>
				)}
			</Card>
		</div>
	);
}

function DealCell({
	name,
	company,
	meta,
}: {
	name: string;
	company: {
		name: string;
		iconUrl: string | null;
		iconDarkUrl: string | null;
		iconTone: string | null;
	};
	meta?: ReactNode;
}) {
	return (
		<span className="flex min-w-0 items-center gap-2">
			<EntityLogo
				src={company.iconUrl}
				darkSrc={company.iconDarkUrl}
				tone={company.iconTone as EntityLogoTone | null | undefined}
				name={company.name}
				size="sm"
			/>
			<span className="flex min-w-0 flex-col">
				<span className="truncate font-medium">{name}</span>
				<span className="truncate text-muted-foreground">
					{meta ? (
						<>
							{company.name} · {meta}
						</>
					) : (
						company.name
					)}
				</span>
			</span>
		</span>
	);
}

function ValueMeter({ share, color }: { share: number; color: string }) {
	return (
		<span
			className="bloom-low flex h-1.5 w-full overflow-hidden bg-muted"
			style={{ "--bloom-color": color } as CSSProperties}
		>
			<span
				className="h-full w-(--share)"
				style={
					{
						backgroundColor: color,
						"--share": `${Math.round(Math.max(Math.min(share, 100), 0))}%`,
					} as CSSProperties
				}
			/>
		</span>
	);
}
