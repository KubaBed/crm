import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { db } from "@crm/db";
import { readAgentModel } from "@crm/db/settings";
import { MODEL_ROUTING } from "./model-config";

type InferenceProvider = ReturnType<typeof createOpenAICompatible>;

export type AgentModel = string | ReturnType<InferenceProvider>;

export interface ModelSelection {
	model: AgentModel;
	modelContextWindowTokens: number;
}

export type ModelRoute =
	| { kind: "gateway"; id: string }
	| { kind: "inference"; id: string; baseUrl: string; apiKey: string }
	| { kind: "unavailable"; id: string; reason: string };

export function routeOf(
	id: string,
	env: Readonly<Record<string, string | undefined>>,
): ModelRoute {
	const { prefix, keyVar, baseUrlVar, defaultBaseUrl } =
		MODEL_ROUTING.inference;

	if (!id.startsWith(prefix)) return { kind: "gateway", id };

	const model = id.slice(prefix.length).trim();
	if (!model) {
		return {
			kind: "unavailable",
			id,
			reason: `"${prefix}" names no model after the prefix`,
		};
	}

	const apiKey = env[keyVar]?.trim();
	if (!apiKey) {
		return {
			kind: "unavailable",
			id,
			reason: `${keyVar} is not set on this install`,
		};
	}

	return {
		kind: "inference",
		id: model,
		baseUrl: env[baseUrlVar]?.trim() || defaultBaseUrl,
		apiKey,
	};
}

let provider: InferenceProvider | null = null;
let providerKey = "";

function inferenceModel(route: Extract<ModelRoute, { kind: "inference" }>) {
	const cacheKey = `${route.baseUrl} ${route.apiKey}`;

	if (!provider || providerKey !== cacheKey) {
		provider = createOpenAICompatible({
			name: MODEL_ROUTING.inference.providerName,
			baseURL: route.baseUrl,
			apiKey: route.apiKey,
			includeUsage: true,
		});
		providerKey = cacheKey;
	}

	return provider(route.id);
}

export async function selectedModel(): Promise<ModelSelection | null> {
	try {
		const setting = await readAgentModel(db);

		if (setting.isDefault) return null;

		const route = routeOf(setting.id, process.env);

		if (route.kind === "unavailable") {
			console.error(
				`[agent] cannot route the configured model "${route.id}": ${route.reason}. Falling back to the default model.`,
			);
			return null;
		}

		return {
			model: route.kind === "inference" ? inferenceModel(route) : route.id,
			modelContextWindowTokens: setting.contextWindowTokens,
		};
	} catch (error) {
		console.error(
			`[agent] could not read the configured model, falling back: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return null;
	}
}
