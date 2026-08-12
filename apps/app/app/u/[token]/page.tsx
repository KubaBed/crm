import { db } from "@crm/db";
import { unsubscribeByToken } from "@crm/db/marketing";
import { readWorkspaceIdentity } from "@crm/db/workspace";
import { Button } from "@crm/ui/components/button";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Unsubscribe" };

export default function UnsubscribePage({ params }: PageProps<"/u/[token]">) {
	return (
		<Suspense fallback={<Shell />}>
			<Unsubscribed params={params} />
		</Suspense>
	);
}

async function Unsubscribed({
	params,
}: Pick<PageProps<"/u/[token]">, "params">) {
	await connection();
	const { token } = await params;

	const [result, workspace] = await Promise.all([
		unsubscribeByToken(db, token).catch(() => null),
		readWorkspaceIdentity(db).catch(() => null),
	]);

	const name = workspace?.name ?? "this workspace";

	return (
		<main className="flex min-h-svh items-center justify-center bg-muted px-6 py-16">
			<div className="flex w-full max-w-md flex-col gap-4 rounded-lg border bg-background p-8">
				<h1 className="font-semibold text-xl tracking-tight">
					You are unsubscribed
				</h1>

				<p className="text-muted-foreground text-sm">
					{result
						? `${result.address} will get no more marketing email from ${name}.`
						: `That address will get no more marketing email from ${name}.`}
				</p>

				<p className="text-muted-foreground text-sm">
					This does not stop a reply to a conversation you started, and it does
					not close your account.
				</p>

				<form
					action={async () => {
						"use server";
					}}
				>
					<Button variant="outline" type="submit" disabled>
						Pause for 90 days instead
					</Button>
				</form>
			</div>
		</main>
	);
}

function Shell() {
	return (
		<main className="flex min-h-svh items-center justify-center bg-muted px-6 py-16">
			<div className="flex w-full max-w-md flex-col gap-4 rounded-lg border bg-background p-8">
				<h1 className="font-semibold text-xl tracking-tight">
					You are unsubscribed
				</h1>
			</div>
		</main>
	);
}
