import type {
	FacetSpec,
	RuleRow,
	RuleTreeValue,
} from "@crm/ui/components/rule-tree";

export const FACETS: FacetSpec[] = [
	{
		id: "contact.hasEmail",
		group: "Contact",
		label: "Has an email address",
		field: { kind: "none" },
	},
	{
		id: "contact.titleContains",
		group: "Contact",
		label: "Job title contains",
		field: { kind: "text", key: "value", placeholder: "Head of" },
	},
	{
		id: "contact.createdWithin",
		group: "Contact",
		label: "Added within",
		field: { kind: "number", key: "days", suffix: "days" },
	},
	{
		id: "company.industry",
		group: "Company",
		label: "Industry is",
		field: { kind: "text", key: "value", placeholder: "Fintech" },
	},
	{
		id: "company.country",
		group: "Company",
		label: "Country is",
		field: { kind: "text", key: "value", placeholder: "United Kingdom" },
	},
	{
		id: "activity.within",
		group: "Activity",
		label: "Active within",
		field: { kind: "number", key: "days", suffix: "days" },
	},
	{
		id: "activity.notWithin",
		group: "Activity",
		label: "Quiet for at least",
		field: { kind: "number", key: "days", suffix: "days" },
	},
	{
		id: "deal.hasNoOpen",
		group: "Deals",
		label: "Has no open deal",
		field: { kind: "none" },
	},
	{
		id: "deal.closedWonWithin",
		group: "Deals",
		label: "Closed won within",
		field: { kind: "number", key: "days", suffix: "days" },
	},
	{
		id: "mailbox.repliedWithin",
		group: "Mailbox",
		label: "Replied within",
		field: { kind: "number", key: "days", suffix: "days" },
	},
	{
		id: "mailbox.neverReplied",
		group: "Mailbox",
		label: "Never replied",
		field: { kind: "none" },
	},
	{
		id: "meeting.bookedWithin",
		group: "Meetings",
		label: "Booked a meeting within",
		field: { kind: "number", key: "days", suffix: "days" },
	},
	{
		id: "meeting.notBookedWithin",
		group: "Meetings",
		label: "No meeting booked within",
		field: { kind: "number", key: "days", suffix: "days" },
	},
	{
		id: "tracking.visitedPath",
		group: "Website",
		label: "Visited a page starting",
		field: { kind: "text", key: "path", placeholder: "/pricing" },
	},
	{
		id: "tracking.submittedForm",
		group: "Website",
		label: "Submitted a form on",
		field: { kind: "text", key: "path", placeholder: "/contact" },
	},
	{
		id: "marketing.noSendWithin",
		group: "Marketing",
		label: "Had no marketing email within",
		field: { kind: "number", key: "days", suffix: "days" },
	},
];

type Facet = Record<string, unknown> & { facet: string };

export function toDefinition(
	value: RuleTreeValue,
): Record<string, unknown> | null {
	const facets = value.rules
		.map((rule) => toFacet(rule))
		.filter((facet): facet is Facet => facet !== null);

	if (facets.length === 0) return null;
	if (facets.length === 1) return { facet: facets[0] };

	return value.match === "all"
		? { all: facets.map((facet) => ({ facet })) }
		: { any: facets.map((facet) => ({ facet })) };
}

function toFacet(rule: RuleRow): Facet | null {
	const spec = FACETS.find((facet) => facet.id === rule.facet);
	if (!spec) return null;

	if (spec.field.kind === "none") return { facet: rule.facet };

	const raw = rule.value.trim();
	if (raw === "") return null;

	if (spec.field.kind === "number") {
		const days = Number.parseInt(raw, 10);
		if (Number.isNaN(days)) return null;
		return { facet: rule.facet, [spec.field.key]: days };
	}

	return { facet: rule.facet, [spec.field.key]: raw };
}

export function fromDefinition(definition: unknown): RuleTreeValue {
	if (!definition || typeof definition !== "object") {
		return { match: "all", rules: [] };
	}

	const node = definition as Record<string, unknown>;

	if ("facet" in node) {
		const rule = toRule(node.facet, 0);
		return { match: "all", rules: rule ? [rule] : [] };
	}

	for (const match of ["all", "any"] as const) {
		const list = node[match];
		if (!Array.isArray(list)) continue;

		return {
			match,
			rules: list
				.map((entry, index) =>
					toRule((entry as { facet?: unknown } | null)?.facet, index),
				)
				.filter((rule): rule is RuleRow => rule !== null),
		};
	}

	return { match: "all", rules: [] };
}

function toRule(value: unknown, index: number): RuleRow | null {
	if (!value || typeof value !== "object") return null;

	const facet = value as Record<string, unknown>;
	const id = typeof facet.facet === "string" ? facet.facet : null;
	if (!id) return null;

	const spec = FACETS.find((candidate) => candidate.id === id);
	const raw = spec && spec.field.kind !== "none" ? facet[spec.field.key] : null;

	return {
		id: `rule-${index}-${id}`,
		facet: id,
		value: raw === null || raw === undefined ? "" : String(raw),
	};
}
