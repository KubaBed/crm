import { TRACING } from "./tracing-config";

export type TraceDestination =
	| { kind: "raindrop"; label: string; writeKey: string }
	| {
			kind: "otlp";
			label: string;
			url: string;
			headers: Record<string, string>;
	  }
	| { kind: "off"; label: string };

export type TraceEnv = Readonly<Record<string, string | undefined>>;

export function resolveTraceDestination(env: TraceEnv): TraceDestination {
	const key = trimmed(env[TRACING.raindrop.keyVar]);
	if (key) return { kind: "raindrop", label: "Raindrop", writeKey: key };

	const endpoint = trimmed(env[TRACING.otlp.endpointVar]);
	if (endpoint) {
		return {
			kind: "otlp",
			label: endpoint,
			url: tracesUrl(endpoint),
			headers: parseHeaders(env[TRACING.otlp.headersVar]),
		};
	}

	return {
		kind: "off",
		label: `no ${TRACING.raindrop.keyVar} and no ${TRACING.otlp.endpointVar}`,
	};
}

export function parseHeaders(
	value: string | undefined,
): Record<string, string> {
	const headers: Record<string, string> = {};

	for (const pair of (value ?? "").split(",")) {
		const at = pair.indexOf("=");
		if (at < 1) continue;

		const name = pair.slice(0, at).trim();
		const content = pair.slice(at + 1).trim();
		if (name && content) headers[name] = content;
	}

	return headers;
}

function tracesUrl(endpoint: string): string {
	const base = endpoint.replace(/\/+$/, "");
	return base.endsWith("/v1/traces") ? base : `${base}/v1/traces`;
}

function trimmed(value: string | undefined): string | null {
	const text = value?.trim();
	return text && text.length > 0 ? text : null;
}
