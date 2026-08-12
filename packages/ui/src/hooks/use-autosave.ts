"use client";

import { useEffect, useRef, useState } from "react";

export type AutosaveState = "idle" | "saving" | "saved";

export function useAutosave<TValue>(
	value: TValue,
	save: (value: TValue) => void,
	options: { enabled?: boolean; delayMs?: number } = {},
) {
	const { enabled = true, delayMs = 800 } = options;

	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const latest = useRef(save);
	const pending = useRef<TValue | null>(null);

	latest.current = save;

	useEffect(() => {
		if (!enabled) return;

		if (timer.current) clearTimeout(timer.current);
		pending.current = value;

		timer.current = setTimeout(() => {
			timer.current = null;
			const next = pending.current;
			pending.current = null;
			if (next !== null) latest.current(next);
		}, delayMs);

		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, [value, enabled, delayMs]);

	useEffect(
		() => () => {
			if (!timer.current) return;
			clearTimeout(timer.current);
			const next = pending.current;
			if (next !== null) latest.current(next);
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
