"use client";

import Add from "@carbon/icons-react/es/Add";
import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

export function CreateCampaignButton() {
	const trpc = useTRPC();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();

	const create = useMutation(
		trpc.marketingCampaigns.create.mutationOptions({
			onSuccess: (row) =>
				router.push(workspaceUrl(`/marketing/campaigns/${row.id}`)),
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button disabled={create.isPending}>
					{create.isPending ? (
						<Spinner />
					) : (
						<Icon icon={Add} data-icon="inline-start" />
					)}
					New campaign
					<Icon icon={ChevronDown} data-icon="inline-end" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onSelect={() =>
						create.mutate({ name: "Untitled blast", kind: "BLAST" })
					}
				>
					Blast — one email, once
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() =>
						create.mutate({ name: "Untitled drip", kind: "DRIP" })
					}
				>
					Drip — several touches over time
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function CreateSegmentButton() {
	const trpc = useTRPC();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();

	const create = useMutation(
		trpc.marketingSegments.create.mutationOptions({
			onSuccess: (row) =>
				router.push(workspaceUrl(`/marketing/segments/${row.id}`)),
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<Button
			disabled={create.isPending}
			onClick={() => create.mutate({ name: "Untitled segment" })}
		>
			{create.isPending ? (
				<Spinner />
			) : (
				<Icon icon={Add} data-icon="inline-start" />
			)}
			New segment
		</Button>
	);
}

export function CreateTemplateButton() {
	const trpc = useTRPC();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();

	const create = useMutation(
		trpc.marketingTemplates.create.mutationOptions({
			onSuccess: (row) =>
				router.push(workspaceUrl(`/marketing/templates/${row.id}`)),
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<Button
			disabled={create.isPending}
			onClick={() => create.mutate({ name: "Untitled template" })}
		>
			{create.isPending ? (
				<Spinner />
			) : (
				<Icon icon={Add} data-icon="inline-start" />
			)}
			New template
		</Button>
	);
}
