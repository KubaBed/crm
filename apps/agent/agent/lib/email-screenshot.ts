import puppeteer, { type Page } from "puppeteer-core";
import { EMAIL_REVIEW } from "./email-review-config";

export type ViewName = "desktop" | "mobile";

export type NamedViewport = {
	view: ViewName;
	width: number;
	height: number;
};

export type ImageBox = {
	src: string;
	top: number;
	left: number;
	width: number;
	height: number;
	naturalWidth: number;
	naturalHeight: number;
};

export type ViewMeasurements = {
	view: ViewName;
	width: number;
	foldHeight: number;
	pageHeight: number;
	horizontalOverflowPx: number;
	firstScreenTextCharacters: number;
	images: ImageBox[];
};

export type Screen = {
	measurements: ViewMeasurements;
	screenshotBase64: string;
};

export async function captureEmail(
	html: string,
	viewports: readonly NamedViewport[],
	executablePath: string,
): Promise<Screen[]> {
	const browser = await puppeteer.launch({
		executablePath,
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-gpu",
			"--hide-scrollbars",
			"--disable-dev-shm-usage",
		],
		timeout: EMAIL_REVIEW.capture.launchTimeoutMs,
	});

	try {
		const screens: Screen[] = [];

		for (const viewport of viewports) {
			const page = await browser.newPage();

			try {
				await page.setJavaScriptEnabled(false);
				await page.setViewport({
					width: viewport.width,
					height: viewport.height,
				});
				await page
					.setContent(html, {
						waitUntil: "load",
						timeout: EMAIL_REVIEW.capture.loadTimeoutMs,
					})
					.catch(() => undefined);
				await waitForImages(page);

				const measurements = await measure(page, viewport);
				const screenshotBase64 = await screenshot(page, measurements);

				screens.push({ measurements, screenshotBase64 });
			} finally {
				await page.close();
			}
		}

		return screens;
	} finally {
		await browser.close();
	}
}

async function waitForImages(page: Page): Promise<void> {
	const deadline = Date.now() + EMAIL_REVIEW.capture.loadTimeoutMs;

	while (Date.now() < deadline) {
		const settled = await page
			.evaluate(() => Array.from(document.images).every((img) => img.complete))
			.catch(() => true);

		if (settled) return;

		await new Promise((resolve) =>
			setTimeout(resolve, EMAIL_REVIEW.capture.imagePollMs),
		);
	}
}

async function measure(
	page: Page,
	viewport: NamedViewport,
): Promise<ViewMeasurements> {
	const raw = await page.evaluate((foldHeight: number) => {
		const root = document.documentElement;

		const images = Array.from(document.images).map((img) => {
			const rect = img.getBoundingClientRect();
			return {
				src: img.currentSrc || img.src,
				top: Math.round(rect.top + window.scrollY),
				left: Math.round(rect.left + window.scrollX),
				width: Math.round(rect.width),
				height: Math.round(rect.height),
				naturalWidth: img.naturalWidth,
				naturalHeight: img.naturalHeight,
			};
		});

		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
		);
		let firstScreenTextCharacters = 0;

		while (walker.nextNode()) {
			const text = walker.currentNode.textContent?.trim() ?? "";
			if (!text) continue;

			const range = document.createRange();
			range.selectNodeContents(walker.currentNode);
			const rect = range.getBoundingClientRect();

			if (rect.height > 0 && rect.top + window.scrollY < foldHeight) {
				firstScreenTextCharacters += text.length;
			}
		}

		return {
			pageHeight: root.scrollHeight,
			horizontalOverflowPx: Math.max(0, root.scrollWidth - window.innerWidth),
			firstScreenTextCharacters,
			images,
		};
	}, viewport.height);

	return {
		view: viewport.view,
		width: viewport.width,
		foldHeight: viewport.height,
		...raw,
	};
}

async function screenshot(
	page: Page,
	measurements: ViewMeasurements,
): Promise<string> {
	const height = Math.max(
		measurements.foldHeight,
		Math.min(measurements.pageHeight, EMAIL_REVIEW.capture.maxHeightPx),
	);

	return page.screenshot({
		type: "jpeg",
		quality: EMAIL_REVIEW.capture.jpegQuality,
		encoding: "base64",
		clip: { x: 0, y: 0, width: measurements.width, height },
	});
}
