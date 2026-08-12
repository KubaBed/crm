import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
import { db } from "@crm/db";
import {
	RESEND_OAUTH,
	readMarketingSettings,
	resendConnection,
	writeMarketingSettings,
} from "@crm/db/marketing";
import { ResendOauthService } from "../src/marketing/resend-oauth.service";

const oauth = new ResendOauthService(db);
const realFetch = globalThis.fetch;

type Call = { url: string; body: string };

let calls: Call[] = [];

function reply(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

function stub(handler: (url: string, body: string) => Response): void {
	globalThis.fetch = (async (
		input: Parameters<typeof fetch>[0],
		init?: Parameters<typeof fetch>[1],
	) => {
		const url = typeof input === "string" ? input : input.toString();
		const body = typeof init?.body === "string" ? init.body : "";
		calls.push({ url, body });
		return handler(url, body);
	}) as typeof fetch;
}

async function blank(): Promise<void> {
	await writeMarketingSettings(db, {
		resendApiKey: null,
		resendClientId: null,
		resendClientSecret: null,
		resendAccessToken: null,
		resendRefreshToken: null,
		resendTokenExpires: null,
		resendAuthState: null,
		resendAuthVerifier: null,
	});
}

beforeEach(async () => {
	calls = [];
	await blank();
});

afterEach(() => {
	globalThis.fetch = realFetch;
});

afterAll(async () => {
	await blank();
});

describe("connecting Resend with OAuth", () => {
	it("registers once, then reuses the client id", async () => {
		stub((url) =>
			url === RESEND_OAUTH.register
				? reply(200, { client_id: "client-1" })
				: reply(404, {}),
		);

		await oauth.start();
		await oauth.start();

		const registrations = calls.filter(
			(call) => call.url === RESEND_OAUTH.register,
		);

		expect(registrations).toHaveLength(1);
		expect((await readMarketingSettings(db)).resendClientId).toBe("client-1");
	});

	it("sends a PKCE challenge and keeps the verifier off the wire", async () => {
		stub(() => reply(200, { client_id: "client-1" }));

		const { url } = await oauth.start();
		const query = new URL(url).searchParams;
		const settings = await readMarketingSettings(db);

		expect(url.startsWith(RESEND_OAUTH.authorize)).toBe(true);
		expect(query.get("code_challenge_method")).toBe("S256");
		expect(query.get("state")).toBe(settings.resendAuthState);
		expect(query.get("scope")).toBe(RESEND_OAUTH.scope);
		expect(query.get("code_challenge")).not.toBe(settings.resendAuthVerifier);
		expect(url).not.toContain(settings.resendAuthVerifier ?? "never");
	});

	it("refuses a callback whose state does not match, and clears the attempt", async () => {
		stub(() => reply(200, { client_id: "client-1" }));
		await oauth.start();

		await expect(oauth.finish("code-1", "not-the-state")).rejects.toThrow(
			/does not match/,
		);

		const settings = await readMarketingSettings(db);
		expect(settings.resendAuthState).toBeNull();
		expect(settings.resendAuthVerifier).toBeNull();
	});

	it("exchanges the code with the verifier and stores the grant", async () => {
		stub((url) =>
			url === RESEND_OAUTH.register
				? reply(200, { client_id: "client-1" })
				: reply(200, {
						access_token: "access-1",
						refresh_token: "refresh-1",
						expires_in: 900,
					}),
		);

		await oauth.start();
		const started = await readMarketingSettings(db);
		await oauth.finish("code-1", started.resendAuthState ?? "");

		const exchange = calls.find((call) => call.url === RESEND_OAUTH.token);
		const sent = new URLSearchParams(exchange?.body ?? "");

		expect(sent.get("grant_type")).toBe("authorization_code");
		expect(sent.get("code")).toBe("code-1");
		expect(sent.get("code_verifier")).toBe(started.resendAuthVerifier);
		expect(sent.get("client_secret")).toBeNull();

		const settings = await readMarketingSettings(db);
		expect(settings.resendAccessToken).toBe("access-1");
		expect(settings.resendRefreshToken).toBe("refresh-1");
		expect(settings.resendAuthVerifier).toBeNull();
		expect(resendConnection(settings)).toBe("oauth");
	});

	it("hands Resend's own refusal back rather than a generic one", async () => {
		stub((url) =>
			url === RESEND_OAUTH.register
				? reply(200, { client_id: "client-1" })
				: reply(400, {
						error: "invalid_grant",
						error_description: "That code is spent.",
					}),
		);

		await oauth.start();
		const started = await readMarketingSettings(db);

		await expect(
			oauth.finish("code-1", started.resendAuthState ?? ""),
		).rejects.toThrow("That code is spent.");
	});
});

describe("keeping the Resend token fresh", () => {
	it("hands back a token that is still good without calling Resend", async () => {
		stub(() => reply(500, {}));

		await writeMarketingSettings(db, {
			resendClientId: "client-1",
			resendAccessToken: "access-1",
			resendRefreshToken: "refresh-1",
			resendTokenExpires: new Date(Date.now() + 10 * 60_000),
		});

		expect(await oauth.accessToken()).toBe("access-1");
		expect(calls).toHaveLength(0);
	});

	it("refreshes before the token expires, not after", async () => {
		stub(() => reply(200, { access_token: "access-2", expires_in: 900 }));

		await writeMarketingSettings(db, {
			resendClientId: "client-1",
			resendAccessToken: "access-1",
			resendRefreshToken: "refresh-1",
			resendTokenExpires: new Date(Date.now() + RESEND_OAUTH.refreshSkewMs / 2),
		});

		expect(await oauth.accessToken()).toBe("access-2");

		const sent = new URLSearchParams(calls[0]?.body ?? "");
		expect(sent.get("grant_type")).toBe("refresh_token");
		expect(sent.get("refresh_token")).toBe("refresh-1");
		expect((await readMarketingSettings(db)).resendAccessToken).toBe(
			"access-2",
		);
	});

	it("keeps the old refresh token when Resend does not rotate it", async () => {
		stub(() => reply(200, { access_token: "access-2", expires_in: 900 }));

		await writeMarketingSettings(db, {
			resendClientId: "client-1",
			resendAccessToken: "access-1",
			resendRefreshToken: "refresh-1",
			resendTokenExpires: new Date(Date.now() - 1),
		});

		await oauth.accessToken();

		expect((await readMarketingSettings(db)).resendRefreshToken).toBe(
			"refresh-1",
		);
	});

	it("disconnects when Resend says the grant is dead, so nothing claims to be connected", async () => {
		stub(() => reply(400, { error: "invalid_grant" }));

		await writeMarketingSettings(db, {
			resendClientId: "client-1",
			resendAccessToken: "access-1",
			resendRefreshToken: "refresh-1",
			resendTokenExpires: new Date(Date.now() - 1),
		});

		expect(await oauth.accessToken()).toBeNull();

		const settings = await readMarketingSettings(db);
		expect(settings.resendAccessToken).toBeNull();
		expect(settings.resendRefreshToken).toBeNull();
		expect(resendConnection(settings)).toBeNull();
	});

	it("keeps the tokens when Resend is merely down, so a blip is not a disconnect", async () => {
		stub(() => reply(503, { error: "server_error" }));

		await writeMarketingSettings(db, {
			resendClientId: "client-1",
			resendAccessToken: "access-1",
			resendRefreshToken: "refresh-1",
			resendTokenExpires: new Date(Date.now() - 1),
		});

		expect(await oauth.accessToken()).toBeNull();

		const settings = await readMarketingSettings(db);
		expect(settings.resendRefreshToken).toBe("refresh-1");
		expect(resendConnection(settings)).toBe("oauth");
	});

	it("falls back to the API key once a dead grant is cleared", async () => {
		stub(() => reply(400, { error: "invalid_grant" }));

		await writeMarketingSettings(db, {
			resendApiKey: "re_fallback",
			resendClientId: "client-1",
			resendAccessToken: "access-1",
			resendRefreshToken: "refresh-1",
			resendTokenExpires: new Date(Date.now() - 1),
		});

		await oauth.accessToken();

		expect(resendConnection(await readMarketingSettings(db))).toBe("key");
	});

	it("says nothing is connected when no token was ever stored", async () => {
		stub(() => reply(500, {}));

		expect(await oauth.accessToken()).toBeNull();
		expect(calls).toHaveLength(0);
	});
});

describe("disconnecting", () => {
	it("revokes at Resend and forgets every token", async () => {
		stub(() => reply(200, {}));

		await writeMarketingSettings(db, {
			resendClientId: "client-1",
			resendAccessToken: "access-1",
			resendRefreshToken: "refresh-1",
			resendTokenExpires: new Date(Date.now() + 10 * 60_000),
		});

		await oauth.disconnect();

		expect(calls[0]?.url).toBe(RESEND_OAUTH.revoke);
		expect(new URLSearchParams(calls[0]?.body ?? "").get("token")).toBe(
			"refresh-1",
		);

		const settings = await readMarketingSettings(db);
		expect(settings.resendAccessToken).toBeNull();
		expect(settings.resendRefreshToken).toBeNull();
		expect(resendConnection(settings)).toBeNull();
	});
});
