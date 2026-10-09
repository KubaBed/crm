export const DEAL_VIEW_OPTIONS = [
	{ value: "active", label: "W trakcie" },
	{ value: "outreach", label: "Outreach" },
	{ value: "open", label: "Wszystkie otwarte" },
	{ value: "closed", label: "Zamknięte" },
];

export const BOARD_VIEW_OPTIONS = DEAL_VIEW_OPTIONS.filter(
	(option) => option.value !== "closed",
);
