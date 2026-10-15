"use client";

import Checkmark from "@carbon/icons-react/es/Checkmark";
import Copy from "@carbon/icons-react/es/Copy";
import Launch from "@carbon/icons-react/es/Launch";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { Icon } from "@crm/ui/components/icon";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import {
	LocalDateTime,
	LocalDay,
	LocalRelativeTime,
} from "@/components/local-date-time";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type DealOffers = RouterOutputs["offers"]["forDeal"];
type Offer = DealOffers["offers"][number];
type OfferEvent = DealOffers["events"][number];

const OFFER_URL = "https://www.workshift.pl/oferta";

const EVENT_LABEL = {
	unlock_password: "Wejście hasłem",
	unlock_token: "Wejście z linku",
	view: "Otwarcie",
	pdf: "Pobranie PDF",
} satisfies Record<OfferEvent["kind"], string>;

const EVENT_TIME: Intl.DateTimeFormatOptions = {
	day: "numeric",
	month: "short",
	hour: "numeric",
	minute: "2-digit",
};

function statusLabel(offer: Offer): string {
	if (offer.status === "revoked") return "Wycofana";
	if (offer.status === "draft") return "Szkic";
	return offer.expired ? "Wygasła" : "Aktywna";
}

export function DealOffersSection({ dealId }: { dealId: string }) {
	const trpc = useTRPC();
	const query = useQuery(trpc.offers.forDeal.queryOptions({ id: dealId }));
	const data = query.data;

	if (!data || data.offers.length === 0) return null;

	const several = data.offers.length > 1;

	return (
		<DetailSheetSection title={several ? "Oferty" : "Oferta"}>
			<div className="space-y-4">
				{data.offers.map((offer) => (
					<OfferSummary key={offer.id} offer={offer} />
				))}
				<OfferEvents events={data.events} showSlug={several} />
			</div>
		</DetailSheetSection>
	);
}

function OfferSummary({ offer }: { offer: Offer }) {
	const url = `${OFFER_URL}/${offer.slug}`;

	return (
		<DetailSheetProperties>
			<DetailSheetProperty label="Link" wide>
				<span className="flex min-w-0 items-center gap-1">
					<a
						href={url}
						target="_blank"
						rel="noreferrer"
						className="min-w-0 truncate underline-offset-2 hover:underline"
					>
						{url.replace("https://", "")}
					</a>
					<CopyLink url={url} />
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="icon-xs" asChild>
								<a href={url} target="_blank" rel="noreferrer">
									<Icon icon={Launch} />
									<span className="sr-only">Otwórz ofertę</span>
								</a>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Otwórz ofertę</TooltipContent>
					</Tooltip>
				</span>
			</DetailSheetProperty>

			<DetailSheetProperty label="Status">
				<span className="flex items-center gap-1.5">
					{statusLabel(offer)}
					{offer.isTest ? <Badge variant="mono">test</Badge> : null}
				</span>
			</DetailSheetProperty>

			<DetailSheetProperty label="Ważna do">
				{offer.expiresAt ? (
					<LocalDay date={offer.expiresAt} />
				) : (
					<span className="text-muted-foreground">bez terminu</span>
				)}
			</DetailSheetProperty>

			<DetailSheetProperty label="Otwarcia">
				<span className="tabular-nums">
					{offer.views}
					{offer.visitors > 1 ? (
						<span className="text-muted-foreground">
							{" "}
							(z {offer.visitors} adresów)
						</span>
					) : null}
				</span>
			</DetailSheetProperty>

			<DetailSheetProperty label="Pobrania PDF">
				{offer.hasPdf ? (
					<span className="tabular-nums">{offer.pdfDownloads}</span>
				) : (
					<span className="text-muted-foreground">brak PDF</span>
				)}
			</DetailSheetProperty>

			<DetailSheetProperty label="Ostatnio">
				{offer.lastOpenedAt ? (
					<LocalRelativeTime date={offer.lastOpenedAt} />
				) : (
					<span className="text-muted-foreground">jeszcze nie otwarta</span>
				)}
			</DetailSheetProperty>

			<DetailSheetProperty label="Pierwsze wejście">
				{offer.firstOpenedAt ? (
					<LocalDateTime date={offer.firstOpenedAt} options={EVENT_TIME} />
				) : (
					<EmptyCellValue />
				)}
			</DetailSheetProperty>
		</DetailSheetProperties>
	);
}

function CopyLink({ url }: { url: string }) {
	const [copied, setCopied] = useState(false);

	async function copy() {
		await navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="ghost" size="icon-xs" onClick={copy}>
					<Icon icon={copied ? Checkmark : Copy} />
					<span className="sr-only">Kopiuj link</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent>{copied ? "Skopiowano" : "Kopiuj link"}</TooltipContent>
		</Tooltip>
	);
}

function OfferEvents({
	events,
	showSlug,
}: {
	events: OfferEvent[];
	showSlug: boolean;
}) {
	if (events.length === 0) return null;

	return (
		<div className="space-y-1">
			<p className="text-muted-foreground text-xs">Ostatnie zdarzenia</p>
			<ul className="divide-y text-xs/5">
				{events.map((event) => (
					<li key={event.id} className="flex items-baseline gap-3 py-1">
						<span className="w-28 shrink-0 tabular-nums text-muted-foreground">
							<LocalDateTime date={event.occurredAt} options={EVENT_TIME} />
						</span>
						<span className="min-w-0 flex-1 truncate">
							{EVENT_LABEL[event.kind]}
							{showSlug ? (
								<span className="text-muted-foreground"> · {event.slug}</span>
							) : null}
						</span>
						<span className="shrink-0 text-muted-foreground">
							{event.country ?? ""}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
