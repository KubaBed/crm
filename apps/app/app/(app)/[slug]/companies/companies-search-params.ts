import { createListSearchParams } from "@/components/data-table/list-search-params";

export const COMPANIES_DEFAULT_VIEW = "active";

export const COMPANY_VIEW_OPTIONS = [
	{ value: "active", label: "Z dealem w trakcie" },
	{ value: "outreach", label: "Outreach" },
	{ value: "idle", label: "Bez otwartego deala" },
];

export const companiesSearchParams = createListSearchParams({
	defaultSort: "lastActivity",
	defaultDir: "desc",
	tabId: "status",
	tabDefault: COMPANIES_DEFAULT_VIEW,
	facetIds: ["owner", "industry", "enrichment", "activity"] as const,
});
