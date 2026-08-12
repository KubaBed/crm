import { db } from "@crm/db";
import {
	autoLayout,
	filterSchema,
	type GraphEdge,
	type GraphNode,
	graphErrors,
	queueDirect,
	readMarketingSettings,
	segmentWhere,
	validateGraph,
} from "@crm/db/marketing";
import { readDocument } from "@crm/email/document";
import { type LintFinding, lintEmail } from "@crm/email/lint";

export type ToolProblem = {
	level: string;
	code: string;
	message: string;
	nodeId?: string;
};

export async function listSegments(limit = 50) {
	const rows = await db.marketingSegment.findMany({
		where: { archivedAt: null },
		select: {
			id: true,
			name: true,
			description: true,
			definition: true,
			members: { select: { contactId: true, mode: true } },
		},
		orderBy: { updatedAt: "desc" },
		take: limit,
	});

	return {
		segments: await Promise.all(
			rows.map(async (row) => ({
				id: row.id,
				name: row.name,
				description: row.description,
				people: await db.contact.count({ where: segmentWhere(row) }),
			})),
		),
	};
}

export async function readSegment(id: string) {
	const row = await db.marketingSegment.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			description: true,
			definition: true,
			members: { select: { contactId: true, mode: true } },
		},
	});

	if (!row) return { error: "No segment with that id." };

	return {
		id: row.id,
		name: row.name,
		description: row.description,
		definition: row.definition,
		people: await db.contact.count({ where: segmentWhere(row) }),
	};
}

export async function previewSegment(definition: unknown, limit = 20) {
	const parsed = filterSchema.safeParse(definition);

	if (!parsed.success) {
		return {
			error: "Those rules cannot be read.",
			problems: parsed.error.issues.map((issue) => issue.message),
		};
	}

	const where = segmentWhere({ definition: parsed.data });

	const [total, sample] = await Promise.all([
		db.contact.count({ where }),
		db.contact.findMany({
			where,
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				company: { select: { id: true, name: true } },
			},
			take: limit,
		}),
	]);

	return { total, sample };
}

export async function writeSegment(input: {
	id?: string;
	name: string;
	description?: string;
	definition: unknown;
}) {
	const parsed = filterSchema.safeParse(input.definition);

	if (!parsed.success) {
		return {
			error: "Those rules cannot be read. Fix them and call this again.",
			problems: parsed.error.issues.map(
				(issue) => `${issue.path.join(".")}: ${issue.message}`,
			),
		};
	}

	const data = {
		name: input.name,
		description: input.description ?? null,
		definition: parsed.data as object,
		kind: "DYNAMIC" as const,
	};

	const segment = input.id
		? await db.marketingSegment.update({
				where: { id: input.id },
				data,
				select: { id: true },
			})
		: await db.marketingSegment.create({ data, select: { id: true } });

	const people = await db.contact.count({
		where: segmentWhere({ definition: parsed.data }),
	});

	return { id: segment.id, people, changed: [segment.id] };
}

export async function listTemplates(limit = 50) {
	const rows = await db.marketingTemplate.findMany({
		where: { archivedAt: null },
		select: { id: true, name: true, subject: true },
		orderBy: { updatedAt: "desc" },
		take: limit,
	});

	return { templates: rows };
}

export async function readTemplate(id: string) {
	const row = await db.marketingTemplate.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			subject: true,
			preheader: true,
			document: true,
		},
	});

	return row ?? { error: "No template with that id." };
}

export async function writeTemplate(input: {
	id?: string;
	name: string;
	subject: string;
	preheader?: string;
	document: unknown;
}) {
	const document = readDocument(input.document);

	if (!document) {
		return {
			error: "That email document cannot be read. Check the block shapes.",
		};
	}

	const findings = lintEmail({
		document,
		subject: input.subject,
		preheader: input.preheader,
	});

	const errors = findings.filter(
		(finding: LintFinding) => finding.level === "error",
	);

	if (errors.length > 0) {
		return {
			error: "The linter refused this. Fix these and call again.",
			problems: errors,
		};
	}

	const data = {
		name: input.name,
		subject: input.subject,
		preheader: input.preheader ?? null,
		document: document as object,
	};

	const template = input.id
		? await db.marketingTemplate.update({
				where: { id: input.id },
				data,
				select: { id: true },
			})
		: await db.marketingTemplate.create({ data, select: { id: true } });

	return {
		id: template.id,
		warnings: findings.filter(
			(finding: LintFinding) => finding.level === "warning",
		),
		changed: [template.id],
	};
}

