import type { Db } from "@crm/db";
import { readMarketingSettings } from "@crm/db/marketing";
import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { InjectDatabase } from "../database/database.constants";

export type SendOne = {
	to: string;
	subject: string;
	html: string;
	text: string;
	replyTo?: string | null;
	headers?: Record<string, string>;
	idempotencyKey?: string;
	attachments?: { filename: string; path: string }[];
};

export type SendOutcome =
	| { ok: true; providerId: string }
	| { ok: false; error: string; retry: boolean };

export type DnsRecord = {
	record: string;
	name: string;
	type: string;
	value: string;
	ttl?: string;
	priority?: number;
	status?: string;
};

export type DomainState = {
	id: string;
	name: string;
	status: string;
	records: DnsRecord[];
	openTracking: boolean;
	clickTracking: boolean;
};

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

@Injectable()
export class ResendService {
	private readonly logger = new Logger(ResendService.name);

	constructor(@InjectDatabase() private readonly db: Db) {}

	async client(): Promise<Resend | null> {
		const settings = await readMarketingSettings(this.db);
		return settings.resendApiKey ? new Resend(settings.resendApiKey) : null;
	}

	private clientFor(key: string): Resend {
		return new Resend(key);
	}

	async verifyKey(
		key: string,
	): Promise<{ state: "valid" | "invalid" | "unknown"; message?: string }> {
		try {
			const result = await this.clientFor(key).domains.list();

			if (result.error) {
				const name = result.error.name ?? "";
				if (
					name.includes("validation") ||
					name.includes("restricted") ||
					name.includes("missing_api_key") ||
					result.error.message?.toLowerCase().includes("api key is invalid")
				) {
					return { state: "invalid", message: result.error.message };
				}
				return { state: "unknown", message: result.error.message };
			}

			return { state: "valid" };
		} catch (error) {
			return {
				state: "unknown",
				message:
					error instanceof Error ? error.message : "Resend did not answer.",
			};
		}
	}

	async createDomain(name: string): Promise<DomainState | null> {
		const client = await this.client();
		if (!client) return null;

		const result = await client.domains.create({ name });

		if (result.error || !result.data) {
			this.logger.warn({
				message: "Resend refused to create the sending domain",
				reason: result.error?.message,
			});
			return null;
		}

		return {
			id: result.data.id,
			name: result.data.name,
			status: result.data.status,
			records: (result.data.records ?? []) as DnsRecord[],
			openTracking: false,
			clickTracking: false,
		};
	}

	async readDomain(id: string): Promise<DomainState | null> {
		const client = await this.client();
		if (!client) return null;

		const result = await client.domains.get(id);
		if (result.error || !result.data) return null;

		const data = result.data as unknown as {
			id: string;
			name: string;
			status: string;
			records?: DnsRecord[];
			open_tracking?: boolean;
			click_tracking?: boolean;
		};

		return {
			id: data.id,
			name: data.name,
			status: data.status,
			records: data.records ?? [],
			openTracking: data.open_tracking ?? false,
			clickTracking: data.click_tracking ?? false,
		};
	}

	async verifyDomain(id: string): Promise<boolean> {
		const client = await this.client();
		if (!client) return false;

		const result = await client.domains.verify(id);
		return !result.error;
	}

	async sendOne(input: SendOne): Promise<SendOutcome> {
		const client = await this.client();
		if (!client) {
			return { ok: false, error: "Resend is not connected.", retry: false };
		}

		const settings = await readMarketingSettings(this.db);
		const from = settings.fromName
			? `${settings.fromName} <${settings.fromAddress}>`
			: (settings.fromAddress ?? "");

		if (!from) {
			return {
				ok: false,
				error: "No from address is configured.",
				retry: false,
			};
		}

		try {
			const result = await client.emails.send(
				{
					from,
					to: [input.to],
					subject: input.subject,
					html: input.html,
					text: input.text,
					replyTo: input.replyTo ?? settings.replyTo ?? undefined,
					headers: input.headers,
					attachments: input.attachments,
				},
				input.idempotencyKey
					? { idempotencyKey: input.idempotencyKey }
					: undefined,
			);

			if (result.error || !result.data) {
				const status = (result.error as { statusCode?: number } | null)
					?.statusCode;
				return {
					ok: false,
					error: result.error?.message ?? "Resend refused the message.",
					retry: status ? RETRYABLE.has(status) : true,
				};
			}

			return { ok: true, providerId: result.data.id };
		} catch (error) {
			return {
				ok: false,
				error:
					error instanceof Error ? error.message : "Resend did not answer.",
				retry: true,
			};
		}
	}

	async sendBatch(
		messages: (SendOne & { sendId: string })[],
	): Promise<Map<string, SendOutcome>> {
		const results = new Map<string, SendOutcome>();
		const client = await this.client();

		if (!client) {
			for (const message of messages) {
				results.set(message.sendId, {
					ok: false,
					error: "Resend is not connected.",
					retry: false,
				});
			}
			return results;
		}

		const settings = await readMarketingSettings(this.db);
		const from = settings.fromName
			? `${settings.fromName} <${settings.fromAddress}>`
			: (settings.fromAddress ?? "");

		try {
			const result = await client.batch.send(
				messages.map((message) => ({
					from,
					to: [message.to],
					subject: message.subject,
					html: message.html,
					text: message.text,
					replyTo: message.replyTo ?? settings.replyTo ?? undefined,
					headers: message.headers,
				})),
			);

			if (result.error || !result.data) {
				for (const message of messages) {
					results.set(message.sendId, {
						ok: false,
						error: result.error?.message ?? "Resend refused the batch.",
						retry: true,
					});
				}
				return results;
			}

			result.data.data.forEach((row, index) => {
				const message = messages[index];
				if (message)
					results.set(message.sendId, { ok: true, providerId: row.id });
			});

			for (const message of messages) {
				if (!results.has(message.sendId)) {
					results.set(message.sendId, {
						ok: false,
						error: "Resend returned no id for this message.",
						retry: true,
					});
				}
			}

			return results;
		} catch (error) {
			const reason =
				error instanceof Error ? error.message : "Resend did not answer.";
			for (const message of messages) {
				results.set(message.sendId, { ok: false, error: reason, retry: true });
			}
			return results;
		}
	}
}
