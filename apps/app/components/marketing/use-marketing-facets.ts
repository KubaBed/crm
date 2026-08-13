"use client";

import type { FacetSpec } from "@crm/ui/components/rule-tree";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { facetsWith, TEXT_FIELD_TYPES } from "@/lib/marketing-facets";
import { useTRPC } from "@/lib/trpc/client";

export function useMarketingFacets(): FacetSpec[] {
	const trpc = useTRPC();

	const users = useQuery(trpc.users.list.queryOptions());

	const fields = useQuery(
		trpc.fields.list.queryOptions({
			entity: "CONTACT",
			includeArchived: false,
		}),
	);

	const campaigns = useQuery(
		trpc.marketingSegments.campaignOptions.queryOptions(),
	);

	return useMemo(
		() =>
			facetsWith({
				owners: users.data ?? [],
				campaigns: campaigns.data ?? [],
				fields: (fields.data ?? [])
					.filter((field) => TEXT_FIELD_TYPES.has(field.type))
					.map((field) => ({
						key: field.key,
						label: field.label,
					})),
			}),
		[users.data, campaigns.data, fields.data],
	);
}
