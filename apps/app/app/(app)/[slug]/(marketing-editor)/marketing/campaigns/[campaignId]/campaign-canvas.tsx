"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import { Button } from "@crm/ui/components/button";
import {
	FlowCanvas,
	type FlowEdge,
	type FlowNode,
} from "@crm/ui/components/flow-canvas";
import { Icon } from "@crm/ui/components/icon";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { toast } from "sonner";
import { CopilotRail } from "@/components/marketing/copilot-rail";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { CampaignStatus } from "../../../../(marketing)/marketing/campaign-status";
import { BlastComposer } from "./blast-composer";
import { CampaignActions } from "./campaign-actions";
import { DripSettings } from "./drip-settings";
import { LogicSheet } from "./logic-sheet";
import { NodeSheet } from "./node-sheet";

type Campaign = RouterOutputs["marketingCampaigns"]["byId"];
type Stats = Campaign["stats"][number];

const KIND_LABEL: Record<string, string> = {
	BRANCH: "Branch",
	SPLIT: "A/B split",
};

function nodeTypeFor(kind: string): string {
	if (kind === "EMAIL") return "email";
	if (kind === "WAIT") return "wait";
	if (kind === "EXIT") return "exit";
	return "logic";
}

function toFlow(
	campaign: Campaign,
	stats: Map<string, Stats>,
	selectedId: string | null,
): { nodes: FlowNode[]; edges: FlowEdge[] } {
	const nodes: FlowNode[] = campaign.nodes.map((node) => {
		const numbers = stats.get(node.id);

		return {
			id: node.id,
			type: nodeTypeFor(node.kind),
			position: { x: node.x, y: node.y },
			selected: node.id === selectedId,
			draggable: true,
			data:
				node.kind === "EMAIL"
					? {
							label: node.label ?? "Email",
							subject: node.subject ?? "",
							stats: numbers
								? {
										sent: numbers.sent,
										opened: numbers.opened,
										clicked: numbers.clicked,
										replied: numbers.replied,
									}
								: null,
						}
					: node.kind === "WAIT"
						? {
								label: node.delayHours
									? `Wait ${Math.round(node.delayHours / 24) || node.delayHours} ${
											node.delayHours >= 24 ? "days" : "hours"
										}`
									: "Wait",
							}
						: node.kind === "EXIT"
							? { label: node.label ?? "Exit" }
							: {
									kind: KIND_LABEL[node.kind] ?? node.kind,
									label: node.label ?? "",
								},
		};
	});

	const edges: FlowEdge[] = campaign.edges.map((edge) => {
		const waiting = stats.get(edge.toId)?.waiting ?? 0;

		const named =
			edge.label ??
			(edge.handle === "yes"
				? "Yes"
				: edge.handle === "no"
					? "No"
					: edge.weight !== 100
						? `${edge.weight}%`
						: null);

		const inFlight = waiting > 0 ? `${waiting.toLocaleString()} here` : null;

		return {
			id: edge.id,
			source: edge.fromId,
			target: edge.toId,
			sourceHandle: edge.handle === "next" ? null : edge.handle,
			type: "smoothstep",
			label: [named, inFlight].filter(Boolean).join(" · ") || undefined,
		};
	});

	return { nodes, edges };
}

