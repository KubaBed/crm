import type { Db, Prisma } from "@crm/db";
import {
	assertSendable,
	autoLayout,
	enrolContact,
	type GraphEdge,
	type GraphNode,
	graphErrors,
	materialise,
	queueDirect,
	readMarketingSettings,
	segmentWhere,
	validateGraph,
} from "@crm/db/marketing";
import { EMPTY_DOCUMENT, lintEmail } from "@crm/email";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { blankToNull } from "../crm/values";
import { InjectDatabase } from "../database/database.constants";
import { type ListInput, paginate, resolveOrderBy } from "../trpc/list-input";
import { MarketingTemplatesService } from "./marketing-templates.service";
import { ResendService } from "./resend.service";

type Json = Record<string, unknown> | null;

export type NodeStats = {
	nodeId: string;
	sent: number;
	delivered: number;
	opened: number;
	clicked: number;
	replied: number;
	bounced: number;
	unsubscribed: number;
	waiting: number;
};

@Injectable()
export class MarketingCampaignsService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly resend: ResendService,
		private readonly templates: MarketingTemplatesService,
	) {}

	async list(input: ListInput & { kind?: string; status?: string }) {
		const where: Prisma.MarketingCampaignWhereInput = {
			status: { not: "ARCHIVED" },
			...(input.q && { name: { contains: input.q, mode: "insensitive" } }),
			...(input.kind === "BLAST" || input.kind === "DRIP"
				? { kind: input.kind }
				: {}),
			...(input.status === "DRAFT" ? { status: "DRAFT" } : {}),
		};

		const orderBy =
			resolveOrderBy<Prisma.MarketingCampaignOrderByWithRelationInput>(
				input,
				{
					name: (dir) => ({ name: dir }),
					updatedAt: (dir) => ({ updatedAt: dir }),
				},
				{ updatedAt: "desc" },
			);

		const [rows, total] = await Promise.all([
			this.db.marketingCampaign.findMany({
				where,
				orderBy,
				...paginate(input),
				select: {
					id: true,
					name: true,
					kind: true,
					status: true,
					scheduledAt: true,
					activatedAt: true,
					updatedAt: true,
					segment: { select: { id: true, name: true } },
					_count: { select: { nodes: true } },
				},
			}),
			this.db.marketingCampaign.count({ where }),
		]);

		const stats = await this.db.marketingSend.groupBy({
			by: ["campaignId"],
			where: { campaignId: { in: rows.map((row) => row.id) } },
			_count: { _all: true },
		});

		const engagement = await Promise.all(
			rows.map(async (row) => {
				const [sent, opened, clicked, replied] = await Promise.all([
					this.db.marketingSend.count({
						where: {
							campaignId: row.id,
							status: { in: ["SENT", "DELIVERED"] },
						},
					}),
					this.db.marketingSend.count({
						where: { campaignId: row.id, openedAt: { not: null } },
					}),
					this.db.marketingSend.count({
						where: { campaignId: row.id, clickedAt: { not: null } },
					}),
					this.db.marketingSend.count({
						where: { campaignId: row.id, repliedAt: { not: null } },
					}),
				]);
				return { id: row.id, sent, opened, clicked, replied };
			}),
		);

		const byId = new Map(engagement.map((row) => [row.id, row]));

		return {
			rows: rows.map((row) => {
				const numbers = byId.get(row.id);
				const touches = row._count.nodes;

				return {
					id: row.id,
					name: row.name,
					kind: row.kind,
					status: row.status,
					touches,
					subtitle:
						row.kind === "DRIP"
							? `Drip · ${touches} node${touches === 1 ? "" : "s"}`
							: "Blast",
					segment: row.segment?.name ?? null,
					sent: numbers?.sent ?? 0,
					opened: numbers?.opened ?? 0,
					clicked: numbers?.clicked ?? 0,
					replied: numbers?.replied ?? 0,
					scheduledAt: row.scheduledAt,
					activatedAt: row.activatedAt,
					updatedAt: row.updatedAt,
				};
			}),
			total,
			facetCounts: {
				kind: Object.fromEntries(
					stats.map((row) => [row.campaignId ?? "none", row._count._all]),
				),
			},
		};
	}

	async overview() {
		const [settings, live, recent, health, enrolments, unsubscribed] =
			await Promise.all([
				assertSendable(this.db),
				this.db.marketingCampaign.count({
					where: { status: { in: ["ACTIVE", "SENDING", "SCHEDULED"] } },
				}),
				this.db.marketingCampaign.findMany({
					where: { status: { not: "ARCHIVED" } },
					select: {
						id: true,
						name: true,
						kind: true,
						status: true,
						updatedAt: true,
					},
					orderBy: { updatedAt: "desc" },
					take: 5,
				}),
				this.db.marketingSend.groupBy({
					by: ["status"],
					where: {
						createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
					},
					_count: { _all: true },
				}),
				this.db.marketingEnrolment.count({ where: { status: "ACTIVE" } }),
				this.db.marketingEvent.count({
					where: {
						type: "UNSUBSCRIBED",
						at: { gte: new Date(Date.now() - 30 * 86_400_000) },
					},
				}),
			]);

		const count = (status: string) =>
			health.find((row) => row.status === status)?._count._all ?? 0;

		const sent =
			count("SENT") +
			count("DELIVERED") +
			count("BOUNCED") +
			count("COMPLAINED");

		return {
			sendable: settings.ok,
			missing: settings.ok ? [] : settings.missing,
			live,
			inFlight: enrolments,
			recent,
			thirtyDays: {
				sent,
				delivered: count("DELIVERED"),
				bounced: count("BOUNCED"),
				complained: count("COMPLAINED"),
				unsubscribed,
				bounceRate: sent > 0 ? count("BOUNCED") / sent : 0,
			},
		};
	}

	async byId(id: string) {
		const campaign = await this.db.marketingCampaign.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				kind: true,
				status: true,
				segmentId: true,
				entryMode: true,
				entryDefinition: true,
				exitDefinition: true,
				reentryCooldownDays: true,
				maxPasses: true,
				fromName: true,
				fromAddress: true,
				replyTo: true,
				scheduledAt: true,
				activatedAt: true,
				pausedReason: true,
				createdById: true,
				createdAt: true,
				updatedAt: true,
				segment: { select: { id: true, name: true } },
				nodes: {
					select: {
						id: true,
						kind: true,
						label: true,
						templateId: true,
						subject: true,
						preheader: true,
						document: true,
						delayHours: true,
						condition: true,
						x: true,
						y: true,
					},
				},
				edges: {
					select: {
						id: true,
						fromId: true,
						toId: true,
						handle: true,
						label: true,
						weight: true,
					},
				},
			},
		});

		if (!campaign) throw new NotFoundException("No such campaign.");

		const [stats, health, enrolled, inFlight, audience] = await Promise.all([
			this.nodeStats(id),
			this.health(id),
			this.db.marketingEnrolment.count({ where: { campaignId: id } }),
			this.db.marketingEnrolment.count({
				where: { campaignId: id, status: "ACTIVE" },
			}),
			this.audience(campaign.segmentId),
		]);

		return {
			...campaign,
			entryDefinition: campaign.entryDefinition as Json,
			exitDefinition: campaign.exitDefinition as Json,
			nodes: campaign.nodes.map((node) => ({
				...node,
				document: node.document as Json,
				condition: node.condition as Json,
			})),
			stats,
			health,
			enrolled,
			inFlight,
			audience,
		};
	}

	async previewNode(input: {
		nodeId: string;
		subject?: string | null;
		preheader?: string | null;
	}) {
		const node = await this.db.marketingCampaignNode.findUnique({
			where: { id: input.nodeId },
			select: { subject: true, preheader: true, document: true },
		});

		if (!node) throw new NotFoundException("No such node.");

		return this.templates.preview({
			document: node.document,
			subject: input.subject ?? node.subject,
			preheader: input.preheader ?? node.preheader,
			contactId: null,
		});
	}

	private async audience(
		segmentId: string | null,
	): Promise<{ total: number; sendable: number; excluded: number }> {
		if (!segmentId) return { total: 0, sendable: 0, excluded: 0 };

		const segment = await this.db.marketingSegment.findUnique({
			where: { id: segmentId },
			select: {
				definition: true,
				members: { select: { contactId: true, mode: true } },
			},
		});

		if (!segment) return { total: 0, sendable: 0, excluded: 0 };

		const where = segmentWhere(segment);

		const [total, sendable] = await Promise.all([
			this.db.contact.count({ where }),
			this.db.contact.count({
				where: {
					AND: [
						where,
						{ email: { not: null } },
						{
							OR: [
								{ marketingRecipients: { none: {} } },
								{ marketingRecipients: { some: { status: "SUBSCRIBED" } } },
							],
						},
					],
				},
			}),
		]);

		return { total, sendable, excluded: total - sendable };
	}

	async nodeStats(campaignId: string): Promise<NodeStats[]> {
		const nodes = await this.db.marketingCampaignNode.findMany({
			where: { campaignId },
			select: { id: true },
		});

		return Promise.all(
			nodes.map(async (node) => {
				const [
					sent,
					delivered,
					opened,
					clicked,
					replied,
					bounced,
					unsubscribed,
					waiting,
				] = await Promise.all([
					this.db.marketingSend.count({
						where: {
							nodeId: node.id,
							status: { in: ["SENT", "DELIVERED", "BOUNCED", "COMPLAINED"] },
						},
					}),
					this.db.marketingSend.count({
						where: { nodeId: node.id, status: "DELIVERED" },
					}),
					this.db.marketingSend.count({
						where: { nodeId: node.id, openedAt: { not: null } },
					}),
					this.db.marketingSend.count({
						where: { nodeId: node.id, clickedAt: { not: null } },
					}),
					this.db.marketingSend.count({
						where: { nodeId: node.id, repliedAt: { not: null } },
					}),
					this.db.marketingSend.count({
						where: { nodeId: node.id, status: "BOUNCED" },
					}),
					this.db.marketingEvent.count({
						where: { type: "UNSUBSCRIBED", send: { nodeId: node.id } },
					}),
					this.db.marketingEnrolment.count({
						where: { currentNodeId: node.id, status: "ACTIVE" },
					}),
				]);

				return {
					nodeId: node.id,
					sent,
					delivered,
					opened,
					clicked,
					replied,
					bounced,
					unsubscribed,
					waiting,
				};
			}),
		);
	}

	async health(campaignId: string) {
		const [sent, delivered, bounced, complained] = await Promise.all([
			this.db.marketingSend.count({
				where: {
					campaignId,
					status: { in: ["SENT", "DELIVERED", "BOUNCED", "COMPLAINED"] },
				},
			}),
			this.db.marketingSend.count({
				where: { campaignId, status: "DELIVERED" },
			}),
			this.db.marketingSend.count({ where: { campaignId, status: "BOUNCED" } }),
			this.db.marketingSend.count({
				where: { campaignId, status: "COMPLAINED" },
			}),
		]);

		return {
			sent,
			delivered,
			bounced,
			complained,
			bounceRate: sent > 0 ? bounced / sent : 0,
			complaintRate: sent > 0 ? complained / sent : 0,
			deliveredRate: sent > 0 ? delivered / sent : 0,
		};
	}

	async create(input: {
		name: string;
		kind: "BLAST" | "DRIP";
		segmentId?: string | null;
		userId: string;
	}) {
		const name = blankToNull(input.name);
		if (!name) throw new BadRequestException("Give the campaign a name.");

		return this.db.$transaction(async (tx) => {
			const campaign = await tx.marketingCampaign.create({
				data: {
					name,
					kind: input.kind,
					segmentId: input.segmentId ?? null,
					createdById: input.userId,
					entryMode: input.kind === "DRIP" ? "CONTINUOUS" : "MANUAL",
				},
				select: { id: true },
			});

			await tx.marketingCampaignNode.create({
				data: {
					campaignId: campaign.id,
					kind: "EMAIL",
					label: input.kind === "DRIP" ? "Touch 1" : "The email",
					subject: "",
					document: EMPTY_DOCUMENT as unknown as Prisma.InputJsonValue,
					x: 0,
					y: 0,
				},
			});

			return campaign;
		});
	}

	async update(input: {
		id: string;
		name?: string;
		segmentId?: string | null;
		replyTo?: string | null;
		entryDefinition?: unknown;
		exitDefinition?: unknown;
		reentryCooldownDays?: number | null;
		maxPasses?: number;
		scheduledAt?: Date | null;
	}) {
		return this.db.marketingCampaign.update({
			where: { id: input.id },
			data: {
				...(input.name && { name: input.name }),
				...(input.segmentId !== undefined && { segmentId: input.segmentId }),
				...(input.replyTo !== undefined && { replyTo: input.replyTo }),
				...(input.entryDefinition !== undefined && {
					entryDefinition: (input.entryDefinition ??
						undefined) as Prisma.InputJsonValue,
				}),
				...(input.exitDefinition !== undefined && {
					exitDefinition: (input.exitDefinition ??
						undefined) as Prisma.InputJsonValue,
				}),
				...(input.reentryCooldownDays !== undefined && {
					reentryCooldownDays: input.reentryCooldownDays,
				}),
				...(input.maxPasses !== undefined && { maxPasses: input.maxPasses }),
				...(input.scheduledAt !== undefined && {
					scheduledAt: input.scheduledAt,
				}),
			},
			select: { id: true },
		});
	}

	async writeGraph(input: {
		campaignId: string;
		nodes: GraphNode[];
		edges: GraphEdge[];
	}) {
		const settings = await readMarketingSettings(this.db);
		const domain = settings.resendDomainId
			? await this.resend.readDomain(settings.resendDomainId)
			: null;

		const problems = validateGraph(input.nodes, input.edges, {
			openTracking: domain?.openTracking ?? false,
		});

		if (graphErrors(problems).length > 0) {
			return { ok: false as const, problems };
		}

		const positions = autoLayout(input.nodes, input.edges);

		await this.db.$transaction(async (tx) => {
			const existing = await tx.marketingCampaignNode.findMany({
				where: { campaignId: input.campaignId },
				select: { id: true, x: true, y: true },
			});
			const placed = new Map(existing.map((node) => [node.id, node]));
			const keep = new Set(input.nodes.map((node) => node.id));

			const busy = await tx.marketingEnrolment.findMany({
				where: {
					campaignId: input.campaignId,
					status: "ACTIVE",
					currentNodeId: {
						in: existing.filter((node) => !keep.has(node.id)).map((n) => n.id),
					},
				},
				select: { currentNodeId: true },
			});

			if (busy.length > 0) {
				throw new ConflictException(
					`${busy.length} people are standing on a node you are deleting. Move them or let the campaign drain first.`,
				);
			}

			await tx.marketingCampaignEdge.deleteMany({
				where: { campaignId: input.campaignId },
			});
			await tx.marketingCampaignNode.deleteMany({
				where: { campaignId: input.campaignId, id: { notIn: [...keep] } },
			});

			for (const node of input.nodes) {
				const auto = positions.get(node.id) ?? { x: 0, y: 0 };
				const previous = placed.get(node.id);
				const x = node.x ?? previous?.x ?? auto.x;
				const y = node.y ?? previous?.y ?? auto.y;

				const data = {
					kind: node.kind,
					label: node.label ?? null,
					templateId: node.templateId ?? null,
					subject: node.subject ?? null,
					preheader: node.preheader ?? null,
					document: (node.document ?? undefined) as
						| Prisma.InputJsonValue
						| undefined,
					delayHours: node.delayHours ?? null,
					condition: (node.condition ?? undefined) as
						| Prisma.InputJsonValue
						| undefined,
					x,
					y,
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
			ok: true as const,
			problems: problems.filter((problem) => problem.level === "warning"),
			changed: input.nodes.map((node) => node.id),
		};
	}

	async updateNode(input: {
		nodeId: string;
		label?: string | null;
		subject?: string | null;
		preheader?: string | null;
		document?: unknown;
		delayHours?: number | null;
		condition?: unknown;
		x?: number;
		y?: number;
	}) {
		const node = await this.db.marketingCampaignNode.update({
			where: { id: input.nodeId },
			data: {
				...(input.label !== undefined && { label: input.label }),
				...(input.subject !== undefined && { subject: input.subject }),
				...(input.preheader !== undefined && { preheader: input.preheader }),
				...(input.document !== undefined && {
					document: input.document as Prisma.InputJsonValue,
				}),
				...(input.delayHours !== undefined && { delayHours: input.delayHours }),
				...(input.condition !== undefined && {
					condition: (input.condition ?? undefined) as Prisma.InputJsonValue,
				}),
				...(input.x !== undefined && { x: input.x }),
				...(input.y !== undefined && { y: input.y }),
			},
			select: {
				id: true,
				campaignId: true,
				subject: true,
				preheader: true,
				document: true,
			},
		});

		return {
			id: node.id,
			campaignId: node.campaignId,
			changed: [node.id],
			lint: lintEmail({
				document: node.document,
				subject: node.subject,
				preheader: node.preheader,
			}),
		};
	}

	async schedule(input: { id: string; at: Date | null }) {
		const sendable = await assertSendable(this.db);
		if (!sendable.ok) throw new BadRequestException(sendable.reason);

		const campaign = await this.db.marketingCampaign.findUnique({
			where: { id: input.id },
			select: {
				kind: true,
				segmentId: true,
				nodes: { select: { subject: true, document: true, kind: true } },
			},
		});

		if (!campaign) throw new NotFoundException("No such campaign.");
		if (campaign.kind !== "BLAST") {
			throw new BadRequestException("A drip is activated, not scheduled.");
		}
		if (!campaign.segmentId) {
			throw new BadRequestException("Choose who this goes to first.");
		}

		const node = campaign.nodes.find((candidate) => candidate.kind === "EMAIL");
		const findings = lintEmail({
			document: node?.document,
			subject: node?.subject,
			preheader: null,
		});
		const errors = findings.filter((finding) => finding.level === "error");

		if (errors.length > 0) {
			throw new BadRequestException(
				errors.map((error) => error.message).join(" "),
			);
		}

		const at = input.at ?? new Date();

		await this.db.marketingCampaign.update({
			where: { id: input.id },
			data: { status: "SCHEDULED", scheduledAt: at },
		});

		const result = await materialise(this.db, input.id, { dueAt: at });

		return { scheduledAt: at, ...result };
	}

	async activate(id: string) {
		const sendable = await assertSendable(this.db);
		if (!sendable.ok) throw new BadRequestException(sendable.reason);

		const campaign = await this.db.marketingCampaign.findUnique({
			where: { id },
			select: {
				kind: true,
				nodes: {
					select: {
						id: true,
						kind: true,
						subject: true,
						document: true,
						delayHours: true,
						condition: true,
						templateId: true,
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

		if (!campaign) throw new NotFoundException("No such campaign.");
		if (campaign.kind !== "DRIP") {
			throw new BadRequestException("A blast is scheduled, not activated.");
		}

		const settings = await readMarketingSettings(this.db);
		const domain = settings.resendDomainId
			? await this.resend.readDomain(settings.resendDomainId)
			: null;

		const problems = validateGraph(campaign.nodes, campaign.edges, {
			openTracking: domain?.openTracking ?? false,
		});

		const errors = graphErrors(problems);
		if (errors.length > 0) {
			throw new BadRequestException(
				errors.map((problem) => problem.message).join(" "),
			);
		}

		await this.db.marketingCampaign.update({
			where: { id },
			data: { status: "ACTIVE", activatedAt: new Date(), pausedReason: null },
		});

		return { status: "ACTIVE" };
	}

	async pause(id: string, reason?: string) {
		await this.db.marketingCampaign.update({
			where: { id },
			data: { status: "PAUSED", pausedReason: reason ?? null },
		});
		return { status: "PAUSED" };
	}

	async resume(id: string, clocks: "restart" | "backlog") {
		const campaign = await this.db.marketingCampaign.findUnique({
			where: { id },
			select: { kind: true },
		});

		if (!campaign) throw new NotFoundException("No such campaign.");

		if (clocks === "restart") {
			const stale = await this.db.marketingEnrolment.findMany({
				where: {
					campaignId: id,
					status: "ACTIVE",
					nextDueAt: { lt: new Date() },
				},
				select: { id: true },
			});

			await this.db.marketingEnrolment.updateMany({
				where: { id: { in: stale.map((row) => row.id) } },
				data: { nextDueAt: new Date() },
			});
		}

		await this.db.marketingCampaign.update({
			where: { id },
			data: {
				status: campaign.kind === "DRIP" ? "ACTIVE" : "SENDING",
				pausedReason: null,
			},
		});

		return { status: campaign.kind === "DRIP" ? "ACTIVE" : "SENDING" };
	}

	async drain(id: string) {
		await this.db.marketingCampaign.update({
			where: { id },
			data: { status: "DRAINING" },
		});
		return { status: "DRAINING" };
	}

	async archive(id: string, mode: "refuse" | "drain" | "stop") {
		const active = await this.db.marketingEnrolment.count({
			where: { campaignId: id, status: "ACTIVE" },
		});

		if (active > 0 && mode === "refuse") {
			throw new ConflictException(
				`${active} people are still walking this campaign. Let them finish, or stop everybody now.`,
			);
		}

		if (active > 0 && mode === "drain") return this.drain(id);

		if (active > 0) {
			await this.db.marketingEnrolment.updateMany({
				where: { campaignId: id, status: "ACTIVE" },
				data: {
					status: "EXITED",
					exitKind: "ARCHIVED",
					exitReason: "the campaign was stopped",
					exitedAt: new Date(),
				},
			});

			await this.db.marketingSend.updateMany({
				where: { campaignId: id, status: "QUEUED" },
				data: { status: "SKIPPED", skipReason: "the campaign was stopped" },
			});
		}

		await this.db.marketingCampaign.update({
			where: { id },
			data: { status: "ARCHIVED", finishedAt: new Date() },
		});

		return { status: "ARCHIVED" };
	}

	async cancel(id: string) {
		await this.db.marketingSend.updateMany({
			where: { campaignId: id, status: "QUEUED" },
			data: { status: "SKIPPED", skipReason: "the campaign was cancelled" },
		});

		await this.db.marketingCampaign.update({
			where: { id },
			data: { status: "CANCELLED", finishedAt: new Date() },
		});

		return { status: "CANCELLED" };
	}

	async recipients(input: ListInput & { campaignId: string }) {
		const where: Prisma.MarketingSendWhereInput = {
			campaignId: input.campaignId,
		};

		const [rows, total] = await Promise.all([
			this.db.marketingSend.findMany({
				where,
				...paginate(input),
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					status: true,
					skipReason: true,
					sentAt: true,
					openedAt: true,
					clickedAt: true,
					repliedAt: true,
					recipient: { select: { address: true } },
					contactId: true,
				},
			}),
			this.db.marketingSend.count({ where }),
		]);

		return { rows, total, facetCounts: {} };
	}

	async enrolments(input: ListInput & { campaignId: string }) {
		const where: Prisma.MarketingEnrolmentWhereInput = {
			campaignId: input.campaignId,
		};

		const [rows, total] = await Promise.all([
			this.db.marketingEnrolment.findMany({
				where,
				...paginate(input),
				orderBy: { enrolledAt: "desc" },
				select: {
					id: true,
					status: true,
					pass: true,
					currentNodeId: true,
					nextDueAt: true,
					exitKind: true,
					exitReason: true,
					enrolledAt: true,
					contact: {
						select: { id: true, firstName: true, lastName: true, email: true },
					},
				},
			}),
			this.db.marketingEnrolment.count({ where }),
		]);

		return { rows, total, facetCounts: {} };
	}

	async enrol(campaignId: string, contactId: string) {
		const result = await enrolContact(this.db, campaignId, contactId);
		if (!result.ok) throw new BadRequestException(result.reason);
		return result;
	}

	async unenrol(enrolmentId: string) {
		await this.db.marketingEnrolment.update({
			where: { id: enrolmentId },
			data: {
				status: "EXITED",
				exitKind: "MANUAL",
				exitReason: "a rep removed them",
				exitedAt: new Date(),
			},
		});
		return { ok: true };
	}

	async declareWinner(input: { nodeId: string; winningEdgeId: string }) {
		const edges = await this.db.marketingCampaignEdge.findMany({
			where: { fromId: input.nodeId },
			select: { id: true },
		});

		if (!edges.some((edge) => edge.id === input.winningEdgeId)) {
			throw new BadRequestException("That path does not leave this split.");
		}

		const stillOnLoser = await this.db.marketingEnrolment.count({
			where: {
				status: "ACTIVE",
				currentNodeId: {
					in: edges
						.filter((e) => e.id !== input.winningEdgeId)
						.map((e) => e.id),
				},
			},
		});

		await this.db.$transaction(
			edges.map((edge) =>
				this.db.marketingCampaignEdge.update({
					where: { id: edge.id },
					data: { weight: edge.id === input.winningEdgeId ? 100 : 0 },
				}),
			),
		);

		return { ok: true, stillOnLoser };
	}

	async sendDirect(input: {
		contactId: string;
		templateId: string;
		userId: string;
		replyTo?: string | null;
	}) {
		const sendable = await assertSendable(this.db);
		if (!sendable.ok) throw new BadRequestException(sendable.reason);

		const [contact, template] = await Promise.all([
			this.db.contact.findUnique({
				where: { id: input.contactId },
				select: { email: true },
			}),
			this.db.marketingTemplate.findUnique({
				where: { id: input.templateId },
				select: { subject: true, document: true },
			}),
		]);

		if (!contact?.email)
			throw new BadRequestException("That contact has no email address.");
		if (!template) throw new NotFoundException("No such template.");

		const result = await queueDirect(this.db, {
			address: contact.email,
			contactId: input.contactId,
			subject: template.subject,
			document: template.document,
			replyTo: input.replyTo ?? null,
			requestedById: input.userId,
		});

		if (!result.ok) {
			throw new BadRequestException(
				result.reason === "unsubscribed"
					? "That person unsubscribed from marketing email, so nothing was sent."
					: `Nothing was sent: ${result.reason}.`,
			);
		}

		return result;
	}

	async sendCompany(input: {
		companyId: string;
		templateId: string;
		userId: string;
		replyTo?: string | null;
	}): Promise<{
		queued: number;
		skipped: Record<string, number>;
		total: number;
	}> {
		const sendable = await assertSendable(this.db);
		if (!sendable.ok) throw new BadRequestException(sendable.reason);

		const [contacts, template] = await Promise.all([
			this.db.contact.findMany({
				where: { companyId: input.companyId, email: { not: null } },
				select: { id: true, email: true },
			}),
			this.db.marketingTemplate.findUnique({
				where: { id: input.templateId },
				select: { subject: true, document: true },
			}),
		]);

		if (!template) throw new NotFoundException("No such template.");

		if (contacts.length === 0) {
			throw new BadRequestException(
				"Nobody at that company has an email address.",
			);
		}

		const skipped: Record<string, number> = {};
		let queued = 0;

		for (const contact of contacts) {
			const result = await queueDirect(this.db, {
				address: contact.email as string,
				contactId: contact.id,
				subject: template.subject,
				document: template.document,
				replyTo: input.replyTo ?? null,
				requestedById: input.userId,
			});

			if (result.ok) queued += 1;
			else skipped[result.reason] = (skipped[result.reason] ?? 0) + 1;
		}

		return { queued, skipped, total: contacts.length };
	}

	async enrolCompany(
		campaignId: string,
		companyId: string,
	): Promise<{ enrolled: number; refused: number; total: number }> {
		const contacts = await this.db.contact.findMany({
			where: { companyId, email: { not: null } },
			select: { id: true },
		});

		if (contacts.length === 0) {
			throw new BadRequestException(
				"Nobody at that company has an email address.",
			);
		}

		let enrolled = 0;
		let refused = 0;

		for (const contact of contacts) {
			const result = await enrolContact(this.db, campaignId, contact.id);
			if (result.ok) enrolled += 1;
			else refused += 1;
		}

		return { enrolled, refused, total: contacts.length };
	}
}
