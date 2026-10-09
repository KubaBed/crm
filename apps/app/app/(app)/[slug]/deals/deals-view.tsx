"use client";

import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useQueryStates } from "nuqs";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { DealsBoard } from "./deals-board";
import { DealsTable } from "./deals-table";
import {
	DEAL_LAYOUTS,
	type DealLayout,
	dealLayoutParsers,
} from "./deals-view-params";

const LAYOUT_LABEL = {
	list: "Lista",
	board: "Tablica",
} satisfies Record<DealLayout, string>;

function isLayout(value: string): value is DealLayout {
	return (DEAL_LAYOUTS as readonly string[]).includes(value);
}

function useDealLayout() {
	const [values, setValues] = useQueryStates(dealLayoutParsers);
	const layout = values[SEARCH_PARAM.deals.view];
	const setLayout = (next: DealLayout) =>
		void setValues({ [SEARCH_PARAM.deals.view]: next });
	return [layout, setLayout] as const;
}

export function DealsLayoutToggleFallback() {
	return (
		<ToggleGroup
			type="single"
			variant="outline"
			size="sm"
			spacing={0}
			disabled
			aria-label="Układ deali"
		>
			{DEAL_LAYOUTS.map((value) => (
				<ToggleGroupItem key={value} value={value}>
					{LAYOUT_LABEL[value]}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

export function DealsLayoutToggle() {
	const [layout, setLayout] = useDealLayout();

	return (
		<ToggleGroup
			type="single"
			variant="outline"
			size="sm"
			spacing={0}
			value={layout}
			onValueChange={(next) => {
				if (isLayout(next)) setLayout(next);
			}}
			aria-label="Układ deali"
		>
			{DEAL_LAYOUTS.map((value) => (
				<ToggleGroupItem key={value} value={value}>
					{LAYOUT_LABEL[value]}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

export function DealsView() {
	const [layout] = useDealLayout();
	return layout === "board" ? <DealsBoard /> : <DealsTable />;
}
