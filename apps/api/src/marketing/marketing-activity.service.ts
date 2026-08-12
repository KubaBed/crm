import { ActivityType, type Db, type Prisma } from "@crm/db";
import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";

export type FiledSend = {
	contactId: string;
	subject: string | null;
	campaignName: string | null;
	sentAt: Date;
};

@Injectable()
export class MarketingActivityService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	/**
	 * One row per send, so a rep opening a contact sees the marketing email
	 * beside the sales one. It never touches `lastActivityAt`: an email we sent
	 * is not the contact being active, and bumping it would reset "Quiet for 60
	 * days" with our own campaign.
	 */
	async file(sends: FiledSend[]): Promise<number> {
		if (sends.length === 0) return 0;

		const authors = await this.authors(sends.map((send) => send.contactId));
		if (authors.size === 0) return 0;

		const rows: Prisma.ActivityCreateManyInput[] = [];

		for (const send of sends) {
			const createdById = authors.get(send.contactId);
			if (!createdById) continue;

			rows.push({
				type: ActivityType.EMAIL,
				subject: send.subject?.trim() || "A marketing email",
				body: send.campaignName,
				contactId: send.contactId,
				occurredAt: send.sentAt,
				createdById,
				meta: { automated: true, source: "marketing" },
			});
		}

		if (rows.length === 0) return 0;

		const result = await this.db.activity.createMany({ data: rows });
		return result.count;
	}

	private async authors(contactIds: string[]): Promise<Map<string, string>> {
		const unique = [...new Set(contactIds)];
		if (unique.length === 0) return new Map();

		const contacts = await this.db.contact.findMany({
			where: { id: { in: unique } },
			select: { id: true, ownerId: true },
		});

		const unowned = contacts.some((contact) => contact.ownerId === null);

		const fallback = unowned
			? await this.db.user.findFirst({ select: { id: true } })
			: null;

		const authors = new Map<string, string>();

		for (const contact of contacts) {
			const author = contact.ownerId ?? fallback?.id ?? null;
			if (author) authors.set(contact.id, author);
		}

		return authors;
	}
}
