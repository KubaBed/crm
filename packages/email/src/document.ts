import { z } from "zod";

export const inline = z.object({
	text: z.string().max(5000),
	bold: z.boolean().optional(),
	italic: z.boolean().optional(),
	href: z.string().url().max(2000).optional(),
});

export type Inline = z.infer<typeof inline>;

const align = z.enum(["left", "center", "right"]);

const heading = z.object({
	type: z.literal("heading"),
	level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
	text: z.array(inline).min(1),
	align: align.optional(),
});

const text = z.object({
	type: z.literal("text"),
	text: z.array(inline).min(1),
	align: align.optional(),
});

const button = z.object({
	type: z.literal("button"),
	label: z.string().trim().min(1).max(120),
	href: z.string().url().max(2000),
	align: align.optional(),
});

const image = z.object({
	type: z.literal("image"),
	src: z.string().url().max(2000),
	alt: z.string().max(300),
	width: z.number().int().min(16).max(1200).optional(),
	href: z.string().url().max(2000).optional(),
});

const quote = z.object({
	type: z.literal("quote"),
	text: z.array(inline).min(1),
});

const divider = z.object({ type: z.literal("divider") });

const spacer = z.object({
	type: z.literal("spacer"),
	size: z.enum(["sm", "md", "lg"]),
});

export type Block =
	| z.infer<typeof heading>
	| z.infer<typeof text>
	| z.infer<typeof button>
	| z.infer<typeof image>
	| z.infer<typeof quote>
	| z.infer<typeof divider>
	| z.infer<typeof spacer>
	| { type: "columns"; columns: Block[][] };

export const block: z.ZodType<Block> = z.lazy(() =>
	z.union([
		heading,
		text,
		button,
		image,
		quote,
		divider,
		spacer,
		z.object({
			type: z.literal("columns"),
			columns: z.array(z.array(block).max(20)).min(2).max(3),
		}),
	]),
);

export const emailDocument = z.object({
	version: z.literal(1),
	blocks: z.array(block).max(200),
});

export type EmailDocument = z.infer<typeof emailDocument>;

export const EMPTY_DOCUMENT: EmailDocument = { version: 1, blocks: [] };

export function parseDocument(value: unknown): EmailDocument {
	const parsed = emailDocument.safeParse(value);

	if (!parsed.success) {
		const first = parsed.error.issues[0];
		throw new Error(
			`This email document cannot be read: ${first?.path.join(".") ?? "document"} — ${first?.message ?? "unknown problem"}`,
		);
	}

	return parsed.data;
}

export function readDocument(value: unknown): EmailDocument | null {
	const parsed = emailDocument.safeParse(value);
	return parsed.success ? parsed.data : null;
}

export function plainTextOf(inlines: Inline[]): string {
	return inlines.map((run) => run.text).join("");
}

export function walkBlocks(
	blocks: Block[],
	visit: (block: Block) => void,
): void {
	for (const item of blocks) {
		visit(item);
		if (item.type === "columns") {
			for (const column of item.columns) walkBlocks(column, visit);
		}
	}
}
