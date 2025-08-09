import { describe, it, beforeEach, afterEach, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import EleventyVite from "../EleventyVite.js";

const outputPath = ".test-output";
const htmlFilePath = path.join(outputPath, "index.html");
const tempFolderName = ".test-11ty-vite";

const mockEleventyConfig = {
	directories: { output: outputPath },
	logger: {
		logWithOptions: () => {},
	},
};
const pluginOptions = {
	tempFolderName,
	viteOptions: {
		logLevel: "silent",
	},
};

describe("EleventyVite", () => {
	beforeEach(async () => {
		await fs.rm(outputPath, { recursive: true, force: true }).catch(() => {});
		await fs.mkdir(outputPath, { recursive: true });
		await fs.writeFile(path.join(outputPath, "style.css"), "body { color: red; }");
		await fs.writeFile(
			htmlFilePath,
			`<html><head><link rel="stylesheet" href="style.css"></head><body></body></html>`,
		);
	});

	afterEach(async () => {
		await fs.rm(outputPath, { recursive: true, force: true }).catch(() => {});
		await fs.rm(tempFolderName, { recursive: true, force: true }).catch(() => {});
	});

	it("constructor merges options", () => {
		const plugin = new EleventyVite(mockEleventyConfig, pluginOptions);
		expect(plugin.options.tempFolderName).toBe(tempFolderName);
		expect(plugin.options.viteOptions).toBeTruthy();
		expect(plugin.options.viteOptions.appType).toBe("mpa");
	});

	it("getServer returns a Vite dev server", async () => {
		const plugin = new EleventyVite(mockEleventyConfig, pluginOptions);
		const server = await plugin.getServer();
		expect(server.middlewares).toBeTruthy();
		await server.close();
	});

	it("getIgnoreDirectory returns correct path", () => {
		const plugin = new EleventyVite(mockEleventyConfig, pluginOptions);
		expect(plugin.getIgnoreDirectory()).toBe(path.join(tempFolderName, "**"));
	});

	it("outputs HTML file to output path during build", async () => {
		const plugin = new EleventyVite(mockEleventyConfig, pluginOptions);
		const input = [{ outputPath: htmlFilePath }];

		await plugin.runBuild(input);

		const stat = await fs.stat(htmlFilePath);
		expect(stat.isFile()).toBe(true);
	});

	it("runBuild runs Vite build and cleans up", async () => {
		const plugin = new EleventyVite(mockEleventyConfig, pluginOptions);
		const input = [{ outputPath: htmlFilePath }];
		await expect(plugin.runBuild(input)).resolves.not.toThrow();

		const exists = await fs.stat(tempFolderName).then(
			() => true,
			() => false,
		);
		expect(exists).toBe(false);
	});

	it("references CSS file with hash in HTML after build", async () => {
		const plugin = new EleventyVite(mockEleventyConfig, pluginOptions);
		const input = [{ outputPath: htmlFilePath }];

		await plugin.runBuild(input);

		const html = await fs.readFile(htmlFilePath, "utf8");
		const match = html.match(
			/<link[^>]+href=["']([^"']*assets\/index-[a-zA-Z0-9]+\.css)["'][^>]*>/,
		);
		expect(match).toBeTruthy();

		const cssPath = match[1];
		const cssFile = path.join(outputPath, cssPath);
		const stat = await fs.stat(cssFile);
		expect(stat.isFile()).toBe(true);
	});

	it("getEleventyRollupOptionsInput returns correct input object", () => {
		const entries = [
			{ outputPath: `${outputPath}index.html` },
			{ outputPath: `${outputPath}posts/index.html` },
			{ outputPath: `${outputPath}posts/hello/index.html` },
			{ outputPath: `${outputPath}robots.txt` },
			{ outputPath: false },
		];

		const plugin = new EleventyVite(mockEleventyConfig, pluginOptions);

		const result = plugin.getEleventyRollupOptionsInput(entries);

		expect(result).toEqual({
			index: path.resolve(`${tempFolderName}/index.html`),
			"posts/index": path.resolve(`${tempFolderName}/posts/index.html`),
			"posts/hello/index": path.resolve(`${tempFolderName}/posts/hello/index.html`),
		});
	});

	it("getUserRollupOptionsInput handles array input", () => {
		const plugin = new EleventyVite(mockEleventyConfig, pluginOptions);
		const result = plugin.getUserRollupOptionsInput(["script.js", "styles/main.css"]);

		expect(result).toEqual({
			script: "script.js",
			"styles/main": "styles/main.css",
		});
	});

	it("getUserRollupOptionsInput handles object input", () => {
		const plugin = new EleventyVite(mockEleventyConfig, pluginOptions);
		const result = plugin.getUserRollupOptionsInput({
			script: "script.js",
			"styles/main": "styles/main.css",
		});

		expect(result).toEqual({
			script: "script.js",
			"styles/main": "styles/main.css",
		});
	});

	it("getUserRollupOptionsInput handles string input", () => {
		const plugin = new EleventyVite(mockEleventyConfig, pluginOptions);
		const result = plugin.getUserRollupOptionsInput("styles/main.css");

		expect(result).toEqual({
			"styles/main": "styles/main.css",
		});
	});
});
