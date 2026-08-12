"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { RuleTree, type RuleTreeValue } from "@crm/ui/components/rule-tree";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CopilotRail } from "@/components/marketing/copilot-rail";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { FACETS, fromDefinition, toDefinition } from "./facets";

export function SegmentBuilder({ segmentId }: { segmentId: string }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const workspaceUrl = useWorkspaceUrl();

	const segment = useQuery(
		trpc.marketingSegments.byId.queryOptions({ id: segmentId }),
	);

	const [name, setName] = useState("");
	const [rules, setRules] = useState<RuleTreeValue>({
		match: "all",
		rules: [],
	});
	const [dirty, setDirty] = useState(false);

	const data = segment.data;

	useEffect(() => {
		if (!data || dirty) return;
		setName(data.name);
		setRules(fromDefinition(data.definition));
	}, [data, dirty]);

	const definition = useMemo(() => toDefinition(rules), [rules]);

	const previewOptions = trpc.marketingSegments.preview.queryOptions({
		definition: (definition ?? {
			facet: { facet: "contact.hasEmail" },
		}) as Record<string, unknown>,
	});

	const preview = useQuery({
		queryKey: previewOptions.queryKey,
		queryFn: previewOptions.queryFn,
		enabled: definition !== null,
	});

	const save = useMutation(
		trpc.marketingSegments.update.mutationOptions({
			onSuccess: async () => {
				setDirty(false);
				toast.success(
					"Saved. This changes who enters next, not who is already in a drip.",
				);
				await queryClient.invalidateQueries({
					queryKey: trpc.marketingSegments.byId.queryKey({ id: segmentId }),
				});
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (segment.isPending) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center text-muted-foreground text-xs">
				That segment is gone.
			</div>
		);
	}

	const total = definition ? (preview.data?.total ?? null) : 0;

	return (
		<div className="flex min-h-0 min-w-0 flex-1">
			<div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
				<header className="flex shrink-0 flex-col gap-2 px-6 pt-5 pb-4">
					<div className="flex items-center gap-2">
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="-ml-2 gap-1.5 font-normal text-muted-foreground"
						>
							<Link href={workspaceUrl("/marketing/segments")} prefetch>
								<Icon icon={ArrowLeft} className="size-3.5" />
								Segments
							</Link>
						</Button>
						<span className="flex-1" />
						<Button
							disabled={save.isPending || !dirty}
							onClick={() => save.mutate({ id: segmentId, name, definition })}
						>
							{save.isPending ? <Spinner /> : null}
							Save
						</Button>
					</div>

					<Input
						value={name}
						onChange={(event) => {
							setName(event.target.value);
							setDirty(true);
						}}
						className="h-auto border-0 px-0 font-medium text-2xl tracking-tight shadow-none focus-visible:ring-0 md:text-3xl"
					/>

					<p className="text-muted-foreground text-xs">
						{data.counts.byHand > 0
							? `${data.counts.byRule.toLocaleString()} by rule · ${data.counts.byHand} added by hand`
							: "Rules only. Anybody matching them is in, from now on."}
						{data.usedBy.length > 0
							? ` · used by ${data.usedBy.map((campaign) => campaign.name).join(", ")}`
							: ""}
					</p>
				</header>

				<div className="flex min-w-0 flex-1 flex-col gap-6 px-6 pb-8">
					<RuleTree
						value={rules}
						facets={FACETS}
						onChange={(next) => {
							setRules(next);
							setDirty(true);
						}}
					/>

					<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
						<div className="flex flex-col overflow-clip rounded-lg border">
							<div className="flex items-center justify-between border-b bg-muted px-4 py-2.5">
								<span className="font-medium text-xs">
									In this segment right now
								</span>
								<span className="text-muted-foreground text-xs">
									{preview.isFetching
										? "Counting…"
										: `Showing up to 20 of ${total?.toLocaleString() ?? 0}`}
								</span>
							</div>

							{(preview.data?.sample ?? []).map((person) => (
								<div
									key={person.id}
									className="flex items-center gap-3 border-b px-4 py-2.5 text-xs last:border-b-0"
								>
									<span className="min-w-0 flex-1 truncate">{person.name}</span>
									<span className="min-w-0 flex-1 truncate text-muted-foreground">
										{person.company ?? "—"}
									</span>
								</div>
							))}

							{definition === null ? (
								<p className="px-4 py-8 text-center text-muted-foreground text-xs">
									Add a rule and this fills in.
								</p>
							) : null}
						</div>

						<div className="flex h-fit flex-col overflow-clip rounded-lg border">
							<div className="flex flex-col gap-1 border-b px-4 py-4">
								<span className="font-medium text-2xl tabular-nums">
									{total?.toLocaleString() ?? "—"}
								</span>
								<span className="text-muted-foreground text-xs">
									match these rules
								</span>
							</div>
							<div className="flex flex-col gap-1 border-b px-4 py-4">
								<span className="font-medium text-2xl tabular-nums">
									{data.counts.sendable.toLocaleString()}
								</span>
								<span className="text-muted-foreground text-xs">
									can be emailed today
								</span>
							</div>
							<p className="px-4 py-3 text-muted-foreground text-xs">
								Editing these rules changes who enters next. It never removes
								anybody already in a drip.
							</p>
						</div>
					</div>
				</div>
			</div>

			<CopilotRail
				record={{ kind: "segment", id: segmentId }}
				onFinish={() => {
					void queryClient.invalidateQueries({
						queryKey: trpc.marketingSegments.byId.queryKey({ id: segmentId }),
					});
					void queryClient.invalidateQueries({
						queryKey: trpc.marketingSegments.preview.pathKey(),
					});
				}}
			/>
		</div>
	);
}
