import { db } from "@crm/db";
import { PRIORITY } from "@crm/db/agent-tasks";

const dealId = process.argv[2] ?? "seed-deal-cal-com-0";

const deal = await db.deal.update({
	where: { id: dealId },
	data: { stage: "CLOSED_WON", closedAt: new Date() },
	select: { id: true, name: true, stage: true, companyId: true },
});

const task = await db.agentTask.create({
	data: {
		dealId: deal.id,
		contactId: null,
		companyId: null,
		kind: "agent-event",
		reason: "deal.closed",
		payload: {
			type: "deal.closed",
			record: { kind: "deal", id: deal.id },
			occurredAt: new Date().toISOString(),
			data: { stage: "CLOSED_WON" },
		},
		priority: PRIORITY.event,
		budget: 1,
		dueAt: new Date(),
	},
	select: { id: true },
});

console.log(JSON.stringify({ deal, taskId: task.id }, null, 2));
process.exit(0);
