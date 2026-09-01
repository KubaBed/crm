import { defineTool } from "eve/tools";
import { z } from "zod";
import { postRunSlackMessage } from "../../../lib/run-runtime";
import { requireTeamAgentAttribute } from "../../../lib/session-purpose";

export default defineTool({
	description:
		"Post one message to the Slack destination approved in the deployed version. That is either the channel this run opened or the standing channel or person pinned at deploy time. Do not choose a channel here; the manifest already has it. The action is idempotent across retries.",
	inputSchema: z.object({
		text: z.string().trim().min(1).max(4_000),
	}),
	async execute(input, ctx) {
		return postRunSlackMessage(
			requireTeamAgentAttribute(ctx, "runId"),
			ctx.callId,
			input,
			ctx.abortSignal,
		);
	},
});
