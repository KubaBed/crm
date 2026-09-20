import { Injectable } from "@nestjs/common";
import { NO_DEADLINE, type SyncDeadline } from "../mailbox/sync-deadline";
import { SyncStateService } from "../mailbox/sync-state.service";
import {
	MICROSOFT_SYNC_SOURCES,
	type MicrosoftSyncSource,
} from "./microsoft.constants";
import { OutlookSyncService } from "./outlook-sync.service";

@Injectable()
export class MicrosoftSyncService {
	constructor(
		private readonly state: SyncStateService,
		private readonly outlook: OutlookSyncService,
	) {}

	async runOne(
		userId: string,
		source: MicrosoftSyncSource,
		deadline: SyncDeadline = NO_DEADLINE,
	) {
		const row = await this.state.get(userId, source);
		if (!row) return null;

		return this.outlook.sync(row, deadline);
	}

	async runForUser(userId: string): Promise<void> {
		for (const source of MICROSOFT_SYNC_SOURCES) {
			await this.runOne(userId, source);
		}
	}
}
