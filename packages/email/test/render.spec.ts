import { describe, expect, test } from "bun:test";
import { lintEmail } from "../src/lint";
import { renderEmail } from "../src/render";

const shell = {
	workspaceName: "Comp AI",
	postalAddress: "Comp AI · 2261 Market Street, San Francisco",
	unsubscribeUrl: "https://app.example.com/u/token",
};

const document = {
	version: 1,
	blocks: [
		{ type: "heading", level: 1, text: [{ text: "Hello" }] },
		{ type: "text", text: [{ text: "Hi {{contact.firstName|there}}." }] },
	],
};

describe("renderEmail", () => {
	test("renders the same twice", async () => {
		const first = await renderEmail({ document, shell });
		const second = await renderEmail({ document, shell });
		expect(first.html).toBe(second.html);
	});

	test("always appends the unsubscribe link and the postal address", async () => {
		const { html, text } = await renderEmail({ document, shell });
		expect(html).toContain("https://app.example.com/u/token");
		expect(text).toContain("2261 Market Street");
	});

	test("resolves merge tags before the element tree", async () => {
		const { html } = await renderEmail({
			document,
			shell,
			context: { contact: { firstName: "Dana" } },
		});
		expect(html).toContain("Hi Dana.");
		expect(html).not.toContain("{{");
	});

	test("falls back when the field is empty", async () => {
		const { html } = await renderEmail({ document, shell, context: {} });
		expect(html).toContain("Hi there.");
	});
});

describe("lintEmail", () => {
	test("refuses an unknown merge tag", () => {
		const findings = lintEmail({
			document: {
				version: 1,
				blocks: [{ type: "text", text: [{ text: "{{nope}}" }] }],
			},
			subject: "x",
			preheader: "y",
		});
		expect(
			findings.some(
				(f) => f.code === "unknown-merge-tag" && f.level === "error",
			),
		).toBe(true);
	});

	test("warns when a nullable tag has no fallback", () => {
		const findings = lintEmail({
			document: {
				version: 1,
				blocks: [
					{ type: "text", text: [{ text: "Hi {{contact.firstName}}" }] },
				],
			},
			subject: "x",
			preheader: "y",
		});
		expect(findings.some((f) => f.code === "merge-tag-no-fallback")).toBe(true);
	});

	test("refuses an image with no alt text", () => {
		const findings = lintEmail({
			document: {
				version: 1,
				blocks: [{ type: "image", src: "https://x.test/a.png", alt: "" }],
			},
			subject: "x",
			preheader: "y",
		});
		expect(
			findings.some((f) => f.code === "image-no-alt" && f.level === "error"),
		).toBe(true);
	});

	test("refuses SVG", () => {
		const findings = lintEmail({
			document: {
				version: 1,
				blocks: [{ type: "image", src: "https://x.test/a.svg", alt: "Logo" }],
			},
			subject: "x",
			preheader: "y",
		});
		expect(
			findings.some((f) => f.code === "image-format" && f.level === "error"),
		).toBe(true);
	});

	test("refuses an empty subject and warns past the mobile cut", () => {
		expect(
			lintEmail({ document, subject: "", preheader: "y" }).some(
				(f) => f.code === "subject-empty",
			),
		).toBe(true);
		expect(
			lintEmail({ document, subject: "x".repeat(60), preheader: "y" }).some(
				(f) => f.code === "subject-mobile-cut",
			),
		).toBe(true);
	});
});
