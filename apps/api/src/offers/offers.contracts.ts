import { z } from "zod";

export const OFFER_STATUSES = ["draft", "active", "revoked"] as const;

export const OFFER_EVENT_KINDS = [
	"unlock_password",
	"unlock_token",
	"view",
	"pdf",
] as const;

export const dealOffersInput = z.object({ id: z.string() });

const dealOffer = z.object({
	id: z.string(),
	slug: z.string(),
	title: z.string(),
	status: z.enum(OFFER_STATUSES),
	expired: z.boolean(),
	expiresAt: z.string().nullable(),
	hasPdf: z.boolean(),
	isTest: z.boolean(),
	views: z.number().int(),
	unlocks: z.number().int(),
	pdfDownloads: z.number().int(),
	visitors: z.number().int(),
	firstOpenedAt: z.string().nullable(),
	lastOpenedAt: z.string().nullable(),
});

const dealOfferEvent = z.object({
	id: z.string(),
	slug: z.string(),
	kind: z.enum(OFFER_EVENT_KINDS),
	occurredAt: z.string(),
	country: z.string().nullable(),
});

export const dealOffersOutput = z.object({
	offers: z.array(dealOffer),
	events: z.array(dealOfferEvent),
});

export type DealOffers = z.infer<typeof dealOffersOutput>;

export const firstOpensOutput = z.object({
	logged: z.number().int(),
	activityIds: z.array(z.string()),
});

export type FirstOpensResult = z.infer<typeof firstOpensOutput>;
