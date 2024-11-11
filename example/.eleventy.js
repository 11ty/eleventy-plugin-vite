import EleventyVitePlugin from "../.eleventy.js";

export default function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("src/assets");

	eleventyConfig.addPlugin(EleventyVitePlugin);
}

export const config = {
	dir: {
		input: "src",
	},
};
