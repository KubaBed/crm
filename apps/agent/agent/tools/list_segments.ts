import { defineTool } from "eve/tools";
import { z } from "zod";
import { listSegments } from "../lib/marketing";

export default defineTool({
	description:
		"List the marketing segments, with how many people are in each right now. A segment is a saved question about the contacts, shared by every campaign. Free.",
	inputSchema: z.object({}),
	async execute() {
		return listSegments();
	},
});
