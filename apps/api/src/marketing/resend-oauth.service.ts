import { createHash, randomBytes } from "node:crypto";
import { apiUrl } from "@crm/auth";
import type { Db } from "@crm/db";
import {
	RESEND_OAUTH,
	readMarketingSettings,
	writeMarketingSettings,
} from "@crm/db/marketing";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";

const registration = z.object({
	client_id: z.string().min(1),
	client_secret: z.string().min(1).optional(),
});

const grant = z.object({
	access_token: z.string().min(1),
	refresh_token: z.string().min(1).optional(),
	expires_in: z.number().int().positive().optional(),
});

const failure = z.object({
	error: z.string().optional(),
	error_description: z.string().optional(),
});

function base64Url(input: Buffer): string {
	return input.toString("base64url");
}

function why(body: unknown, fallback: string): string {
	const parsed = failure.safeParse(body);
	if (!parsed.success) return fallback;
	return parsed.data.error_description ?? parsed.data.error ?? fallback;
}

function errorCode(body: unknown): string {
	return failure.safeParse(body).data?.error ?? "";
}

const DEAD_GRANT = new Set([
	"invalid_grant",
	"invalid_client",
	"unauthorized_client",
]);

export type ResendOauthState = {
	connected: boolean;
	registered: boolean;
	expiresAt: Date | null;
};

@Injectable()
export class ResendOauthService {
	private readonly logger = new Logger(ResendOauthService.name);

	constructor(@InjectDatabase() private readonly db: Db) {}

	private redirectUri(): string {
		return `${apiUrl.replace(/\/+$/, "")}${RESEND_OAUTH.callbackPath}`;
	}

