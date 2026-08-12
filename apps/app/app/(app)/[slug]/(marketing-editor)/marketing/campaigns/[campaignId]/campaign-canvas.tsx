"use client";

import "@crm/ui/flow-tokens.css";

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
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { CampaignStatus } from "../../../../(marketing)/marketing/campaign-status";
import { CopilotRail } from "./copilot-rail";
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

	const waiting = new Map<string, number>();
	for (const row of stats.values()) waiting.set(row.nodeId, row.waiting);

	const edges: FlowEdge[] = campaign.edges.map((edge) => ({
		id: edge.id,
		source: edge.fromId,
		target: edge.toId,
		sourceHandle: edge.handle === "next" ? null : edge.handle,
		type: "smoothstep",
		label:
			edge.label ??
			(edge.handle === "yes"
				? "Yes"
				: edge.handle === "no"
					? "No"
					: edge.weight !== 100
						? `${edge.weight}%`
						: undefined),
	}));

	return { nodes, edges };
}

export function CampaignCanvas({ campaignId }: { campaignId: string }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const workspaceUrl = useWorkspaceUrl();
	const [selectedId, setSelectedId] = useState<string | null>(null);

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

	const pause = useMutation(
		trpc.marketingCampaigns.pause.mutationOptions({
			onSuccess: () => invalidate(),
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
			<div className="flex min-h-0 flex-1 items-center justify-center text-muted-foreground text-sm">
				That campaign is gone.
			</div>
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
					<h1 className="truncate font-semibold text-base">{data.name}</h1>
					<span className="shrink-0 rounded-sm border px-1.5 py-px text-[11px] text-muted-foreground">
						{data.kind === "DRIP" ? "Drip" : "Blast"}
					</span>
					<span className="shrink-0 text-xs">
						<CampaignStatus status={data.status} />
					</span>

					<div className="flex-1" />

					{live ? (
						<Button
							variant="outline"
							size="sm"
							disabled={pause.isPending}
							onClick={() => pause.mutate({ id: campaignId })}
						>
							Pause
						</Button>
					) : (
						<Button
							size="sm"
							disabled={activate.isPending || data.kind !== "DRIP"}
							onClick={() => activate.mutate({ id: campaignId })}
						>
							Activate
						</Button>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
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
					onNodeClick={(_event, node) => setSelectedId(node.id)}
					onNodeMoved={(id, position) =>
						moveNode.mutate({ nodeId: id, x: position.x, y: position.y })
					}
				/>

				{selected ? (
					<NodeSheet
						node={selected}
						stats={stats.get(selected.id) ?? null}
						onClose={() => setSelectedId(null)}
						onSaved={() => invalidate()}
					/>
				) : (
					<CopilotRail campaignId={campaignId} />
				)}
			</div>
		</div>
	);
}
