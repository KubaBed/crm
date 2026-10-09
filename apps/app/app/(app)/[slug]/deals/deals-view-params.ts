import { parseAsStringLiteral } from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { BOARD_VIEW_OPTIONS } from "./deal-view-options";

export const DEAL_LAYOUTS = ["list", "board"] as const;

export type DealLayout = (typeof DEAL_LAYOUTS)[number];

export const BOARD_PAGE_SIZE = 100;

const BOARD_VIEWS = new Set(BOARD_VIEW_OPTIONS.map((option) => option.value));

export const dealLayoutParsers = {
	[SEARCH_PARAM.deals.view]:
		parseAsStringLiteral(DEAL_LAYOUTS).withDefault("list"),
};

export function boardInput<TInput extends { status: string }>(input: TInput) {
	return {
		...input,
		status: BOARD_VIEWS.has(input.status) ? input.status : "open",
		stage: [],
		page: 1,
		pageSize: BOARD_PAGE_SIZE,
		sort: "progress",
		dir: "desc" as const,
	};
}
