import { Spinner } from "@crm/ui/components/spinner";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ShellEditor } from "./shell-editor";

export const metadata: Metadata = { title: "The shell" };

function Loading() {
	return (
		<div className="flex min-h-0 flex-1 items-center justify-center">
			<Spinner />
		</div>
	);
}

export default function ShellPage() {
	return (
		<Suspense fallback={<Loading />}>
			<ShellEditor />
		</Suspense>
	);
}
