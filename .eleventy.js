const pkg = require("./package.json");
const path = require("path");
const EleventyVite = require("./EleventyVite");

module.exports = function(eleventyConfig, options = {}) {
  try {
    eleventyConfig.versionCheck(pkg["11ty"].compatibility);
  } catch(e) {
    console.warn( `[11ty] Warning: Eleventy Plugin (${pkg.name}) Compatibility: ${e.message}` );
  }

  let eleventyVite = new EleventyVite(eleventyConfig.dir.output, options);

  eleventyConfig.setServerOptions({
    module: "@11ty/eleventy-dev-server",
    // enabled: false,
    // domdiff: false,
    showVersion: true,
    
    setup: async () => {
      // Use Vite as Middleware
      let middleware = await eleventyVite.getServerMiddleware();

      return {
        middleware: [ middleware ]
      }
    },
  });

  // Add temp folder to the ignores
  eleventyConfig.ignores.add(eleventyVite.getIgnoreDirectory());

  // Run Vite build
  // TODO use `build.write` option to work with json or ndjson outputs
  eleventyConfig.on("eleventy.after", async ({ dir, runMode, outputMode, results }) => {
    // Skips the Vite build if:
    //   --serve
    //   --to=json
    //   --to=ndjson
    //   or 0 output files from Eleventy build
    // Notably, this *does* run Vite build in --watch mode
    if(runMode === "serve" || outputMode === "json" || outputMode === "ndjson" || results.length === 0) {
      return;
    }

    await eleventyVite.runBuild(results);
  });
};