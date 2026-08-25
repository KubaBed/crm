export const TRACING = {
	raindrop: {
		url: "https://api.raindrop.ai/v1/traces",
		keyVar: "RAINDROP_WRITE_KEY",
	},

	otlp: {
		endpointVar: "OTEL_EXPORTER_OTLP_ENDPOINT",
		headersVar: "OTEL_EXPORTER_OTLP_HEADERS",
	},

	content: {
		recordInputs: true,
		recordOutputs: true,
	},
} as const;
