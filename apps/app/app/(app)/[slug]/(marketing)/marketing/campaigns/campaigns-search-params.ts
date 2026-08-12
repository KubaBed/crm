import { createListSearchParams } from "@/components/data-table/list-search-params";

export const campaignsSearchParams = createListSearchParams({
	defaultSort: "updatedAt",
	defaultDir: "desc",
	facetIds: ["kind"] as const,
});
