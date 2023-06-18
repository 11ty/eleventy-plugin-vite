const { promises: fsp } = require("fs");
const path = require("path");
const { createServer: createViteServer, build: buildVite } = require("vite");
const lodashMerge = require("lodash.merge");

const DEFAULT_OPTIONS = {
  tempFolderName: ".11ty-vite",
  viteOptions: {
    resolve:{
      alias:{
        // Allow references to `node_modules` directly for bundling.
        '/node_modules': path.resolve(".", 'node_modules')
        // Note that bare module specifiers are also supported
      },
    },
    clearScreen: false,
    appType: "mpa",
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

	// copy outputDir into tmp and remove outputDir
    await fsp.mkdir(tmp, { recursive: true });
	await fsp.cp(this.outputDir, tmp,  { recursive: true });
	await fsp.rm(this.outputDir,  { recursive: true });
	
    try {
      let viteOptions = lodashMerge({}, this.options.viteOptions);
      viteOptions.root = tmp;

      viteOptions.build.rollupOptions.input = input
        .filter(entry => !!entry.outputPath) // filter out `false` serverless routes
        .filter(entry => (entry.outputPath || "").endsWith(".html")) // only html output
        .map(entry => {	
			
		  // we must ensure the path is normalized to be ensure our separator is correct 		
          if(!path.normalize(entry.outputPath).startsWith(this.outputDir + path.sep)) {	
			  
            throw new Error(`Unexpected output path (was not in output directory ${this.outputDir}): ${entry.outputPath}`);
          }

          return path.resolve(tmp, entry.outputPath.substr(this.outputDir.length + path.sep.length));
        });

      viteOptions.build.outDir = path.resolve(".", this.outputDir);

      await buildVite(viteOptions);
    } catch(e) {
      console.warn( `[11ty] Encountered a Vite build error, restoring original Eleventy output to ${this.outputDir}`, e );
      
	  // copy from tmp back to ouptuDir
	  await fsp.cp(tmp, this.outputDir,  { recursive: true });
      throw e;
    } finally {
      // remove the tmp dir
      await fsp.rm(tmp, { recursive: true });
    }
  }
}

module.exports = EleventyVite;
