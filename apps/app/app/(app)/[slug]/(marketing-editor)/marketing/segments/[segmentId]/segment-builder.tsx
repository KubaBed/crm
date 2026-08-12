"use client";

import Close from "@carbon/icons-react/es/Close";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { RuleTree, type RuleTreeValue } from "@crm/ui/components/rule-tree";
import { Spinner } from "@crm/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CopilotRail } from "@/components/marketing/copilot-rail";
import {
	MarketingEditorMeta,
	MarketingEditorShell,
} from "@/components/marketing/editor-shell";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { facetsWithOwners, fromDefinition, toDefinition } from "./facets";

export function SegmentBuilder({ segmentId }: { segmentId: string }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const workspaceUrl = useWorkspaceUrl();
	const router = useRouter();

	const segment = useQuery(
		trpc.marketingSegments.byId.queryOptions({ id: segmentId }),
	);

	const [name, setName] = useState("");
	const [rules, setRules] = useState<RuleTreeValue>({
		match: "all",
		rules: [],
	});
	const [dirty, setDirty] = useState(false);
	const [search, setSearch] = useState("");
	const [mode, setMode] = useState<"ADD" | "EXCLUDE">("ADD");

	const data = segment.data;

	useEffect(() => {
		if (!data || dirty) return;
		setName(data.name);
		setRules(fromDefinition(data.definition));
	}, [data, dirty]);

	const definition = useMemo(() => toDefinition(rules), [rules]);

	const users = useQuery(trpc.users.list.queryOptions());
	const facets = useMemo(
		() => facetsWithOwners(users.data ?? []),
		[users.data],
	);

	const previewOptions = trpc.marketingSegments.preview.queryOptions({
		definition: (definition ?? {
			facet: { facet: "contact.hasEmail" },
		}) as Record<string, unknown>,
	});

	const preview = useQuery({
		queryKey: previewOptions.queryKey,
		queryFn: previewOptions.queryFn,
		enabled: definition !== null,
	});

	const save = useMutation(
		trpc.marketingSegments.update.mutationOptions({
			onSuccess: async () => {
				setDirty(false);
				toast.success(
					"Saved. This changes who enters next, not who is already in a drip.",
				);
				await queryClient.invalidateQueries({
					queryKey: trpc.marketingSegments.byId.queryKey({ id: segmentId }),
				});
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const reload = () =>
		queryClient.invalidateQueries({
			queryKey: trpc.marketingSegments.byId.queryKey({ id: segmentId }),
		});

	const people = useQuery({
		...trpc.contacts.list.queryOptions({
			q: search,
			sort: "updatedAt",
			dir: "desc",
			page: 1,
			pageSize: 20,
		}),
		enabled: search.trim().length > 0,
		placeholderData: (previous) => previous,
	});

	const addMember = useMutation(
		trpc.marketingSegments.addMember.mutationOptions({
			onSuccess: async () => {
				setSearch("");
				await reload();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const excludeMember = useMutation(
		trpc.marketingSegments.excludeMember.mutationOptions({
			onSuccess: async () => {
				setSearch("");
				await reload();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const removeMember = useMutation(
		trpc.marketingSegments.removeMember.mutationOptions({
			onSuccess: () => reload(),
			onError: (error) => toast.error(error.message),
		}),
	);

	const archive = useMutation(
		trpc.marketingSegments.archive.mutationOptions({
			onSuccess: () => {
				toast.success("Archived.");
				router.push(workspaceUrl("/marketing/segments"));
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (segment.isPending) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center text-muted-foreground text-xs">
				That segment is gone.
			</div>
		);
	}

	const total = definition ? (preview.data?.total ?? null) : 0;

	return (
		<MarketingEditorShell
			backHref={workspaceUrl("/marketing/segments")}
			backLabel="Segments"
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
								variant="destructive"
								disabled={archive.isPending}
								onSelect={() => archive.mutate({ id: segmentId })}
							>
								Archive
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						size="sm"
						disabled={save.isPending || !dirty}
						onClick={() => save.mutate({ id: segmentId, name, definition })}
					>
						{save.isPending ? <Spinner /> : null}
						Save
					</Button>
				</>
			}
			meta={
				<MarketingEditorMeta
					parts={[
						`${(total ?? 0).toLocaleString()} match these rules`,
						`${data.counts.sendable.toLocaleString()} can be emailed today`,
						data.counts.byHand > 0
							? `${data.counts.byHand} added by hand`
							: null,
						data.usedBy.length > 0
							? `used by ${data.usedBy.map((campaign) => campaign.name).join(", ")}`
							: null,
					]}
				/>
			}
			rail={
				<CopilotRail
					record={{ kind: "segment", id: segmentId }}
					onFinish={() => {
						void queryClient.invalidateQueries({
							queryKey: trpc.marketingSegments.byId.queryKey({ id: segmentId }),
						});
						void queryClient.invalidateQueries({
							queryKey: trpc.marketingSegments.preview.pathKey(),
						});
					}}
				/>
			}
		>
			<div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
				<div className="flex min-w-0 flex-1 flex-col gap-6 px-6 pb-8">
					<RuleTree
						value={rules}
						facets={facets}
						onChange={(next) => {
							setRules(next);
							setDirty(true);
						}}
					/>

					<div className="flex flex-col gap-3 overflow-clip rounded-lg border">
						<div className="flex items-center justify-between border-b bg-muted px-4 py-2.5">
							<span className="font-medium text-xs">Added by hand</span>
							<span className="text-muted-foreground text-xs">
								They stay in even when the rules stop matching them.
							</span>
						</div>

						<div className="flex items-center gap-2 px-4">
							<ToggleGroup
								type="single"
								value={mode}
								onValueChange={(next) =>
									setMode(next === "EXCLUDE" ? "EXCLUDE" : "ADD")
								}
							>
								<ToggleGroupItem value="ADD">Add</ToggleGroupItem>
								<ToggleGroupItem value="EXCLUDE">Hold out</ToggleGroupItem>
							</ToggleGroup>
							<Combobox
								options={(people.data?.rows ?? []).map((person) => ({
									value: person.id,
									label:
										[person.firstName, person.lastName]
											.filter(Boolean)
											.join(" ") ||
										(person.email ?? "Somebody"),
									hint: person.email ?? undefined,
								}))}
								value=""
								onValueChange={(contactId) =>
									mode === "EXCLUDE"
										? excludeMember.mutate({ segmentId, contactId })
										: addMember.mutate({ segmentId, contactId })
								}
								search={search}
								onSearchChange={setSearch}
								placeholder={
									mode === "EXCLUDE" ? "Hold somebody out" : "Add somebody"
								}
								searchPlaceholder="Search contacts…"
								empty={
									search.trim() ? "Nobody matches." : "Type a name to search."
								}
							/>
						</div>

						{data.members.length === 0 ? (
							<p className="px-4 pb-4 text-muted-foreground text-xs">
								Nobody yet. Everybody here comes from the rules.
							</p>
						) : (
							<div className="flex flex-col pb-1">
								{data.members.map((member) => (
									<div
										key={member.contactId}
										className="flex items-center gap-3 border-t px-4 py-2.5 text-xs"
									>
										<span className="min-w-0 flex-1 truncate">
											{member.name}
										</span>
										<span className="min-w-0 flex-1 truncate text-muted-foreground">
											{member.email ?? "No address"}
										</span>
										<span className="text-muted-foreground">
											{member.mode === "EXCLUDE" ? "Held out" : "Added"}
										</span>
										<Button
											variant="ghost"
											size="icon"
											aria-label="Remove"
											disabled={removeMember.isPending}
											onClick={() =>
												removeMember.mutate({
													segmentId,
													contactId: member.contactId,
												})
											}
										>
											<Icon icon={Close} className="size-3.5" />
										</Button>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="flex flex-col gap-6">
						<div className="flex flex-col overflow-clip rounded-lg border">
							<div className="flex items-center justify-between border-b bg-muted px-4 py-2.5">
								<span className="font-medium text-xs">
									In this segment right now
								</span>
								<span className="text-muted-foreground text-xs">
									{preview.isFetching
										? "Counting…"
										: `Showing up to 20 of ${total?.toLocaleString() ?? 0}`}
								</span>
							</div>

							{(preview.data?.sample ?? []).map((person) => (
								<div
									key={person.id}
									className="flex items-center gap-3 border-b px-4 py-2.5 text-xs last:border-b-0"
								>
									<span className="min-w-0 flex-1 truncate">{person.name}</span>
									<span className="min-w-0 flex-1 truncate text-muted-foreground">
										{person.company ?? "—"}
									</span>
								</div>
							))}

							{definition === null ? (
								<p className="px-4 py-8 text-center text-muted-foreground text-xs">
									Add a rule and this fills in.
								</p>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</MarketingEditorShell>
	);
}
