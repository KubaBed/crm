"use client";

import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useState } from "react";
import { AgentPanel } from "@/components/crm/agent-panel";

export function CopilotRail({ campaignId }: { campaignId: string }) {
	const [open, setOpen] = useState(true);

	if (!open) {
		return (
			<aside className="flex w-11 shrink-0 flex-col items-center border-l py-3">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setOpen(true)}
					aria-label="Open the co-pilot"
				>
					<Icon icon={ChevronRight} className="rotate-180" />
				</Button>
			</aside>
		);
	}

	return (
		<aside className="flex w-[360px] shrink-0 flex-col border-l bg-background">
			<header className="flex h-11 shrink-0 items-center gap-2 border-b pr-3 pl-4">
				<span className="font-medium text-xs">Co-pilot</span>
				<div className="flex-1" />
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1 px-2 font-normal text-muted-foreground text-xs"
					onClick={() => setOpen(false)}
				>
					Collapse
					<Icon icon={ChevronRight} className="size-3.5" />
				</Button>
			</header>

			<div className="flex min-h-0 flex-1 flex-col">
				<AgentPanel record={{ kind: "campaign", id: campaignId }} />
			</div>
		</aside>
	);
}
