import { defineTool } from "eve/tools";
import { z } from "zod";
import { channelOfRun } from "../lib/run-resume";
import { requireTeamAgentAttribute } from "../lib/session-purpose";
import { inviteToSlackChannel } from "../lib/slack-invite";

export default defineTool({
	description:
		"Invite people to the Slack channel this run opened. An address inside this workspace is added straight away. An address outside it gets a Slack Connect invitation, which that person has to accept before they can read anything.",
	inputSchema: z.object({
		emails: z
			.array(z.email())
			.min(1)
			.max(10)
			.describe(
				"Who to invite, by email address. Customers and colleagues both go here.",
			),
		channelId: z
			.string()
			.trim()
			.optional()
			.describe(
				"Leave this out. It defaults to the channel this run opened and watches.",
			),
	}),
	async execute({ emails, channelId }, ctx) {
		const runId = requireTeamAgentAttribute(ctx, "runId");
		const channel = channelId?.trim() || (await channelOfRun(runId));

		if (!channel) {
			return {
				reason:
					"This run has no Slack channel yet. Open one with open_slack_channel first.",
				invited: [],
				refused: [],
			};
		}

		const outcomes = [];
		for (const email of emails) {
			outcomes.push(await inviteToSlackChannel(channel, email));
		}

		return {
			channelId: channel,
			invited: outcomes.filter((outcome) => outcome.invited),
			refused: outcomes.filter((outcome) => !outcome.invited),
		};
	},
});
