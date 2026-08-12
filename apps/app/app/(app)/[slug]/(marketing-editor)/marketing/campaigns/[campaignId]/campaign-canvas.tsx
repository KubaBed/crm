"use client";

import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	FlowCanvas,
	type FlowEdge,
	type FlowNode,
} from "@crm/ui/components/flow-canvas";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { toast } from "sonner";
import { CopilotRail } from "@/components/marketing/copilot-rail";
import {
	MarketingEditorMeta,
	MarketingEditorShell,
} from "@/components/marketing/editor-shell";
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

type NewKind = "EMAIL" | "WAIT" | "EXIT";

const NEW_NODE: Record<NewKind, Record<string, unknown>> = {
	EMAIL: {
		kind: "EMAIL",
		label: "New touch",
		subject: "",
		document: { version: 1, blocks: [] },
	},
	WAIT: { kind: "WAIT", label: "Wait", delayHours: 72 },
	EXIT: { kind: "EXIT", label: "Stop here" },
};

function withNode(campaign: Campaign, kind: NewKind, afterId: string | null) {
	const nodes = campaign.nodes.map((node) => ({
		id: node.id,
		kind: node.kind,
		label: node.label,
		templateId: node.templateId,
		subject: node.subject,
		preheader: node.preheader,
		document: node.document,
		delayHours: node.delayHours,
		condition: node.condition,
		x: node.x,
		y: node.y,
	}));

	const edges = campaign.edges.map((edge) => ({
		fromId: edge.fromId,
		toId: edge.toId,
		handle: edge.handle,
		label: edge.label,
		weight: edge.weight,
	}));

	const outgoing = new Set(edges.map((edge) => edge.fromId));
	const anchor =
		afterId ??
		campaign.nodes.findLast((node) => !outgoing.has(node.id))?.id ??
		campaign.nodes[campaign.nodes.length - 1]?.id ??
		null;

	const id = `node_${Math.random().toString(36).slice(2, 12)}`;
	nodes.push({ id, ...NEW_NODE[kind] } as (typeof nodes)[number]);

	if (anchor) {
		const following = edges.find(
			(edge) => edge.fromId === anchor && edge.handle === "next",
		);

		if (following) following.fromId = id;
		edges.push({
			fromId: anchor,
			toId: id,
			handle: "next",
			label: null,
			weight: 100,
		});
	}

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
	const live = data.status === "ACTIVE";

	return (
		<MarketingEditorShell
			backHref={workspaceUrl("/marketing/campaigns")}
			backLabel="Campaigns"
			name={data.name}
			onNameChange={(next) => rename.mutate({ id: campaignId, name: next })}
			badges={
				<>
					<span className="shrink-0 rounded-sm border px-1.5 py-px text-muted-foreground text-xs">
						{data.kind === "DRIP" ? "Drip" : "Blast"}
					</span>
					<span className="shrink-0 text-xs">
						<CampaignStatus status={data.status} />
					</span>
				</>
			}
			actions={
				<>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" disabled={addNode.isPending}>
								{addNode.isPending ? <Spinner /> : null}
								Add step
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{(["EMAIL", "WAIT", "EXIT"] as const).map((kind) => (
								<DropdownMenuItem
									key={kind}
									onSelect={() =>
										addNode.mutate({
											campaignId,
											...withNode(data, kind, selectedId),
										})
									}
								>
									{kind === "EMAIL"
										? "Email"
										: kind === "WAIT"
											? "Wait"
											: "Exit"}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

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
