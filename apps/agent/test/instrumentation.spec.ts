import { afterAll, describe, expect, it } from "bun:test";

const REAL_KEY = process.env.INFERENCE_API_KEY;
const REAL_RECORD = process.env.INFERENCE_RECORD_CONTENT;

afterAll(() => {
	if (REAL_KEY === undefined) delete process.env.INFERENCE_API_KEY;
	else process.env.INFERENCE_API_KEY = REAL_KEY;
	if (REAL_RECORD === undefined) delete process.env.INFERENCE_RECORD_CONTENT;
	else process.env.INFERENCE_RECORD_CONTENT = REAL_RECORD;
});

describe("the instrumentation handed to the tracing SDK", () => {
	it("withholds content when the install asks it to", async () => {
		process.env.INFERENCE_API_KEY = "test-key";
		process.env.INFERENCE_RECORD_CONTENT = "0";

		const { default: config } = await import("../agent/instrumentation");

		expect(config.recordInputs).toBe(false);
		expect(config.recordOutputs).toBe(false);
	});
});
