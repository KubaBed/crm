import { ActivityType, type Db } from "@crm/db";
import { Injectable, Logger } from "@nestjs/common";
import { ActivityStampService } from "../crm/activity-stamp.service";
import { InjectDatabase } from "../database/database.constants";
import type {
	DealOffers,
	FirstOpensResult,
	OFFER_EVENT_KINDS,
	OFFER_STATUSES,
} from "./offers.contracts";

export const OFFER_ACTIVITY_SOURCE = "offer";
export const FIRST_OPEN_EVENT = "first_open";
export const OFFER_PUBLIC_URL = "https://www.workshift.pl/oferta";

const RECENT_EVENTS = 20;
const SWEEP_LOCK = "crm-offers-first-open";

type OfferRow = {
	id: string;
	slug: string;
	title: string;
	status: (typeof OFFER_STATUSES)[number];
	expired: boolean;
	expiresAt: Date | null;
	hasPdf: boolean;
	isTest: boolean;
	views: number;
	unlocks: number;
	pdfDownloads: number;
	visitors: number;
	firstOpenedAt: Date | null;
	lastOpenedAt: Date | null;
};

type EventRow = {
	id: string;
	slug: string;
	kind: (typeof OFFER_EVENT_KINDS)[number];
	occurredAt: Date;
	country: string | null;
};

type FirstOpenRow = {
	offerId: string;
	slug: string;
	title: string;
	dealId: string;
	companyId: string;
	ownerId: string;
	eventId: string;
	kind: string;
	occurredAt: Date;
	country: string | null;
};

@Injectable()
export class OffersService {
	private readonly logger = new Logger(OffersService.name);
	private schemaReady = false;

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly stamp: ActivityStampService,
	) {}

	async forDeal(dealId: string): Promise<DealOffers> {
		if (!(await this.hasOffersSchema())) return { offers: [], events: [] };

		const [offers, events] = await Promise.all([
			this.db.$queryRaw<OfferRow[]>`
				SELECT
					o.id::text AS "id",
					o.slug,
					o.title,
					o.status,
					(o.expires_at IS NOT NULL AND o.expires_at <= now()) AS "expired",
					o.expires_at AS "expiresAt",
					(o.pdf_path IS NOT NULL) AS "hasPdf",
					o.is_test AS "isTest",
					count(e.id) FILTER (WHERE e.kind = 'view')::int AS "views",
					count(e.id) FILTER (WHERE e.kind LIKE 'unlock_%')::int AS "unlocks",
					count(e.id) FILTER (WHERE e.kind = 'pdf')::int AS "pdfDownloads",
					count(DISTINCT e.ip_hash)::int AS "visitors",
					min(e.occurred_at) FILTER (WHERE e.kind <> 'pdf') AS "firstOpenedAt",
					max(e.occurred_at) FILTER (WHERE e.kind <> 'pdf') AS "lastOpenedAt"
				FROM offers.offer o
				LEFT JOIN offers.offer_event e ON e.offer_id = o.id
				WHERE o.deal_id = ${dealId}
				GROUP BY o.id
				ORDER BY o.updated_at DESC
			`,
			this.db.$queryRaw<EventRow[]>`
				SELECT
					e.id::text AS "id",
					o.slug,
					e.kind,
					e.occurred_at AS "occurredAt",
					e.country
				FROM offers.offer_event e
				JOIN offers.offer o ON o.id = e.offer_id
				WHERE o.deal_id = ${dealId}
				ORDER BY e.occurred_at DESC, e.id DESC
				LIMIT ${RECENT_EVENTS}
			`,
		]);

		return {
			offers: offers.map((offer) => ({
				...offer,
				expiresAt: offer.expiresAt?.toISOString() ?? null,
				firstOpenedAt: offer.firstOpenedAt?.toISOString() ?? null,
				lastOpenedAt: offer.lastOpenedAt?.toISOString() ?? null,
			})),
			events: events.map((event) => ({
				...event,
				occurredAt: event.occurredAt.toISOString(),
			})),
		};
	}

	async logFirstOpens(): Promise<FirstOpensResult> {
		if (!(await this.hasOffersSchema())) return { logged: 0, activityIds: [] };

		const created = await this.db.$transaction(async (tx) => {
			await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${SWEEP_LOCK}))`;

			const pending = await tx.$queryRaw<FirstOpenRow[]>`
				SELECT
					o.id::text AS "offerId",
					o.slug,
					o.title,
					d.id AS "dealId",
					d."companyId",
					d."ownerId",
					first.id::text AS "eventId",
					first.kind,
					first.occurred_at AS "occurredAt",
					first.country
				FROM offers.offer o
				JOIN public.deal d ON d.id = o.deal_id AND d."archivedAt" IS NULL
				CROSS JOIN LATERAL (
					SELECT e.id, e.kind, e.occurred_at, e.country
					FROM offers.offer_event e
					WHERE e.offer_id = o.id AND e.kind <> 'pdf'
					ORDER BY e.occurred_at, e.id
					LIMIT 1
				) first
				WHERE NOT EXISTS (
					SELECT 1 FROM public.activity a
					WHERE a."dealId" = d.id
						AND a.meta->>'source' = ${OFFER_ACTIVITY_SOURCE}
						AND a.meta->>'event' = ${FIRST_OPEN_EVENT}
						AND a.meta->>'offerId' = o.id::text
				)
			`;

			const rows: { id: string; row: FirstOpenRow; createdAt: Date }[] = [];
			for (const row of pending) {
				const activity = await tx.activity.create({
					data: {
						type: ActivityType.NOTE,
						subject: "Klient otworzył ofertę",
						body: firstOpenBody(row),
						occurredAt: row.occurredAt,
						dealId: row.dealId,
						companyId: row.companyId,
						createdById: row.ownerId,
						meta: {
							source: OFFER_ACTIVITY_SOURCE,
							event: FIRST_OPEN_EVENT,
							offerId: row.offerId,
							slug: row.slug,
							eventId: row.eventId,
							kind: row.kind,
						},
					},
					select: { id: true, createdAt: true },
				});
				rows.push({ id: activity.id, row, createdAt: activity.createdAt });
			}
			return rows;
		});

		for (const { row, createdAt } of created) {
			await this.stamp.touch(
				{ companyId: row.companyId, dealId: row.dealId },
				createdAt,
			);
		}

		if (created.length > 0) {
			this.logger.log({
				message: "Offer first opens logged",
				count: created.length,
				offerIds: created.map(({ row }) => row.offerId),
			});
		}

		return {
			logged: created.length,
			activityIds: created.map(({ id }) => id),
		};
	}

	private async hasOffersSchema(): Promise<boolean> {
		if (this.schemaReady) return true;

		const [row] = await this.db.$queryRaw<{ ready: boolean }[]>`
			SELECT to_regclass('offers.offer') IS NOT NULL
				AND to_regclass('offers.offer_event') IS NOT NULL AS "ready"
		`;
		this.schemaReady = row?.ready === true;
		return this.schemaReady;
	}
}

function firstOpenBody(row: FirstOpenRow): string {
	const how =
		row.kind === "unlock_token"
			? "z linku"
			: row.kind === "unlock_password"
				? "hasłem"
				: "z zapisanej sesji";
	const where = row.country ? `, kraj ${row.country}` : "";

	return `${row.title}: ${OFFER_PUBLIC_URL}/${row.slug} (wejście ${how}${where}).`;
}
