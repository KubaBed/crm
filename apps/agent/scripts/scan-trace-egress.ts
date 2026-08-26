import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const SKIP_KEYS = ["workflow.", "messaging.", "rpc.", "http.", "$eve."];
const MIN_LENGTH = 12;

const PATTERNS = [
	{ label: "email address", re: /[\w.+-]+@[\w-]+\.[\w.]{2,}/g },
	{ label: "UK mobile", re: /\b07\d{3}\s?\d{6}\b/g },
	{ label: "UK postcode", re: /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/g },
	{ label: "US phone", re: /\b\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g },
	{ label: "national insurance", re: /\b[A-Z]{2}\d{6}[A-D]\b/g },
	{ label: "US social security", re: /\b\d{3}-\d{2}-\d{4}\b/g },
	{ label: "date of birth", re: /\b(19|20)\d{2}-\d{2}-\d{2}\b/g },
	{
		label: "sensitive category",
		re: /\b(divorce|cancer|diagnos\w+|pregnan\w+|redundan\w+|bereave\w+|compassionate leave|visa status|immigration)\b/gi,
	},
] as const;

type Finding = {
	spanId: string;
	traceId: string;
	kind: string;
	name: string;
	labels: Set<string>;
};

const source = process.argv[2];

if (!source) {
	console.error(
		[
			"Scans a Catalyst trace export for personal data that left this install.",
			"",
			"  bun run scan:egress <spans.jsonl|spans.jsonl.gz|https://…>",
			"",
			"Get the export from the Inference dashboard, or ask Claude to queue one",
			"over MCP (export_traces, then get_trace_export_download_url). There is no",
			"public REST endpoint for it, so the file is the interface.",
		].join("\n"),
	);
	process.exit(1);
}

const bytes = source.startsWith("http")
	? Buffer.from(await (await fetch(source)).arrayBuffer())
	: readFileSync(source);

const text = (
	bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : bytes
).toString("utf8");

const lines = text.split("\n").filter(Boolean);
const carriers = new Map<string, Finding>();
const byLabel = new Map<string, number>();
let withContent = 0;

for (const line of lines) {
	let span: {
		attributes?: Record<string, unknown>;
		name?: string;
		span_id?: string;
		trace_id?: string;
	};
	try {
		span = JSON.parse(line);
	} catch {
		continue;
	}

	const attributes = span.attributes ?? {};
	const spanId = String(span.span_id ?? "");
	let counted = false;

	for (const [key, value] of Object.entries(attributes)) {
		if (value === null || value === undefined) continue;
		if (SKIP_KEYS.some((skip) => key.startsWith(skip))) continue;

		const content = typeof value === "string" ? value : JSON.stringify(value);
		if (content.length < MIN_LENGTH) continue;

		if (!counted) {
			withContent += 1;
			counted = true;
		}

		for (const { label, re } of PATTERNS) {
			re.lastIndex = 0;
			if (!re.test(content)) continue;
			re.lastIndex = 0;

			byLabel.set(label, (byLabel.get(label) ?? 0) + 1);

			const found = carriers.get(spanId) ?? {
				spanId,
				traceId: String(span.trace_id ?? ""),
				kind: String(attributes["openinference.span.kind"] ?? ""),
				name: String(span.name ?? ""),
				labels: new Set<string>(),
			};
			found.labels.add(label);
			carriers.set(spanId, found);
		}
	}
}

console.log(
	`${lines.length} spans, ${withContent} carrying content, ${carriers.size} carrying personal data.\n`,
);

if (carriers.size === 0) {
	console.log("No matches in this export.");
	process.exit(0);
}

console.log("By category:");
for (const [label, count] of [...byLabel].sort((a, b) => b[1] - a[1])) {
	console.log(`  ${String(count).padStart(5)}  ${label}`);
}

const kinds = new Map<string, number>();
for (const found of carriers.values()) {
	kinds.set(found.kind, (kinds.get(found.kind) ?? 0) + 1);
}

console.log("\nBy span kind:");
for (const [kind, count] of [...kinds].sort((a, b) => b[1] - a[1])) {
	console.log(`  ${String(count).padStart(5)}  ${kind || "(none)"}`);
}

console.log("\nCarrier spans:");
for (const found of [...carriers.values()].slice(0, 15)) {
	console.log(
		`  ${found.kind.padEnd(6)} ${found.spanId}  ${found.name}\n` +
			`         trace=${found.traceId}\n` +
			`         ${[...found.labels].join(", ")}`,
	);
}

if (carriers.size > 15) {
	console.log(`  … and ${carriers.size - 15} more.`);
}

console.log(
	"\nThis is what the tracing vendor holds. recordInputs and recordOutputs in\n" +
		"apps/agent/agent/lib/tracing-config.ts control it; both must be false, because\n" +
		"the same text rides on the TOOL result and again on the AGENT prompt.",
);
