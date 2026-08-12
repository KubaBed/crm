"use client";

import { Button } from "@crm/ui/components/button";
import {
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
} from "@crm/ui/components/context-menu";
import {
	FlowCanvas,
	type FlowEdge,
	type FlowNode,
} from "@crm/ui/components/flow-canvas";
import { Spinner } from "@crm/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";
import { toast } from "sonner";
import { CampaignKind } from "@/components/marketing/campaign-kind";
import { CopilotRail } from "@/components/marketing/copilot-rail";
import { MarketingEditorShell } from "@/components/marketing/editor-shell";
import {
	ENTRY,
	entryLabel,
	entryX,
	NEW_LABEL,
	withNode,
} from "@/lib/campaign-graph";
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

	const rename = useMutation(
		trpc.marketingCampaigns.update.mutationOptions({
			onSuccess: () => invalidate(),
			onError: (error) => toast.error(error.message),
		}),
	);

	const addNode = useMutation(
		trpc.marketingCampaigns.writeGraph.mutationOptions({
			onSuccess: (result) => {
				if (!result.ok) {
					toast.error(
						result.problems[0]?.message ?? "That step cannot be added.",
					);
					return;
				}
				void invalidate();
			},
			onError: (error) => toast.error(error.message),
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
	const activatable = data.kind === "DRIP" && data.status === "DRAFT";

	return (
		<MarketingEditorShell
			backHref={workspaceUrl("/marketing/campaigns")}
			backLabel="Campaigns"
			name={data.name}
			onNameChange={(next) => rename.mutate({ id: campaignId, name: next })}
			badges={
				<>
					<CampaignKind
						campaignId={campaignId}
						kind={data.kind === "DRIP" ? "DRIP" : "BLAST"}
						editable={data.status === "DRAFT"}
						onChanged={() => void invalidate()}
					/>
					<span className="shrink-0 text-xs">
						<CampaignStatus status={data.status} />
					</span>
				</>
			}
			actions={
				<>
					{activatable ? (
						<Button
							size="sm"
							disabled={activate.isPending}
							onClick={() => activate.mutate({ id: campaignId })}
						>
							{activate.isPending ? <Spinner /> : null}
							Activate
						</Button>
					) : null}

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
				</>
			}
			meta={
				<MarketingEditorMeta
					parts={[
						`${data.enrolled.toLocaleString()} enrolled`,
						`${data.inFlight.toLocaleString()} in flight`,
						`${data.health.sent.toLocaleString()} sent`,
						`${(data.health.deliveredRate * 100).toFixed(1)}% delivered`,
						`${(data.health.bounceRate * 100).toFixed(1)}% bounced`,
						`${(data.health.complaintRate * 100).toFixed(2)}% complaints`,
					]}
				/>
			}
			rail={
				selected && selected.kind !== "EMAIL" ? (
					<LogicSheet
						key={`${selected.id}:${selected.delayHours ?? ""}`}
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
						}}
					/>
				)
			}
		>
			<FlowCanvas
				menu={
					<ContextMenuContent>
						<ContextMenuLabel>
							{selected
								? `Add after ${selected.label ?? "this step"}`
								: "Add a step"}
						</ContextMenuLabel>
						{(["EMAIL", "WAIT", "BRANCH", "EXIT"] as const).map((kind) => (
							<ContextMenuItem
								key={kind}
								disabled={addNode.isPending}
								onSelect={() =>
									addNode.mutate({
										campaignId,
										...withNode(data, kind, selectedId),
									})
								}
							>
								{NEW_LABEL[kind]}
							</ContextMenuItem>
						))}
					</ContextMenuContent>
				}
				nodes={flow.nodes}
				edges={flow.edges}
				selectedId={selectedId}
				fitKey={`${data.nodes.length}-${data.edges.length}`}
				onNodeClick={(_event, node) => void setSelectedId(node.id)}
				onNodeMoved={(id, position) =>
					moveNode.mutate({ nodeId: id, x: position.x, y: position.y })
				}
			/>
		</MarketingEditorShell>
	);
}
