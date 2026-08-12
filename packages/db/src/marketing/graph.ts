import { z } from "zod";
import type { MarketingNodeKind } from "../generated/prisma/enums";
import { filterSchema } from "./segments";

export type GraphNode = {
	id: string;
	kind: MarketingNodeKind;
	label?: string | null;
	templateId?: string | null;
	subject?: string | null;
	preheader?: string | null;
	document?: unknown;
	delayHours?: number | null;
	condition?: unknown;
	x?: number;
	y?: number;
};

export type GraphEdge = {
	id?: string;
	fromId: string;
	toId: string;
	handle?: string;
	label?: string | null;
	weight?: number;
};

export type GraphProblem = {
	level: "error" | "warning";
	code: string;
	message: string;
	nodeId?: string;
	edgeId?: string;
};

export const graphNodeInput = z.object({
	id: z.string().min(1),
	kind: z.enum(["EMAIL", "WAIT", "BRANCH", "SPLIT", "EXIT"]),
	label: z.string().trim().max(120).nullish(),
	templateId: z.string().nullish(),
	subject: z.string().trim().max(200).nullish(),
	preheader: z.string().trim().max(300).nullish(),
	document: z.unknown().nullish(),
	delayHours: z
		.number()
		.int()
		.min(0)
		.max(24 * 365)
		.nullish(),
	condition: z.unknown().nullish(),
	x: z.number().nullish(),
	y: z.number().nullish(),
});

export const graphEdgeInput = z.object({
	id: z.string().nullish(),
	fromId: z.string().min(1),
	toId: z.string().min(1),
	handle: z.string().trim().min(1).max(40).default("next"),
	label: z.string().trim().max(60).nullish(),
	weight: z.number().int().min(0).max(100).default(100),
});

export const BRANCH_HANDLES = ["yes", "no"] as const;

function conditionUsesOpened(condition: unknown): boolean {
	const parsed = filterSchema.safeParse(condition);
	if (!parsed.success) return false;

	const walk = (filter: unknown): boolean => {
		if (!filter || typeof filter !== "object") return false;
		if ("all" in filter) return (filter.all as unknown[]).some(walk);
		if ("any" in filter) return (filter.any as unknown[]).some(walk);
		if ("not" in filter) return walk((filter as { not: unknown }).not);
		if ("facet" in filter) {
			const facet = (filter as { facet: { facet: string } }).facet;
			return facet.facet === "marketing.openedCampaign";
		}
		return false;
	};

	return walk(parsed.data);
}

export function validateGraph(
	nodes: GraphNode[],
	edges: GraphEdge[],
	options: { openTracking?: boolean } = {},
): GraphProblem[] {
	const problems: GraphProblem[] = [];
	const byId = new Map(nodes.map((node) => [node.id, node]));

	if (nodes.length === 0) {
		problems.push({
			level: "error",
			code: "empty",
			message: "A campaign needs at least one email.",
		});
		return problems;
	}

	for (const edge of edges) {
		if (!byId.has(edge.fromId)) {
			problems.push({
				level: "error",
				code: "dangling-edge",
				edgeId: edge.id,
				message: `An edge starts at a node that does not exist.`,
			});
		}
		if (!byId.has(edge.toId)) {
			problems.push({
				level: "error",
				code: "dangling-edge",
				edgeId: edge.id,
				message: `An edge ends at a node that does not exist.`,
			});
		}
	}

	const incoming = new Map<string, number>();
	for (const node of nodes) incoming.set(node.id, 0);
	for (const edge of edges) {
		if (byId.has(edge.toId))
			incoming.set(edge.toId, (incoming.get(edge.toId) ?? 0) + 1);
	}

	const roots = nodes.filter((node) => (incoming.get(node.id) ?? 0) === 0);
	if (roots.length === 0) {
		problems.push({
			level: "error",
			code: "no-root",
			message:
				"Every node has something pointing at it, so nothing can start. The graph must not loop.",
		});
	} else if (roots.length > 1) {
		for (const root of roots.slice(1)) {
			problems.push({
				level: "error",
				code: "many-roots",
				nodeId: root.id,
				message: "A campaign has one starting point, and this is a second one.",
			});
		}
	}

	const out = new Map<string, GraphEdge[]>();
	for (const edge of edges) {
		const list = out.get(edge.fromId) ?? [];
		list.push(edge);
		out.set(edge.fromId, list);
	}

	const state = new Map<string, "open" | "done">();
	const cycle = (id: string): boolean => {
		const seen = state.get(id);
		if (seen === "done") return false;
		if (seen === "open") return true;
		state.set(id, "open");
		for (const edge of out.get(id) ?? []) {
			if (byId.has(edge.toId) && cycle(edge.toId)) return true;
		}
		state.set(id, "done");
		return false;
	};

	for (const node of nodes) {
		if (cycle(node.id)) {
			problems.push({
				level: "error",
				code: "cycle",
				nodeId: node.id,
				message: "This node is part of a loop. A campaign runs forwards only.",
			});
			break;
		}
	}

	for (const node of nodes) {
		const outgoing = out.get(node.id) ?? [];

		switch (node.kind) {
			case "EMAIL": {
				if (!node.document && !node.templateId) {
					problems.push({
						level: "error",
						code: "email-empty",
						nodeId: node.id,
						message: "This email has no content and no template.",
					});
				}
				if (!node.subject?.trim() && !node.templateId) {
					problems.push({
						level: "error",
						code: "email-no-subject",
						nodeId: node.id,
						message: "This email has no subject.",
					});
				}
				if (outgoing.length > 1) {
					problems.push({
						level: "error",
						code: "email-many-out",
						nodeId: node.id,
						message: "An email leads to one next step.",
					});
				}
				break;
			}
			case "WAIT": {
				if (node.delayHours === null || node.delayHours === undefined) {
					problems.push({
						level: "error",
						code: "wait-no-delay",
						nodeId: node.id,
						message: "This wait has no length.",
					});
				}
				if (outgoing.length > 1) {
					problems.push({
						level: "error",
						code: "wait-many-out",
						nodeId: node.id,
						message: "A wait leads to one next step.",
					});
				}
				break;
			}
			case "BRANCH": {
				if (!node.condition) {
					problems.push({
						level: "error",
						code: "branch-no-condition",
						nodeId: node.id,
						message: "This branch has no condition.",
					});
				} else if (!filterSchema.safeParse(node.condition).success) {
					problems.push({
						level: "error",
						code: "branch-bad-condition",
						nodeId: node.id,
						message: "This branch's condition is not a valid rule.",
					});
				}

				const handles = new Set(outgoing.map((edge) => edge.handle ?? "next"));
				for (const handle of BRANCH_HANDLES) {
					if (!handles.has(handle)) {
						problems.push({
							level: "error",
							code: "branch-missing-arm",
							nodeId: node.id,
							message: `This branch has no "${handle}" path.`,
						});
					}
				}

				if (conditionUsesOpened(node.condition)) {
					if (options.openTracking === false) {
						problems.push({
							level: "error",
							code: "branch-open-tracking-off",
							nodeId: node.id,
							message:
								"This branch asks whether somebody opened an email, but open tracking is off at Resend. Nobody will ever take the yes path. Turn tracking on, or branch on a click instead.",
						});
					} else {
						problems.push({
							level: "warning",
							code: "branch-opens-are-inflated",
							nodeId: node.id,
							message:
								"Apple Mail opens every email before a person does, so the yes path collects Apple Mail readers whether or not they looked. Branching on a click is more reliable.",
						});
					}
				}
				break;
			}
			case "SPLIT": {
				if (outgoing.length < 2) {
					problems.push({
						level: "error",
						code: "split-one-arm",
						nodeId: node.id,
						message: "A split needs at least two paths.",
					});
					break;
				}
				const total = outgoing.reduce(
					(sum, edge) => sum + (edge.weight ?? 0),
					0,
				);
				if (total !== 100) {
					problems.push({
						level: "error",
						code: "split-weights",
						nodeId: node.id,
						message: `The split's paths add up to ${total}%, not 100%.`,
					});
				}
				break;
			}
			case "EXIT": {
				if (outgoing.length > 0) {
					problems.push({
						level: "error",
						code: "exit-has-out",
						nodeId: node.id,
						message: "An exit is the end. It leads nowhere.",
					});
				}
				break;
			}
		}
	}

	const handleSeen = new Set<string>();
	for (const edge of edges) {
		const key = `${edge.fromId}:${edge.handle ?? "next"}`;
		if (handleSeen.has(key)) {
			problems.push({
				level: "error",
				code: "duplicate-handle",
				edgeId: edge.id,
				nodeId: edge.fromId,
				message: "Two paths leave this node by the same route.",
			});
		}
		handleSeen.add(key);
	}

	return problems;
}

