import { defineTool } from "eve/tools";
import { z } from "zod";
import { listTemplates } from "../lib/marketing";

export default defineTool({
	description: "List the marketing email templates. Free.",
	inputSchema: z.object({}),
	async execute() {
		return listTemplates();
	},
});
