import { z } from "zod";
import { TRACING } from "./tracing-config";

export type TraceDestination =
	| {
			kind: "inference";
			label: string;
			token: string;
			endpoint: string;
			serviceName: string;
	  }
	| { kind: "off"; label: string };

export type TraceEnv = Readonly<Record<string, string | undefined>>;

export function resolveTraceDestination(env: TraceEnv): TraceDestination {
	const token = trimmed(env[TRACING.inference.keyVar]);

	if (!token) {
		return {
			kind: "off",
			label: `no ${TRACING.inference.keyVar}`,
		};
	}

	const endpoint =
		trimmed(env[TRACING.inference.endpointVar]) ??
		TRACING.inference.defaultEndpoint;

	const serviceName =
		trimmed(env[TRACING.inference.serviceNameVar]) ??
		TRACING.inference.defaultServiceName;

	return { kind: "inference", label: endpoint, token, endpoint, serviceName };
}

export function environmentOf(env: TraceEnv): string {
	return trimmed(env.NODE_ENV) ?? "development";
}

function trimmed(value: string | undefined): string | null {
	const text = value?.trim();
	return text && text.length > 0 ? text : null;
}

const sessionAuth = z.object({
	initiator: z.object({ principalId: z.string().trim().min(1) }).nullish(),
	current: z.object({ principalId: z.string().trim().min(1) }).nullish(),
});

export function principalOf(auth: unknown): string | null {
	const parsed = sessionAuth.safeParse(auth);
	if (!parsed.success) return null;

	return (
		parsed.data.initiator?.principalId ??
		parsed.data.current?.principalId ??
		null
	);
}
