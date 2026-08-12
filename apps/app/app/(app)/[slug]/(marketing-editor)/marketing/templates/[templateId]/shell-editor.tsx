"use client";

import { Button } from "@crm/ui/components/button";
import {
	type EmailBlock,
	EmailBlockEditor,
} from "@crm/ui/components/email-blocks";
import { Spinner } from "@crm/ui/components/spinner";
import { useAutosave } from "@crm/ui/hooks/use-autosave";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopilotRail } from "@/components/marketing/copilot-rail";
import {
	MarketingEditorMeta,
	MarketingEditorShell,
} from "@/components/marketing/editor-shell";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

function blocksOf(document: unknown): EmailBlock[] {
	if (!document || typeof document !== "object") return [];
	const blocks = (document as { blocks?: unknown }).blocks;
	return Array.isArray(blocks) ? (blocks as EmailBlock[]) : [];
}

export function ShellEditor({ shellId }: { shellId: string }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const workspaceUrl = useWorkspaceUrl();

	const shell = useQuery(
		trpc.marketingTemplates.shellById.queryOptions({ id: shellId }),
	);

	const [name, setName] = useState("");
	const [blocks, setBlocks] = useState<EmailBlock[]>([]);
	const [selected, setSelected] = useState<number | null>(null);
	const [dirty, setDirty] = useState(false);
	const [device, setDevice] = useState<"desktop" | "mobile" | "text">(
		"desktop",
	);

	const data = shell.data;

	useEffect(() => {
		if (!data || dirty) return;
		setName(data.name);
		setBlocks(blocksOf(data.document));
	}, [data, dirty]);

	const previewOptions = trpc.marketingTemplates.previewShell.queryOptions({
		id: shellId,
		document: { version: 1, blocks } as unknown as Record<string, unknown>,
	});

	const preview = useQuery({
		queryKey: previewOptions.queryKey,
		queryFn: previewOptions.queryFn,
	});

	const save = useMutation(
		trpc.marketingTemplates.savePartial.mutationOptions({
			onSuccess: async () => {
				setDirty(false);
				toast.success("Saved. Every template wears this from the next send.");
				await queryClient.invalidateQueries({
					queryKey: trpc.marketingTemplates.shellById.queryKey({ id: shellId }),
				});
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	useAutosave(
		{ name, blocks },
		(draft) =>
			save.mutate({
				id: shellId,
				name: draft.name,
				document: { version: 1, blocks: draft.blocks } as unknown as Record<
					string,
					unknown
				>,
			}),
		{ enabled: dirty },
	);

	if (shell.isPending) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center text-muted-foreground text-xs">
				That is gone.
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
					{data.kind === "HEADER" ? "Header" : "Footer"}
				</span>
			}
			actions={
				<span className="text-muted-foreground text-xs">
					{save.isPending ? "Saving…" : dirty ? "Unsaved" : "Saved"}
				</span>
			}
			meta={
				<MarketingEditorMeta
					parts={[
						data.isDefault ? "The default" : "Not the default",
						data.usedBy === 0
							? "No template picks it"
							: `${data.usedBy} template${data.usedBy === 1 ? "" : "s"}`,
						"A node cannot change this. Every email wears it.",
					]}
				/>
			}
			rail={<CopilotRail record={{ kind: "shell", id: shellId }} />}
		>
			<div className="flex w-[400px] shrink-0 flex-col gap-4 overflow-y-auto border-r p-4">
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

			<div className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted">
				<div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
					<div className="flex items-center gap-0.5 rounded-md bg-muted p-0.5">
						{(["desktop", "mobile", "text"] as const).map((mode) => (
							<Button
								key={mode}
								variant={device === mode ? "outline" : "ghost"}
								size="sm"
								className="h-7 px-2.5 font-normal text-xs capitalize"
								onClick={() => setDevice(mode)}
							>
								{mode === "text" ? "Plain text" : mode}
							</Button>
						))}
					</div>
					<span className="flex-1" />
					<span className="text-muted-foreground text-xs">
						An email wearing this, rendered by the code that sends it
					</span>
				</div>

				<div className="flex min-h-0 flex-1 justify-center overflow-y-auto p-6">
					{preview.isPending ? (
						<Spinner />
					) : preview.data?.blocked ? (
						<p className="max-w-sm text-center text-muted-foreground text-xs">
							{preview.data.blocked}
						</p>
					) : device === "text" ? (
						<pre className="w-full whitespace-pre-wrap rounded-lg border bg-background p-5 text-xs">
							{preview.data?.text}
						</pre>
					) : (
						<iframe
							title="Shell preview"
							srcDoc={preview.data?.html ?? ""}
							sandbox=""
							className="h-full w-full rounded-lg border bg-background"
							style={{ maxWidth: device === "mobile" ? 390 : 640 }}
						/>
					)}
				</div>
			</div>
		</MarketingEditorShell>
	);
}
