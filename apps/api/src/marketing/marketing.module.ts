import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import {
	MarketingDrainController,
	MarketingPublicController,
} from "./marketing.controller";
import {
	MarketingCampaignsRouter,
	MarketingRouter,
	MarketingSegmentsRouter,
	MarketingTemplatesRouter,
} from "./marketing.router";
import { MarketingCampaignsService } from "./marketing-campaigns.service";
import { MarketingComposeService } from "./marketing-compose.service";
import { MarketingDrainService } from "./marketing-drain.service";
import { MarketingSegmentsService } from "./marketing-segments.service";
import { MarketingSettingsService } from "./marketing-settings.service";
import { MarketingTemplatesService } from "./marketing-templates.service";
import { ResendService } from "./resend.service";

@Module({
	imports: [TrpcModule],
	controllers: [MarketingDrainController, MarketingPublicController],
	providers: [
		ResendService,
		MarketingComposeService,
		MarketingSettingsService,
		MarketingSegmentsService,
		MarketingTemplatesService,
		MarketingCampaignsService,
		MarketingDrainService,
		MarketingRouter,
		MarketingCampaignsRouter,
		MarketingSegmentsRouter,
		MarketingTemplatesRouter,
	],
	exports: [MarketingComposeService, MarketingSettingsService],
})
export class MarketingModule {}
