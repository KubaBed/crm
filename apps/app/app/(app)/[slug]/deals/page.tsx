import type { Metadata } from "next";
import { createLoader } from "nuqs/server";
import { Suspense } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellLoading,
	PageShellTitle,
} from "@/components/page-shell";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { CreateDealSheet } from "./create-deal-sheet";
import { dealsSearchParams } from "./deals-search-params";
import {
	DealsLayoutToggle,
	DealsLayoutToggleFallback,
	DealsView,
} from "./deals-view";
import { boardInput, dealLayoutParsers } from "./deals-view-params";

const loadLayout = createLoader(dealLayoutParsers);

export const metadata: Metadata = {
	title: "Deale",
};

export default function DealsPage({
	searchParams,
}: PageProps<"/[slug]/deals">) {
	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Deale</PageShellTitle>
					<PageShellDescription>
						Domyślnie rozmowy w toku. Outreach i zamknięte są w osobnych
						widokach.
					</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<Suspense fallback={<DealsLayoutToggleFallback />}>
						<DealsLayoutToggle />
					</Suspense>
					<CreateDealSheet />
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<PageShellLoading />}>
					<Deals searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Deals({
	searchParams,
}: Pick<PageProps<"/[slug]/deals">, "searchParams">) {
	const [, values, layout] = await Promise.all([
		requireSession(),
		dealsSearchParams.load(searchParams),
		loadLayout(searchParams),
	]);

	const input = dealsSearchParams.toInput(values);
	const board = layout[SEARCH_PARAM.deals.view] === "board";

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	await Promise.all([
		queryClient.prefetchQuery(
			trpc.deals.list.queryOptions(board ? boardInput(input) : input),
		),
		queryClient.prefetchQuery(trpc.users.list.queryOptions()),
		queryClient.prefetchQuery(trpc.companies.options.queryOptions({ q: "" })),
	]);

	return (
		<HydrateClient>
			<DealsView />
		</HydrateClient>
	);
}
