export type SyncDeadline = {
	expired(): boolean;
};

export const NO_DEADLINE: SyncDeadline = { expired: () => false };

export function deadlineIn(ms: number): SyncDeadline {
	const at = Date.now() + ms;
	return { expired: () => Date.now() >= at };
}
