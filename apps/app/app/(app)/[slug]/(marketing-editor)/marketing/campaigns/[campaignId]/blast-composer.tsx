"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import { Button } from "@crm/ui/components/button";
import {
	type EmailBlock,
	EmailBlockEditor,
} from "@crm/ui/components/email-blocks";
import { Icon } from "@crm/ui/components/icon";
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
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { CampaignStatus } from "../../../../(marketing)/marketing/campaign-status";
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
		<div className="flex min-h-0 min-w-0 flex-1 flex-col">
			<header className="flex shrink-0 items-center gap-2 border-b px-6 py-3">
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
				<h1 className="truncate font-medium text-xs">{campaign.name}</h1>
				<span className="shrink-0 rounded-sm border px-1.5 py-px text-muted-foreground text-xs">
					Blast
				</span>
				<span className="shrink-0 text-xs">
					<CampaignStatus status={campaign.status} />
				</span>
				<span className="flex-1" />

				{sent ? null : (
					<Button
						disabled={
							schedule.isPending || errors.length > 0 || !segmentId || dirty
						}
						onClick={() => schedule.mutate({ id: campaign.id, at: null })}
					>
						{schedule.isPending ? <Spinner /> : null}
						Send now
					</Button>
				)}
			</header>

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
	);
}
