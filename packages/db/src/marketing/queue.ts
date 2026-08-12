import type { Db } from "../client";
import type { Prisma } from "../generated/prisma/client";
import type {
	MarketingSendOrigin,
	MarketingSendStatus,
} from "../generated/prisma/enums";
import { recipientsFor } from "./recipients";
import { segmentWhere } from "./segments";
import { MARKETING } from "./settings";

export type SkipReason =
	| "no-address"
	| "unsubscribed"
	| "bounced"
	| "complained"
	| "daily-cap";

export type MaterialiseResult = {
	queued: number;
	skipped: Record<string, number>;
	total: number;
};

function skipFor(status: string): SkipReason | null {
	if (status === "SUBSCRIBED") return null;
	if (status === "UNSUBSCRIBED") return "unsubscribed";
	if (status === "BOUNCED") return "bounced";
	if (status === "COMPLAINED") return "complained";
	return null;
}

export async function audienceFor(
	db: Db,
	segmentId: string,
): Promise<{ id: string; email: string | null }[]> {
	const segment = await db.marketingSegment.findUnique({
		where: { id: segmentId },
		select: {
			definition: true,
			members: { select: { contactId: true, mode: true } },
		},
	});

	if (!segment) return [];

	return db.contact.findMany({
		where: segmentWhere(segment),
		select: { id: true, email: true },
	});
}

export async function materialise(
	db: Db,
	campaignId: string,
	options: { dueAt?: Date } = {},
): Promise<MaterialiseResult> {
	const campaign = await db.marketingCampaign.findUnique({
		where: { id: campaignId },
		select: {
			id: true,
			segmentId: true,
			replyTo: true,
			scheduledAt: true,
			nodes: {
				select: {
					id: true,
					subject: true,
					preheader: true,
					document: true,
					kind: true,
				},
			},
		},
	});

	if (!campaign?.segmentId) return { queued: 0, skipped: {}, total: 0 };

	const node = campaign.nodes.find((candidate) => candidate.kind === "EMAIL");
	if (!node) return { queued: 0, skipped: {}, total: 0 };

	const contacts = await audienceFor(db, campaign.segmentId);
	const withEmail = contacts.filter((contact) => contact.email);
	const recipients = await recipientsFor(
		db,
		withEmail.map((contact) => ({
			address: contact.email as string,
			contactId: contact.id,
		})),
	);

	const dueAt = options.dueAt ?? campaign.scheduledAt ?? new Date();
	const skipped: Record<string, number> = {};
	const rows: Prisma.MarketingSendCreateManyInput[] = [];

	for (const contact of contacts) {
		if (!contact.email) {
			skipped["no-address"] = (skipped["no-address"] ?? 0) + 1;
			continue;
		}

		const recipient = recipients.get(contact.email.toLowerCase());
		if (!recipient) {
			skipped["no-address"] = (skipped["no-address"] ?? 0) + 1;
			continue;
		}

		const reason = skipFor(recipient.status);

		rows.push({
			campaignId: campaign.id,
			nodeId: node.id,
			recipientId: recipient.id,
			contactId: contact.id,
			origin: "CAMPAIGN",
			pass: 1,
			subject: node.subject,
			document: (node.document ?? undefined) as
				| Prisma.InputJsonValue
				| undefined,
			replyTo: campaign.replyTo,
			status: reason ? "SKIPPED" : "QUEUED",
			skipReason: reason,
			dueAt,
		});

		if (reason) skipped[reason] = (skipped[reason] ?? 0) + 1;
	}

	await db.marketingSend.createMany({ data: rows, skipDuplicates: true });

	const queued =
		rows.length - Object.values(skipped).reduce((sum, n) => sum + n, 0);

	await db.marketingCampaign.update({
		where: { id: campaign.id },
		data: { totalRecipients: rows.length },
	});

	return { queued, skipped, total: rows.length };
}

export type DirectSend = {
	address: string;
	contactId?: string | null;
	subject: string;
	document: unknown;
	replyTo?: string | null;
	requestedById?: string | null;
	origin?: MarketingSendOrigin;
	dueAt?: Date;
};

export type DirectResult =
	| { ok: true; sendId: string }
	| { ok: false; reason: SkipReason | "invalid-address" };

export async function queueDirect(
	db: Db,
	input: DirectSend,
): Promise<DirectResult> {
	const recipients = await recipientsFor(db, [
		{ address: input.address, contactId: input.contactId ?? null },
	]);
	const recipient = [...recipients.values()][0];

	if (!recipient) return { ok: false, reason: "invalid-address" };

	const reason = skipFor(recipient.status);
	if (reason) return { ok: false, reason };

	const send = await db.marketingSend.create({
		data: {
			recipientId: recipient.id,
			contactId: input.contactId ?? recipient.contactId,
			origin: input.origin ?? "DIRECT",
			subject: input.subject,
			document: input.document as Prisma.InputJsonValue,
			replyTo: input.replyTo ?? null,
			requestedById: input.requestedById ?? null,
			dueAt: input.dueAt ?? new Date(),
		},
		select: { id: true },
	});

	return { ok: true, sendId: send.id };
}

