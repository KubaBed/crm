import { defineTool } from "eve/tools";
import { z } from "zod";
import { claimSlackChannel } from "../lib/run-resume";
import { requireTeamAgentAttribute } from "../lib/session-purpose";
import { toChannelName } from "../lib/slack-channel-name";
import { createSlackChannel } from "../lib/slack-membership";

export default defineTool({
	description:
		"Open the Slack channel this run works in, and start watching it. Every message and every join in that channel wakes this run up, so open the channel before you invite anybody. A name already in use gives you back the existing channel.",
	inputSchema: z.object({
		name: z
			.string()
			.trim()
			.min(1)
			.max(120)
			.describe(
				"What to call it, in plain words: 'Acme onboarding'. Spaces and capitals are fine; Slack gets a tidied version.",
			),
		isPrivate: z
			.boolean()
			.default(false)
			.describe(
				"True for work the whole workspace must not read. A customer channel is public.",
			),
	}),
	async execute({ name, isPrivate }, ctx) {
		const runId = requireTeamAgentAttribute(ctx, "runId");
		const channelName = toChannelName(name);

		if (!channelName) {
			return {
				opened: false as const,
				reason: "That name has no letters or numbers Slack accepts.",
			};
		}

		const outcome = await createSlackChannel(channelName, isPrivate);
		if ("error" in outcome) {
			return { opened: false as const, reason: outcome.error };
		}

		const watching = await claimSlackChannel(runId, outcome.id);

		return {
			opened: true as const,
			channelId: outcome.id,
			channelName: outcome.name,
			watching: watching === outcome.id,
			reason:
				watching === outcome.id
					? undefined
					: `This run already watches ${watching}, so messages in #${outcome.name} do not reach it.`,
		};
	},
});
