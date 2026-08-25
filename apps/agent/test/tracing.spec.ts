import { describe, expect, it } from "bun:test";
import { parseHeaders, resolveTraceDestination } from "../agent/lib/tracing";
import { TRACING } from "../agent/lib/tracing-config";

describe("resolveTraceDestination", () => {
	it("is off when nothing is configured", () => {
		const destination = resolveTraceDestination({});

		expect(destination.kind).toBe("off");
		expect(destination.label).toContain(TRACING.raindrop.keyVar);
		expect(destination.label).toContain(TRACING.otlp.endpointVar);
	});

	it("treats a blank key as unset rather than sending Bearer undefined", () => {
		expect(resolveTraceDestination({ RAINDROP_WRITE_KEY: "" }).kind).toBe("off");
		expect(resolveTraceDestination({ RAINDROP_WRITE_KEY: "   " }).kind).toBe(
			"off",
		);
	});

	it("sends to Raindrop when the write key is set", () => {
		const destination = resolveTraceDestination({
			RAINDROP_WRITE_KEY: "rd_live_123",
		});

		if (destination.kind !== "raindrop") throw new Error("expected Raindrop");
		expect(destination.writeKey).toBe("rd_live_123");
	});

	it("never puts the key in the label a boot line prints", () => {
		const destination = resolveTraceDestination({
			RAINDROP_WRITE_KEY: "rd_live_secret",
		});

		expect(destination.label).toBe("Raindrop");
		expect(destination.label).not.toContain("rd_live_secret");
	});

	it("falls back to any OTLP endpoint, so a local Jaeger works", () => {
		const destination = resolveTraceDestination({
			OTEL_EXPORTER_OTLP_ENDPOINT: "http://localhost:4318",
		});

		if (destination.kind !== "otlp") throw new Error("expected an exporter");
		expect(destination.url).toBe("http://localhost:4318/v1/traces");
	});

	it("prefers Raindrop when both are set", () => {
		const destination = resolveTraceDestination({
			RAINDROP_WRITE_KEY: "rd_live_123",
			OTEL_EXPORTER_OTLP_ENDPOINT: "http://localhost:4318",
		});

		expect(destination.kind).toBe("raindrop");
	});

	it("does not double the traces path a backend already names", () => {
		const destination = resolveTraceDestination({
			OTEL_EXPORTER_OTLP_ENDPOINT: "https://api.honeycomb.io/v1/traces",
		});

		if (destination.kind !== "otlp") throw new Error("expected an exporter");
		expect(destination.url).toBe("https://api.honeycomb.io/v1/traces");
	});

	it("tolerates a trailing slash on the endpoint", () => {
		const destination = resolveTraceDestination({
			OTEL_EXPORTER_OTLP_ENDPOINT: "http://localhost:4318/",
		});

		if (destination.kind !== "otlp") throw new Error("expected an exporter");
		expect(destination.url).toBe("http://localhost:4318/v1/traces");
	});

	it("carries the OTLP headers a backend needs to authorise", () => {
		const destination = resolveTraceDestination({
			OTEL_EXPORTER_OTLP_ENDPOINT: "https://api.honeycomb.io",
			OTEL_EXPORTER_OTLP_HEADERS: "x-honeycomb-team=abc123",
		});

		if (destination.kind !== "otlp") throw new Error("expected an exporter");
		expect(destination.headers).toEqual({ "x-honeycomb-team": "abc123" });
	});
});

describe("what a span carries", () => {
	it("names the keys Raindrop reads, not names of our own", () => {
		expect(TRACING.attributes.userId).toBe(
			"traceloop.association.properties.user_id",
		);
		expect(TRACING.attributes.convoId).toBe(
			"traceloop.association.properties.convo_id",
		);
	});

	it("keeps full content and no redaction, as the owner decided", () => {
		expect(TRACING.content.recordInputs).toBe(true);
		expect(TRACING.content.recordOutputs).toBe(true);
		expect(TRACING.content.redactPii).toBe(false);
	});
});

describe("parseHeaders", () => {
	it("reads the comma-separated form every backend documents", () => {
		expect(parseHeaders("a=1,b=2")).toEqual({ a: "1", b: "2" });
	});

	it("keeps a value that contains an equals sign", () => {
		expect(parseHeaders("authorization=Basic dXNlcjpwYXNz==")).toEqual({
			authorization: "Basic dXNlcjpwYXNz==",
		});
	});

	it("ignores whitespace and empty pairs", () => {
		expect(parseHeaders(" a = 1 , , b=2 ")).toEqual({ a: "1", b: "2" });
	});

	it("reads nothing as no headers", () => {
		expect(parseHeaders(undefined)).toEqual({});
		expect(parseHeaders("")).toEqual({});
	});

	it("drops a pair with no name", () => {
		expect(parseHeaders("=novalue,ok=1")).toEqual({ ok: "1" });
	});
});
