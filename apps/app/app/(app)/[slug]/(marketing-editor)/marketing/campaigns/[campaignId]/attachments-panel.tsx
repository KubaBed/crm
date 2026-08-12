"use client";

import Attachment from "@carbon/icons-react/es/Attachment";
import Close from "@carbon/icons-react/es/Close";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";

const MAX_TOTAL = 40 * 1024 * 1024;

function size(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function toBase64(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

export function AttachmentsPanel({
	campaignId,
	recipients,
}: {
	campaignId: string;
	recipients: number;
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const input = useRef<HTMLInputElement>(null);

	const attachments = useQuery(
		trpc.marketingCampaigns.attachments.queryOptions({ id: campaignId }),
	);

	const invalidate = () =>
		queryClient.invalidateQueries({
			queryKey: trpc.marketingCampaigns.attachments.queryKey({
				id: campaignId,
			}),
		});

	const add = useMutation(
		trpc.marketingCampaigns.addAttachment.mutationOptions({
			onSuccess: () => {
				toast.success("Attached.");
				void invalidate();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const remove = useMutation(
		trpc.marketingCampaigns.removeAttachment.mutationOptions({
			onSuccess: () => invalidate(),
			onError: (error) => toast.error(error.message),
		}),
	);

	const rows = attachments.data ?? [];
	const total = rows.reduce((sum, row) => sum + row.bytes, 0);

	return (
		<div className="flex flex-col gap-2">
			<span className="text-muted-foreground text-xs">Attachments</span>

			{rows.length > 0 ? (
				<div className="flex flex-col overflow-clip rounded-lg border">
					{rows.map((row) => (
						<div
							key={row.id}
							className="flex items-center gap-2 border-b px-2.5 py-2 last:border-b-0"
						>
							<Icon
								icon={Attachment}
								className="size-3 shrink-0 text-muted-foreground"
							/>
							<span className="min-w-0 flex-1 truncate text-xs">
								{row.filename}
							</span>
							<span className="shrink-0 text-muted-foreground text-xs">
								{size(row.bytes)}
							</span>
							<Button
								variant="ghost"
								size="icon"
								aria-label={`Remove ${row.filename}`}
								disabled={remove.isPending}
								onClick={() => remove.mutate({ id: row.id })}
							>
								<Icon icon={Close} />
							</Button>
						</div>
					))}
				</div>
			) : null}

			<input
				ref={input}
				type="file"
				className="hidden"
				onChange={async (event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (!file) return;

					if (total + file.size > MAX_TOTAL) {
						toast.error(
							"That would take the attachments over 40 MB, which Resend refuses.",
						);
						return;
					}

					add.mutate({
						campaignId,
						filename: file.name,
						mimeType: file.type || "application/octet-stream",
						contentBase64: await toBase64(file),
					});
				}}
			/>

			<Button
				variant="outline"
				size="sm"
				className="self-start"
				disabled={add.isPending}
				onClick={() => input.current?.click()}
			>
				{add.isPending ? (
					<Spinner />
				) : (
					<Icon icon={Attachment} data-icon="inline-start" />
				)}
				Attach a file
			</Button>

			{rows.length > 0 ? (
				<span className="text-muted-foreground text-xs">
					{size(total)} of 40 MB.
					{recipients > 50
						? " Attachments cannot be batched, so this send will take far longer and lands worse."
						: ""}
				</span>
			) : null}
		</div>
	);
}
