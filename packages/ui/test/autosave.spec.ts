import { describe, expect, test } from "bun:test";

function stableKey(value: unknown): string {
	return JSON.stringify(value ?? null);
}

describe("what autosave decides to write", () => {
	test("a redrawn object with the same contents is not a change", () => {
		const first = { subject: "Hi", blocks: [{ type: "text" }] };
		const second = { subject: "Hi", blocks: [{ type: "text" }] };

		expect(first === second).toBe(false);
		expect(stableKey(first)).toBe(stableKey(second));
	});

	test("an edited field is a change", () => {
		expect(stableKey({ subject: "Hi" })).not.toBe(stableKey({ subject: "Ho" }));
	});

	test("an added block is a change", () => {
		expect(stableKey({ blocks: [] })).not.toBe(
			stableKey({ blocks: [{ type: "divider" }] }),
		);
	});

	test("undefined and null settle to the same key", () => {
		expect(stableKey(undefined)).toBe(stableKey(null));
	});
});