export type ClaimedSend = {
	id: string;
	recipientId: string;
	address: string;
	token: string;
	contactId: string | null;
	campaignId: string | null;
	nodeId: string | null;
	subject: string | null;
	document: unknown;
	replyTo: string | null;
	attempts: number;
	hasAttachments: boolean;
};

export async function claimDueSends(
	db: Db,
	limit = MARKETING.drain.claimLimit,
): Promise<ClaimedSend[]> {
	const leaseCutoff = new Date(Date.now() - MARKETING.drain.leaseMs);

	const claimed = await db.$queryRaw<{ id: string }[]>`
		WITH due AS (
			SELECT s.id
			FROM "marketingSend" s
			WHERE s."dueAt" <= now()
				AND s.attempts < ${MARKETING.drain.maxAttempts}
				AND (
					s.status = 'QUEUED'
					OR (s.status = 'SENDING' AND (s."leasedAt" IS NULL OR s."leasedAt" < ${leaseCutoff}))
				)
			ORDER BY s."dueAt" ASC
			LIMIT ${limit}
			FOR UPDATE SKIP LOCKED
		)
		UPDATE "marketingSend" s
		SET status = 'SENDING', "leasedAt" = now(), attempts = s.attempts + 1
		FROM due
		WHERE s.id = due.id
		RETURNING s.id
	`;

	if (claimed.length === 0) return [];

	const rows = await db.marketingSend.findMany({
		where: { id: { in: claimed.map((row) => row.id) } },
		select: {
			id: true,
			recipientId: true,
			contactId: true,
			campaignId: true,
			nodeId: true,
			subject: true,
			document: true,
			replyTo: true,
			attempts: true,
			recipient: { select: { address: true, token: true } },
			_count: { select: { attachments: true } },
		},
	});

	return rows.map((row) => ({
		id: row.id,
		recipientId: row.recipientId,
		address: row.recipient.address,
		token: row.recipient.token,
		contactId: row.contactId,
		campaignId: row.campaignId,
		nodeId: row.nodeId,
		subject: row.subject,
		document: row.document,
		replyTo: row.replyTo,
		attempts: row.attempts,
		hasAttachments: row._count.attachments > 0,
	}));
}

export type Outcome =
	| { ok: true; providerId: string }
	| { ok: false; error: string; retry: boolean };

export async function settle(
	db: Db,
	sendId: string,
	outcome: Outcome,
): Promise<void> {
	if (outcome.ok) {
		const now = new Date();
		await db.$transaction([
			db.marketingSend.update({
				where: { id: sendId },
				data: {
					status: "SENT",
					sentAt: now,
					providerId: outcome.providerId,
					error: null,
				},
			}),
			db.marketingEvent.create({ data: { sendId, type: "SENT", at: now } }),
		]);

		const send = await db.marketingSend.findUnique({
			where: { id: sendId },
			select: { recipientId: true },
		});

		if (send) {
			await db.marketingRecipient.update({
				where: { id: send.recipientId },
				data: { lastSentAt: now },
			});
		}
		return;
	}

	const status: MarketingSendStatus = outcome.retry ? "QUEUED" : "FAILED";

	await db.marketingSend.update({
		where: { id: sendId },
		data: {
			status,
			error: outcome.error.slice(0, 500),
			leasedAt: null,
			...(outcome.retry && { dueAt: new Date(Date.now() + 60_000) }),
		},
	});

	if (!outcome.retry) {
		await db.marketingEvent.create({ data: { sendId, type: "FAILED" } });
	}
}

export async function finishCampaigns(db: Db): Promise<void> {
	const sending = await db.marketingCampaign.findMany({
		where: { kind: "BLAST", status: "SENDING" },
		select: { id: true },
	});

	for (const campaign of sending) {
		const outstanding = await db.marketingSend.count({
			where: { campaignId: campaign.id, status: { in: ["QUEUED", "SENDING"] } },
		});

		if (outstanding === 0) {
			await db.marketingCampaign.update({
				where: { id: campaign.id },
				data: { status: "SENT", finishedAt: new Date() },
			});
		}
	}
}

export async function startDueCampaigns(db: Db): Promise<void> {
	await db.marketingCampaign.updateMany({
		where: {
			kind: "BLAST",
			status: "SCHEDULED",
			scheduledAt: { lte: new Date() },
		},
		data: { status: "SENDING", startedAt: new Date() },
	});
}
