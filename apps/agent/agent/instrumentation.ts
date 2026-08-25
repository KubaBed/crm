import "@crm/env/load";

import { OTLPHttpProtoTraceExporter, registerOTel } from "@vercel/otel";
import { defineInstrumentation } from "eve/instrumentation";
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
			registerOTel({
				serviceName: agentName,
				traceExporter: new OTLPHttpProtoTraceExporter({
					url: destination.url,
					headers: destination.headers,
				}),
			});

			console.log(
				`[agent] tracing on: ${destination.label}. Model inputs and outputs are included.`,
			);
		} catch (error) {
			console.error(
				`[agent] tracing could not start, so the agent runs untraced: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	},
});
