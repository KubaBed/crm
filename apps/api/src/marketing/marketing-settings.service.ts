import type { Db } from "@crm/db";
import {
	assertSendable,
	maskKey,
	readMarketingSettings,
	writeMarketingSettings,
} from "@crm/db/marketing";
import { BadRequestException, Injectable } from "@nestjs/common";
import { blankToNull, normalizeEmail } from "../crm/values";
import { InjectDatabase } from "../database/database.constants";
import type { DnsRecord } from "./resend.service";
import { ResendService } from "./resend.service";

export type MarketingStatus = { onboarded: boolean };

export type MarketingSettingsView = {
	connected: boolean;
	apiKeyMask: string | null;
	sendingDomain: string | null;
	fromName: string | null;
	fromAddress: string | null;
	replyTo: string | null;
	postalAddress: string | null;
	sendsPerMinute: number;
	quietStart: number | null;
	quietEnd: number | null;
	timeZone: string;
	dailyCap: number | null;
	onboardedAt: Date | null;
	sendable: { ok: boolean; missing: string[] };
};

@Injectable()
export class MarketingSettingsService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly resend: ResendService,
	) {}

	async status(): Promise<MarketingStatus> {
		const settings = await readMarketingSettings(this.db);
		return { onboarded: settings.onboardedAt !== null };
	}

	async settings(): Promise<MarketingSettingsView> {
		const [settings, sendable] = await Promise.all([
			readMarketingSettings(this.db),
			assertSendable(this.db),
		]);

		return {
			connected: settings.resendApiKey !== null,
			apiKeyMask: maskKey(settings.resendApiKey),
			sendingDomain: settings.sendingDomain,
			fromName: settings.fromName,
			fromAddress: settings.fromAddress,
			replyTo: settings.replyTo,
			postalAddress: settings.postalAddress,
			sendsPerMinute: settings.sendsPerMinute,
			quietStart: settings.quietStart,
			quietEnd: settings.quietEnd,
			timeZone: settings.timeZone,
			dailyCap: settings.dailyCap,
			onboardedAt: settings.onboardedAt,
			sendable: sendable.ok
				? { ok: true, missing: [] }
				: { ok: false, missing: sendable.missing },
		};
	}

	async saveKey(key: string): Promise<{ state: string; message?: string }> {
		const trimmed = blankToNull(key);
		if (!trimmed) throw new BadRequestException("Paste your Resend API key.");

		const check = await this.resend.verifyKey(trimmed);

		if (check.state === "invalid") {
			throw new BadRequestException(
				check.message ?? "Resend does not recognise that key.",
			);
		}

		await writeMarketingSettings(this.db, { resendApiKey: trimmed });

		return { state: check.state, message: check.message };
	}

	async disconnect(): Promise<void> {
		await writeMarketingSettings(this.db, {
			resendApiKey: null,
			resendDomainId: null,
			sendingDomain: null,
		});
	}

	async saveIdentity(input: {
		fromName: string;
		fromAddress: string;
		replyTo?: string | null;
		postalAddress: string;
	}): Promise<void> {
		const fromAddress = normalizeEmail(input.fromAddress);
		if (!fromAddress)
			throw new BadRequestException("A from address is required.");

		const postalAddress = blankToNull(input.postalAddress);
		if (!postalAddress) {
			throw new BadRequestException(
				"A postal address is required by law on marketing email.",
			);
		}

		const settings = await readMarketingSettings(this.db);
		const domain = settings.sendingDomain;

		if (domain && !fromAddress.endsWith(`@${domain}`)) {
			throw new BadRequestException(
				`The from address must sit on ${domain}, or Resend will refuse the send.`,
			);
		}

		await writeMarketingSettings(this.db, {
			fromName: blankToNull(input.fromName),
			fromAddress,
			replyTo: input.replyTo ? normalizeEmail(input.replyTo) : null,
			postalAddress,
		});
	}

	async saveSending(input: {
		sendsPerMinute: number;
		dailyCap: number | null;
		quietStart: number | null;
		quietEnd: number | null;
		timeZone: string;
	}): Promise<void> {
		await writeMarketingSettings(this.db, {
			sendsPerMinute: input.sendsPerMinute,
			dailyCap: input.dailyCap,
			quietStart: input.quietStart,
			quietEnd: input.quietEnd,
			timeZone: input.timeZone,
		});
	}

	async domain(): Promise<{
		name: string | null;
		status: string;
		records: DnsRecord[];
		openTracking: boolean;
		clickTracking: boolean;
	}> {
		const settings = await readMarketingSettings(this.db);

		if (!settings.resendDomainId) {
			return {
				name: settings.sendingDomain,
				status: "not_started",
				records: [],
				openTracking: false,
				clickTracking: false,
			};
		}

		const state = await this.resend.readDomain(settings.resendDomainId);

		if (!state) {
			return {
				name: settings.sendingDomain,
				status: "unknown",
				records: [],
				openTracking: false,
				clickTracking: false,
			};
		}

		return {
			name: state.name,
			status: state.status,
			records: state.records,
			openTracking: state.openTracking,
			clickTracking: state.clickTracking,
		};
	}

	async createDomain(
		name: string,
	): Promise<{ records: DnsRecord[]; status: string }> {
		const host = blankToNull(name)?.toLowerCase();
		if (!host) throw new BadRequestException("Enter a subdomain to send from.");

		if (host.split(".").length < 3) {
			throw new BadRequestException(
				`Use a subdomain such as send.${host}, so the records cannot collide with the MX that carries your own mail.`,
			);
		}

		const created = await this.resend.createDomain(host);
		if (!created) {
			throw new BadRequestException("Resend would not create that domain.");
		}

		await writeMarketingSettings(this.db, {
			resendDomainId: created.id,
			sendingDomain: created.name,
		});

		return { records: created.records, status: created.status };
	}

	async verifyDomain(): Promise<{ status: string }> {
		const settings = await readMarketingSettings(this.db);
		if (!settings.resendDomainId) {
			throw new BadRequestException("There is no sending domain to check yet.");
		}

		await this.resend.verifyDomain(settings.resendDomainId);
		const state = await this.resend.readDomain(settings.resendDomainId);

		return { status: state?.status ?? "unknown" };
	}

	async markOnboarded(): Promise<void> {
		await writeMarketingSettings(this.db, { onboardedAt: new Date() });
	}
}
