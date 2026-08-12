import { appUrl } from "@crm/auth";
import { Controller, Get, Logger, Query, Res } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import type { Response } from "express";
import { MarketingSettingsService } from "./marketing-settings.service";

function landing(outcome: "connected" | "failed", reason?: string): string {
	const query = new URLSearchParams({ resend: outcome });
	if (reason) query.set("reason", reason);
	return `${appUrl.replace(/\/+$/, "")}/?${query.toString()}`;
}

@Controller("api/marketing/resend")
export class ResendOauthController {
	private readonly logger = new Logger(ResendOauthController.name);

	constructor(private readonly settings: MarketingSettingsService) {}

	@AllowAnonymous()
	@Get("callback")
	async callback(
		@Query("code") code: string | undefined,
		@Query("state") state: string | undefined,
		@Query("error") error: string | undefined,
		@Query("error_description") description: string | undefined,
		@Res() response: Response,
	): Promise<void> {
		if (error) {
			response.redirect(landing("failed", description ?? error));
			return;
		}

		if (!code || !state) {
			response.redirect(
				landing("failed", "Resend sent no authorisation code."),
			);
			return;
		}

		try {
			await this.settings.connectFinish(code, state);
			response.redirect(landing("connected"));
		} catch (cause) {
			const reason =
				cause instanceof Error ? cause.message : "Resend refused the sign-in.";

			this.logger.warn({
				message: "Resend did not finish the marketing sign-in",
				reason,
			});

			response.redirect(landing("failed", reason));
		}
	}
}
