const MEGABYTE = 1024 * 1024;

export const AGENT_ATTACHMENTS = {
	image: { maxBytes: 4 * MEGABYTE, maxCount: 4 },
} as const;

export type DraftAttachment = {
	id: string;
	dataUrl: string;
	mediaType: string;
	filename: string | null;
	size: number;
};

export function isImage(file: File): boolean {
	return file.type.startsWith("image/");
}

export function tooLarge(file: File): boolean {
	return file.size > AGENT_ATTACHMENTS.image.maxBytes;
}

export function sizeLimitLabel(): string {
	return `${Math.round(AGENT_ATTACHMENTS.image.maxBytes / MEGABYTE)} MB`;
}

export function toDraftAttachment(file: File): Promise<DraftAttachment> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(reader.error);
		reader.onload = () =>
			resolve({
				id: crypto.randomUUID(),
				dataUrl: String(reader.result),
				mediaType: file.type,
				filename: file.name || null,
				size: file.size,
			});
		reader.readAsDataURL(file);
	});
}
