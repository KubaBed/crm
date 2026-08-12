export type NodeKind = "EMAIL" | "WAIT" | "BRANCH" | "SPLIT" | "EXIT";

export type CampaignGraph = {
	nodes: {
		id: string;
		kind: NodeKind;
		label: string | null;
		templateId: string | null;
		subject: string | null;
		preheader: string | null;
		document: Record<string, unknown> | null;
		delayHours: number | null;
		condition: Record<string, unknown> | null;
		x: number;
		y: number;
	}[];
	edges: {
		fromId: string;
		toId: string;
		handle: string;
		label: string | null;
		weight: number;
	}[];
};

export type NewKind = "EMAIL" | "WAIT" | "BRANCH" | "EXIT";

export const NEW_LABEL: Record<NewKind, string> = {
	EMAIL: "Email",
	WAIT: "Wait",
	BRANCH: "Branch",
	EXIT: "Exit",
};

const NEW_NODE: Record<NewKind, Record<string, unknown>> = {
	EMAIL: {
		kind: "EMAIL",
		label: "New touch",
		subject: "Untitled email",
		document: { version: 1, blocks: [] },
	},
	WAIT: { kind: "WAIT", label: "Wait", delayHours: 72 },
	BRANCH: {
		kind: "BRANCH",
		label: "Have they replied?",
		condition: { facet: { facet: "mailbox.neverReplied" } },
	},
	EXIT: { kind: "EXIT", label: "Stop here" },
};

function newId(): string {
	return `node_${Math.random().toString(36).slice(2, 12)}`;
}

export function withNode(
	campaign: CampaignGraph,
	kind: NewKind,
	afterId: string | null,
) {
	const nodes = campaign.nodes.map((node) => ({
		id: node.id,
		kind: node.kind,
		label: node.label,
		templateId: node.templateId,
		subject: node.subject,
		preheader: node.preheader,
		document: node.document,
		delayHours: node.delayHours,
		condition: node.condition,
		x: node.x,
		y: node.y,
	}));

	const edges = campaign.edges.map((edge) => ({
		fromId: edge.fromId,
		toId: edge.toId,
		handle: edge.handle,
		label: edge.label,
		weight: edge.weight,
	}));

	const outgoing = new Set(edges.map((edge) => edge.fromId));
	const anchor =
		afterId ??
		campaign.nodes.findLast((node) => !outgoing.has(node.id))?.id ??
		campaign.nodes[campaign.nodes.length - 1]?.id ??
		null;

	const id = newId();
	nodes.push({ id, ...NEW_NODE[kind] } as (typeof nodes)[number]);

	const following = anchor
		? edges.find((edge) => edge.fromId === anchor && edge.handle === "next")
		: undefined;

	if (kind === "BRANCH") {
		const stop = newId();
		nodes.push({ id: stop, ...NEW_NODE.EXIT } as (typeof nodes)[number]);

		if (following) {
			following.fromId = id;
			following.handle = "yes";
		} else {
			const yes = newId();
			nodes.push({ id: yes, ...NEW_NODE.EXIT } as (typeof nodes)[number]);
			edges.push({
				fromId: id,
				toId: yes,
				handle: "yes",
				label: null,
				weight: 100,
			});
		}

		edges.push({
			fromId: id,
			toId: stop,
			handle: "no",
			label: null,
			weight: 100,
		});
	} else if (following) {
		following.fromId = id;
	}

	if (anchor) {
		edges.push({
			fromId: anchor,
			toId: id,
			handle: "next",
			label: null,
			weight: 100,
		});
	}

	return { nodes, edges };
}
