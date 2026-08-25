import "@crm/env/load";

import { trace } from "@opentelemetry/api";
import { OTLPHttpProtoTraceExporter, registerOTel } from "@vercel/otel";
import { defineInstrumentation } from "eve/instrumentation";
import { Raindrop } from "raindrop-ai";
import { resolveTraceDestination } from "./lib/tracing";
import { TRACING } from "./lib/tracing-config";

export default defineInstrumentation({
	recordInputs: TRACING.content.recordInputs,
	recordOutputs: TRACING.content.recordOutputs,

	setup: ({ agentName }) => {
		const destination = resolveTraceDestination(process.env);

		if (destination.kind === "off") {
			console.log(
				`[agent] tracing off (${destination.label}). eve's local trace store is not written while this file exists, so nothing is recorded. Set ${TRACING.raindrop.keyVar} for Raindrop, or ${TRACING.otlp.endpointVar} for any other OTLP backend.`,
			);
			return;
		}

		try {
			if (destination.kind === "raindrop") {
				const raindrop = new Raindrop({
					writeKey: destination.writeKey,
					useExternalOtel: true,
					redactPii: TRACING.content.redactPii,
				});

				registerOTel({
					serviceName: agentName,
					spanProcessors: [raindrop.createSpanProcessor()],
				});
			} else {
				registerOTel({
					serviceName: agentName,
					traceExporter: new OTLPHttpProtoTraceExporter({
						url: destination.url,
						headers: destination.headers,
					}),
				});
			}

			console.log(
				`[agent] tracing on: ${destination.label}. Model inputs and outputs are included${
					TRACING.content.redactPii
						? ", with PII redaction"
						: ", with no PII redaction"
				}.`,
			);
		} catch (error) {
			console.error(
				`[agent] tracing could not start, so the agent runs untraced: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	},

	events: {
		"step.started"(input) {
			const userId =
				input.session.auth.initiator?.principalId ??
				input.session.auth.current?.principalId;

			const span = trace.getActiveSpan();
			if (userId) span?.setAttribute(TRACING.attributes.userId, userId);
			span?.setAttribute(TRACING.attributes.convoId, input.session.id);

			return {
				runtimeContext: {
					[TRACING.attributes.convoId]: input.session.id,
					...(userId ? { [TRACING.attributes.userId]: userId } : {}),
				},
			};
		},
	},
});
