import { createListSearchParams } from "@/components/data-table/list-search-params";

export const DEALS_DEFAULT_VIEW = "active";

export const dealsSearchParams = createListSearchParams({
	defaultSort: "progress",
	defaultDir: "desc",
	tabId: "status",
	tabDefault: DEALS_DEFAULT_VIEW,
	facetIds: ["owner", "stage", "closing"] as const,
});
