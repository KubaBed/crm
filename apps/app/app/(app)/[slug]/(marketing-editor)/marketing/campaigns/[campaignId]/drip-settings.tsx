"use client";

import Settings from "@carbon/icons-react/es/Settings";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { Label } from "@crm/ui/components/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@crm/ui/components/sheet";
import { Spinner } from "@crm/ui/components/spinner";
import { Switch } from "@crm/ui/components/switch";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";

export function DripSettings({
	campaignId,
	cooldownDays,
	maxPasses,
	onChanged,
}: {
	campaignId: string;
	cooldownDays: number | null;
	maxPasses: number;
	onChanged: () => void;
}) {
	const trpc = useTRPC();
	const [open, setOpen] = useState(false);
	const [reentry, setReentry] = useState(cooldownDays !== null);
	const [days, setDays] = useState(String(cooldownDays ?? 90));
	const [passes, setPasses] = useState(String(maxPasses));

	const save = useMutation(
		trpc.marketingCampaigns.update.mutationOptions({
			onSuccess: () => {
				toast.success("Saved.");
				setOpen(false);
				onChanged();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon" aria-label="Campaign settings">
					<Icon icon={Settings} />
				</Button>
			</SheetTrigger>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Re-entry</SheetTitle>
					<SheetDescription>
						By default somebody walks this campaign once, ever. Turning re-entry
						on lets them come back — which is right for a seasonal drip and
						wrong for a welcome series.
					</SheetDescription>
				</SheetHeader>

				<div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
					<div className="flex items-center gap-3">
						<Switch
							id="reentry"
							checked={reentry}
							onCheckedChange={setReentry}
						/>
						<Label htmlFor="reentry" className="text-xs">
							Let people re-enter
						</Label>
					</div>

					{reentry ? (
						<>
							<div className="flex flex-col gap-1.5">
								<Label
									htmlFor="cooldown"
									className="text-muted-foreground text-xs"
								>
									Wait at least
								</Label>
								<div className="flex items-center gap-2">
									<Input
										id="cooldown"
										type="number"
										value={days}
										onChange={(event) => setDays(event.target.value)}
									/>
									<span className="shrink-0 text-muted-foreground text-xs">
										days after they leave
									</span>
								</div>
							</div>

							<div className="flex flex-col gap-1.5">
								<Label
									htmlFor="passes"
									className="text-muted-foreground text-xs"
								>
									Never more than
								</Label>
								<div className="flex items-center gap-2">
									<Input
										id="passes"
										type="number"
										value={passes}
										onChange={(event) => setPasses(event.target.value)}
									/>
									<span className="shrink-0 text-muted-foreground text-xs">
										times, ever
									</span>
								</div>
								<span className="text-muted-foreground text-xs">
									This is the setting that stops the disaster. A cooldown alone
									lets somebody who drifts in and out of the segment get this
									campaign every {days || "90"} days forever, and each send
									looks correct on its own.
								</span>
							</div>
						</>
					) : null}

					<p className="text-muted-foreground text-xs">
						Somebody who unsubscribed, bounced or complained never re-enters,
						whatever these say.
					</p>
				</div>

				<SheetFooter>
					<Button
						disabled={save.isPending}
						onClick={() =>
							save.mutate({
								id: campaignId,
								reentryCooldownDays: reentry
									? Number.parseInt(days, 10) || 0
									: null,
								maxPasses: reentry
									? Math.max(1, Number.parseInt(passes, 10) || 1)
									: 1,
							})
						}
					>
						{save.isPending ? <Spinner /> : null}
						Save
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
