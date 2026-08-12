import type { CarbonIcon } from "@crm/ui/components/icon";

export type AgentRecordKind =
	| "contact"
	| "company"
	| "deal"
	| "campaign"
	| "segment"
	| "template";

export type AgentRecord = { kind: AgentRecordKind; id: string };

export type AgentRecordFilter = {
	contactId?: string;
	companyId?: string;
	dealId?: string;
	campaignId?: string;
	segmentId?: string;
	templateId?: string;
};

type RecordCopy = {
	header: string;
	field:
		| "contactId"
		| "companyId"
		| "dealId"
		| "campaignId"
		| "segmentId"
		| "templateId";
	title: string;
	blurb: string;
	placeholder: string;
	suggestions: string[];
};

const COPY: Record<AgentRecordKind, RecordCopy> = {
	contact: {
		header: "x-crm-contact",
		field: "contactId",
		title: "Ask about this person",
		blurb:
			"Every step is shown as it happens — including the leads it throws away.",
		placeholder: "Are they still there?",
		suggestions: [
			"Who is this person?",
			"Are they still there?",
			"What should I know before a call?",
		],
	},
	company: {
		header: "x-crm-company",
		field: "companyId",
		title: "Ask about this company",
		blurb:
			"It reads their site and our own history with them, and shows its working.",
		placeholder: "What do they sell?",
		suggestions: [
			"What do they do?",
			"Who do we know here?",
			"What has changed recently?",
		],
	},
	deal: {
		header: "x-crm-deal",
		field: "dealId",
		title: "Ask about this deal",
		blurb:
			"It can read the thread, the meetings and the people on both sides of it.",
		placeholder: "Where has this stalled?",
		suggestions: [
			"Where does this stand?",
			"Who else should be involved?",
			"What is the risk here?",
		],
	},
	campaign: {
		header: "x-crm-campaign",
		field: "campaignId",
		title: "Build this campaign",
		blurb:
			"Describe the touches and it writes the graph. It edits drafts; you activate it.",
		placeholder:
			"Four touches over two weeks, branching on whether they opened.",
		suggestions: [
			"Add a wait and a follow-up after touch one",
			"Branch after the first email on whether they clicked",
			"Make touch two shorter",
		],
	},
	segment: {
		header: "x-crm-segment",
		field: "segmentId",
		title: "Describe who is in this segment",
		blurb: "It writes the rules. You can still drag them afterwards.",
		placeholder: "People who hit pricing twice and never replied.",
		suggestions: [
			"Everyone who visited pricing and has no open deal",
			"Signed up but never logged in",
			"Drop anyone we spoke to this month",
		],
	},
	template: {
		header: "x-crm-template",
		field: "templateId",
		title: "Write this email",
		blurb:
			"It writes the body only. The header and footer come from the shell.",
		placeholder: "Make this shorter and lead with the customer.",
		suggestions: [
			"Make this shorter",
			"Lead with the customer, not us",
			"Add a closing line about the Thursday walkthrough",
		],
	},
};

export function recordCopy(kind: AgentRecordKind): RecordCopy {
	return COPY[kind];
}

export function recordHeader(record: AgentRecord): Record<string, string> {
	return { [COPY[record.kind].header]: record.id };
}

export function recordFilter(record: AgentRecord): AgentRecordFilter {
	return { [COPY[record.kind].field]: record.id };
}

export type { CarbonIcon };
