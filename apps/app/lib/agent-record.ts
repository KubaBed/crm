import type { CarbonIcon } from "@crm/ui/components/icon";

export type AgentRecordKind =
	| "contact"
	| "company"
	| "deal"
	| "campaign"
	| "segment"
	| "template"
	| "shell";

export type AgentRecord = { kind: AgentRecordKind; id: string };

export type AgentRecordFilter = {
	contactId?: string;
	companyId?: string;
	dealId?: string;
	campaignId?: string;
	segmentId?: string;
	templateId?: string;
	shellId?: string;
};

type RecordCopy = {
	header: string;
	field:
		| "contactId"
		| "companyId"
		| "dealId"
		| "campaignId"
		| "segmentId"
		| "templateId"
		| "shellId";
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
			"Describe the steps and it builds the flow. It edits drafts; you activate it.",
		placeholder:
			"Four emails over two weeks, branching on whether they opened.",
		suggestions: [
			"Add a wait and a follow-up after the first email",
			"Branch after the first email on whether they clicked",
			"Make the second email shorter",
		],
	},
	segment: {
		header: "x-crm-segment",
		field: "segmentId",
		title: "Describe who is in this segment",
		blurb:
			"Say it in plain English. The agent writes the rules on the left, and you can still edit every one yourself.",
		placeholder: "People who hit pricing twice and never replied.",
		suggestions: [
			"Everyone who visited pricing and has no open deal",
			"Signed up but never logged in",
			"Drop anyone we spoke to this month",
		],
	},
	shell: {
		header: "x-crm-shell",
		field: "shellId",
		title: "Write this header or footer",
		blurb:
			"Every email carries it. The postal address and the unsubscribe link are added on every send and cannot move.",
		placeholder: "Put our logo at the top and a thin rule under it.",
		suggestions: [
			"Put our logo at the top",
			"Add a line about why they are getting this",
			"Make the footer shorter",
		],
	},
	template: {
		header: "x-crm-template",
		field: "templateId",
		title: "Write this email",
		blurb:
			"It writes the body only. The header and footer come from your default template.",
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
