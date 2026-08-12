"use client";

import { DataTable, type DataTableColumn } from "@crm/ui/components/data-table";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import type { RouterOutputs } from "@/lib/trpc/types";
import { segmentsSearchParams } from "./segments-search-params";

type SegmentRow = RouterOutputs["marketingSegments"]["list"]["rows"][number];

const TYPE_LABEL: Record<string, string> = {
	rule: "By rule",
	hand: "By hand",
	both: "Both",
};

const COLUMNS: DataTableColumn<SegmentRow>[] = [
	{
		id: "name",
		header: "Segment",
		sortable: true,
		hideable: false,
		width: "w-[28%]",
		cell: (row) => <span className="truncate font-medium">{row.name}</span>,
	},
	{
		id: "type",
		header: "Type",
		width: "w-[10%]",
		cell: (row) => (
			<span className="text-muted-foreground">
				{TYPE_LABEL[row.type] ?? row.type}
			</span>
		),
	},
	{
		id: "people",
		header: "People",
		width: "w-[17%]",
		cell: (row) => (
			<span className="flex min-w-0 flex-col gap-0.5">
				<span>{row.people.toLocaleString()}</span>
				{row.type === "both" ? (
					<span className="truncate text-muted-foreground text-xs">
						{row.byRule.toLocaleString()} by rule · {row.byHand} by hand
					</span>
				) : null}
			</span>
		),
	},
	{
		id: "usedBy",
		header: "Used by",
		width: "w-[27%]",
		hideBelow: "md",
		cell: (row) =>
			row.usedBy.length === 0 ? (
				<EmptyCellValue />
			) : (
				<span className="flex min-w-0 flex-col gap-0.5">
					<span className="truncate">
						{row.usedBy.length === 1
							? row.usedBy[0]?.name
							: `${row.usedBy.length} campaigns`}
					</span>
					{row.usedBy.length === 1 ? (
						<span className="truncate text-muted-foreground text-xs">
							{row.usedBy[0]?.role}
						</span>
					) : null}
				</span>
			),
	},
	{
		id: "refreshed",
		header: "Refreshed",
		align: "right",
		width: "w-[18%]",
		hideBelow: "lg",
		cell: (row) => (
			<span className="text-muted-foreground">
				{row.refreshed === "Live" ? "Live" : "By hand"}
			</span>
		),
	},
];

export function SegmentsTable() {
	const trpc = useTRPC();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();
	const { query, input } = useTableQuery(segmentsSearchParams);

	const segments = useQuery({
		...trpc.marketingSegments.list.queryOptions(input),
		placeholderData: (previous) => previous,
	});

	return (
		<DataTable
			query={query}
			search={<ListSearch placeholder="Search segments…" />}
			columns={COLUMNS}
			rows={segments.data?.rows ?? []}
			total={segments.data?.total ?? 0}
			getRowId={(row) => row.id}
			loading={segments.isPending}
			onRowClick={(row) =>
				router.push(workspaceUrl(`/marketing/segments/${row.id}`))
			}
			empty="No segments yet. A segment is a saved question about your contacts, and every campaign shares them."
		/>
	);
}
