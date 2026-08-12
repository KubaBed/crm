"use client";

import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";

export function CampaignKind({
	campaignId,
	kind,
	editable,
	onChanged,
}: {
	campaignId: string;
	kind: "BLAST" | "DRIP";
	editable: boolean;
	onChanged: () => void;
}) {
	const trpc = useTRPC();

	const setKind = useMutation(
		trpc.marketingCampaigns.setKind.mutationOptions({
			onSuccess: (result) => {
				toast.success(
					result.kind === "DRIP"
						? "Now a sequence. Build the steps on the canvas."
						: "Now a blast. One email, once.",
				);
				onChanged();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (!editable) {
		return (
			<span className="shrink-0 rounded-sm border px-1.5 py-px text-muted-foreground text-xs">
				{kind === "DRIP" ? "Sequence" : "Blast"}
			</span>
		);
	}

	return (
		<ToggleGroup
			type="single"
			size="sm"
			value={kind}
			disabled={setKind.isPending}
			onValueChange={(next) => {
				if (next !== "BLAST" && next !== "DRIP") return;
				if (next === kind) return;
				setKind.mutate({ id: campaignId, kind: next });
			}}
		>
			<ToggleGroupItem value="DRIP">Sequence</ToggleGroupItem>
			<ToggleGroupItem value="BLAST">Blast</ToggleGroupItem>
		</ToggleGroup>
	);
}
