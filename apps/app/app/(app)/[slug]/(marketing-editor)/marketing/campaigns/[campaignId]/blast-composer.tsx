"use client";

import { Button } from "@crm/ui/components/button";
import {
	type EmailBlock,
	EmailBlockEditor,
} from "@crm/ui/components/email-blocks";
import { Input } from "@crm/ui/components/input";
import { Label } from "@crm/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CampaignKind } from "@/components/marketing/campaign-kind";
import { CopilotRail } from "@/components/marketing/copilot-rail";
import {
	MarketingEditorMeta,
	MarketingEditorShell,
} from "@/components/marketing/editor-shell";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { CampaignStatus } from "../../../../(marketing)/marketing/campaign-status";
import { AttachmentsPanel } from "./attachments-panel";
import { CampaignResults } from "./campaign-results";

type Campaign = RouterOutputs["marketingCampaigns"]["byId"];

function blocksOf(document: unknown): EmailBlock[] {
	if (!document || typeof document !== "object") return [];
	const blocks = (document as { blocks?: unknown }).blocks;
	return Array.isArray(blocks) ? (blocks as EmailBlock[]) : [];
}

export function BlastComposer({
	campaign,
	onChanged,
}: {
	campaign: Campaign;
	onChanged: () => void;
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const workspaceUrl = useWorkspaceUrl();

	const node = campaign.nodes.find(
		(candidate: Campaign["nodes"][number]) => candidate.kind === "EMAIL",
	);

	const [subject, setSubject] = useState(node?.subject ?? "");
	const [preheader, setPreheader] = useState(node?.preheader ?? "");
	const [blocks, setBlocks] = useState<EmailBlock[]>(blocksOf(node?.document));
	const [selected, setSelected] = useState<number | null>(null);
	const [segmentId, setSegmentId] = useState(campaign.segmentId ?? "");
	const [dirty, setDirty] = useState(false);

	useEffect(() => {
		if (dirty || !node) return;
		setSubject(node.subject ?? "");
		setPreheader(node.preheader ?? "");
		setBlocks(blocksOf(node.document));
	}, [node, dirty]);

	const segments = useQuery(trpc.marketingSegments.options.queryOptions());

	const previewOptions = trpc.marketingCampaigns.previewNode.queryOptions({
		nodeId: node?.id ?? "",
		subject,
		preheader,
		document: { version: 1, blocks } as unknown as Record<string, unknown>,
	});

	const preview = useQuery({
		queryKey: previewOptions.queryKey,
		queryFn: previewOptions.queryFn,
		enabled: Boolean(node),
	});

	const saveNode = useMutation(
		trpc.marketingCampaigns.updateNode.mutationOptions({
			onSuccess: () => {
				setDirty(false);
				toast.success("Saved.");
				onChanged();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const saveAudience = useMutation(
		trpc.marketingCampaigns.update.mutationOptions({
			onSuccess: onChanged,
			onError: (error) => toast.error(error.message),
		}),
	);

	const rename = useMutation(
		trpc.marketingCampaigns.update.mutationOptions({
			onSuccess: () => onChanged(),
			onError: (error) => toast.error(error.message),
		}),
	);

	const schedule = useMutation(
		trpc.marketingCampaigns.schedule.mutationOptions({
			onSuccess: (result) => {
				toast.success(
					`${result.queued.toLocaleString()} queued. Sending starts within a minute.`,
				);
				onChanged();
				void queryClient.invalidateQueries({
					queryKey: trpc.marketingCampaigns.list.queryKey(),
				});
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const sent = campaign.status === "SENT" || campaign.status === "SENDING";
	const findings = preview.data?.lint ?? [];
	const errors = findings.filter((finding) => finding.level === "error");

	return (
		<MarketingEditorShell
			backHref={workspaceUrl("/marketing/campaigns")}
			backLabel="Campaigns"
			name={campaign.name}
			onNameChange={(next) => rename.mutate({ id: campaign.id, name: next })}
			badges={
				<>
					<CampaignKind
						campaignId={campaign.id}
						kind="BLAST"
						editable={campaign.status === "DRAFT"}
						onChanged={onChanged}
					/>
					<span className="shrink-0 text-xs">
						<CampaignStatus status={campaign.status} />
					</span>
				</>
			}
			actions={
				sent ? null : (
					<Button
						size="sm"
						disabled={
							schedule.isPending || errors.length > 0 || !segmentId || dirty
						}
						onClick={() => schedule.mutate({ id: campaign.id, at: null })}
					>
						{schedule.isPending ? <Spinner /> : null}
						Send now
					</Button>
				)
			}
			meta={
				<MarketingEditorMeta
					parts={[
						segmentId
							? `${campaign.audience.sendable.toLocaleString()} will receive this`
							: "No segment yet",
						errors.length > 0
							? `${errors.length} error${errors.length === 1 ? "" : "s"} to fix`
							: "Checks clean",
					]}
				/>
			}
			rail={
				<CopilotRail
					record={{ kind: "campaign", id: campaign.id }}
					onFinish={onChanged}
				/>
			}
		>
			<div className="flex min-h-0 min-w-0 flex-1 flex-col">
				{sent ? (
					<CampaignResults campaign={campaign} />
				) : (
					<div className="flex min-h-0 flex-1">
						<div className="flex w-[400px] shrink-0 flex-col gap-4 overflow-y-auto border-r p-4">
							<div className="flex flex-col gap-1.5">
								<Label
									htmlFor="blast-segment"
									className="text-muted-foreground text-xs"
								>
									Who gets this
								</Label>
								<Select
									value={segmentId}
									onValueChange={(next) => {
										setSegmentId(next);
										saveAudience.mutate({ id: campaign.id, segmentId: next });
									}}
								>
									<SelectTrigger id="blast-segment">
										<SelectValue placeholder="Choose a segment" />
									</SelectTrigger>
									<SelectContent>
										{(segments.data ?? []).map((segment) => (
											<SelectItem key={segment.id} value={segment.id}>
												{segment.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="flex flex-col gap-1.5">
								<Label
									htmlFor="blast-subject"
									className="text-muted-foreground text-xs"
								>
									Subject
								</Label>
								<Input
									id="blast-subject"
									value={subject}
									onChange={(event) => {
										setSubject(event.target.value);
										setDirty(true);
									}}
								/>
								<span className="text-muted-foreground text-xs">
									{subject.length} characters
									{subject.length > 50
										? " — most phones cut it at 50"
										: " — comfortably inside the mobile cut"}
								</span>
							</div>

							<div className="flex flex-col gap-1.5">
								<Label
									htmlFor="blast-preheader"
									className="text-muted-foreground text-xs"
								>
									Preheader
								</Label>
								<Input
									id="blast-preheader"
									value={preheader}
									onChange={(event) => {
										setPreheader(event.target.value);
										setDirty(true);
									}}
								/>
							</div>

							<div className="flex flex-col gap-2">
								<span className="text-muted-foreground text-xs">Body</span>
								<EmailBlockEditor
									blocks={blocks}
									selected={selected}
									onSelect={setSelected}
									onChange={(next) => {
										setBlocks(next);
										setDirty(true);
									}}
									shell={{
										header: "Default shell · workspace logo",
										footer: "Default shell · address + unsubscribe",
									}}
								/>
							</div>

							<AttachmentsPanel
								campaignId={campaign.id}
								recipients={campaign.audience.sendable}
							/>

							<Button
								variant="outline"
								className="self-start"
								disabled={!node || saveNode.isPending || !dirty}
								onClick={() =>
									node &&
									saveNode.mutate({
										nodeId: node.id,
										subject,
										preheader: preheader || null,
										document: { version: 1, blocks } as unknown as Record<
											string,
											unknown
										>,
									})
								}
							>
								{saveNode.isPending ? <Spinner /> : null}
								Save
							</Button>
						</div>

						<div className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted">
							<div className="flex min-h-0 flex-1 justify-center overflow-y-auto p-6">
								{preview.isPending ? (
									<Spinner />
								) : preview.data?.blocked ? (
									<p className="max-w-sm text-center text-muted-foreground text-xs">
										{preview.data.blocked}
									</p>
								) : (
									<iframe
										title="Email preview"
										srcDoc={preview.data?.html ?? ""}
										sandbox=""
										className="h-full w-full max-w-[640px] rounded-lg border bg-background"
									/>
								)}
							</div>

							<div className="flex shrink-0 items-center gap-3 border-t bg-background px-6 py-4">
								<span className="font-medium text-2xl tabular-nums">
									{campaign.audience.sendable.toLocaleString()}
								</span>
								<span className="text-muted-foreground text-xs">
									{segmentId
										? campaign.audience.excluded > 0
											? `people will receive this · ${campaign.audience.excluded.toLocaleString()} excluded of ${campaign.audience.total.toLocaleString()} in the segment`
											: `people will receive this · ${campaign.audience.total.toLocaleString()} in the segment`
										: "Choose a segment to see who gets this"}
								</span>
								<span className="flex-1" />
								{errors.length > 0 ? (
									<span className="text-destructive text-xs">
										{errors[0]?.message}
									</span>
								) : dirty ? (
									<span className="text-muted-foreground text-xs">
										Save before sending
									</span>
								) : null}
							</div>
						</div>
					</div>
				)}
			</div>
		</MarketingEditorShell>
	);
}
