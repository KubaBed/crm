import type { Prisma } from "@crm/db";
import { CLOSED_DEAL_STAGES, OPEN_DEAL_STAGES } from "@crm/db/deal-stage";

export const OUTREACH_FIELD_KEY = "outreach";

export const DEAL_VIEWS = ["active", "outreach", "open", "closed"] as const;

export type DealView = (typeof DEAL_VIEWS)[number];

const open: Prisma.DealWhereInput = { stage: { in: [...OPEN_DEAL_STAGES] } };

const outreach: Prisma.DealWhereInput = {
	fieldValues: {
		some: {
			bool: true,
			field: { key: OUTREACH_FIELD_KEY, entity: "DEAL", archivedAt: null },
		},
	},
};

export const DEAL_VIEW_WHERE = {
	active: { AND: [open, { NOT: outreach }] },
	outreach: { AND: [open, outreach] },
	open,
	closed: { stage: { in: [...CLOSED_DEAL_STAGES] } },
} satisfies Record<DealView, Prisma.DealWhereInput>;

export function isDealView(value: string): value is DealView {
	return (DEAL_VIEWS as readonly string[]).includes(value);
}
