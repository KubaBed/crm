"use client";

import Close from "@carbon/icons-react/es/Close";
import Draggable from "@carbon/icons-react/es/Draggable";
import Email from "@carbon/icons-react/es/Email";
import Locked from "@carbon/icons-react/es/Locked";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { Label } from "@crm/ui/components/label";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type Campaign = RouterOutputs["marketingCampaigns"]["byId"];
type Node = Campaign["nodes"][number];
type Stats = Campaign["stats"][number];

type Block = { type: string; text?: { text: string }[]; label?: string };

const BLOCK_LABEL: Record<string, string> = {
	heading: "Heading",
	text: "Text",
	button: "Button",
	image: "Image",
	quote: "Quote",
	divider: "Divider",
	spacer: "Spacer",
	columns: "Columns",
};

function blocksOf(document: unknown): Block[] {
	if (!document || typeof document !== "object") return [];
	const blocks = (document as { blocks?: unknown }).blocks;
	return Array.isArray(blocks) ? (blocks as Block[]) : [];
}

function blockSummary(block: Block): string {
	if (block.type === "button") return block.label ?? "";
	if (block.text) return block.text.map((run) => run.text).join("");
	return "";
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex w-[104px] shrink-0 flex-col gap-0.5">
			<span className="text-[11px] text-muted-foreground">{label}</span>
			<span className="font-medium text-sm">{value}</span>
		</div>
	);
}

function ShellRow({ kind, detail }: { kind: string; detail: string }) {
	return (
		<div className="flex h-9 items-center gap-2 bg-muted px-2.5">
			<Icon icon={Locked} className="size-3 shrink-0 text-muted-foreground" />
			<span className="shrink-0 rounded-sm bg-background px-1.5 py-px text-[11px] text-muted-foreground">
				{kind}
			</span>
			<span className="min-w-0 flex-1 truncate text-muted-foreground text-xs">
				{detail}
			</span>
		</div>
	);
}

