import type { Prisma } from "@crm/db";
import { DEAL_VIEW_WHERE } from "../deals/deal-views";

export const COMPANY_VIEWS = ["active", "outreach", "idle"] as const;

export type CompanyView = (typeof COMPANY_VIEWS)[number];

function withDeal(deal: Prisma.DealWhereInput): Prisma.CompanyWhereInput {
	return { deals: { some: { AND: [deal, { archivedAt: null }] } } };
}

const active = withDeal(DEAL_VIEW_WHERE.active);

export const COMPANY_VIEW_WHERE = {
	active,
	outreach: { AND: [{ NOT: active }, withDeal(DEAL_VIEW_WHERE.outreach)] },
	idle: { NOT: withDeal(DEAL_VIEW_WHERE.open) },
} satisfies Record<CompanyView, Prisma.CompanyWhereInput>;

export function isCompanyView(value: string): value is CompanyView {
	return (COMPANY_VIEWS as readonly string[]).includes(value);
}
