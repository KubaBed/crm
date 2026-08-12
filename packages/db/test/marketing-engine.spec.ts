import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "../src/client";
import {
	advance,
	advanceDue,
	enrolContact,
	sweepEntries,
	sweepExits,
} from "../src/marketing/drips";
import { claimDueSends, materialise, settle } from "../src/marketing/queue";

const TAG = `mktest${Date.now()}`;

let seq = 0;

type Seeded = {
	campaignId: string;
	touch1: string;
	touch2: string;
	contactId: string;
	address: string;
};

async function seedDrip(
	options: { maxPasses?: number; cooldown?: number | null } = {},
) {
	seq += 1;
	const suffix = `${TAG}x${seq}`;

	const contact = await db.contact.create({
		data: {
			firstName: "Dana",
			lastName: TAG,
			email: `dana.${suffix}@example.test`,
		},
		select: { id: true, email: true },
	});

	const campaign = await db.marketingCampaign.create({
		data: {
			name: `${TAG} drip ${seq}`,
			kind: "DRIP",
			status: "ACTIVE",
			entryMode: "MANUAL",
			maxPasses: options.maxPasses ?? 1,
			reentryCooldownDays: options.cooldown ?? null,
		},
		select: { id: true },
	});

	const touch1 = await db.marketingCampaignNode.create({
		data: {
			campaignId: campaign.id,
			kind: "EMAIL",
			label: "Touch 1",
			subject: "First",
			document: { version: 1, blocks: [] },
		},
		select: { id: true },
	});

	const wait = await db.marketingCampaignNode.create({
		data: { campaignId: campaign.id, kind: "WAIT", delayHours: 0 },
		select: { id: true },
	});

	const touch2 = await db.marketingCampaignNode.create({
		data: {
			campaignId: campaign.id,
			kind: "EMAIL",
			label: "Touch 2",
			subject: "Second",
			document: { version: 1, blocks: [] },
		},
		select: { id: true },
	});

	await db.marketingCampaignEdge.createMany({
		data: [
			{ campaignId: campaign.id, fromId: touch1.id, toId: wait.id },
			{ campaignId: campaign.id, fromId: wait.id, toId: touch2.id },
		],
	});

	return {
		campaignId: campaign.id,
		touch1: touch1.id,
		touch2: touch2.id,
		contactId: contact.id,
		address: contact.email as string,
	} satisfies Seeded;
}

async function cleanup() {
	await db.marketingCampaign.deleteMany({ where: { name: { contains: TAG } } });
	await db.marketingSegment.deleteMany({ where: { name: { contains: TAG } } });
	await db.marketingRecipient.deleteMany({
		where: { address: { contains: TAG } },
	});
	await db.contact.deleteMany({ where: { lastName: TAG } });
}

beforeAll(cleanup);
afterAll(cleanup);

describe("a drip walks its graph", () => {
	test("sends touch one, then touch two, one send each", async () => {
		const drip = await seedDrip();

		const enrolled = await enrolContact(db, drip.campaignId, drip.contactId);
		expect(enrolled.ok).toBe(true);

		await advanceDue(db);
		await advanceDue(db);
		await advanceDue(db);

		const sends = await db.marketingSend.findMany({
			where: { campaignId: drip.campaignId },
			select: { nodeId: true, pass: true },
		});

		expect(sends).toHaveLength(2);
		expect(sends.map((send) => send.nodeId).sort()).toEqual(
			[drip.touch1, drip.touch2].sort(),
		);
		expect(sends.every((send) => send.pass === 1)).toBe(true);
	});

	test("advancing twice does not send the same touch twice", async () => {
		const drip = await seedDrip();
		await enrolContact(db, drip.campaignId, drip.contactId);

		const enrolment = await db.marketingEnrolment.findFirstOrThrow({
			where: { campaignId: drip.campaignId },
			select: { id: true },
		});

		await advance(db, enrolment.id);
		await db.marketingEnrolment.update({
			where: { id: enrolment.id },
			data: { currentNodeId: drip.touch1, nextDueAt: new Date() },
		});
		await advance(db, enrolment.id);

		const count = await db.marketingSend.count({
			where: { nodeId: drip.touch1 },
		});

		expect(count).toBe(1);
	});
});

describe("re-entry", () => {
	test("is refused while they are still walking", async () => {
		const drip = await seedDrip({ maxPasses: 3, cooldown: 0 });
		await enrolContact(db, drip.campaignId, drip.contactId);

		const second = await enrolContact(db, drip.campaignId, drip.contactId);

		expect(second.ok).toBe(false);
	});

	test("is refused once, ever, when maxPasses is one", async () => {
		const drip = await seedDrip({ maxPasses: 1 });
		await enrolContact(db, drip.campaignId, drip.contactId);

		await db.marketingEnrolment.updateMany({
			where: { campaignId: drip.campaignId },
			data: { status: "COMPLETED", exitedAt: new Date(), exitKind: "RULE" },
		});

		const again = await enrolContact(db, drip.campaignId, drip.contactId);
		expect(again.ok).toBe(false);
	});

	test("lets a second pass send the touch the first pass already sent", async () => {
		const drip = await seedDrip({ maxPasses: 2, cooldown: 0 });

		await enrolContact(db, drip.campaignId, drip.contactId);
		const first = await db.marketingEnrolment.findFirstOrThrow({
			where: { campaignId: drip.campaignId },
			select: { id: true },
		});
		await advance(db, first.id);

		await db.marketingEnrolment.update({
			where: { id: first.id },
			data: { status: "COMPLETED", exitedAt: new Date(), exitKind: "RULE" },
		});

		const second = await enrolContact(db, drip.campaignId, drip.contactId);
		expect(second.ok).toBe(true);
		if (!second.ok) return;

		await advance(db, second.enrolmentId);

		const sends = await db.marketingSend.findMany({
			where: { nodeId: drip.touch1 },
			select: { pass: true },
			orderBy: { pass: "asc" },
		});

		expect(sends.map((send) => send.pass)).toEqual([1, 2]);
	});

	test("never lets a suppressed address back in", async () => {
		const drip = await seedDrip({ maxPasses: 5, cooldown: 0 });
		await enrolContact(db, drip.campaignId, drip.contactId);

		await db.marketingEnrolment.updateMany({
			where: { campaignId: drip.campaignId },
			data: {
				status: "EXITED",
				exitKind: "SUPPRESSED",
				exitedAt: new Date(),
			},
		});

		await db.marketingRecipient.updateMany({
			where: { address: drip.address },
			data: { status: "UNSUBSCRIBED" },
		});

		const again = await enrolContact(db, drip.campaignId, drip.contactId);
		expect(again.ok).toBe(false);
	});
});

