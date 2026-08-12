import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
import { db } from "@crm/db";
import { MarketingCampaignsService } from "../src/marketing/marketing-campaigns.service";
import type { MarketingTemplatesService } from "../src/marketing/marketing-templates.service";
import type { ResendService } from "../src/marketing/resend.service";

const TAG = `pause${Date.now()}`;

const resend = {} as unknown as ResendService;
const templates = {} as unknown as MarketingTemplatesService;

const campaigns = new MarketingCampaignsService(db, resend, templates);

let seq = 0;
let campaignId: string;
let nodeId: string;
let enrolmentId: string;
let sendId: string;

async function clean() {
	await db.marketingCampaign.deleteMany({ where: { name: { contains: TAG } } });
	await db.marketingRecipient.deleteMany({
		where: { address: { contains: TAG } },
	});
	await db.contact.deleteMany({ where: { lastName: TAG } });
}

beforeAll(clean);
afterAll(clean);

beforeEach(async () => {
	seq += 1;

	const contact = await db.contact.create({
		data: {
			firstName: "Dana",
			lastName: TAG,
			email: `dana.${TAG}.${seq}@example.test`,
		},
		select: { id: true, email: true },
	});

	const recipient = await db.marketingRecipient.create({
		data: { address: contact.email as string, contactId: contact.id },
		select: { id: true },
	});

	const campaign = await db.marketingCampaign.create({
		data: {
			name: `${TAG} drip ${seq}`,
			kind: "DRIP",
			status: "ACTIVE",
			entryMode: "MANUAL",
			nodes: {
				create: [{ kind: "EMAIL", subject: "Hello", x: 0, y: 0 }],
			},
		},
		select: { id: true, nodes: { select: { id: true } } },
	});

	const node = campaign.nodes.at(0);
	if (!node) throw new Error("The campaign was created with no node.");

	campaignId = campaign.id;
	nodeId = node.id;

	const enrolment = await db.marketingEnrolment.create({
		data: {
			campaignId,
			contactId: contact.id,
			recipientId: recipient.id,
			status: "ACTIVE",
			currentNodeId: nodeId,
			nextDueAt: new Date(Date.now() - 60_000),
		},
		select: { id: true },
	});

	enrolmentId = enrolment.id;

	const send = await db.marketingSend.create({
		data: {
			campaignId,
			enrolmentId,
			nodeId,
			recipientId: recipient.id,
			contactId: contact.id,
			origin: "DRIP",
			subject: "Hello",
			document: { version: 1, blocks: [] },
			dueAt: new Date(Date.now() - 60_000),
		},
		select: { id: true },
	});

	sendId = send.id;
});

function readSend() {
	return db.marketingSend.findUniqueOrThrow({
		where: { id: sendId },
		select: { status: true, skipReason: true, dueAt: true },
	});
}

describe("pausing a campaign stops the mail already queued", () => {
	it("takes every queued send out of the drain", async () => {
		await campaigns.pause(campaignId, "Wrong list.");

		const send = await readSend();

		expect(send.status).toBe("SKIPPED");
		expect(send.skipReason).toBe("the campaign is paused");
	});

	it("puts them back when the campaign resumes", async () => {
		await campaigns.pause(campaignId);
		await campaigns.resume(campaignId, "backlog");

		const send = await readSend();

		expect(send.status).toBe("QUEUED");
		expect(send.skipReason).toBeNull();
	});

	it("moves the clock to now when the resume restarts it", async () => {
		const before = new Date();

		await campaigns.pause(campaignId);
		await campaigns.resume(campaignId, "restart");

		const send = await readSend();

		expect(send.status).toBe("QUEUED");
		expect(send.dueAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
	});

	it("leaves a send whose person left during the pause", async () => {
		await campaigns.pause(campaignId);
		await campaigns.unenrol(enrolmentId);
		await campaigns.resume(campaignId, "restart");

		const send = await readSend();

		expect(send.status).toBe("SKIPPED");
		expect(send.skipReason).toBe("the campaign is paused");
	});
});

describe("removing somebody by hand", () => {
	it("skips the email they were about to get", async () => {
		await campaigns.unenrol(enrolmentId);

		const send = await readSend();

		expect(send.status).toBe("SKIPPED");
		expect(send.skipReason).toBe("a rep removed them");
	});

	it("exits the enrolment with the manual reason", async () => {
		await campaigns.unenrol(enrolmentId);

		const row = await db.marketingEnrolment.findUniqueOrThrow({
			where: { id: enrolmentId },
			select: { status: true, exitKind: true, exitReason: true },
		});

		expect(row.status).toBe("EXITED");
		expect(row.exitKind).toBe("MANUAL");
		expect(row.exitReason).toBe("a rep removed them");
	});
});