export async function readCampaign(id: string) {
	const campaign = await db.marketingCampaign.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			kind: true,
			status: true,
			entryMode: true,
			maxPasses: true,
			reentryCooldownDays: true,
			segment: { select: { id: true, name: true } },
			nodes: {
				select: {
					id: true,
					kind: true,
					label: true,
					subject: true,
					preheader: true,
					delayHours: true,
					condition: true,
				},
			},
			edges: {
				select: {
					id: true,
					fromId: true,
					toId: true,
					handle: true,
					weight: true,
				},
			},
		},
	});

	if (!campaign) return { error: "No campaign with that id." };

	const stats = await Promise.all(
		campaign.nodes.map(async (node) => {
			const [sent, opened, clicked, replied, waiting] = await Promise.all([
				db.marketingSend.count({
					where: { nodeId: node.id, status: { in: ["SENT", "DELIVERED"] } },
				}),
				db.marketingSend.count({
					where: { nodeId: node.id, openedAt: { not: null } },
				}),
				db.marketingSend.count({
					where: { nodeId: node.id, clickedAt: { not: null } },
				}),
				db.marketingSend.count({
					where: { nodeId: node.id, repliedAt: { not: null } },
				}),
				db.marketingEnrolment.count({
					where: { currentNodeId: node.id, status: "ACTIVE" },
				}),
			]);

			return { nodeId: node.id, sent, opened, clicked, replied, waiting };
		}),
	);

	return { ...campaign, stats };
}

export async function writeCampaignGraph(input: {
	campaignId: string;
	nodes: GraphNode[];
	edges: GraphEdge[];
}) {
	const settings = await readMarketingSettings(db);

	const problems = validateGraph(input.nodes, input.edges, {
		openTracking: Boolean(settings.resendDomainId),
	});

	if (graphErrors(problems).length > 0) {
		return {
			error: "This graph will not run. Fix these and call again.",
			problems: graphErrors(problems),
		};
	}

	const positions = autoLayout(input.nodes, input.edges);

	await db.$transaction(async (tx) => {
		const keep = new Set(input.nodes.map((node) => node.id));

		await tx.marketingCampaignEdge.deleteMany({
			where: { campaignId: input.campaignId },
		});
		await tx.marketingCampaignNode.deleteMany({
			where: { campaignId: input.campaignId, id: { notIn: [...keep] } },
		});

		for (const node of input.nodes) {
			const at = positions.get(node.id) ?? { x: 0, y: 0 };
			const data = {
				kind: node.kind,
				label: node.label ?? null,
				subject: node.subject ?? null,
				preheader: node.preheader ?? null,
				document: (node.document ?? undefined) as object | undefined,
				delayHours: node.delayHours ?? null,
				condition: (node.condition ?? undefined) as object | undefined,
				x: at.x,
				y: at.y,
			};

			await tx.marketingCampaignNode.upsert({
				where: { id: node.id },
				create: { id: node.id, campaignId: input.campaignId, ...data },
				update: data,
			});
		}

		for (const edge of input.edges) {
			await tx.marketingCampaignEdge.create({
				data: {
					campaignId: input.campaignId,
					fromId: edge.fromId,
					toId: edge.toId,
					handle: edge.handle ?? "next",
					label: edge.label ?? null,
					weight: edge.weight ?? 100,
				},
			});
		}
	});

	return {
		ok: true,
		warnings: problems.filter((problem) => problem.level === "warning"),
		changed: input.nodes.map((node) => node.id),
	};
}

export async function sendDirectEmail(input: {
	contactId: string;
	templateId: string;
	requestedById?: string;
}) {
	const [contact, template] = await Promise.all([
		db.contact.findUnique({
			where: { id: input.contactId },
			select: { email: true, firstName: true },
		}),
		db.marketingTemplate.findUnique({
			where: { id: input.templateId },
			select: { subject: true, document: true },
		}),
	]);

	if (!contact?.email) return { error: "That contact has no email address." };
	if (!template) return { error: "No template with that id." };

	const result = await queueDirect(db, {
		address: contact.email,
		contactId: input.contactId,
		subject: template.subject,
		document: template.document,
		requestedById: input.requestedById,
	});

	if (!result.ok) {
		return {
			error:
				result.reason === "unsubscribed"
					? `${contact.email} unsubscribed from marketing email, so nothing was sent.`
					: `Nothing was sent: ${result.reason}.`,
		};
	}

	await pokeDrain();

	return { sendId: result.sendId, to: contact.email };
}

export async function pokeDrain(): Promise<void> {
	const url = process.env.API_URL;
	const secret = process.env.AGENT_BRIDGE_SECRET;
	if (!url || !secret) return;

	try {
		await fetch(`${url.replace(/\/$/, "")}/internal/marketing/drain`, {
			method: "POST",
			headers: { authorization: `Bearer ${secret}` },
		});
	} catch {
		return;
	}
}