describe("the exit sweep", () => {
	test("pulls somebody out the moment their address is suppressed", async () => {
		const drip = await seedDrip();
		await enrolContact(db, drip.campaignId, drip.contactId);

		await db.marketingRecipient.updateMany({
			where: { address: drip.address },
			data: { status: "UNSUBSCRIBED" },
		});

		const exited = await sweepExits(db, drip.campaignId);
		expect(exited).toBeGreaterThan(0);

		const enrolment = await db.marketingEnrolment.findFirstOrThrow({
			where: { campaignId: drip.campaignId },
			select: { status: true, exitKind: true },
		});

		expect(enrolment.status).toBe("EXITED");
		expect(enrolment.exitKind).toBe("SUPPRESSED");
	});

	test("runs between touches, not only when the next one is due", async () => {
		const drip = await seedDrip();
		await enrolContact(db, drip.campaignId, drip.contactId);

		await db.marketingEnrolment.updateMany({
			where: { campaignId: drip.campaignId },
			data: { nextDueAt: new Date(Date.now() + 14 * 86_400_000) },
		});

		await db.marketingRecipient.updateMany({
			where: { address: drip.address },
			data: { status: "COMPLAINED" },
		});

		await sweepExits(db, drip.campaignId);

		const enrolment = await db.marketingEnrolment.findFirstOrThrow({
			where: { campaignId: drip.campaignId },
			select: { status: true },
		});

		expect(enrolment.status).toBe("EXITED");
	});
});

describe("the entry sweep", () => {
	test("does nothing for a manual drip", async () => {
		const drip = await seedDrip();
		expect(await sweepEntries(db, drip.campaignId)).toBe(0);
	});
});

describe("the send queue", () => {
	test("claims a due send once, even when two drains run", async () => {
		const drip = await seedDrip();
		await enrolContact(db, drip.campaignId, drip.contactId);
		await advance(
			db,
			(
				await db.marketingEnrolment.findFirstOrThrow({
					where: { campaignId: drip.campaignId },
					select: { id: true },
				})
			).id,
		);

		const [first, second] = await Promise.all([
			claimDueSends(db, 50),
			claimDueSends(db, 50),
		]);

		const mine = [...first, ...second].filter(
			(send) => send.campaignId === drip.campaignId,
		);

		expect(mine).toHaveLength(1);
	});

	test("settles a send and stamps the recipient", async () => {
		const drip = await seedDrip();
		await enrolContact(db, drip.campaignId, drip.contactId);
		await advance(
			db,
			(
				await db.marketingEnrolment.findFirstOrThrow({
					where: { campaignId: drip.campaignId },
					select: { id: true },
				})
			).id,
		);

		const send = await db.marketingSend.findFirstOrThrow({
			where: { campaignId: drip.campaignId },
			select: { id: true },
		});

		await settle(db, send.id, { ok: true, providerId: `prov_${TAG}` });

		const settled = await db.marketingSend.findUniqueOrThrow({
			where: { id: send.id },
			select: {
				status: true,
				sentAt: true,
				recipient: { select: { lastSentAt: true } },
			},
		});

		expect(settled.status).toBe("SENT");
		expect(settled.sentAt).not.toBeNull();
		expect(settled.recipient.lastSentAt).not.toBeNull();
	});
});

describe("a blast", () => {
	test("materialises once per recipient, and twice cannot double-send", async () => {
		const contact = await db.contact.create({
			data: {
				firstName: "Blast",
				lastName: TAG,
				email: `blast.${TAG}@example.test`,
			},
			select: { id: true },
		});

		const segment = await db.marketingSegment.create({
			data: {
				name: `${TAG} segment`,
				definition: { facet: { facet: "contact.hasEmail" } },
			},
			select: { id: true },
		});

		const campaign = await db.marketingCampaign.create({
			data: {
				name: `${TAG} blast`,
				kind: "BLAST",
				status: "SCHEDULED",
				segmentId: segment.id,
				scheduledAt: new Date(),
			},
			select: { id: true },
		});

		await db.marketingCampaignNode.create({
			data: {
				campaignId: campaign.id,
				kind: "EMAIL",
				subject: "One send",
				document: { version: 1, blocks: [] },
			},
		});

		const first = await materialise(db, campaign.id);
		const second = await materialise(db, campaign.id);

		expect(first.total).toBeGreaterThan(0);

		const rows = await db.marketingSend.count({
			where: { campaignId: campaign.id, contactId: contact.id },
		});

		expect(rows).toBe(1);
		expect(second.total).toBe(first.total);
	});
});
