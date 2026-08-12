"use client";

import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";

const STEP_LABEL: Record<string, string> = {
	connect: "connect Resend",
	identity: "set the from address and postal address",
	domain: "verify a sending domain",
	branding: "build the header and footer",
	test: "send yourself a test",
};

export function MarketingSettingsForm() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const settings = useQuery(trpc.marketing.settings.queryOptions());
	const domain = useQuery(trpc.marketing.domain.queryOptions());

	const [fromName, setFromName] = useState("");
	const [fromAddress, setFromAddress] = useState("");
	const [replyTo, setReplyTo] = useState("");
	const [postalAddress, setPostalAddress] = useState("");
	const [key, setKey] = useState("");

	const fromNameId = useId();
	const fromAddressId = useId();
	const replyToId = useId();
	const postalId = useId();
	const keyId = useId();

	const data = settings.data;

	useEffect(() => {
		if (!data) return;
		setFromName(data.fromName ?? "");
		setFromAddress(data.fromAddress ?? "");
		setReplyTo(data.replyTo ?? "");
		setPostalAddress(data.postalAddress ?? "");
	}, [data]);

	const invalidate = () =>
		queryClient.invalidateQueries({
			queryKey: trpc.marketing.settings.queryKey(),
		});

	const saveKey = useMutation(
		trpc.marketing.saveKey.mutationOptions({
			onSuccess: (result) => {
				setKey("");
				toast.success(
					result.state === "valid"
						? "Resend is connected."
						: "Saved. Resend did not confirm the key, so watch the first send.",
				);
				void invalidate();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const saveIdentity = useMutation(
		trpc.marketing.saveIdentity.mutationOptions({
			onSuccess: () => {
				toast.success("Saved.");
				void invalidate();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (settings.isPending) return <Spinner />;
	if (!data) return null;

	return (
		<div className="flex max-w-2xl flex-col gap-6">
			{!data.sendable.ok ? (
				<Card>
					<CardHeader>
						<CardTitle>Marketing cannot send yet</CardTitle>
						<CardDescription>
							Still to do:{" "}
							{data.sendable.missing
								.map((step) => STEP_LABEL[step] ?? step)
								.join(", ")}
							.
						</CardDescription>
					</CardHeader>
				</Card>
			) : null}

			<Card>
				<CardHeader>
					<CardTitle>Resend</CardTitle>
					<CardDescription>
						Resend carries the mail, signs it, and reports what happened to it.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={keyId}>API key</FieldLabel>
							<Input
								id={keyId}
								value={key}
								placeholder={data.apiKeyMask ?? "re_…"}
								onChange={(event) => setKey(event.target.value)}
								autoComplete="off"
							/>
						</Field>
						<Button
							className="self-start"
							disabled={!key.trim() || saveKey.isPending}
							onClick={() => saveKey.mutate({ key })}
						>
							{saveKey.isPending ? <Spinner /> : null}
							{data.connected ? "Replace key" : "Connect"}
						</Button>
					</FieldGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Who it comes from</CardTitle>
					<CardDescription>
						The reply-to defaults to whoever sent it. A postal address is
						required by law on marketing email, and the compiler adds it to
						every send.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={fromNameId}>From name</FieldLabel>
							<Input
								id={fromNameId}
								value={fromName}
								onChange={(event) => setFromName(event.target.value)}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor={fromAddressId}>From address</FieldLabel>
							<Input
								id={fromAddressId}
								value={fromAddress}
								onChange={(event) => setFromAddress(event.target.value)}
								placeholder="hello@send.example.com"
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor={replyToId}>Fallback reply-to</FieldLabel>
							<Input
								id={replyToId}
								value={replyTo}
								onChange={(event) => setReplyTo(event.target.value)}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor={postalId}>Postal address</FieldLabel>
							<Input
								id={postalId}
								value={postalAddress}
								onChange={(event) => setPostalAddress(event.target.value)}
								placeholder="Comp AI · 2261 Market Street, San Francisco"
							/>
						</Field>
						<Button
							className="self-start"
							disabled={saveIdentity.isPending}
							onClick={() =>
								saveIdentity.mutate({
									fromName,
									fromAddress,
									replyTo: replyTo || null,
									postalAddress,
								})
							}
						>
							{saveIdentity.isPending ? <Spinner /> : null}
							Save
						</Button>
					</FieldGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Sending domain</CardTitle>
					<CardDescription>
						Resend issues the DNS records and tells us when each one resolves.
						We render what it says rather than composing records ourselves.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<p className="text-muted-foreground text-sm">
						{domain.data?.name
							? `${domain.data.name} — ${domain.data.status.replace(/_/g, " ")}`
							: "No sending domain yet."}
					</p>
					{(domain.data?.records ?? []).map((record) => (
						<div
							key={`${record.type}-${record.name}`}
							className="flex flex-col gap-1 rounded-md border p-3 text-xs"
						>
							<span className="font-medium">
								{record.type} · {record.name}
							</span>
							<span className="break-all text-muted-foreground">
								{record.value}
							</span>
							{record.status ? (
								<span className="text-muted-foreground">{record.status}</span>
							) : null}
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Open and click tracking</CardTitle>
					<CardDescription>
						These live on the Resend domain, not here. Apple Mail opens every
						email before a person does, so the open rate reads high whether or
						not anybody looked. Click tracking rewrites every link in the body,
						including an in-body unsubscribe link — the List-Unsubscribe header
						is untouched.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						Opens {domain.data?.openTracking ? "on" : "off"} · Clicks{" "}
						{domain.data?.clickTracking ? "on" : "off"}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
