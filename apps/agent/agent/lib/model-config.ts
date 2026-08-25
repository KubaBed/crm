export const MODEL_ROUTING = {
	inference: {
		prefix: "inference_model_",
		keyVar: "INFERENCE_API_KEY",
		baseUrlVar: "INFERENCE_BASE_URL",
		defaultBaseUrl: "https://api.inference.net/v1",
		providerName: "inference.net",
	},
} as const;
