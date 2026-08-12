import { defineTool } from "eve/tools";
import { z } from "zod";
import { sensitiveWrite } from "../lib/approval";
import { writeShell } from "../lib/marketing";

export default defineTool({
	description:
		"Read the `writing-an-email` skill first: the block document shape is not guessable. Rewrite the header or the footer every email wears. Every template and every campaign node picks it up on the next send, so this reaches mail somebody already wrote. The postal address and the unsubscribe link are added by the compiler and are not blocks — you cannot add or remove them. Free.",
	inputSchema: z.object({
		shellId: z
			.string()
			.min(1)
			.describe("From read_shell. The header or footer you are rewriting."),
		name: z.string().min(1).max(160).optional(),
		document: z
			.record(z.string(), z.unknown())
			.describe("The whole block document, the same shape a template uses."),
	}),
	approval: sensitiveWrite(
		"A person edits the header and footer in Marketing → Templates.",
	),
	async execute(input) {
		return writeShell(input);
	},
});
