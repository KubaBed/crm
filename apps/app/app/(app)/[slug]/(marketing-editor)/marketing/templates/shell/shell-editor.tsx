"use client";

import { Button } from "@crm/ui/components/button";
import {
	type EmailBlock,
	EmailBlockEditor,
} from "@crm/ui/components/email-blocks";
import { Input } from "@crm/ui/components/input";
import { Label } from "@crm/ui/components/label";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	MarketingEditorMeta,
	MarketingEditorShell,
} from "@/components/marketing/editor-shell";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

type Partial = { id: string; kind: string; name: string; isDefault: boolean };

function blocksOf(document: unknown): EmailBlock[] {
	if (!document || typeof document !== "object") return [];
	const blocks = (document as { blocks?: unknown }).blocks;
	return Array.isArray(blocks) ? (blocks as EmailBlock[]) : [];
}

export function ShellEditor() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const workspaceUrl = useWorkspaceUrl();

	const partials = useQuery(trpc.marketingTemplates.partials.queryOptions());

	const [openId, setOpenId] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [blocks, setBlocks] = useState<EmailBlock[]>([]);
	const [selected, setSelected] = useState<number | null>(null);
	const [dirty, setDirty] = useState(false);

	const rows = partials.data ?? [];
	const open = rows.find((row) => row.id === openId) ?? rows[0] ?? null;

	useEffect(() => {
		if (!open || dirty) return;
		setName(open.name);
		setBlocks(blocksOf(open.document));
	}, [open, dirty]);

	const save = useMutation(
		trpc.marketingTemplates.savePartial.mutationOptions({
			onSuccess: async () => {
				setDirty(false);
				toast.success("Saved. Every template wears this from the next send.");
				await queryClient.invalidateQueries({
					queryKey: trpc.marketingTemplates.partials.queryKey(),
				});
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (partials.isPending) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!open) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center text-muted-foreground text-xs">
				This install has no header or footer yet.
			</div>
		);
	}

	return (
		<MarketingEditorShell
			backHref={workspaceUrl("/marketing/templates")}
			backLabel="Templates"
			name={name}
			onNameChange={(next) => {
				setName(next);
				setDirty(true);
			}}
			badges={
				<span className="shrink-0 rounded-sm border px-1.5 py-px text-muted-foreground text-xs">
					{open.kind === "HEADER" ? "Header" : "Footer"}
				</span>
			}
			actions={
				<Button
					size="sm"
					disabled={save.isPending || !dirty}
					onClick={() =>
						save.mutate({
							id: open.id,
							name,
							document: { version: 1, blocks } as unknown as Record<
								string,
								unknown
							>,
						})
					}
				>
					{save.isPending ? <Spinner /> : null}
					Save
				</Button>
			}
			meta={
				<MarketingEditorMeta
					parts={[
						open.isDefault ? "The default" : "Not the default",
						"Every template wears this. A node cannot change it.",
					]}
				/>
			}
		>
			<div className="flex w-[260px] shrink-0 flex-col gap-1 overflow-y-auto border-r p-3">
				{rows.map((row: Partial) => (
					<Button
						key={row.id}
						variant="ghost"
						className={
							row.id === open.id
								? "justify-start bg-muted font-normal text-foreground hover:bg-muted"
								: "justify-start font-normal text-muted-foreground"
						}
						onClick={() => {
							setDirty(false);
							setOpenId(row.id);
						}}
					>
						{row.name}
					</Button>
				))}
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="shell-name" className="text-muted-foreground text-xs">
						Name
					</Label>
					<Input
						id="shell-name"
						value={name}
						onChange={(event) => {
							setName(event.target.value);
							setDirty(true);
						}}
					/>
				</div>

				<EmailBlockEditor
					blocks={blocks}
					selected={selected}
					onSelect={setSelected}
					onChange={(next) => {
						setBlocks(next);
						setDirty(true);
					}}
				/>

				<p className="text-muted-foreground text-xs">
					The postal address and the unsubscribe link are added by the compiler
					on every send. They are not blocks and nothing here can remove them.
				</p>
			</div>
		</MarketingEditorShell>
	);
}
