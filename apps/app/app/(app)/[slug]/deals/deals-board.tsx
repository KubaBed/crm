"use client";

import type { DealStage } from "@crm/db/enums";
import { Kanban, type KanbanColumn } from "@crm/ui/components/kanban";
import { Spinner } from "@crm/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { formatMoneyCompact } from "@crm/ui/lib/format";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CompanyCell } from "@/components/crm/company-cell";
import { DealStageIndicator } from "@/components/crm/deal-stage";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { OPEN_STAGES } from "@/lib/deal-stage";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { BOARD_VIEW_OPTIONS } from "./deal-view-options";
import { dealsSearchParams } from "./deals-search-params";
import { BOARD_PAGE_SIZE, boardInput } from "./deals-view-params";
import { NextStep } from "./next-step";

type DealRow = RouterOutputs["deals"]["list"]["rows"][number];

export function DealsBoard() {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const openRecord = useOpenRecord();
	const { query, input } = useTableQuery(dealsSearchParams);
	const [moved, setMoved] = useState<Record<string, DealStage>>({});

	const board = boardInput(input);

	const deals = useQuery({
		...trpc.deals.list.queryOptions(board),
		placeholderData: (previous) => previous,
	});

	const setStage = useMutation(
		trpc.deals.setStage.mutationOptions({
			onSuccess: (_, variables) => cache.deal(variables.id),
			onError: (error) => toast.error(error.message),
			onSettled: (_, __, variables) =>
				setMoved(({ [variables.id]: _settled, ...rest }) => rest),
		}),
	);

	const data = deals.data;

	if (!data) {
		return (
			<div className="flex flex-1 justify-center py-12">
				<Spinner />
			</div>
		);
	}

	const rows = data.rows.map((row) => {
		const stage = moved[row.id];
		return stage ? { ...row, stage } : row;
	});

	const columns: KanbanColumn<DealRow>[] = OPEN_STAGES.map((stage) => {
		const items = rows.filter((row) => row.stage === stage);
		const valueCents = items.reduce(
			(total, row) => total + (row.baseAmountCents ?? 0),
			0,
		);

		return {
			id: stage,
			items,
			empty: "Pusto",
			header: (
				<span className="flex items-center justify-between gap-2">
					<DealStageIndicator stage={stage} />
					<span className="text-muted-foreground text-xs tabular-nums">
						{items.length}
						{valueCents > 0
							? ` · ${formatMoneyCompact(valueCents, data.reportingCurrency)}`
							: ""}
					</span>
				</span>
			),
		};
	});

	const open = (row: DealRow) => openRecord({ kind: "deal", id: row.id });

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<ListSearch placeholder="Szukaj deala lub firmy…" />
				<ToggleGroup
					type="single"
					variant="outline"
					size="sm"
					spacing={0}
					value={board.status}
					onValueChange={(next) => {
						if (next) query.setTab(next);
					}}
					aria-label="Które deale pokazać"
				>
					{BOARD_VIEW_OPTIONS.map((option) => (
						<ToggleGroupItem key={option.value} value={option.value}>
							{option.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				{data.total > BOARD_PAGE_SIZE ? (
					<span className="text-muted-foreground text-xs">
						Widać {BOARD_PAGE_SIZE} z {data.total}. Zawęź wyszukiwaniem.
					</span>
				) : null}
			</div>

			<Kanban
				columns={columns}
				getItemId={(row) => row.id}
				getItemLabel={(row) => row.name}
				onItemClick={open}
				onMove={(id, to) => {
					const stage = OPEN_STAGES.find((value) => value === to);
					if (!stage) return;
					setMoved((current) => ({ ...current, [id]: stage }));
					setStage.mutate({ id, stage });
				}}
				renderItem={(row) => <DealCard deal={row} onOpen={() => open(row)} />}
			/>
		</div>
	);
}

function DealCard({ deal, onOpen }: { deal: DealRow; onOpen: () => void }) {
	return (
		<div className="flex flex-col gap-2">
			<button
				type="button"
				onClick={(event) => {
					event.stopPropagation();
					onOpen();
				}}
				className="line-clamp-2 text-left font-medium hover:underline"
			>
				{deal.name}
			</button>
			<span className="text-muted-foreground">
				<CompanyCell company={deal.company} />
			</span>
			<span className="flex min-w-0 items-center justify-between gap-3 text-xs">
				<span className="flex min-w-0 flex-1">
					<NextStep stage={deal.stage} nextTask={deal.nextTask} />
				</span>
				{deal.amountCents !== null ? (
					<span className="shrink-0 tabular-nums">
						{formatMoneyCompact(deal.amountCents, deal.currency)}
					</span>
				) : null}
			</span>
		</div>
	);
}
