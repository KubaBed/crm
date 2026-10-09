export function plural(
	count: number,
	one: string,
	few: string,
	many: string,
): string {
	if (count === 1) return `${count} ${one}`;
	const lastDigit = count % 10;
	const lastTwo = count % 100;
	const isFew =
		lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14);
	return `${count} ${isFew ? few : many}`;
}
