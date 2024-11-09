import EleventyVite from "./EleventyVite.js";

import path from "node:path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("./package.json");

/**
 * Options which can be passed to eleventy-plugin-vite
 * @typedef {Object} EleventyViteOptions
 * @property {string} tempFolderName
 * @property {import("vite").InlineConfig} [viteOptions]
 * @property {Object} [serverOptions]
 */

/**
 * @param {import('@11ty/eleventy/src/UserConfig').default} eleventyConfig
 * @param {EleventyViteOptions} options
 */
export default function (eleventyConfig, options = {}) {
	try {
		eleventyConfig.versionCheck(pkg["11ty"].compatibility);
	} catch (error) {
		eleventyConfig.logger.warn(
			`Warning: Eleventy Plugin (${pkg.name}) Compatibility: ${error.message}`,
		);
	}

	const eleventyVite = new EleventyVite(eleventyConfig, options);

	const publicDir = eleventyVite.options.viteOptions?.publicDir || "public";

	if (!path.relative(eleventyConfig.directories.output, publicDir)) {
		throw new Error(
			`${EleventyVite.LOGGER_PREFIX} Misconfiguration: Can't use the same directory for 11ty output and vite public directory`,
		);
	}

	eleventyConfig.ignores.add(path.join(publicDir, "**"));
	eleventyConfig.addPassthroughCopy(publicDir);

	// Add temp folder to ignores
	eleventyConfig.ignores.add(eleventyVite.getIgnoreDirectory());

	const serverOptions = Object.assign(
		{
			module: "@11ty/eleventy-dev-server",
			domDiff: false,
		},
		options.serverOptions,
	);

	serverOptions.setup = async () => {
		// Use Vite as Middleware
		const viteDevServer = await eleventyVite.getServer();

		process.on("SIGINT", async () => {
			await viteDevServer.close();
		});

		return {
			middleware: [viteDevServer.middlewares],
		};
	};

	eleventyConfig.setServerOptions(serverOptions);

	// Run Vite build
	// TODO use `build.write` option to work with json or ndjson outputs
	eleventyConfig.on("eleventy.after", async ({ dir, runMode, outputMode, results }) => {
		// Skips the Vite build if:
		//   --serve
		//   --to=json
		//   --to=ndjson
		//   or 0 output files from Eleventy build
		// Notably, this *does* run Vite build in --watch mode
		if (
			runMode === "serve" ||
			outputMode === "json" ||
			outputMode === "ndjson" ||
			results.length === 0
		) {
			return;
		}

		await eleventyVite.runBuild(results);
	});
}
