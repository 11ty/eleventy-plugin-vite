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
    resolve:{
      alias:{
        // Allow references to `node_modules` directly for bundling.
        '/node_modules': path.resolve(".", 'node_modules')
        // Note that bare module specifiers are also supported
      },
    },
  }
}

export default class EleventyVite {
  /** @type {import("@11ty/eleventy/src/Util/ProjectDirectories.js").default} */
  directories;

  /** @type {Required<import(".eleventy.js").EleventyViteOptions>} */
  options;

  constructor(directories, pluginOptions = {}) {
    this.directories = directories;
    this.options = Merge({}, DEFAULT_OPTIONS, pluginOptions);
  }

  async getServerMiddleware() {
    /** @type {import("vite").InlineConfig} */
    let viteOptions = DeepCopy({}, this.options.viteOptions);
    viteOptions.root = this.directories.output;

    let vite = await createServer(viteOptions);

    return vite.middlewares;
  }

  getIgnoreDirectory() {
    return path.join(this.options.tempFolderName, "**");
  }

  async runBuild(input) {
    let tmp = path.resolve(this.directories.input, this.options.tempFolderName);

    await fsp.rename(this.directories.output, tmp);

    try {
      /** @type {import("vite").InlineConfig} */
      let viteOptions = DeepCopy({}, this.options.viteOptions);
      viteOptions.root = tmp;

      viteOptions.build.rollupOptions.input = input
        .filter(entry => !!entry.outputPath) // filter out `false` serverless routes
        .filter(entry => (entry.outputPath || "").endsWith(".html")) // only html output
        .map(entry => {
          if(!entry.outputPath.startsWith(this.directories.output)) {
            throw new Error(`Unexpected output path (was not in output directory ${this.directories.output}): ${entry.outputPath}`);
          }

          return path.resolve(tmp, entry.outputPath.substring(this.directories.output.length));
        });

      viteOptions.build.outDir = path.resolve(".", this.directories.output);

      await build(viteOptions);
    } catch(e) {
      console.warn( `[11ty] Encountered a Vite build error, restoring original Eleventy output to ${this.directories.output}`, e );
      await fsp.rename(tmp, this.directories.output);
      throw e;
    } finally {
      // remove the tmp dir
      await fsp.rm(tmp, { recursive: true });
    }
  }
}

