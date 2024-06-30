import EleventyVite from "./EleventyVite.js";

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
	} catch (e) {
		console.warn(`[11ty] Warning: Eleventy Plugin (${pkg.name}) Compatibility: ${e.message}`);
	}

	let eleventyVite = new EleventyVite(eleventyConfig.directories, options);

	// Adds support for automatic publicDir passthrough copy
	// vite/rollup will not touch these files and as part of the build will copy them to the root of your output folder
	let publicDir = eleventyVite.options.viteOptions?.publicDir || "public";
	eleventyConfig.ignores.add(publicDir);

	// Use passthrough copy on the public directory
	let passthroughCopyObject = {};
	passthroughCopyObject[`${publicDir}/`] = "/";
	eleventyConfig.addPassthroughCopy(passthroughCopyObject);

	// Add temp folder to the ignores
	eleventyConfig.ignores.add(eleventyVite.getIgnoreDirectory());

	let serverOptions = Object.assign(
		{
			module: "@11ty/eleventy-dev-server",
			domDiff: false,
		},
		options.serverOptions,
	);

	serverOptions.setup = async () => {
		// Use Vite as Middleware
		let middleware = await eleventyVite.getServerMiddleware();

		return {
			middleware: [middleware],
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
