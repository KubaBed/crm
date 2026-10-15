import { timingSafeEqual } from "node:crypto";
import {
	Controller,
	ForbiddenException,
	Headers,
	Logger,
	Post,
	ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	ApiForbiddenResponse,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiServiceUnavailableResponse,
	ApiTags,
} from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import type { EnvironmentVariables } from "../config/env.validation";
import { OffersService } from "./offers.service";

@ApiTags("Internal — Cron")
@ApiHeader({
	name: "authorization",
	description: "`Bearer <CRON_SECRET>`",
	required: true,
})
@ApiForbiddenResponse({ description: "CRON_SECRET did not match." })
@ApiServiceUnavailableResponse({ description: "CRON_SECRET is not set." })
@Controller("internal/offers")
export class OffersController {
	private readonly logger = new Logger(OffersController.name);
	private readonly secret: string | undefined;

	constructor(
		private readonly offers: OffersService,
		config: ConfigService<EnvironmentVariables, true>,
	) {
		this.secret = config.get("CRON_SECRET", { infer: true });
	}

	@Post("first-opens")
	@AllowAnonymous()
	@ApiOperation({
		summary: "Log the first open of each offer on its deal's timeline",
	})
	@ApiOkResponse({ description: "How many first opens were logged." })
	async firstOpens(@Headers("authorization") authorization?: string) {
		if (!this.secret) {
			this.logger.error({
				message: "CRON_SECRET is not set, refusing to run the offers sweep.",
			});
			throw new ServiceUnavailableException("Sweep is not configured.");
		}

		if (!sameSecret(authorization ?? "", `Bearer ${this.secret}`)) {
			throw new ForbiddenException();
		}

		return this.offers.logFirstOpens();
	}
}

function sameSecret(given: string, expected: string): boolean {
	const a = Buffer.from(given);
	const b = Buffer.from(expected);
	return a.length === b.length && timingSafeEqual(a, b);
}