export function graphErrors(problems: GraphProblem[]): GraphProblem[] {
	return problems.filter((problem) => problem.level === "error");
}

export function rootNode(
	nodes: GraphNode[],
	edges: GraphEdge[],
): GraphNode | null {
	const targets = new Set(edges.map((edge) => edge.toId));
	return nodes.find((node) => !targets.has(node.id)) ?? null;
}

export function pickArm(
	edges: { id?: string; toId: string; weight?: number }[],
	seed: string,
): { toId: string } | null {
	const first = edges[0];
	if (!first) return null;

	let hash = 2166136261;
	for (let index = 0; index < seed.length; index += 1) {
		hash ^= seed.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}

	const total = edges.reduce((sum, edge) => sum + (edge.weight ?? 0), 0);
	if (total <= 0) return { toId: first.toId };

	let roll = Math.abs(hash) % total;
	for (const edge of edges) {
		roll -= edge.weight ?? 0;
		if (roll < 0) return { toId: edge.toId };
	}

	const last = edges[edges.length - 1];
	return last ? { toId: last.toId } : null;
}

export function autoLayout(
	nodes: GraphNode[],
	edges: GraphEdge[],
): Map<string, { x: number; y: number }> {
	const positions = new Map<string, { x: number; y: number }>();
	const root = rootNode(nodes, edges);
	if (!root) return positions;

	const out = new Map<string, GraphEdge[]>();
	for (const edge of edges) {
		const list = out.get(edge.fromId) ?? [];
		list.push(edge);
		out.set(edge.fromId, list);
	}

	const ROW = 132;
	const COL = 300;
	const depth = new Map<string, number>();
	const order: string[] = [];
	const queue: { id: string; level: number }[] = [{ id: root.id, level: 0 }];

	while (queue.length > 0) {
		const next = queue.shift();
		if (!next || depth.has(next.id)) continue;
		depth.set(next.id, next.level);
		order.push(next.id);
		for (const edge of out.get(next.id) ?? []) {
			queue.push({ id: edge.toId, level: next.level + 1 });
		}
	}

	const perLevel = new Map<number, string[]>();
	for (const id of order) {
		const level = depth.get(id) ?? 0;
		const list = perLevel.get(level) ?? [];
		list.push(id);
		perLevel.set(level, list);
	}

	for (const [level, ids] of perLevel) {
		const width = (ids.length - 1) * COL;
		ids.forEach((id, index) => {
			positions.set(id, { x: index * COL - width / 2, y: level * ROW });
		});
	}

	for (const node of nodes) {
		if (!positions.has(node.id)) positions.set(node.id, { x: 0, y: 0 });
	}

	return positions;
}
