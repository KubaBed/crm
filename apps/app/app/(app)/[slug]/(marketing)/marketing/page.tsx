import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellLoading,
	PageShellTitle,
} from "@/components/page-shell";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { CampaignsTable } from "./campaigns/campaigns-table";

export const metadata: Metadata = { title: "Marketing" };

export default function MarketingOverviewPage() {
	return (
		<PageShell className="min-h-0">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Marketing</PageShellTitle>
					<PageShellDescription>
						The last thing you sent, and what it did.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<Suspense fallback={<PageShellLoading />}>
					<Recent />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function Recent() {
	const queryClient = getServerQueryClient();
	const trpc = getServerTrpc();

	await queryClient.prefetchQuery(
		trpc.marketingCampaigns.list.queryOptions({
			q: "",
			sort: "updatedAt",
			dir: "desc",
			page: 1,
			pageSize: 25,
			kind: "",
			status: "",
		}),
	);

	return (
		<HydrateClient>
			<CampaignsTable />
		</HydrateClient>
	);
}
