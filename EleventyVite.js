import { promises as fsp } from "node:fs";
import path from "node:path";
import { DeepCopy, Merge } from "@11ty/eleventy-utils";
import { build, createServer } from "vite";

/** @type {Required<import(".eleventy.js").EleventyViteOptions>} */
const DEFAULT_OPTIONS = {
	tempFolderName: ".11ty-vite",
	viteOptions: {
		clearScreen: false,
		appType: "mpa",
		server: {
			middlewareMode: true,
		},
		build: {
			emptyOutDir: true,
			rollupOptions: {}, // we use this to inject input for MPA build below
		},
		resolve: {
			alias: {
				// Allow references to `node_modules` directly for bundling.
				"/node_modules": path.resolve(".", "node_modules"),
				// Note that bare module specifiers are also supported
			},
		},
	},
};

export default class EleventyVite {
	static LOGGER_PREFIX = "[11ty/eleventy-plugin-vite]";

	/** @type {import("@11ty/eleventy/src/Util/ProjectDirectories.js").default} */
	directories;

	/** @type {import("@11ty/eleventy/src/Util/ConsoleLogger.js").default} */
	logger;

	/** @type {Required<import(".eleventy.js").EleventyViteOptions>} */
	options;

	constructor(eleventyConfig, pluginOptions = {}) {
		this.directories = eleventyConfig.directories;
		this.logger = eleventyConfig.logger;
		this.options = Merge({}, DEFAULT_OPTIONS, pluginOptions);
	}

	getServer() {
		/** @type {import("vite").InlineConfig} */
		const viteOptions = DeepCopy({}, this.options.viteOptions);
		viteOptions.root = this.directories.output;

		return createServer(viteOptions);
	}

	getIgnoreDirectory() {
		return path.join(this.options.tempFolderName, "**");
	}

	async runBuild(input) {
		const tempFolderPath = path.resolve(this.options.tempFolderName);
		await fsp.rename(this.directories.output, tempFolderPath);

		try {
			/** @type {import("vite").InlineConfig} */
			const viteOptions = DeepCopy({}, this.options.viteOptions);
			viteOptions.root = tempFolderPath;

			viteOptions.build.rollupOptions.input = input
				.filter((entry) => !!entry.outputPath) // filter out `false` serverless routes
				.filter((entry) => (entry.outputPath || "").endsWith(".html")) // only html output
				.map((entry) => {
					if (!entry.outputPath.startsWith(this.directories.output)) {
						throw new Error(
							`Unexpected output path (was not in output directory ${this.directories.output}): ${entry.outputPath}`,
						);
					}

					return path.resolve(
						tempFolderPath,
						entry.outputPath.substring(this.directories.output.length),
					);
				});

			viteOptions.build.outDir = path.resolve(".", this.directories.output);

			this.logger.logWithOptions({
				prefix: EleventyVite.LOGGER_PREFIX,
				message: "Starting Vite build",
				type: "info",
			});
			await build(viteOptions);
			this.logger.logWithOptions({
				prefix: EleventyVite.LOGGER_PREFIX,
				message: "Finished Vite build",
				type: "info",
			});
		} catch (error) {
			this.logger.logWithOptions({
				prefix: EleventyVite.LOGGER_PREFIX,
				message: `Encountered a Vite build error, restoring original Eleventy output to ${this.directories.output}`,
				type: "error",
				color: "red",
			});
			this.logger.logWithOptions({
				prefix: EleventyVite.LOGGER_PREFIX,
				message: "Vite error:",
				type: "error",
			});
			this.logger.logWithOptions({
				prefix: EleventyVite.LOGGER_PREFIX,
				message: JSON.stringify(error, null, 2),
				type: "error",
				color: "cyan",
			});

			await fsp.rename(tempFolderPath, this.directories.output);

			throw error;
		} finally {
			await fsp.rm(tempFolderPath, { force: true, recursive: true });
		}
	}
}
