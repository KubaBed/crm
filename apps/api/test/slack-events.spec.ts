import { beforeEach, describe, expect, it } from "bun:test";
import { signBody } from "@crm/auth";
import type { SlackEnvelope, SlackEvent } from "@crm/validation";
import { UnauthorizedException } from "@nestjs/common";
import { SlackEventsController } from "../src/slack/slack-events.controller";

const secret = "test-signing-secret";

type Stored = {
	eventId: string;
	type: string;
	teamId?: string;
	channelId?: string;
	messageTs?: string;
};

const stored: Stored[] = [];
let nextResult = { stored: true };

const agent = {
	slackEventReceived: async (input: Stored) => {
		stored.push(input);
		return nextResult;
	},
} as never;

const config = {
	get: () => secret,
} as never;

const controller = new SlackEventsController(agent, config);

const post = (
	payload: SlackEnvelope | { type: string; nested?: { a: number } },
	over: { secret?: string; skew?: number } = {},
) => {
	const body = JSON.stringify(payload);
	const timestamp = String(Math.floor(Date.now() / 1000) + (over.skew ?? 0));
	const signature = signBody(body, timestamp, over.secret ?? secret);

	return controller.events(Buffer.from(body), timestamp, signature);
};

const callback = (event: SlackEvent, eventId = "Ev1") => ({
	type: "event_callback",
	event_id: eventId,
	team_id: "T1",
	event,
});

beforeEach(() => {
	stored.length = 0;
	nextResult = { stored: true };
});

describe("the Slack events endpoint", () => {
	it("answers Slack's setup handshake with the challenge", async () => {
		const result = await post({
			type: "url_verification",
			challenge: "abc123",
		});

		expect(result).toEqual({ challenge: "abc123" });
		expect(stored).toHaveLength(0);
	});

	it("stores a member-joined event for the agent to act on", async () => {
		await post(
			callback({ type: "member_joined_channel", channel: "C1", user: "U1" }),
		);

		expect(stored).toHaveLength(1);
		expect(stored[0]).toMatchObject({
			eventId: "Ev1",
			type: "member_joined_channel",
			channelId: "C1",
			teamId: "T1",
		});
	});

	it("stores a human message", async () => {
		await post(
			callback({
				type: "message",
				channel: "C1",
				user: "U1",
				text: "org_abc123",
			}),
		);

		expect(stored).toHaveLength(1);
	});

	it("stores a mention, which is how somebody asks the agent for help", async () => {
		await post(
			callback({
				type: "app_mention",
				channel: "C1",
				user: "U1",
				text: "<@U9> where are we",
				ts: "1700000000.000100",
			}),
		);

		expect(stored).toHaveLength(1);
		expect(stored[0]).toMatchObject({
			type: "app_mention",
			messageTs: "1700000000.000100",
		});
	});

	it("refuses a body that was not signed with our secret", async () => {
		const attempt = post(
			callback({ type: "member_joined_channel", channel: "C1" }),
			{ secret: "someone-elses-secret" },
		);

		await expect(attempt).rejects.toThrow(UnauthorizedException);
		expect(stored).toHaveLength(0);
	});

	it("refuses a replayed request from outside the window", async () => {
		const attempt = post(
			callback({ type: "member_joined_channel", channel: "C1" }),
			{ skew: -3600 },
		);

		await expect(attempt).rejects.toThrow(UnauthorizedException);
		expect(stored).toHaveLength(0);
	});

	it("ignores our own bot, which would otherwise talk to itself", async () => {
		await post(
			callback({
				type: "message",
				channel: "C1",
				text: "hello",
				bot_id: "B1",
			}),
		);

		expect(stored).toHaveLength(0);
	});

	it("ignores an event type we do not act on", async () => {
		await post(callback({ type: "reaction_added", channel: "C1" }));

		expect(stored).toHaveLength(0);
	});

	it("answers 200 when the agent reports the event was already stored", async () => {
		nextResult = { stored: false };

		const result = await post(
			callback({ type: "member_joined_channel", channel: "C1" }),
		);

		expect(result).toEqual({ ok: true });
	});

	it("answers 200 to a shape it cannot read, so Slack stops retrying", async () => {
		const result = await post({ type: "something_new", nested: { a: 1 } });

		expect(result).toEqual({ ok: true });
		expect(stored).toHaveLength(0);
	});

	it("refuses everything when no signing secret is configured", async () => {
		const unconfigured = new SlackEventsController(agent, {
			get: () => undefined,
		} as never);

		const body = JSON.stringify({ type: "url_verification", challenge: "x" });
		const timestamp = String(Math.floor(Date.now() / 1000));

		await expect(
			unconfigured.events(
				Buffer.from(body),
				timestamp,
				signBody(body, timestamp, secret),
			),
		).rejects.toThrow(UnauthorizedException);
	});
});

describe("the Slack events body cap", () => {
	it("uses Express raw middleware with an explicit size limit, then verifies", async () => {
		const source = await Bun.file(
			new URL("../src/create-app.ts", import.meta.url),
		).text();

		expect(source).toContain(
			'raw({ type: "*/*", limit: SLACK.events.maxBodyBytes })',
		);
		expect(source).not.toContain("collectRawBody");
		expect(source).toContain("SLACK_EVENTS_PATH");
	});
});
