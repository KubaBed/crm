import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { OffersService } from "../src/offers/offers.service";

const suffix = process.env.TEST_RUN_ID ?? "deal-offers-spec";
const userId = `user-${suffix}`;
const domain = `offers-${suffix}.test`;
const slug = `spec-${suffix}`.toLowerCase().replace(/[^a-z0-9_-]/g, "-");

let companyId: string;
let dealId: string;
let otherDealId: string;
let offerId: string;

const service = () => new OffersService(db, new ActivityStampService(db));

async function createOffersSchema() {
	await db.$executeRawUnsafe("DROP SCHEMA IF EXISTS offers CASCADE");
	await db.$executeRawUnsafe("CREATE SCHEMA offers");
	await db.$executeRawUnsafe(`
		CREATE TABLE offers.offer (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			slug text NOT NULL UNIQUE,
			deal_id text REFERENCES public.deal(id) ON DELETE SET NULL,
			title text NOT NULL,
			content jsonb NOT NULL,
			status text NOT NULL DEFAULT 'draft',
			password_hash text,
			token_hash text UNIQUE,
			access_epoch integer NOT NULL DEFAULT 0,
			expires_at timestamptz,
			pdf_path text,
			is_test boolean NOT NULL DEFAULT false,
			created_at timestamptz NOT NULL DEFAULT now(),
			updated_at timestamptz NOT NULL DEFAULT now()
		)
	`);
	await db.$executeRawUnsafe(`
		CREATE TABLE offers.offer_event (
			id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
			offer_id uuid NOT NULL REFERENCES offers.offer(id) ON DELETE CASCADE,
			kind text NOT NULL,
			occurred_at timestamptz NOT NULL DEFAULT now(),
			ip_hash text,
			country text,
			user_agent text
		)
	`);
}

beforeAll(async () => {
	await db.$executeRawUnsafe("DROP SCHEMA IF EXISTS offers CASCADE");

	await db.user.upsert({
		where: { id: userId },
		create: {
			id: userId,
			name: "Offer Tester",
			email: `offers@${domain}`,
			emailVerified: true,
		},
		update: {},
	});

	const company = await db.company.upsert({
		where: { domain },
		create: { name: `Offers Co ${suffix}`, domain, ownerId: userId },
		update: {},
	});
	companyId = company.id;

	const deal = await db.deal.create({
		data: { name: `Offer deal ${suffix}`, companyId, ownerId: userId },
	});
	dealId = deal.id;

	const other = await db.deal.create({
		data: { name: `Other deal ${suffix}`, companyId, ownerId: userId },
	});
	otherDealId = other.id;
});

afterAll(async () => {
	await db.$executeRawUnsafe("DROP SCHEMA IF EXISTS offers CASCADE");
	await db.activity.deleteMany({ where: { companyId } });
	await db.deal.deleteMany({ where: { companyId } });
	await db.company.deleteMany({ where: { id: companyId } });
	await db.user.deleteMany({ where: { id: userId } });
});

describe("offers without the offers schema", () => {
	it("reads as no offers and logs nothing", async () => {
		const offers = service();
		expect(await offers.forDeal(dealId)).toEqual({ offers: [], events: [] });
		expect(await offers.logFirstOpens()).toEqual({
			logged: 0,
			activityIds: [],
		});
	});
});

