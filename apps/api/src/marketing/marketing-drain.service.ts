import type { Db } from "@crm/db";
import {
	advanceDue,
	archiveDrained,
	type ClaimedSend,
	claimDueSends,
	finishCampaigns,
	linkReplies,
	MARKETING,
	pauseUnhealthy,
	readMarketingSettings,
	settle,
	startDueCampaigns,
	sweepEntries,
	sweepExits,
} from "@crm/db/marketing";
import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { MarketingComposeService } from "./marketing-compose.service";
import { ResendService } from "./resend.service";

@Injectable()
export class MarketingDrainService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(MarketingDrainService.name);
	private timer: ReturnType<typeof setInterval> | null = null;
	private running = false;
	private lastReplyScan = new Date(Date.now() - 10 * 60_000);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly resend: ResendService,
		private readonly compose: MarketingComposeService,
	) {}

	onModuleInit(): void {
		if (process.env.NODE_ENV === "test") return;

		this.timer = setInterval(() => {
			void this.tick().catch((error: unknown) => {
				this.logger.error(
					{ message: "The marketing drain failed" },
					error instanceof Error ? error.stack : undefined,
				);
			});
		}, MARKETING.drain.tickMs);

		this.timer.unref?.();
	}

	onModuleDestroy(): void {
		if (this.timer) clearInterval(this.timer);
	}

	async tick(): Promise<{ sent: number; failed: number; advanced: number }> {
		if (this.running) return { sent: 0, failed: 0, advanced: 0 };
		this.running = true;

		try {
			const since = this.lastReplyScan;
			this.lastReplyScan = new Date();
			await linkReplies(this.db, since);

			const live = await this.db.marketingCampaign.findMany({
				where: { kind: "DRIP", status: { in: ["ACTIVE", "DRAINING"] } },
				select: { id: true, status: true },
			});

			for (const campaign of live) {
				await sweepExits(this.db, campaign.id);
				if (campaign.status === "ACTIVE")
					await sweepEntries(this.db, campaign.id);
			}

			const advanced = await advanceDue(this.db);
			await archiveDrained(this.db);
			await startDueCampaigns(this.db);

			const { sent, failed } = await this.drainSends();

			const paused = await pauseUnhealthy(this.db);
			for (const campaignId of paused) {
				this.logger.warn({
					message: "A campaign paused itself on deliverability",
					campaignId,
				});
			}

			await finishCampaigns(this.db);

			return { sent, failed, advanced };
		} finally {
			this.running = false;
		}
	}

	private async drainSends(): Promise<{ sent: number; failed: number }> {
		const settings = await readMarketingSettings(this.db);
		if (!settings.resendApiKey) return { sent: 0, failed: 0 };

		const perTick = Math.max(
			1,
			Math.round((settings.sendsPerMinute * MARKETING.drain.tickMs) / 60_000),
		);

		const limit: number = Math.min(perTick, MARKETING.drain.claimLimit);
		const claimed = await claimDueSends(this.db, limit);
		if (claimed.length === 0) return { sent: 0, failed: 0 };

		let sent = 0;
		let failed = 0;

		const batchable: {
			send: ClaimedSend;
			body: NonNullable<
				Awaited<ReturnType<MarketingComposeService["compose"]>>
			>;
		}[] = [];

		for (const send of claimed) {
			const context = await this.compose.contextFor(send.contactId);
			const body = await this.compose.compose({
				document: send.document,
				subject: send.subject ?? "",
				token: send.token,
				context,
			});

			if (!body) {
				await settle(this.db, send.id, {
					ok: false,
					error:
						"This install cannot build the unsubscribe link. Set APP_URL and a postal address.",
					retry: false,
				});
				failed += 1;
				continue;
			}

			if (send.hasAttachments) {
				const outcome = await this.resend.sendOne({
					to: send.address,
					subject: body.subject,
					html: body.html,
					text: body.text,
					replyTo: send.replyTo,
					headers: body.headers,
					idempotencyKey: `send/${send.id}`,
				});

				await settle(this.db, send.id, outcome);
				if (outcome.ok) sent += 1;
				else failed += 1;
				continue;
			}

			batchable.push({ send, body });
		}

		for (
			let index = 0;
			index < batchable.length;
			index += MARKETING.send.batchSize
		) {
			const slice = batchable.slice(index, index + MARKETING.send.batchSize);

			const outcomes = await this.resend.sendBatch(
				slice.map(({ send, body }) => ({
					sendId: send.id,
					to: send.address,
					subject: body.subject,
					html: body.html,
					text: body.text,
					replyTo: send.replyTo,
					headers: body.headers,
				})),
			);

			for (const { send } of slice) {
				const outcome = outcomes.get(send.id) ?? {
					ok: false as const,
					error: "Resend did not answer for this message.",
					retry: true,
				};

				await settle(this.db, send.id, outcome);
				if (outcome.ok) sent += 1;
				else failed += 1;
			}
		}

		return { sent, failed };
	}
}
