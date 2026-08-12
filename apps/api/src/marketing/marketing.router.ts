import { Inject } from "@nestjs/common";
import {
	Ctx,
	Input,
	Mutation,
	Query,
	Router,
	UseMiddlewares,
} from "nestjs-trpc";
import type { z } from "zod";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { listInput } from "../trpc/list-input";
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import {
	archiveCampaignInput,
	campaignListInput,
	campaignPageInput,
	createCampaignInput,
	createDomainInput,
	createSegmentInput,
	createTemplateInput,
	enrolInput,
	idInput,
	memberInput,
	pauseInput,
	previewSegmentInput,
	previewTemplateInput,
	resumeInput,
	saveIdentityInput,
	saveKeyInput,
	saveSendingInput,
	scheduleInput,
	sendDirectInput,
	updateCampaignInput,
	updateNodeInput,
	updateSegmentInput,
	updateTemplateInput,
	winnerInput,
	writeGraphInput,
} from "./marketing.contracts";
import { MarketingCampaignsService } from "./marketing-campaigns.service";
import { MarketingSegmentsService } from "./marketing-segments.service";
import { MarketingSettingsService } from "./marketing-settings.service";
import { MarketingTemplatesService } from "./marketing-templates.service";

@Router({ alias: "marketing" })
@UseMiddlewares(AuthMiddleware)
export class MarketingRouter {
	constructor(
		@Inject(MarketingSettingsService)
		private readonly settingsService: MarketingSettingsService,
	) {}

	@Query()
	async status() {
		return this.settingsService.status();
	}

	@Query()
	async settings() {
		return this.settingsService.settings();
	}

	@Query()
	async domain() {
		return this.settingsService.domain();
	}

	@Mutation({ input: saveKeyInput })
	async saveKey(@Input() input: z.infer<typeof saveKeyInput>) {
		return this.settingsService.saveKey(input.key);
	}

	@Mutation()
	async disconnect() {
		return this.settingsService.disconnect();
	}

	@Mutation({ input: saveIdentityInput })
	async saveIdentity(@Input() input: z.infer<typeof saveIdentityInput>) {
		return this.settingsService.saveIdentity(input);
	}

	@Mutation({ input: saveSendingInput })
	async saveSending(@Input() input: z.infer<typeof saveSendingInput>) {
		return this.settingsService.saveSending({
			sendsPerMinute: input.sendsPerMinute,
			dailyCap: input.dailyCap ?? null,
			quietStart: input.quietStart ?? null,
			quietEnd: input.quietEnd ?? null,
			timeZone: input.timeZone,
		});
	}

	@Mutation({ input: createDomainInput })
	async createDomain(@Input() input: z.infer<typeof createDomainInput>) {
		return this.settingsService.createDomain(input.name);
	}

	@Mutation()
	async verifyDomain() {
		return this.settingsService.verifyDomain();
	}

	@Mutation()
	async markOnboarded() {
		return this.settingsService.markOnboarded();
	}
}

@Router({ alias: "marketingCampaigns" })
@UseMiddlewares(AuthMiddleware)
export class MarketingCampaignsRouter {
	constructor(
		@Inject(MarketingCampaignsService)
		private readonly campaigns: MarketingCampaignsService,
	) {}

	@Query({ input: campaignListInput })
	async list(@Input() input: z.infer<typeof campaignListInput>) {
		return this.campaigns.list(input);
	}

	@Query({ input: idInput })
	async byId(@Input() input: z.infer<typeof idInput>) {
		return this.campaigns.byId(input.id);
	}

	@Query({ input: idInput })
	async nodeStats(@Input() input: z.infer<typeof idInput>) {
		return this.campaigns.nodeStats(input.id);
	}

	@Query({ input: campaignPageInput })
	async recipients(@Input() input: z.infer<typeof campaignPageInput>) {
		return this.campaigns.recipients(input);
	}

	@Query({ input: campaignPageInput })
	async enrolments(@Input() input: z.infer<typeof campaignPageInput>) {
		return this.campaigns.enrolments(input);
	}

	@Mutation({ input: createCampaignInput })
	async create(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof createCampaignInput>,
	) {
		return this.campaigns.create({ ...input, userId: ctx.user.id });
	}

	@Mutation({ input: updateCampaignInput })
	async update(@Input() input: z.infer<typeof updateCampaignInput>) {
		return this.campaigns.update(input);
	}

	@Mutation({ input: writeGraphInput })
	async writeGraph(@Input() input: z.infer<typeof writeGraphInput>) {
		return this.campaigns.writeGraph({
			campaignId: input.campaignId,
			nodes: input.nodes.map((node) => ({
				...node,
				x: node.x ?? undefined,
				y: node.y ?? undefined,
			})),
			edges: input.edges.map((edge) => ({ ...edge, id: edge.id ?? undefined })),
		});
	}

	@Mutation({ input: updateNodeInput })
	async updateNode(@Input() input: z.infer<typeof updateNodeInput>) {
		return this.campaigns.updateNode(input);
	}

	@Mutation({ input: scheduleInput })
	async schedule(@Input() input: z.infer<typeof scheduleInput>) {
		return this.campaigns.schedule({ id: input.id, at: input.at ?? null });
	}

