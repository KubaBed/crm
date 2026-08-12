"use client";

import { DataTable, type DataTableColumn } from "@crm/ui/components/data-table";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { LocalRelativeDate } from "@/components/local-date-time";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { CampaignStatus } from "../campaign-status";
import { campaignsSearchParams } from "./campaigns-search-params";

type CampaignRow = RouterOutputs["marketingCampaigns"]["list"]["rows"][number];

function count(value: number, sent: number) {
	if (sent === 0) return <EmptyCellValue />;
	return <span>{value.toLocaleString()}</span>;
}

const COLUMNS: DataTableColumn<CampaignRow>[] = [
	{
		id: "name",
		header: "Campaign",
		sortable: true,
		hideable: false,
		width: "w-[26%]",
		cell: (row) => <span className="truncate font-medium">{row.name}</span>,
	},
	{
		id: "kind",
		header: "Kind",
		width: "w-[12%]",
		hideBelow: "md",
		cell: (row) => (
			<span className="truncate text-muted-foreground">{row.subtitle}</span>
		),
	},
	{
		id: "status",
		header: "Status",
		width: "w-[11%]",
		cell: (row) => <CampaignStatus status={row.status} />,
	},
	{
		id: "segment",
		header: "Segment",
		width: "w-[16%]",
		hideBelow: "md",
		cell: (row) =>
			row.segment ? (
				<span className="truncate text-muted-foreground">{row.segment}</span>
			) : (
				<EmptyCellValue />
			),
	},
	{
		id: "sent",
		header: "Sent",
		align: "right",
		width: "w-[8%]",
		cell: (row) => count(row.sent, row.sent),
	},
	{
		id: "opened",
		header: "Opened",
		align: "right",
		width: "w-[8%]",
		hideBelow: "sm",
		cell: (row) => count(row.opened, row.sent),
	},
	{
		id: "clicked",
		header: "Clicked",
		align: "right",
		width: "w-[8%]",
		hideBelow: "sm",
		cell: (row) => count(row.clicked, row.sent),
	},
	{
		id: "replied",
		header: "Replied",
		align: "right",
		width: "w-[8%]",
		hideBelow: "md",
		cell: (row) => count(row.replied, row.sent),
	},
	{
		id: "updatedAt",
		header: "Updated",
		sortable: true,
		align: "right",
		width: "w-[15%]",
		hideBelow: "lg",
		cell: (row) => (
			<span className="text-muted-foreground">
				{row.status === "ACTIVE" && row.activatedAt ? (
					<>
						Live since <LocalRelativeDate date={row.activatedAt} />
					</>
				) : row.scheduledAt ? (
					<LocalRelativeDate date={row.scheduledAt} />
				) : (
					<LocalRelativeDate date={row.updatedAt} />
				)}
			</span>
		),
	},
];

export function CampaignsTable() {
	const trpc = useTRPC();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();
	const { query, input } = useTableQuery(campaignsSearchParams);

	const kind = query.filters.kind ?? "all";

	const campaigns = useQuery({
		...trpc.marketingCampaigns.list.queryOptions({
			...input,
			kind: kind === "all" ? "" : kind,
			status: "",
		}),
		placeholderData: (previous) => previous,
	});

	const rows = campaigns.data?.rows ?? [];

	return (
		<DataTable
			query={query}
			search={<ListSearch placeholder="Search campaigns…" />}
			columns={COLUMNS}
			rows={rows}
			total={campaigns.data?.total ?? 0}
			getRowId={(row) => row.id}
			facets={[
				{
					id: "kind",
					label: "Kind",
					options: [
						{ value: "BLAST", label: "Blasts" },
						{ value: "DRIP", label: "Drips" },
					],
				},
			]}
			loading={campaigns.isPending}
			onRowClick={(row) =>
				router.push(workspaceUrl(`/marketing/campaigns/${row.id}`))
			}
			empty="No campaigns yet. A blast goes to a segment once; a drip follows up over weeks and branches."
		/>
	);
}
