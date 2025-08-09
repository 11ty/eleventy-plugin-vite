import { describe, it, expect, vi } from "vitest";
import eleventyPlugin from "../.eleventy.js";

describe(".eleventy.js", () => {
	it("sets up passthrough, ignores, and server options", () => {
		const ignores = new Set();

		const eleventyConfig = {
			directories: { output: "dist" },
			addPassthroughCopy: vi.fn(),
			ignores,
			setServerOptions: vi.fn(),
			on: vi.fn(),
			logger: { warn: vi.fn() },
			versionCheck: vi.fn(),
		};

		eleventyPlugin(eleventyConfig, { tempFolderName: ".test-11ty-vite" });

		expect(eleventyConfig.addPassthroughCopy).toHaveBeenCalled();
		expect([...ignores].some((i) => i.includes(".test-11ty-vite"))).toBe(true);
		expect(eleventyConfig.setServerOptions).toHaveBeenCalled();
		expect(typeof eleventyConfig.setServerOptions.mock.calls[0][0].setup).toBe("function");
		expect(eleventyConfig.on).toHaveBeenCalled();
	});
});
