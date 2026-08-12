"use client";

import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	type EmailBlock,
	EmailBlockEditor,
} from "@crm/ui/components/email-blocks";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { Label } from "@crm/ui/components/label";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAutosave } from "@crm/ui/hooks/use-autosave";
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

export function TemplateEditor({ templateId }: { templateId: string }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const workspaceUrl = useWorkspaceUrl();
	const router = useRouter();

	const template = useQuery(
		trpc.marketingTemplates.byId.queryOptions({ id: templateId }),
	);

	const [name, setName] = useState("");
	const [subject, setSubject] = useState("");
	const [preheader, setPreheader] = useState("");
	const [blocks, setBlocks] = useState<EmailBlock[]>([]);
	const [selected, setSelected] = useState<number | null>(null);
	const [device, setDevice] = useState<"desktop" | "mobile" | "text">(
		"desktop",
	);
	const [dirty, setDirty] = useState(false);

	const data = template.data;

	useEffect(() => {
		if (!data || dirty) return;
		setName(data.name);
		setSubject(data.subject);
		setPreheader(data.preheader ?? "");
		setBlocks(blocksOf(data.document));
	}, [data, dirty]);

	const document = { version: 1 as const, blocks };

	const previewOptions = trpc.marketingTemplates.preview.queryOptions({
		document: document as unknown as Record<string, unknown>,
		subject,
		preheader,
		contactId: null,
	});

	const preview = useQuery({
		queryKey: previewOptions.queryKey,
		queryFn: previewOptions.queryFn,
	});

	const save = useMutation(
		trpc.marketingTemplates.update.mutationOptions({
			onSuccess: async () => {
				setDirty(false);
				toast.success("Saved.");
				await queryClient.invalidateQueries({
					queryKey: trpc.marketingTemplates.byId.queryKey({ id: templateId }),
				});
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const duplicate = useMutation(
		trpc.marketingTemplates.duplicate.mutationOptions({
			onSuccess: (result) => {
				toast.success("Copied.");
				router.push(workspaceUrl(`/marketing/templates/${result.id}`));
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const archive = useMutation(
		trpc.marketingTemplates.archive.mutationOptions({
			onSuccess: () => {
				toast.success("Archived.");
				router.push(workspaceUrl("/marketing/templates"));
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const sendTest = useMutation(
		trpc.marketing.sendTest.mutationOptions({
			onSuccess: (result) => toast.success(`Sent to ${result.to}.`),
			onError: (error) => toast.error(error.message),
		}),
	);

	useAutosave(
		{ name, subject, preheader, blocks },
		(draft) =>
			save.mutate({
				id: templateId,
				name: draft.name,
				subject: draft.subject,
				preheader: draft.preheader || null,
				document: { version: 1, blocks: draft.blocks } as unknown as Record<
					string,
					unknown
				>,
			}),
		{ enabled: dirty },
	);

	if (template.isPending) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center text-muted-foreground text-xs">
				That template is gone.
			</div>
		);
	}

	const findings = preview.data?.lint ?? [];
	const errors = findings.filter((finding) => finding.level === "error");

	return (
		<MarketingEditorShell
			backHref={workspaceUrl("/marketing/templates")}
			backLabel="Templates"
			name={name}
			onNameChange={(next) => {
				setName(next);
				setDirty(true);
			}}
			actions={
				<>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" aria-label="More">
								<Icon icon={OverflowMenuVertical} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								disabled={sendTest.isPending}
								onSelect={() => sendTest.mutate()}
							>
								Send me a test
							</DropdownMenuItem>
							<DropdownMenuItem
								disabled={duplicate.isPending}
								onSelect={() => duplicate.mutate({ id: templateId })}
							>
								Duplicate
							</DropdownMenuItem>
							<DropdownMenuItem
								variant="destructive"
								disabled={archive.isPending}
								onSelect={() => archive.mutate({ id: templateId })}
							>
								Archive
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						size="sm"
						disabled={save.isPending || !dirty}
						onClick={() =>
							save.mutate({
								id: templateId,
								name,
								subject,
								preheader: preheader || null,
								document: document as unknown as Record<string, unknown>,
							})
						}
					>
						{save.isPending ? <Spinner /> : null}
						Save
					</Button>
				</>
			}
			meta={
				<MarketingEditorMeta
					parts={[
						data.usedBy === 0
							? "Never used"
							: `Used by ${data.usedBy} campaign${data.usedBy === 1 ? "" : "s"}`,
						errors.length > 0
							? `${errors.length} error${errors.length === 1 ? "" : "s"} to fix`
							: "Checks clean",
					]}
				/>
			}
			rail={
				<CopilotRail
					record={{ kind: "template", id: templateId }}
					onFinish={() =>
						queryClient.invalidateQueries({
							queryKey: trpc.marketingTemplates.byId.queryKey({
								id: templateId,
							}),
						})
					}
				/>
			}
		>
			<div className="flex w-[400px] shrink-0 flex-col gap-4 overflow-y-auto border-r p-4">
				<div className="flex flex-col gap-1.5">
					<Label
						htmlFor="template-subject"
						className="text-muted-foreground text-xs"
					>
						Subject
					</Label>
					<Input
						id="template-subject"
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
						htmlFor="template-preheader"
						className="text-muted-foreground text-xs"
					>
						Preheader
					</Label>
					<Input
						id="template-preheader"
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

				<div className="flex flex-col gap-1 rounded-md bg-muted px-3 py-2.5">
					<span className="font-medium text-xs">
						Header and footer: Default shell
					</span>
					<span className="text-muted-foreground text-xs">
						The logo, the address and the unsubscribe link are added by the
						compiler. Edit the shell once in Templates, not here.
					</span>
				</div>
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
						Rendered by the code that sends it
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
							title="Email preview"
							srcDoc={preview.data?.html ?? ""}
							sandbox=""
							className="h-full w-full rounded-lg border bg-background"
							style={{ maxWidth: device === "mobile" ? 390 : 640 }}
						/>
					)}
				</div>

				{findings.length > 0 ? (
					<div className="flex shrink-0 flex-col border-t bg-background">
						<div className="flex items-center justify-between border-b px-4 py-2">
							<span className="font-medium text-xs">
								{findings.length} thing{findings.length === 1 ? "" : "s"} to
								look at
							</span>
							<span className="text-muted-foreground text-xs">
								{errors.length === 0
									? "No errors — this can be sent"
									: `${errors.length} must be fixed before this sends`}
							</span>
						</div>
						{findings.slice(0, 4).map((finding) => (
							<div
								key={`${finding.code}-${finding.blockIndex ?? "x"}`}
								className="flex items-center gap-2 border-b px-4 py-2 text-xs last:border-b-0"
							>
								<span
									className={
										finding.level === "error"
											? "size-1.5 shrink-0 rounded-sm bg-destructive"
											: "size-1.5 shrink-0 rounded-sm bg-muted-foreground"
									}
								/>
								{finding.message}
							</div>
						))}
					</div>
				) : null}
			</div>
		</MarketingEditorShell>
	);
}
