export const TRACING = {
	raindrop: {
		keyVar: "RAINDROP_WRITE_KEY",
	},

	otlp: {
		endpointVar: "OTEL_EXPORTER_OTLP_ENDPOINT",
		headersVar: "OTEL_EXPORTER_OTLP_HEADERS",
	},

	attributes: {
		userId: "traceloop.association.properties.user_id",
		convoId: "traceloop.association.properties.convo_id",
	},

	content: {
		recordInputs: true,
		recordOutputs: true,
		redactPii: false,
	},
} as const;
