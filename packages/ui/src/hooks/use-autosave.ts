"use client";

import { useEffect, useRef, useState } from "react";

export type AutosaveState = "idle" | "saving" | "saved";

export function useAutosave<TValue>(
	value: TValue,
	save: (value: TValue) => void,
	options: { enabled?: boolean; delayMs?: number } = {},
) {
	const { enabled = true, delayMs = 800 } = options;

	const key = JSON.stringify(value ?? null);

	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const latest = useRef(save);
	const draft = useRef(value);
	const written = useRef<string | null>(null);

	latest.current = save;
	draft.current = value;

	useEffect(() => {
		if (!enabled) return;
		if (written.current === null) {
			written.current = key;
			return;
		}
		if (written.current === key) return;

		if (timer.current) clearTimeout(timer.current);

		timer.current = setTimeout(() => {
			timer.current = null;
			written.current = key;
			latest.current(draft.current);
		}, delayMs);

		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, [key, enabled, delayMs]);

	useEffect(
		() => () => {
			if (!timer.current) return;
			clearTimeout(timer.current);
			latest.current(draft.current);
		},
		[],
	);
}

export function useSaveStatus(pending: boolean, holdMs = 2000): AutosaveState {
	const [state, setState] = useState<AutosaveState>("idle");
	const saved = useRef(false);

	useEffect(() => {
		if (pending) {
			saved.current = true;
			setState("saving");
			return;
		}

		if (!saved.current) return;
		saved.current = false;
		setState("saved");

		const timer = setTimeout(() => setState("idle"), holdMs);
		return () => clearTimeout(timer);
	}, [pending, holdMs]);

	return state;
}

export function saveLabel(state: AutosaveState): string {
	if (state === "saving") return "Saving…";
	return state === "saved" ? "Saved" : "";
}
