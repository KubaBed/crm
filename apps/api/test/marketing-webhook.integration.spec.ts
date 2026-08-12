import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { createHmac, randomBytes } from "node:crypto";
import { Readable } from "node:stream";
import { db } from "@crm/db";
import type { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import type { EnvironmentVariables } from "../src/config/env.validation";
import { MarketingPublicController } from "../src/marketing/marketing.controller";
import type { ResendService } from "../src/marketing/resend.service";

const TAG = `hook${Date.now()}`;
const SECRET = `whsec_${randomBytes(24).toString("base64")}`;

const config = {
	get: () => SECRET,
} as unknown as ConfigService<EnvironmentVariables, true>;

const resend = {
	client: async () => new Resend("re_test_key_not_used"),
} as unknown as ResendService;

const controller = new MarketingPublicController(db, resend, config);

function signed(payload: string) {
	const id = `msg_${TAG}`;
	const timestamp = String(Math.floor(Date.now() / 1000));
	const key = Buffer.from(SECRET.split("_")[1] ?? "", "base64");

	const signature = createHmac("sha256", key)
		.update(`${id}.${timestamp}.${payload}`)
		.digest("base64");

	return {
		"svix-id": id,
		"svix-timestamp": timestamp,
		"svix-signature": `v1,${signature}`,
	};
}

function body(payload: string) {
	return Readable.from([payload]) as unknown as Parameters<
		MarketingPublicController["webhook"]
	>[0];
}

async function seed(providerId: string) {
	const recipient = await db.marketingRecipient.create({
		data: { address: `${providerId}.${TAG}@example.test` },
		select: { id: true },
	});

	const send = await db.marketingSend.create({
		data: {
			recipientId: recipient.id,
			status: "SENT",
			dueAt: new Date(),
			sentAt: new Date(),
			providerId,
		},
		select: { id: true },
	});

	return send.id;
}

async function clean() {
	await db.marketingRecipient.deleteMany({
		where: { address: { contains: TAG } },
	});
}

beforeAll(clean);
afterAll(clean);

describe("the Resend delivery webhook", () => {
	it("verifies a real signature and records the delivery", async () => {
		const providerId = `prov-${TAG}-delivered`;
		const sendId = await seed(providerId);

		const payload = JSON.stringify({
			type: "email.delivered",
			data: { email_id: providerId },
		});

		await controller.webhook(body(payload), signed(payload));

		const send = await db.marketingSend.findUniqueOrThrow({
			where: { id: sendId },
			select: { status: true, events: { select: { type: true } } },
		});

		expect(send.status).toBe("DELIVERED");
		expect(send.events.map((event) => event.type)).toEqual(["DELIVERED"]);
	});

	it("suppresses the address on a hard bounce", async () => {
		const providerId = `prov-${TAG}-bounced`;
		const sendId = await seed(providerId);

		const payload = JSON.stringify({
			type: "email.bounced",
			data: { email_id: providerId },
		});

		await controller.webhook(body(payload), signed(payload));

		const send = await db.marketingSend.findUniqueOrThrow({
			where: { id: sendId },
			select: { status: true, recipient: { select: { status: true } } },
		});

		expect(send.status).toBe("BOUNCED");
		expect(send.recipient.status).toBe("BOUNCED");
	});

	it("refuses a payload whose signature does not match", async () => {
		const providerId = `prov-${TAG}-forged`;
		const sendId = await seed(providerId);

		const payload = JSON.stringify({
			type: "email.delivered",
			data: { email_id: providerId },
		});

		const headers = signed(payload);
		headers["svix-signature"] = "v1,not-a-real-signature";

		await expect(controller.webhook(body(payload), headers)).rejects.toThrow();

		const send = await db.marketingSend.findUniqueOrThrow({
			where: { id: sendId },
			select: { status: true, events: { select: { id: true } } },
		});

		expect(send.status).toBe("SENT");
		expect(send.events).toHaveLength(0);
	});

	it("ignores an event for a send this install does not have", async () => {
		const payload = JSON.stringify({
			type: "email.delivered",
			data: { email_id: `prov-${TAG}-unknown` },
		});

		expect(await controller.webhook(body(payload), signed(payload))).toEqual(
			{},
		);
	});
});
