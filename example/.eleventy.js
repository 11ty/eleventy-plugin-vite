import EleventyVitePlugin from "../.eleventy.js"

export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy(`${eleventyConfig.directories.input}assets/`);

  eleventyConfig.addPlugin(EleventyVitePlugin);
};