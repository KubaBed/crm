"use client";

import { useQueryState } from "nuqs";
import { PageShellDescription, PageShellTitle } from "@/components/page-shell";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { overviewParsers } from "./overview-search-params";

export function OverviewGreetingFallback() {
	return (
		<>
			<PageShellTitle>Dzień dobry</PageShellTitle>
			<PageShellDescription>
				Co zamknięte, co w grze i co czeka dziś na ciebie.
			</PageShellDescription>
		</>
	);
}

export function OverviewGreeting() {
	const [scope] = useQueryState(
		SEARCH_PARAM.overview.scope,
		overviewParsers[SEARCH_PARAM.overview.scope],
	);

	return (
		<>
			<PageShellTitle>Dzień dobry</PageShellTitle>
			<PageShellDescription>
				{scope === "me"
					? "Co zamknięte, co w grze i co czeka dziś na ciebie."
					: "Co zamknął zespół, co w grze i co czeka dziś na ciebie."}
			</PageShellDescription>
		</>
	);
}
