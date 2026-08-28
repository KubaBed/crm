import { db } from "@crm/db";
import type { SlackEvent } from "@crm/validation";
import { schemas } from "@crm/validation";
import { SLACK_EVENT_TYPES } from "@crm/validation/slack-events";
import type { SendFn } from "eve/channels";
import { resumeAgentRun, runOnSlackChannel } from "./run-resume";
import { SLACK_EVENTS } from "./slack-events-config";

export type SlackEventOutcome = {
	eventId: string;
	resumed: boolean;
	outcome: string;
};

export async function pendingSlackEventIds(): Promise<string[]> {
	const rows = await db.slackEventInbox.findMany({
		where: { processedAt: null },
		orderBy: { receivedAt: "asc" },
		take: SLACK_EVENTS.batch,
		select: { id: true },
	});

	return rows.map((row) => row.id);
}

export async function dispatchSlackEvent(
	id: string,
	send: SendFn,
): Promise<SlackEventOutcome | null> {
	const row = await db.slackEventInbox.findUnique({
		where: { id },
		select: {
			id: true,
			eventId: true,
			channelId: true,
			payload: true,
			processedAt: true,
		},
	});

	if (!row || row.processedAt) return null;

	const settle = (outcome: string, resumed = false) =>
		db.slackEventInbox
			.updateMany({
				where: { id, processedAt: null },
				data: { processedAt: new Date(), outcome: outcome.slice(0, 300) },
			})
			.then(() => ({ eventId: row.eventId, resumed, outcome }));

	if (!row.channelId) return settle("The event names no channel.");

	const envelope = schemas.slackEvents.eventCallback.safeParse(row.payload);
	if (!envelope.success) return settle("The stored payload cannot be read.");

	const runId = await runOnSlackChannel(row.channelId);
	if (!runId) {
		return settle(`No live agent run owns ${row.channelId}.`);
	}

	const result = await resumeAgentRun(
		{
			runId,
			message: describe(envelope.data.event),
			source: `slack.${envelope.data.event.type}`,
			attributes: {
				slackChannelId: row.channelId,
				slackEventId: row.eventId,
			},
		},
		send,
	);

	if (result.kind === "resumed") {
		await db.slackEventInbox.updateMany({
			where: { id },
			data: { runId },
		});
		return settle(`Resumed run ${runId}.`, true);
	}

	return settle(`Run ${runId} was not resumed: ${result.reason}`);
}

export async function drainSlackEvents(send: SendFn): Promise<number> {
	const ids = await pendingSlackEventIds();

	const outcomes = await Promise.all(
		ids.map((id) =>
			dispatchSlackEvent(id, send).catch((error) => {
				console.error(
					`[agent] Slack event ${id} could not be dispatched: ${
						error instanceof Error ? error.message : String(error)
					}`,
				);
				return null;
			}),
		),
	);

	return outcomes.filter((outcome) => outcome?.resumed).length;
}

export function describe(event: SlackEvent): string {
	if (event.type === SLACK_EVENT_TYPES.MEMBER_JOINED) {
		return [
			`Somebody joined the Slack channel this run is working in (${event.channel}).`,
			event.user ? `Their Slack user id is ${event.user}.` : "",
			"Carry on from where you parked.",
		]
			.filter(Boolean)
			.join(" ");
	}

	const text = event.text?.trim() ?? "";

	return [
		`A message arrived in the Slack channel this run is working in (${event.channel})`,
		event.user ? ` from ${event.user}` : "",
		`: ${text.slice(0, SLACK_EVENTS.maxTextChars)}`,
	].join("");
}
