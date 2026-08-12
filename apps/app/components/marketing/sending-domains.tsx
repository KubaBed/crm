"use client";

import Launch from "@carbon/icons-react/es/Launch";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";

const RESEND_DOMAINS_URL = "https://resend.com/domains";

export function SendingDomains({ enabled = true }: { enabled?: boolean }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const domains = useQuery({
		...trpc.marketing.domains.queryOptions(),
		enabled,
	});

	const refresh = () =>
		Promise.all([
			queryClient.invalidateQueries({
				queryKey: trpc.marketing.domains.queryKey(),
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.marketing.domain.queryKey(),
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.marketing.settings.queryKey(),
			}),
		]);

	const choose = useMutation(
		trpc.marketing.useDomain.mutationOptions({
			onSuccess: async (result) => {
				await refresh();
				toast.success(`Sending from ${result.name}.`);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const rows = domains.data ?? [];

	if (domains.isPending) return <Spinner />;

	return (
		<div className="flex flex-col">
			{rows.map((row) => {
				const verified = row.status === "verified";

				return (
					<div
						key={row.id}
						className="flex items-center gap-3 border-b py-2.5 first:pt-0 last:border-b-0"
					>
						<span className="min-w-0 flex-1 truncate text-sm">{row.name}</span>
						<Badge variant={verified ? "secondary" : "outline"}>
							{row.status.replace(/_/g, " ")}
						</Badge>
						{row.selected ? (
							<Badge variant="default">Sending from this</Badge>
						) : (
							<Button
								variant="outline"
								size="sm"
								disabled={!verified || choose.isPending}
								onClick={() => choose.mutate({ id: row.id })}
							>
								{choose.isPending ? <Spinner /> : null}
								Use it
							</Button>
						)}
					</div>
				);
			})}

			<p className="pt-3 text-muted-foreground text-xs">
				{rows.length === 0
					? "Resend has no domains yet. Add one there and verify it, then it shows up here."
					: "Only a domain Resend has verified can send. Add and verify domains in Resend."}
			</p>

			<div className="flex items-center gap-2 pt-3">
				<Button variant="outline" size="sm" asChild>
					<a href={RESEND_DOMAINS_URL} target="_blank" rel="noreferrer">
						<Icon icon={Launch} />
						Open Resend
					</a>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					disabled={domains.isFetching}
					onClick={() => void refresh()}
				>
					{domains.isFetching ? <Spinner /> : null}
					Refresh
				</Button>
			</div>
		</div>
	);
}