export function NodeSheet({
	node,
	stats,
	onClose,
	onSaved,
}: {
	node: Node;
	stats: Stats | null;
	onClose: () => void;
	onSaved: () => void;
}) {
	const trpc = useTRPC();
	const [subject, setSubject] = useState(node.subject ?? "");
	const [preheader, setPreheader] = useState(node.preheader ?? "");
	const [device, setDevice] = useState<"desktop" | "mobile" | "text">(
		"desktop",
	);

	useEffect(() => {
		setSubject(node.subject ?? "");
		setPreheader(node.preheader ?? "");
	}, [node.subject, node.preheader]);

	const preview = useQuery(
		trpc.marketingCampaigns.previewNode.queryOptions({
			nodeId: node.id,
			subject,
			preheader,
		}),
	);

	const save = useMutation(
		trpc.marketingCampaigns.updateNode.mutationOptions({
			onSuccess: () => {
				toast.success("Saved.");
				onSaved();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const blocks = blocksOf(node.document);

	const percent = (part: number, whole: number) =>
		whole === 0 ? "—" : `${Math.round((part / whole) * 100)}%`;

	return (
		<aside className="flex w-[1000px] max-w-[70vw] shrink-0 flex-col border-l bg-background">
			<header className="flex h-13 shrink-0 items-center gap-2 border-b px-4 py-3">
				<Icon
					icon={Email}
					className="size-3.5 shrink-0 text-muted-foreground"
				/>
				<span className="font-semibold text-sm">{node.label ?? "Email"}</span>
				<span className="rounded-sm border px-1.5 py-px text-[11px] text-muted-foreground">
					Email
				</span>
				<div className="flex-1" />
				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					aria-label="Close"
				>
					<Icon icon={Close} />
				</Button>
			</header>

			{stats ? (
				<div className="flex shrink-0 items-center gap-0 border-b px-4 py-3">
					<Stat label="Sent" value={stats.sent.toLocaleString()} />
					<Stat label="Delivered" value={stats.delivered.toLocaleString()} />
					<Stat label="Opened" value={percent(stats.opened, stats.sent)} />
					<Stat label="Clicked" value={percent(stats.clicked, stats.sent)} />
					<Stat label="Replied" value={percent(stats.replied, stats.sent)} />
					<Stat
						label="Unsubscribed"
						value={stats.unsubscribed.toLocaleString()}
					/>
				</div>
			) : null}

			<div className="flex min-h-0 flex-1">
				<div className="flex w-[400px] shrink-0 flex-col gap-4 overflow-y-auto p-4">
					<div className="flex flex-col gap-1.5">
						<Label
							htmlFor="node-subject"
							className="text-[11px] text-muted-foreground"
						>
							Subject
						</Label>
						<Input
							id="node-subject"
							value={subject}
							onChange={(event) => setSubject(event.target.value)}
						/>
						<span className="text-[11px] text-muted-foreground">
							{subject.length} characters
							{subject.length > 50
								? " — most phones cut it at 50"
								: " — comfortably inside the mobile cut"}
						</span>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label
							htmlFor="node-preheader"
							className="text-[11px] text-muted-foreground"
						>
							Preheader
						</Label>
						<Input
							id="node-preheader"
							value={preheader}
							onChange={(event) => setPreheader(event.target.value)}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<span className="text-[11px] text-muted-foreground">Body</span>
						<div className="overflow-clip rounded-lg border">
							<ShellRow kind="Header" detail="Default shell · workspace logo" />
							{blocks.map((block, index) => (
								<div
									key={`${block.type}-${index}`}
									className="flex h-9 items-center gap-2 border-b px-2.5 last:border-b-0"
								>
									<Icon
										icon={Draggable}
										className="size-3 shrink-0 text-border"
									/>
									<span className="shrink-0 rounded-sm bg-muted px-1.5 py-px text-[11px] text-muted-foreground">
										{BLOCK_LABEL[block.type] ?? block.type}
									</span>
									<span className="min-w-0 flex-1 truncate text-xs">
										{blockSummary(block)}
									</span>
								</div>
							))}
							<div className="flex h-9 items-center px-2.5 text-muted-foreground text-xs">
								+ Add block
							</div>
							<ShellRow
								kind="Footer"
								detail="Default shell · address + unsubscribe"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-1 rounded-md bg-muted px-3 py-2.5">
						<span className="font-medium text-[11px]">
							Header and footer: Default shell
						</span>
						<span className="text-[11px] text-muted-foreground">
							The logo, the address and the unsubscribe link are added by the
							compiler. You cannot edit them here, and that is on purpose — edit
							the shell once in Templates.
						</span>
					</div>

					<div className="flex-1" />

					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<div className="flex-1" />
						<Button
							disabled={save.isPending}
							onClick={() =>
								save.mutate({
									nodeId: node.id,
									subject,
									preheader: preheader || null,
								})
							}
						>
							Done
						</Button>
					</div>
				</div>

				<div className="flex min-h-0 min-w-0 flex-1 flex-col border-l bg-muted">
					<div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
						<div className="flex items-center gap-0.5 rounded-md bg-muted p-0.5">
							{(["desktop", "mobile", "text"] as const).map((mode) => (
								<Button
									key={mode}
									variant={device === mode ? "outline" : "ghost"}
									size="sm"
									className="h-6 px-2.5 font-normal text-[11px] capitalize"
									onClick={() => setDevice(mode)}
								>
									{mode === "text" ? "Plain text" : mode}
								</Button>
							))}
						</div>
						<div className="flex-1" />
						<span className="text-[11px] text-muted-foreground">
							Rendered by the code that sends it
						</span>
					</div>

					<div className="flex min-h-0 flex-1 justify-center overflow-y-auto p-6">
						{preview.isPending ? (
							<Spinner />
						) : preview.data?.blocked ? (
							<p className="max-w-sm text-center text-muted-foreground text-sm">
								{preview.data.blocked}
							</p>
						) : device === "text" ? (
							<pre className="w-full whitespace-pre-wrap rounded-lg border bg-background p-5 text-xs">
								{preview.data?.text}
							</pre>
						) : (
							<iframe
								title="Email preview"
								srcDoc={preview.data?.html ?? ""}
								sandbox=""
								className="h-full w-full rounded-lg border bg-background"
								style={{ maxWidth: device === "mobile" ? 390 : 640 }}
							/>
						)}
					</div>
				</div>
			</div>
		</aside>
	);
}
