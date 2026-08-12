import type { Db, Prisma } from "@crm/db";
import {
	EMPTY_DOCUMENT,
	emailDocument,
	lintEmail,
	readDocument,
} from "@crm/email";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { blankToNull } from "../crm/values";
import { InjectDatabase } from "../database/database.constants";
import { type ListInput, paginate, resolveOrderBy } from "../trpc/list-input";
import { MarketingComposeService } from "./marketing-compose.service";

@Injectable()
export class MarketingTemplatesService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly compose: MarketingComposeService,
	) {}

	async list(input: ListInput) {
		const where: Prisma.MarketingTemplateWhereInput = {
			archivedAt: null,
			...(input.q && { name: { contains: input.q, mode: "insensitive" } }),
		};

		const orderBy =
			resolveOrderBy<Prisma.MarketingTemplateOrderByWithRelationInput>(
				input,
				{
					name: (dir) => ({ name: dir }),
					updatedAt: (dir) => ({ updatedAt: dir }),
				},
				{ updatedAt: "desc" },
			);

		const [rows, total] = await Promise.all([
			this.db.marketingTemplate.findMany({
				where,
				orderBy,
				...paginate(input),
				select: {
					id: true,
					name: true,
					subject: true,
					updatedAt: true,
					_count: { select: { nodes: true } },
				},
			}),
			this.db.marketingTemplate.count({ where }),
		]);

		return {
			rows: rows.map((row) => ({
				id: row.id,
				name: row.name,
				subject: row.subject,
				usedBy: row._count.nodes,
				updatedAt: row.updatedAt,
			})),
			total,
			facetCounts: {},
		};
	}

	async byId(id: string) {
		const row = await this.db.marketingTemplate.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				subject: true,
				preheader: true,
				document: true,
				headerId: true,
				footerId: true,
				updatedAt: true,
				_count: { select: { nodes: true } },
			},
		});

		if (!row) throw new NotFoundException("No such template.");

		return {
			...row,
			usedBy: row._count.nodes,
			lint: lintEmail({
				document: row.document,
				subject: row.subject,
				preheader: row.preheader,
			}),
		};
	}

	async create(input: { name: string; subject?: string; document?: unknown }) {
		const name = blankToNull(input.name);
		if (!name) throw new BadRequestException("Give the template a name.");

		return this.db.marketingTemplate.create({
			data: {
				name,
				subject: input.subject ?? "",
				document: (input.document ?? EMPTY_DOCUMENT) as Prisma.InputJsonValue,
			},
			select: { id: true },
		});
	}

	async update(input: {
		id: string;
		name?: string;
		subject?: string;
		preheader?: string | null;
		document?: unknown;
	}) {
		if (input.document !== undefined) {
			const parsed = emailDocument.safeParse(input.document);
			if (!parsed.success) {
				throw new BadRequestException("That email content cannot be read.");
			}
		}

		return this.db.marketingTemplate.update({
			where: { id: input.id },
			data: {
				...(input.name && { name: input.name }),
				...(input.subject !== undefined && { subject: input.subject }),
				...(input.preheader !== undefined && {
					preheader: input.preheader ? blankToNull(input.preheader) : null,
				}),
				...(input.document !== undefined && {
					document: input.document as Prisma.InputJsonValue,
				}),
			},
			select: { id: true },
		});
	}

	async duplicate(id: string) {
		const source = await this.db.marketingTemplate.findUnique({
			where: { id },
			select: { name: true, subject: true, preheader: true, document: true },
		});

		if (!source) throw new NotFoundException("No such template.");

		return this.db.marketingTemplate.create({
			data: {
				name: `${source.name} copy`,
				subject: source.subject,
				preheader: source.preheader,
				document: source.document as Prisma.InputJsonValue,
			},
			select: { id: true },
		});
	}

	async archive(id: string) {
		return this.db.marketingTemplate.update({
			where: { id },
			data: { archivedAt: new Date() },
			select: { id: true },
		});
	}

	async preview(input: {
		document: unknown;
		subject?: string | null;
		preheader?: string | null;
		contactId?: string | null;
	}) {
		const context = await this.compose.contextFor(input.contactId ?? null);

		const composed = await this.compose.compose({
			document: input.document,
			subject: input.subject ?? "",
			preheader: input.preheader,
			token: "preview",
			context,
		});

		const lint = lintEmail({
			document: input.document,
			subject: input.subject,
			preheader: input.preheader,
		});

		if (!composed) {
			return {
				html: null,
				text: null,
				lint,
				blocked:
					"Set a postal address in Marketing settings, and APP_URL for this install, before anything can be previewed or sent.",
			};
		}

		return { html: composed.html, text: composed.text, lint, blocked: null };
	}

	async partials() {
		const rows = await this.db.marketingPartial.findMany({
			where: { archivedAt: null },
			select: {
				id: true,
				kind: true,
				name: true,
				isDefault: true,
				document: true,
			},
			orderBy: [{ kind: "asc" }, { isDefault: "desc" }],
		});

		return rows.map((row) => ({
			...row,
			document: readDocument(row.document),
		}));
	}

	async options() {
		return this.db.marketingTemplate.findMany({
			where: { archivedAt: null },
			select: { id: true, name: true, subject: true },
			orderBy: { name: "asc" },
		});
	}
}
