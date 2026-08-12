import { Spinner } from "@crm/ui/components/spinner";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { ShellEditor } from "./shell-editor";
import { TemplateEditor } from "./template-editor";

export const metadata: Metadata = { title: "Template" };

function Loading() {
	return (
		<div className="flex min-h-0 flex-1 items-center justify-center">
			<Spinner />
		</div>
	);
}

export default function TemplatePage({
	params,
}: PageProps<"/[slug]/marketing/templates/[templateId]">) {
	return (
		<Suspense fallback={<Loading />}>
			<Editor params={params} />
		</Suspense>
	);
}

async function Editor({
	params,
}: Pick<PageProps<"/[slug]/marketing/templates/[templateId]">, "params">) {
	const { templateId } = await params;

	const shell = await getServerQueryClient().fetchQuery(
		getServerTrpc().marketingTemplates.shellById.queryOptions({
			id: templateId,
		}),
	);

	return shell ? (
		<ShellEditor shellId={templateId} />
	) : (
		<TemplateEditor templateId={templateId} />
	);
}
