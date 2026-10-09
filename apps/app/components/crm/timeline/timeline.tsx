"use client";

import Chat from "@carbon/icons-react/es/Chat";
import Checkmark from "@carbon/icons-react/es/Checkmark";
import Email from "@carbon/icons-react/es/Email";
import Events from "@carbon/icons-react/es/Events";
import Task from "@carbon/icons-react/es/Task";
import Time from "@carbon/icons-react/es/Time";
import { Button } from "@crm/ui/components/button";
import type { CarbonIcon } from "@crm/ui/components/icon";
import { Spinner } from "@crm/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { LOCALE } from "@crm/ui/lib/format";
import { cn } from "@crm/ui/lib/utils";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { DetailSheetEmpty, SECTION_TITLE } from "@/components/detail-sheet";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useHydrated } from "@/lib/use-hydrated";
import { ActivityComposer } from "./activity-composer";
import { TimelineEntry, type TimelineEntryData } from "./timeline-entry";
import {
	historyFilter,
	TIMELINE_TABS,
	type TimelineTab,
	timelineTabParser,
} from "./timeline-search-params";

export type TimelineAnchor =
	| { companyId: string }
	| { contactId: string }
	| { dealId: string };

const TAB_LABELS = {
	all: "Wszystko",
	notes: "Notatki",
	email: "E-mail",
	meetings: "Spotkania",
	upcoming: "Do zrobienia",
	done: "Zrobione",
} satisfies Record<TimelineTab, string>;

const EMPTY_STATES = {
	all: {
		title: "Jeszcze nic się nie wydarzyło",
		description:
			"Tu trafiają telefony, notatki, maile i spotkania. Zapisz pierwszą aktywność powyżej albo poczekaj na synchronizację Gmaila i Kalendarza.",
	},
	notes: {
		title: "Brak notatek",
		description:
			"Notatka to to, co warto zapamiętać na później: na czym im zależy, kto jeszcze decyduje, co obiecaliśmy.",
	},
	email: {
		title: "Brak maili",
		description:
			"Wątki pojawiają się tu po synchronizacji z Gmailem. Maile sprzed podłączenia skrzynki nie są importowane.",
	},
	meetings: {
		title: "Brak spotkań",
		description:
			"Tu widać wydarzenia z kalendarza z udziałem osób z tego rekordu, minione i nadchodzące.",
	},
	upcoming: {
		title: "Nic do zrobienia",
		description:
			"Tu są niezakończone zadania. Do czasu odhaczenia widać je też na górze zakładki Wszystko.",
	},
	done: {
		title: "Nic jeszcze nie zrobiono",
		description: "Zadania trafiają tu po odhaczeniu.",
	},
} satisfies Record<TimelineTab, { title: string; description: string }>;

const EMPTY_ICONS = {
	all: Time,
	notes: Chat,
	email: Email,
	meetings: Events,
	upcoming: Task,
	done: Checkmark,
} satisfies Record<TimelineTab, CarbonIcon>;

const dayFormat = new Intl.DateTimeFormat(LOCALE, {
	weekday: "short",
	month: "short",
	day: "numeric",
	year: "numeric",
});

function dayLabel(day: string, local: boolean): string {
	const now = new Date();
	const today = dayKey(now.toISOString(), local);
	const yesterdayDate = local
		? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
		: new Date(Date.now() - 86_400_000);
	const yesterday = dayKey(yesterdayDate.toISOString(), local);

	if (day === today) return "Dziś";
	if (day === yesterday) return "Wczoraj";
	return dayFormat.format(new Date(`${day}T00:00:00`));
}

function byDay(entries: TimelineEntryData[], local: boolean) {
	const groups = new Map<
		string,
		{ day: string; label: string; entries: TimelineEntryData[] }
	>();

	for (const entry of entries) {
		const day = dayKey(entry.occurredAt ?? entry.createdAt, local);

		const group = groups.get(day);
		if (group) {
			group.entries.push(entry);
		} else {
			groups.set(day, { day, label: dayLabel(day, local), entries: [entry] });
		}
	}

	return [...groups.values()];
}

function dayKey(value: string, local: boolean): string {
	if (!local) return value.slice(0, 10);
	const date = new Date(value);
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0"),
	].join("-");
}

function TimelineDay({
	label,
	entries,
	anchor,
}: {
	label: string;
	entries: TimelineEntryData[];
	anchor: TimelineAnchor;
}) {
	return (
		<section>
			<h3 className={cn("sticky top-0 z-10 bg-popover py-2", SECTION_TITLE)}>
				{label}
			</h3>
			<ul className="divide-y">
				{entries.map((entry) => (
					<TimelineEntry key={entry.id} entry={entry} anchor={anchor} />
				))}
			</ul>
		</section>
	);
}

export function Timeline({ anchor }: { anchor: TimelineAnchor }) {
	const trpc = useTRPC();
	const hydrated = useHydrated();

	const [tab, setTab] = useQueryState(
		SEARCH_PARAM.record.timeline,
		timelineTabParser,
	);

	const counts = useQuery(trpc.activities.timelineCounts.queryOptions(anchor));

	const pinned = useQuery({
		...trpc.activities.timeline.queryOptions({
			...anchor,
			filter: "upcoming",
			limit: 10,
		}),
		enabled: tab === "all",
	});

	const history = useInfiniteQuery({
		...trpc.activities.timeline.infiniteQueryOptions(
			{ ...anchor, filter: historyFilter(tab) },
			{ getNextPageParam: (page) => page.nextCursor ?? undefined },
		),
	});

	const entries = history.data?.pages.flatMap((page) => page.entries) ?? [];
	const pinnedEntries = tab === "all" ? (pinned.data?.entries ?? []) : [];

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="flex shrink-0 flex-col gap-2 border-b px-5 py-3">
				<ActivityComposer anchor={anchor} />

				<ToggleGroup
					type="single"
					value={tab}
					onValueChange={(next) => {
						if (next) void setTab(next as TimelineTab);
					}}
					size="sm"
					spacing={0}
				>
					{TIMELINE_TABS.map((option) => (
						<ToggleGroupItem key={option} value={option}>
							{TAB_LABELS[option]}
							{counts.data?.[option] ? (
								<span className="tabular-nums opacity-60">
									{counts.data[option]}
								</span>
							) : null}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>

			{history.isPending ? (
				<div className="flex min-h-0 flex-1 items-center justify-center">
					<Spinner />
				</div>
			) : entries.length === 0 && pinnedEntries.length === 0 ? (
				<DetailSheetEmpty
					icon={EMPTY_ICONS[tab]}
					title={EMPTY_STATES[tab].title}
					description={EMPTY_STATES[tab].description}
				/>
			) : (
				<div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-4">
					{pinnedEntries.length > 0 ? (
						<TimelineDay
							label="Do zrobienia"
							entries={pinnedEntries}
							anchor={anchor}
						/>
					) : null}

					{byDay(entries, hydrated).map((group) => (
						<TimelineDay
							key={group.day}
							label={group.label}
							entries={group.entries}
							anchor={anchor}
						/>
					))}

					{history.hasNextPage ? (
						<Button
							variant="outline"
							size="sm"
							className="mt-4 self-start"
							disabled={history.isFetchingNextPage}
							onClick={() => history.fetchNextPage()}
						>
							{history.isFetchingNextPage ? <Spinner /> : null}
							Show older
						</Button>
					) : null}
				</div>
			)}
		</div>
	);
}