export function CampaignCanvas({ campaignId }: { campaignId: string }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const workspaceUrl = useWorkspaceUrl();
	const [selectedId, setSelectedId] = useQueryState("node");

	const campaign = useQuery(
		trpc.marketingCampaigns.byId.queryOptions({ id: campaignId }),
	);

	const invalidate = () =>
		queryClient.invalidateQueries({
			queryKey: trpc.marketingCampaigns.byId.queryKey({ id: campaignId }),
		});

	const moveNode = useMutation(
		trpc.marketingCampaigns.updateNode.mutationOptions({
			onSuccess: () => invalidate(),
		}),
	);

	const activate = useMutation(
		trpc.marketingCampaigns.activate.mutationOptions({
			onSuccess: () => {
				toast.success(
					"The drip is live. People start entering on the next tick.",
				);
				void invalidate();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const data = campaign.data;

	const stats = useMemo(
		() => new Map((data?.stats ?? []).map((row) => [row.nodeId, row])),
		[data?.stats],
	);

	const flow = useMemo(
		() => (data ? toFlow(data, stats, selectedId) : { nodes: [], edges: [] }),
		[data, stats, selectedId],
	);

	if (campaign.isPending) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center text-muted-foreground text-xs">
				That campaign is gone.
			</div>
		);
	}

	if (data.kind === "BLAST") {
		return (
			<BlastComposer campaign={data} onChanged={() => void invalidate()} />
		);
	}

	const selected = data.nodes.find((node) => node.id === selectedId) ?? null;
	const live = data.status === "ACTIVE";

	return (
		<div className="flex min-h-0 min-w-0 flex-1 flex-col">
			<header className="flex shrink-0 flex-col gap-1.5 border-b px-6 py-4">
				<div className="flex items-center gap-2">
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="-ml-2 gap-1.5 font-normal text-muted-foreground"
					>
						<Link href={workspaceUrl("/marketing/campaigns")} prefetch>
							<Icon icon={ArrowLeft} className="size-3.5" />
							Campaigns
						</Link>
					</Button>
					<span className="h-3.5 w-px bg-border" />
					<h1 className="truncate font-medium text-xs">{data.name}</h1>
					<span className="shrink-0 rounded-sm border px-1.5 py-px text-xs text-muted-foreground">
						{data.kind === "DRIP" ? "Drip" : "Blast"}
					</span>
					<span className="shrink-0 text-xs">
						<CampaignStatus status={data.status} />
					</span>

					<div className="flex-1" />

					{live ? null : (
						<Button
							size="sm"
							disabled={activate.isPending || data.kind !== "DRIP"}
							onClick={() => activate.mutate({ id: campaignId })}
						>
							Activate
						</Button>
					)}

					<DripSettings
						campaignId={campaignId}
						cooldownDays={data.reentryCooldownDays}
						maxPasses={data.maxPasses}
						onChanged={() => void invalidate()}
					/>

					<CampaignActions
						campaignId={campaignId}
						status={data.status}
						inFlight={data.inFlight}
						onChanged={() => void invalidate()}
					/>
				</div>

				<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
					<span>{data.enrolled.toLocaleString()} enrolled</span>
					<span className="size-[3px] rounded-sm bg-border" />
					<span>{data.inFlight.toLocaleString()} in flight</span>
					<span className="size-[3px] rounded-sm bg-border" />
					<span>{data.health.sent.toLocaleString()} sent</span>
					<span className="size-[3px] rounded-sm bg-border" />
					<span>{(data.health.deliveredRate * 100).toFixed(1)}% delivered</span>
					<span className="size-[3px] rounded-sm bg-border" />
					<span>{(data.health.bounceRate * 100).toFixed(1)}% bounced</span>
					<span className="size-[3px] rounded-sm bg-border" />
					<span>
						{(data.health.complaintRate * 100).toFixed(2)}% complaints
					</span>
				</div>
			</header>

			<div className="flex min-h-0 w-full flex-1">
				<FlowCanvas
					nodes={flow.nodes}
					edges={flow.edges}
					selectedId={selectedId}
					fitKey={`${data.nodes.length}-${data.edges.length}`}
					onNodeClick={(_event, node) => void setSelectedId(node.id)}
					onNodeMoved={(id, position) =>
						moveNode.mutate({ nodeId: id, x: position.x, y: position.y })
					}
				/>

				{selected && selected.kind !== "EMAIL" ? (
					<LogicSheet
						node={selected}
						campaign={data}
						stats={stats}
						onClose={() => void setSelectedId(null)}
						onChanged={() => void invalidate()}
					/>
				) : selected ? (
					<NodeSheet
						node={selected}
						campaignId={campaignId}
						recipients={data.inFlight}
						stats={stats.get(selected.id) ?? null}
						onClose={() => void setSelectedId(null)}
						onSaved={() => invalidate()}
					/>
				) : (
					<CopilotRail
						record={{ kind: "campaign", id: campaignId }}
						onFinish={() => {
							void queryClient.invalidateQueries({
								queryKey: trpc.marketingCampaigns.byId.queryKey({
									id: campaignId,
								}),
							});
							void queryClient.invalidateQueries({
								queryKey: trpc.marketingCampaigns.nodeStats.queryKey({
									id: campaignId,
								}),
							});
						}}
					/>
				)}
			</div>
		</div>
	);
}
