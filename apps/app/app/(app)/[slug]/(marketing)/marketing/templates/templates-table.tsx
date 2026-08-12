"use client";

import { DataTable, type DataTableColumn } from "@crm/ui/components/data-table";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { useQuery } from "@tanstack/react-query";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { LocalRelativeDate } from "@/components/local-date-time";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { templatesSearchParams } from "./templates-search-params";

type TemplateRow = RouterOutputs["marketingTemplates"]["list"]["rows"][number];

const COLUMNS: DataTableColumn<TemplateRow>[] = [
	{
		id: "name",
		header: "Template",
		sortable: true,
		hideable: false,
		width: "w-[32%]",
		cell: (row) => <span className="truncate font-medium">{row.name}</span>,
	},
	{
		id: "subject",
		header: "Subject",
		width: "w-[38%]",
		hideBelow: "md",
		cell: (row) =>
			row.subject ? (
				<span className="truncate text-muted-foreground">{row.subject}</span>
			) : (
				<EmptyCellValue />
			),
	},
	{
		id: "usedBy",
		header: "Used by",
		align: "right",
		width: "w-[14%]",
		cell: (row) => (
			<span className="text-muted-foreground">
				{row.usedBy === 0
					? "—"
					: `${row.usedBy} node${row.usedBy === 1 ? "" : "s"}`}
			</span>
		),
	},
	{
		id: "updatedAt",
		header: "Edited",
		sortable: true,
		align: "right",
		width: "w-[16%]",
		hideBelow: "sm",
		cell: (row) => (
			<span className="text-muted-foreground">
				<LocalRelativeDate date={row.updatedAt} />
			</span>
		),
	},
];

export function TemplatesTable() {
	const trpc = useTRPC();
	const { query, input } = useTableQuery(templatesSearchParams);

	const templates = useQuery({
		...trpc.marketingTemplates.list.queryOptions(input),
		placeholderData: (previous) => previous,
	});

	return (
		<DataTable
			query={query}
			search={<ListSearch placeholder="Search templates…" />}
			columns={COLUMNS}
			rows={templates.data?.rows ?? []}
			total={templates.data?.total ?? 0}
			getRowId={(row) => row.id}
			loading={templates.isPending}
			empty="No templates yet. A template holds the shell and a starting point for the copy."
		/>
	);
}
