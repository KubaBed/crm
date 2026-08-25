import { describe, expect, it } from "bun:test";
import { routeOf } from "../agent/lib/model";
import { MODEL_ROUTING } from "../agent/lib/model-config";

const KEY = { INFERENCE_API_KEY: "inf_live_123" };
const prefixed = (name: string) => `${MODEL_ROUTING.inference.prefix}${name}`;

describe("routeOf", () => {
	it("leaves an unprefixed id on the gateway, as before", () => {
		const route = routeOf("zai/glm-5.2-fast", KEY);

		expect(route.kind).toBe("gateway");
		if (route.kind !== "gateway") throw new Error("expected the gateway");
		expect(route.id).toBe("zai/glm-5.2-fast");
	});

	it("routes a prefixed id to Inference and strips the prefix", () => {
		const route = routeOf(prefixed("glm-5.2-fast"), KEY);

		if (route.kind !== "inference") throw new Error("expected Inference");
		expect(route.id).toBe("glm-5.2-fast");
		expect(route.baseUrl).toBe(MODEL_ROUTING.inference.defaultBaseUrl);
		expect(route.apiKey).toBe("inf_live_123");
	});

	it("sends the name Inference prices, not the gateway's prefixed one", () => {
		const route = routeOf(prefixed("glm-5.2-fast"), KEY);

		if (route.kind !== "inference") throw new Error("expected Inference");
		expect(route.id).not.toContain("zai/");
	});

	it("takes a self-hosted base URL over the default", () => {
		const route = routeOf(prefixed("glm-5.2-fast"), {
			...KEY,
			INFERENCE_BASE_URL: "https://gateway.internal.example/v1",
		});

		if (route.kind !== "inference") throw new Error("expected Inference");
		expect(route.baseUrl).toBe("https://gateway.internal.example/v1");
	});

	it("is unavailable rather than broken when the key is missing", () => {
		const route = routeOf(prefixed("glm-5.2-fast"), {});

		if (route.kind !== "unavailable") throw new Error("expected unavailable");
		expect(route.reason).toContain(MODEL_ROUTING.inference.keyVar);
	});

	it("is unavailable when the prefix names no model", () => {
		expect(routeOf(MODEL_ROUTING.inference.prefix, KEY).kind).toBe(
			"unavailable",
		);
		expect(routeOf(prefixed("   "), KEY).kind).toBe("unavailable");
	});

	it("never routes a bare id that merely contains the prefix", () => {
		expect(routeOf(`zai/${MODEL_ROUTING.inference.prefix}x`, KEY).kind).toBe(
			"gateway",
		);
	});
});