	private async post(
		url: string,
		body: Record<string, string>,
		headers: Record<string, string> = {},
	): Promise<{ status: number; body: unknown }> {
		const json = headers["Content-Type"] === "application/json";

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json",
				...headers,
			},
			body: json ? JSON.stringify(body) : new URLSearchParams(body).toString(),
		});

		return {
			status: response.status,
			body: await response.json().catch(() => null),
		};
	}

	private async register(): Promise<{
		clientId: string;
		secret: string | null;
	}> {
		const settings = await readMarketingSettings(this.db);

		if (settings.resendClientId) {
			return {
				clientId: settings.resendClientId,
				secret: settings.resendClientSecret,
			};
		}

		const response = await fetch(RESEND_OAUTH.register, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				client_name: RESEND_OAUTH.clientName,
				redirect_uris: [this.redirectUri()],
				grant_types: ["authorization_code", "refresh_token"],
				response_types: ["code"],
				token_endpoint_auth_method: "none",
				scope: RESEND_OAUTH.scope,
			}),
		});

		const body = await response.json().catch(() => null);

		if (!response.ok) {
			throw new BadRequestException(
				why(body, "Resend would not register this workspace."),
			);
		}

		const parsed = registration.safeParse(body);

		if (!parsed.success) {
			throw new BadRequestException(
				"Resend registered this workspace but returned no client id.",
			);
		}

		await writeMarketingSettings(this.db, {
			resendClientId: parsed.data.client_id,
			resendClientSecret: parsed.data.client_secret ?? null,
		});

		return {
			clientId: parsed.data.client_id,
			secret: parsed.data.client_secret ?? null,
		};
	}

	async start(): Promise<{ url: string }> {
		const redirectUri = this.redirectUri();
		const { clientId } = await this.register();

		const verifier = base64Url(randomBytes(32));
		const state = base64Url(randomBytes(16));
		const challenge = base64Url(createHash("sha256").update(verifier).digest());

		await writeMarketingSettings(this.db, {
			resendAuthState: state,
			resendAuthVerifier: verifier,
		});

		const query = new URLSearchParams({
			response_type: "code",
			client_id: clientId,
			redirect_uri: redirectUri,
			scope: RESEND_OAUTH.scope,
			state,
			code_challenge: challenge,
			code_challenge_method: "S256",
		});

		return { url: `${RESEND_OAUTH.authorize}?${query.toString()}` };
	}

	async finish(code: string, state: string): Promise<void> {
		const settings = await readMarketingSettings(this.db);

		if (!settings.resendAuthState || !settings.resendAuthVerifier) {
			throw new BadRequestException(
				"That sign-in was not started here. Try connecting again.",
			);
		}

		if (settings.resendAuthState !== state) {
			await this.clearPending();
			throw new BadRequestException(
				"That sign-in does not match the one we started. Try connecting again.",
			);
		}

		if (!settings.resendClientId) {
			await this.clearPending();
			throw new BadRequestException(
				"This workspace is not registered with Resend. Try connecting again.",
			);
		}

		const form: Record<string, string> = {
			grant_type: "authorization_code",
			code,
			redirect_uri: this.redirectUri(),
			client_id: settings.resendClientId,
			code_verifier: settings.resendAuthVerifier,
		};

		if (settings.resendClientSecret) {
			form.client_secret = settings.resendClientSecret;
		}

		const result = await this.post(RESEND_OAUTH.token, form);

		await this.clearPending();

		if (result.status >= 400) {
			throw new BadRequestException(
				why(result.body, "Resend would not complete the sign-in."),
			);
		}

		await this.store(result.body);
	}

	async accessToken(): Promise<string | null> {
		const settings = await readMarketingSettings(this.db);

		if (!settings.resendAccessToken && !settings.resendRefreshToken)
			return null;

		const expires = settings.resendTokenExpires?.getTime() ?? 0;
		const fresh = expires - RESEND_OAUTH.refreshSkewMs > Date.now();

		if (settings.resendAccessToken && fresh) return settings.resendAccessToken;
		if (!settings.resendRefreshToken) return settings.resendAccessToken;

		return this.refresh(
			settings.resendRefreshToken,
			settings.resendClientId,
			settings.resendClientSecret,
		);
	}

	private async refresh(
		refreshToken: string,
		clientId: string | null,
		clientSecret: string | null,
	): Promise<string | null> {
		if (!clientId) return null;

		const form: Record<string, string> = {
			grant_type: "refresh_token",
			refresh_token: refreshToken,
			client_id: clientId,
		};

		if (clientSecret) form.client_secret = clientSecret;

		const result = await this.post(RESEND_OAUTH.token, form);

		if (result.status >= 400) {
			const reason = why(result.body, "Unknown");
			const dead = DEAD_GRANT.has(errorCode(result.body));

			this.logger.warn({
				message: dead
					? "Resend has revoked the marketing sign-in, so it is now disconnected"
					: "Resend would not refresh the marketing token",
				reason,
			});

			if (dead) await this.forget();

			return null;
		}

		return this.store(result.body);
	}

	private async store(body: unknown): Promise<string | null> {
		const parsed = grant.safeParse(body);

		if (!parsed.success) {
			this.logger.warn({
				message: "Resend returned a token this app cannot read",
			});
			return null;
		}

		const expiresAt = parsed.data.expires_in
			? new Date(Date.now() + parsed.data.expires_in * 1000)
			: null;

		const patch = {
			resendAccessToken: parsed.data.access_token,
			resendTokenExpires: expiresAt,
			...(parsed.data.refresh_token
				? { resendRefreshToken: parsed.data.refresh_token }
				: {}),
		};

		try {
			await writeMarketingSettings(this.db, patch);
		} catch (first) {
			this.logger.warn({
				message: "Could not save the Resend token, trying once more",
				reason: first instanceof Error ? first.message : "Unknown",
			});

			try {
				await writeMarketingSettings(this.db, patch);
			} catch (second) {
				this.logger.error({
					message:
						"Could not save the Resend token. Marketing needs signing in to Resend again.",
					reason: second instanceof Error ? second.message : "Unknown",
					rotated: Boolean(parsed.data.refresh_token),
				});

				return parsed.data.access_token;
			}
		}

		return parsed.data.access_token;
	}

	private async forget(): Promise<void> {
		await writeMarketingSettings(this.db, {
			resendAccessToken: null,
			resendRefreshToken: null,
			resendTokenExpires: null,
		});
	}

	private async clearPending(): Promise<void> {
		await writeMarketingSettings(this.db, {
			resendAuthState: null,
			resendAuthVerifier: null,
		});
	}

	async state(): Promise<ResendOauthState> {
		const settings = await readMarketingSettings(this.db);

		return {
			connected: Boolean(
				settings.resendAccessToken || settings.resendRefreshToken,
			),
			registered: Boolean(settings.resendClientId),
			expiresAt: settings.resendTokenExpires,
		};
	}

	async disconnect(): Promise<void> {
		const settings = await readMarketingSettings(this.db);
		const token = settings.resendRefreshToken ?? settings.resendAccessToken;

		if (token && settings.resendClientId) {
			const form: Record<string, string> = {
				token,
				client_id: settings.resendClientId,
			};

			if (settings.resendClientSecret) {
				form.client_secret = settings.resendClientSecret;
			}

			await this.post(RESEND_OAUTH.revoke, form).catch(() => null);
		}

		await writeMarketingSettings(this.db, {
			resendAccessToken: null,
			resendRefreshToken: null,
			resendTokenExpires: null,
			resendAuthState: null,
			resendAuthVerifier: null,
		});
	}
}
