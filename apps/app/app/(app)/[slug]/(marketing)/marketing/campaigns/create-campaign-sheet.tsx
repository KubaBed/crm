"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@crm/ui/components/sheet";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type ComponentProps, Suspense, useId, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

const NONE = "none";

function AddButton(props: ComponentProps<typeof Button>) {
	return (
		<Button {...props}>
			<Icon icon={Add} data-icon="inline-start" />
			New campaign
		</Button>
	);
}

export function CreateCampaignSheet() {
	return (
		<Suspense fallback={<AddButton disabled />}>
			<CreateCampaignForm />
		</Suspense>
	);
}

function CreateCampaignForm() {
	const trpc = useTRPC();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();

	const [open, setOpen] = useQueryState(
		"new",
		parseAsBoolean.withDefault(false),
	);
	const [name, setName] = useState("");
	const [kind, setKind] = useState<"BLAST" | "DRIP">("DRIP");
	const [segmentId, setSegmentId] = useState(NONE);

	const nameId = useId();
	const kindId = useId();
	const segmentIdId = useId();

	const segments = useQuery(trpc.marketingSegments.options.queryOptions());

	const create = useMutation(
		trpc.marketingCampaigns.create.mutationOptions({
			onSuccess: async (campaign) => {
				await setOpen(null);
				setName("");
				router.push(workspaceUrl(`/marketing/campaigns/${campaign.id}`));
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<Sheet open={open} onOpenChange={(next) => setOpen(next || null)}>
			<SheetTrigger asChild>
				<AddButton />
			</SheetTrigger>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>New campaign</SheetTitle>
					<SheetDescription>
						A blast goes to a segment once. A drip follows up over weeks and can
						branch on what people do.
					</SheetDescription>
				</SheetHeader>

				<form
					id="create-campaign"
					className="flex-1 overflow-y-auto px-4"
					onSubmit={(event) => {
						event.preventDefault();
						create.mutate({
							name,
							kind,
							segmentId: segmentId === NONE ? null : segmentId,
						});
					}}
				>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={nameId}>Name</FieldLabel>
							<Input
								id={nameId}
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder="Pricing page follow-up"
								autoFocus
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor={kindId}>Kind</FieldLabel>
							<Select
								value={kind}
								onValueChange={(value) => setKind(value as "BLAST" | "DRIP")}
							>
								<SelectTrigger id={kindId}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="DRIP">Drip — many touches</SelectItem>
									<SelectItem value="BLAST">Blast — one send</SelectItem>
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel htmlFor={segmentIdId}>Segment</FieldLabel>
							<Select value={segmentId} onValueChange={setSegmentId}>
								<SelectTrigger id={segmentIdId}>
									<SelectValue placeholder="Choose who this goes to" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={NONE}>Decide later</SelectItem>
									{(segments.data ?? []).map((segment) => (
										<SelectItem key={segment.id} value={segment.id}>
											{segment.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					</FieldGroup>
				</form>

				<SheetFooter>
					<Button
						type="submit"
						form="create-campaign"
						disabled={!name.trim() || create.isPending}
					>
						{create.isPending ? <Spinner /> : null}
						Create
					</Button>
					<SheetClose asChild>
						<Button variant="outline">Cancel</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
