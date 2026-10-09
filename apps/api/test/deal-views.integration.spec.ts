import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { ActivityType, DealStage, db } from "@crm/db";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import { OUTREACH_FIELD_KEY } from "../src/deals/deal-views";
import type { DealListInput } from "../src/deals/deals.contracts";
import { DealsService } from "../src/deals/deals.service";
import { FieldsService } from "../src/fields/fields.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";

const suffix = process.env.TEST_RUN_ID ?? "deal-views-spec";
const userId = `user-${suffix}`;
const domain = `views-${suffix}.test`;

const agent = {
	withCrmEvents: withDiscardedCrmEvents,
} as unknown as AgentTriggerService;

const deals = new DealsService(
	db,
	agent,
	new ActivityStampService(db),
	new ConversionService(db),
	new FieldsService(db, {
		fieldBackfill: async () => undefined,
		fieldBackfillRecords: async () => undefined,
	} as never),
);

let companyId: string;
let createdFieldId: string | null = null;
const ids = {
	outreach: "",
	talking: "",
	offer: "",
	won: "",
};

function listInput(status: string): DealListInput {
	return {
		q: suffix,
		page: 1,
		pageSize: 25,
		sort: "progress",
		dir: "desc",
		status,
		owner: [userId],
		stage: [],
		closing: [],
		fields: {},
		archived: false,
	};
}

async function create(name: string, stage: DealStage): Promise<string> {
	const deal = await deals.create({
		name: `${name} ${suffix}`,
		companyId,
		ownerId: userId,
		stage,
	});
	return deal.id;
}

beforeAll(async () => {
	await db.user.upsert({
		where: { id: userId },
		create: {
			id: userId,
			name: "View Tester",
			email: `views@${domain}`,
			emailVerified: true,
		},
		update: {},
	});

	const company = await db.company.upsert({
		where: { domain },
		create: { name: `Views Co ${suffix}`, domain },
		update: {},
		select: { id: true },
	});
	companyId = company.id;

	const existing = await db.fieldDefinition.findUnique({
		where: { entity_key: { entity: "DEAL", key: OUTREACH_FIELD_KEY } },
		select: { id: true },
	});
	const field =
		existing ??
		(await db.fieldDefinition.create({
			data: {
				entity: "DEAL",
				key: OUTREACH_FIELD_KEY,
				label: "Outreach",
				type: "CHECKBOX",
				agentFilled: false,
				position: 999,
			},
			select: { id: true },
		}));
	if (!existing) createdFieldId = field.id;

	ids.outreach = await create("Cold", DealStage.DEMO_BOOKED);
	ids.talking = await create("Talking", DealStage.QUALIFIED_TO_BUY);
	ids.offer = await create("Offer", DealStage.CONTRACT_SENT);
	ids.won = await create("Won", DealStage.CLOSED_WON);

	await db.fieldValue.create({
		data: { fieldId: field.id, dealId: ids.outreach, bool: true },
	});

	await db.activity.createMany({
		data: [
			{
				type: ActivityType.TASK,
				subject: "Later step",
				dueAt: new Date("2026-12-20T09:00:00.000Z"),
				dealId: ids.talking,
				companyId,
				createdById: userId,
			},
			{
				type: ActivityType.TASK,
				subject: "Next step",
				dueAt: new Date("2026-12-10T09:00:00.000Z"),
				dealId: ids.talking,
				companyId,
				createdById: userId,
			},
			{
				type: ActivityType.TASK,
				subject: "Finished step",
				dueAt: new Date("2026-12-01T09:00:00.000Z"),
				completedAt: new Date(),
				dealId: ids.talking,
				companyId,
				createdById: userId,
			},
		],
	});
});

afterAll(async () => {
	await db.activity.deleteMany({ where: { companyId } });
	await db.deal.deleteMany({ where: { companyId } });
	await db.company.deleteMany({ where: { domain } });
	await db.user.deleteMany({ where: { id: userId } });
	if (createdFieldId) {
		await db.fieldDefinition.delete({ where: { id: createdFieldId } });
	}
});

describe("deal views", () => {
	it("keeps outreach out of the deals in progress", async () => {
		const list = await deals.list(listInput("active"));
		expect(list.rows.map((row) => row.id)).toEqual([ids.offer, ids.talking]);
	});

	it("lists outreach on its own", async () => {
		const list = await deals.list(listInput("outreach"));
		expect(list.rows.map((row) => row.id)).toEqual([ids.outreach]);
	});

	it("counts every view, whichever one is open", async () => {
		const list = await deals.list(listInput("active"));
		expect(list.facetCounts.status).toEqual({
			active: 2,
			outreach: 1,
			open: 3,
			closed: 1,
		});
	});

	it("shows the earliest open task as the next step", async () => {
		const list = await deals.list(listInput("active"));
		const talking = list.rows.find((row) => row.id === ids.talking);
		expect(talking?.nextTask?.subject).toBe("Next step");
		const offer = list.rows.find((row) => row.id === ids.offer);
		expect(offer?.nextTask).toBeNull();
	});
});