describe("offers on a deal", () => {
	beforeAll(async () => {
		await createOffersSchema();

		const [offer] = await db.$queryRaw<{ id: string }[]>`
			INSERT INTO offers.offer (slug, deal_id, title, content, status, expires_at, pdf_path, is_test, password_hash, token_hash)
			VALUES (${slug}, ${dealId}, 'Oferta testowa', '{"secret":"content"}'::jsonb, 'active',
				now() + interval '10 days', 'x/oferta.pdf', true, 'scrypt$hash', 'tokenhash')
			RETURNING id::text AS id
		`;
		offerId = offer?.id ?? "";

		await db.$executeRaw`
			INSERT INTO offers.offer_event (offer_id, kind, occurred_at, ip_hash, country, user_agent)
			VALUES
				(${offerId}::uuid, 'unlock_token', now() - interval '3 hours', 'ip-a', 'PL', 'UA-a'),
				(${offerId}::uuid, 'view', now() - interval '3 hours' + interval '1 second', 'ip-a', 'PL', 'UA-a'),
				(${offerId}::uuid, 'pdf', now() - interval '2 hours', 'ip-a', 'PL', 'UA-a'),
				(${offerId}::uuid, 'view', now() - interval '1 hour', 'ip-b', 'DE', 'UA-b')
		`;
	});

	it("summarises the offer without its secrets", async () => {
		const result = await service().forDeal(dealId);

		expect(result.offers).toHaveLength(1);
		const [offer] = result.offers;
		expect(offer).toMatchObject({
			id: offerId,
			slug,
			title: "Oferta testowa",
			status: "active",
			expired: false,
			hasPdf: true,
			isTest: true,
			views: 2,
			unlocks: 1,
			pdfDownloads: 1,
			visitors: 2,
		});
		expect(offer?.firstOpenedAt).not.toBeNull();
		expect(new Date(offer?.lastOpenedAt ?? 0).getTime()).toBeGreaterThan(
			new Date(offer?.firstOpenedAt ?? 0).getTime(),
		);

		expect(result.events.map((event) => event.kind)).toEqual([
			"view",
			"pdf",
			"view",
			"unlock_token",
		]);
		expect(result.events[0]?.country).toBe("DE");

		const serialized = JSON.stringify(result);
		for (const secret of [
			"ip-a",
			"UA-a",
			"scrypt",
			"tokenhash",
			"oferta.pdf",
		]) {
			expect(serialized).not.toContain(secret);
		}
		expect(serialized).not.toContain("content");
	});

	it("shows nothing on a deal without offers", async () => {
		expect(await service().forDeal(otherDealId)).toEqual({
			offers: [],
			events: [],
		});
	});

	it("marks an offer past its date as expired", async () => {
		await db.$executeRaw`UPDATE offers.offer SET expires_at = now() - interval '1 minute' WHERE id = ${offerId}::uuid`;
		const [offer] = (await service().forDeal(dealId)).offers;
		expect(offer?.expired).toBe(true);
		await db.$executeRaw`UPDATE offers.offer SET expires_at = now() + interval '10 days' WHERE id = ${offerId}::uuid`;
	});

	it("logs the first open on the deal timeline once", async () => {
		const offers = service();

		const first = await offers.logFirstOpens();
		expect(first.logged).toBe(1);

		const [activity] = await db.activity.findMany({ where: { dealId } });
		expect(activity).toMatchObject({
			type: "NOTE",
			subject: "Klient otworzył ofertę",
			companyId,
			createdById: userId,
			meta: {
				source: "offer",
				event: "first_open",
				offerId,
				slug,
				kind: "unlock_token",
			},
		});
		expect(activity?.body).toContain(`/oferta/${slug}`);
		expect(activity?.body).toContain("z linku");

		const deal = await db.deal.findUnique({ where: { id: dealId } });
		expect(deal?.lastActivityAt).not.toBeNull();

		expect((await offers.logFirstOpens()).logged).toBe(0);
		expect(await db.activity.count({ where: { dealId } })).toBe(1);
	});

	it("skips offers that are not on a deal", async () => {
		await db.$executeRaw`
			INSERT INTO offers.offer (slug, title, content, status)
			VALUES (${`${slug}-loose`}, 'Bez deala', '{}'::jsonb, 'active')
		`;
		await db.$executeRaw`
			INSERT INTO offers.offer_event (offer_id, kind)
			SELECT id, 'view' FROM offers.offer WHERE slug = ${`${slug}-loose`}
		`;

		expect((await service().logFirstOpens()).logged).toBe(0);
	});
});
