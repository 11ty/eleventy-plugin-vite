const { promises: fsp } = require("fs");
const path = require("path");
const { createServer: createViteServer, build: buildVite } = require("vite");
const lodashMerge = require("lodash.merge");

const DEFAULT_OPTIONS = {
  tempFolderName: ".11ty-vite",
  viteOptions: {
    clearScreen: false,
    appType: "custom",
    server: {
      mode: "development",
      middlewareMode: true,
    },
    build: {
      mode: "production",
      rollupOptions: {}, // we use this to inject input for MPA build below
    }
  }
}

class EleventyVite {
  constructor(outputDir, pluginOptions = {}) {
    this.outputDir = outputDir;
    this.options = lodashMerge({}, DEFAULT_OPTIONS, pluginOptions);
  }

  async getServerMiddleware() {
    let viteOptions = lodashMerge({}, this.options.viteOptions);
    viteOptions.root = this.outputDir;

    let vite = await createViteServer(viteOptions);
    return vite.middlewares;
  }

  getIgnoreDirectory() {
    return path.join(this.options.tempFolderName, "**");
  }

  async runBuild(input) {
    let tmp = path.resolve(".", this.options.tempFolderName);

    await fsp.mkdir(tmp, { recursive: true });
    await fsp.rename(this.outputDir, tmp);

    try {
      let viteOptions = lodashMerge({}, this.options.viteOptions);
      viteOptions.root = tmp;

      viteOptions.build.rollupOptions.input = input
        .filter(entry => !!entry.outputPath) // filter out `false` serverless routes
        .filter(entry => (entry.outputPath || "").endsWith(".html")) // only html output
        .map(entry => {
          if(!entry.outputPath.startsWith(this.outputDir + path.sep)) {
            throw new Error(`Unexpected output path (was not in output directory ${this.outputDir}): ${entry.outputPath}`);
          }

          return path.resolve(tmp, entry.outputPath.substr(this.outputDir.length + path.sep.length));
        });

      viteOptions.build.outDir = path.resolve(".", this.outputDir);

      await buildVite(viteOptions);
    } catch(e) {
      console.warn( `[11ty] Encountered a Vite build error, restoring original Eleventy output to ${this.outputDir}`, e );
      await fsp.rename(tmp, this.outputDir);
      throw e;
    } finally {
      // remove the tmp dir
      await fsp.rm(tmp, { recursive: true });
    }
  }
}

module.exports = EleventyVite;
