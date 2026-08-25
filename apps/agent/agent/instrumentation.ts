import "@crm/env/load";

import { defineCatalystEveInstrumentation } from "@inference/tracing/eve";
import {
	environmentOf,
	principalOf,
	resolveTraceDestination,
} from "./lib/tracing";
import { TRACING } from "./lib/tracing-config";

const destination = resolveTraceDestination(process.env);

if (destination.kind === "off") {
	console.log(
		`[agent] tracing off (${destination.label}). eve's local trace store is not written while this file exists, so nothing is recorded. Set ${TRACING.inference.keyVar} to send traces to Inference.`,
	);
} else {
	console.log(
		`[agent] tracing on: ${destination.label} as ${destination.serviceName}. Model inputs and outputs are included.`,
	);
}

export default defineCatalystEveInstrumentation({
	...(destination.kind === "inference"
		? {
				token: destination.token,
				endpoint: destination.endpoint,
				serviceName: destination.serviceName,
				functionId: destination.serviceName,
			}
		: {}),

	recordInputs: TRACING.content.recordInputs,
	recordOutputs: TRACING.content.recordOutputs,

	environment: environmentOf(process.env),

	events: {
		"step.started"(input) {
			const userId = principalOf(input.session.auth);

			return {
				runtimeContext: {
					[TRACING.attributes.convoId]: input.session.id,
					...(userId ? { [TRACING.attributes.userId]: userId } : {}),
				},
			};
		},
	},
});
