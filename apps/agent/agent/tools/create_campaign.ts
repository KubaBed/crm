import { db } from "@crm/db";
import { EMPTY_DOCUMENT } from "@crm/email/document";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
	description:
		"Create a marketing campaign as a draft, and return its id so you can write its graph. A blast goes to a segment once; a drip follows up over weeks and can branch. Nothing sends until a person activates it.",
	inputSchema: z.object({
		name: z.string().min(1).max(160),
		kind: z.enum(["BLAST", "DRIP"]),
		segmentId: z.string().optional(),
	}),
	async execute(input) {
		const campaign = await db.marketingCampaign.create({
			data: {
				name: input.name,
				kind: input.kind,
				segmentId: input.segmentId ?? null,
				entryMode: input.kind === "DRIP" ? "CONTINUOUS" : "MANUAL",
				nodes: {
					create: {
						kind: "EMAIL",
						label: input.kind === "DRIP" ? "Touch 1" : "The email",
						subject: "",
						document: EMPTY_DOCUMENT as object,
					},
				},
			},
			select: { id: true, nodes: { select: { id: true } } },
		});

		return {
			campaignId: campaign.id,
			firstNodeId: campaign.nodes[0]?.id,
			status: "DRAFT",
			next: "Write the graph with write_campaign_graph, then tell the rep to open it and activate it.",
		};
	},
});
