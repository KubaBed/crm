import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import Chat from "@carbon/icons-react/es/Chat";
import Email from "@carbon/icons-react/es/Email";
import Events from "@carbon/icons-react/es/Events";
import MagicWand from "@carbon/icons-react/es/MagicWand";
import Phone from "@carbon/icons-react/es/Phone";
import Task from "@carbon/icons-react/es/Task";
import type { ActivityType } from "@crm/db/enums";
import type { CarbonIcon } from "@crm/ui/components/icon";

type ActivityPresentation = Record<
	ActivityType,
	{ icon: CarbonIcon; label: string }
>;

const PRESENTATION: ActivityPresentation = {
	NOTE: { icon: Chat, label: "Notatka" },
	CALL: { icon: Phone, label: "Telefon" },
	EMAIL: { icon: Email, label: "E-mail" },
	MEETING: { icon: Events, label: "Spotkanie" },
	TASK: { icon: Task, label: "Zadanie" },
	STAGE_CHANGE: { icon: ArrowRight, label: "Zmiana etapu" },
	ENRICHMENT: { icon: MagicWand, label: "Uzupełnienie danych" },
};

export function activityLabel(type: ActivityType): string {
	return PRESENTATION[type].label;
}

export function activityIcon(type: ActivityType): CarbonIcon {
	return PRESENTATION[type].icon;
}