	@Mutation({ input: idInput })
	async activate(@Input() input: z.infer<typeof idInput>) {
		return this.campaigns.activate(input.id);
	}

	@Mutation({ input: pauseInput })
	async pause(@Input() input: z.infer<typeof pauseInput>) {
		return this.campaigns.pause(input.id, input.reason);
	}

	@Mutation({ input: resumeInput })
	async resume(@Input() input: z.infer<typeof resumeInput>) {
		return this.campaigns.resume(input.id, input.clocks);
	}

	@Mutation({ input: idInput })
	async drain(@Input() input: z.infer<typeof idInput>) {
		return this.campaigns.drain(input.id);
	}

	@Mutation({ input: archiveCampaignInput })
	async archive(@Input() input: z.infer<typeof archiveCampaignInput>) {
		return this.campaigns.archive(input.id, input.mode);
	}

	@Mutation({ input: idInput })
	async cancel(@Input() input: z.infer<typeof idInput>) {
		return this.campaigns.cancel(input.id);
	}

	@Mutation({ input: enrolInput })
	async enrol(@Input() input: z.infer<typeof enrolInput>) {
		return this.campaigns.enrol(input.campaignId, input.contactId);
	}

	@Mutation({ input: idInput })
	async unenrol(@Input() input: z.infer<typeof idInput>) {
		return this.campaigns.unenrol(input.id);
	}

	@Mutation({ input: winnerInput })
	async declareWinner(@Input() input: z.infer<typeof winnerInput>) {
		return this.campaigns.declareWinner(input);
	}

	@Mutation({ input: sendDirectInput })
	async sendDirect(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof sendDirectInput>,
	) {
		return this.campaigns.sendDirect({ ...input, userId: ctx.user.id });
	}
}

@Router({ alias: "marketingSegments" })
@UseMiddlewares(AuthMiddleware)
export class MarketingSegmentsRouter {
	constructor(
		@Inject(MarketingSegmentsService)
		private readonly segments: MarketingSegmentsService,
	) {}

	@Query({ input: listInput })
	async list(@Input() input: z.infer<typeof listInput>) {
		return this.segments.list(input);
	}

	@Query({ input: idInput })
	async byId(@Input() input: z.infer<typeof idInput>) {
		return this.segments.byId(input.id);
	}

	@Query()
	async options() {
		return this.segments.options();
	}

	@Query({ input: previewSegmentInput })
	async preview(@Input() input: z.infer<typeof previewSegmentInput>) {
		return this.segments.preview(input.definition);
	}

	@Mutation({ input: createSegmentInput })
	async create(@Input() input: z.infer<typeof createSegmentInput>) {
		return this.segments.create(input);
	}

	@Mutation({ input: updateSegmentInput })
	async update(@Input() input: z.infer<typeof updateSegmentInput>) {
		return this.segments.update(input);
	}

	@Mutation({ input: idInput })
	async archive(@Input() input: z.infer<typeof idInput>) {
		return this.segments.archive(input.id);
	}

	@Mutation({ input: memberInput })
	async addMember(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof memberInput>,
	) {
		return this.segments.addMember(
			input.segmentId,
			input.contactId,
			ctx.user.id,
		);
	}

	@Mutation({ input: memberInput })
	async excludeMember(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof memberInput>,
	) {
		return this.segments.excludeMember(
			input.segmentId,
			input.contactId,
			ctx.user.id,
		);
	}

	@Mutation({ input: memberInput })
	async removeMember(@Input() input: z.infer<typeof memberInput>) {
		return this.segments.removeMember(input.segmentId, input.contactId);
	}
}

@Router({ alias: "marketingTemplates" })
@UseMiddlewares(AuthMiddleware)
export class MarketingTemplatesRouter {
	constructor(
		@Inject(MarketingTemplatesService)
		private readonly templates: MarketingTemplatesService,
	) {}

	@Query({ input: listInput })
	async list(@Input() input: z.infer<typeof listInput>) {
		return this.templates.list(input);
	}

	@Query({ input: idInput })
	async byId(@Input() input: z.infer<typeof idInput>) {
		return this.templates.byId(input.id);
	}

	@Query()
	async options() {
		return this.templates.options();
	}

	@Query()
	async partials() {
		return this.templates.partials();
	}

	@Query({ input: previewTemplateInput })
	async preview(@Input() input: z.infer<typeof previewTemplateInput>) {
		return this.templates.preview(input);
	}

	@Mutation({ input: createTemplateInput })
	async create(@Input() input: z.infer<typeof createTemplateInput>) {
		return this.templates.create(input);
	}

	@Mutation({ input: updateTemplateInput })
	async update(@Input() input: z.infer<typeof updateTemplateInput>) {
		return this.templates.update(input);
	}

	@Mutation({ input: idInput })
	async duplicate(@Input() input: z.infer<typeof idInput>) {
		return this.templates.duplicate(input.id);
	}

	@Mutation({ input: idInput })
	async archive(@Input() input: z.infer<typeof idInput>) {
		return this.templates.archive(input.id);
	}
}
