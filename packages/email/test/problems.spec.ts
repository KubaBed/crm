import { describe, expect, test } from "bun:test";
import { BLOCK_SHAPES, documentProblems } from "../src/document";

describe("telling an author what is wrong", () => {
	test("names the field when a text run is a bare string", () => {
		const problems = documentProblems({
			version: 1,
			blocks: [{ type: "text", text: "Hello" }],
		});

		expect(problems.length).toBeGreaterThan(0);
		expect(problems[0]?.path).toContain("blocks.0.text");
	});

	test("names the field when a button has no real url", () => {
		const problems = documentProblems({
			version: 1,
			blocks: [{ type: "button", label: "Read more", href: "https://" }],
		});

		expect(problems.some((problem) => problem.path.includes("href"))).toBe(
			true,
		);
	});

	test("says nothing about a document that parses", () => {
		expect(
			documentProblems({
				version: 1,
				blocks: [{ type: "text", text: [{ text: "Hello" }] }],
			}),
		).toEqual([]);
	});

	test("the shapes it hands back are themselves readable", () => {
		expect(BLOCK_SHAPES.inline).toContain("ARRAY of runs");
		expect(BLOCK_SHAPES.text).toContain('"text": [{ "text"');
	});
});
