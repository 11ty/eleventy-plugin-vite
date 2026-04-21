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
			rolldownOptions: {
				// HTML files will be injected and merged into `input` for MPA
			},
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

		// Relevant until `rollupOptions` are removed
		pluginOptions = DeepCopy({}, pluginOptions);
		const userBuildOptions = pluginOptions.viteOptions?.build;
		if (userBuildOptions?.rollupOptions && !userBuildOptions?.rolldownOptions) {
			this.logger.logWithOptions({
				prefix: EleventyVite.LOGGER_PREFIX,
				message: "Use `rolldownOptions` are deprecated, use `rollupOptions` instead",
				type: "info",
			});

			userBuildOptions.rolldownOptions = userBuildOptions.rollupOptions;
			delete userBuildOptions.rollupOptions;
		}

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

	get tempFolderPath() {
		return path.resolve(this.options.tempFolderName);
	}

	static getEntryPointName(filePath) {
		return path
			.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)))
			.replace(/^\/+/, "");
	}

	getEleventyRolldownOptionsInput(input) {
		return (
			input
				// Filter out `false` serverless routes
				.filter((entry) => !!entry.outputPath)
				// Only HTML output
				.filter((entry) => (entry.outputPath ?? "").endsWith(".html"))
				.reduce((result, entry) => {
					if (!entry.outputPath.startsWith(this.directories.output)) {
						throw new Error(
							`Unexpected output path (was not in output directory ${this.directories.output}): ${entry.outputPath}`,
						);
					}

					const filePath = entry.outputPath.substring(this.directories.output.length);
					result[EleventyVite.getEntryPointName(filePath)] = path.resolve(
						this.tempFolderPath,
						filePath,
					);

					return result;
				}, {})
		);
	}

	getUserRolldownOptionsInput(input) {
		let userInput = {};

		if (input) {
			if (Array.isArray(input)) {
				input.forEach((file) => {
					userInput[EleventyVite.getEntryPointName(file)] = file;
				});
			} else if (typeof input === "object") {
				userInput = input;
			} else if (typeof input === "string") {
				userInput[EleventyVite.getEntryPointName(input)] = input;
			}
		}

		return userInput;
	}

	async runBuild(input) {
		await fsp.rename(this.directories.output, this.tempFolderPath);

		try {
			/** @type {import("vite").InlineConfig} */
			const viteOptions = DeepCopy({}, this.options.viteOptions);
			viteOptions.root = this.tempFolderPath;
			viteOptions.build.outDir = path.resolve(".", this.directories.output);
			viteOptions.build.rolldownOptions.input = {
				...this.getEleventyRolldownOptionsInput(input, this.tempFolderPath),
				...this.getUserRolldownOptionsInput(viteOptions.build.rolldownOptions.input),
			};

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

			await fsp.rename(this.tempFolderPath, this.directories.output);

			throw error;
		} finally {
			await fsp.rm(this.tempFolderPath, { force: true, recursive: true });
		}
	}
}
