<p align="center"><img src="https://www.11ty.dev/img/logo-github.svg" width="200" height="200" alt="11ty Logo">&#160;&#160;<img src="https://v1.image.11ty.dev/https%3A%2F%2Fvitejs.dev%2Flogo.svg/png/200x200/" alt="Vite logo" width="200" height="200"></p>

# eleventy-plugin-vite 🕚⚡️🎈🐀

A plugin to use [Vite v5](https://vitejs.dev/) with Eleventy v3.

This plugin:

- Runs Vite as Middleware in Eleventy Dev Server (try with Eleventy’s `--incremental`)
- Runs Vite build to postprocess your Eleventy build output

## Eleventy Housekeeping

- Please star [Eleventy on GitHub](https://github.com/11ty/eleventy/)!
- Follow us on Mastodon [@eleventy@fosstodon.org](https://fosstodon.org/@eleventy) or Twitter [@eleven_ty](https://twitter.com/eleven_ty)
- Join us on [Discord](https://www.11ty.dev/blog/discord/)
- Support [11ty on Open Collective](https://opencollective.com/11ty)
- [11ty on npm](https://www.npmjs.com/org/11ty)
- [11ty on GitHub](https://github.com/11ty)

[![npm Version](https://img.shields.io/npm/v/@11ty/eleventy-plugin-vite.svg?style=for-the-badge)](https://www.npmjs.com/package/@11ty/eleventy-plugin-vite)

## Installation

```
npm install @11ty/eleventy-plugin-vite@alpha --save-dev
```

### ESM `.eleventy.js` Config

```js
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyVitePlugin);
}
```

### CommonJS `.eleventy.js` Config

> [!NOTE]
> This plugin is written in ESM, therefore `require` is not possible. If your .eleventy.js config is in CommonJS make it async and create a dynamic import as shown below.

```js
module.exports = async function (eleventyConfig) {
	const EleventyPluginVite = (await import("@11ty/eleventy-plugin-vite")).default;

	eleventyConfig.addPlugin(EleventyPluginVite);
};
```

### Options

View the [full list of Vite Configuration options](https://vitejs.dev/config/).

```js
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		tempFolderName: ".11ty-vite", // Default name of the temp folder

		// Options passed to the Eleventy Dev Server
		// Defaults
		serverOptions: {
			module: "@11ty/eleventy-dev-server",
			domDiff: false,
		},

		// Defaults
		viteOptions: {
			clearScreen: false,
			appType: "mpa",

			server: {
				middlewareMode: true,
			},

			build: {
				emptyOutDir: true,
			},

			resolve: {
				alias: {
					// Allow references to `node_modules` folder directly
					"/node_modules": path.resolve(".", "node_modules"),
				},
			},
		},
	});
}
```

## Limitations and TODOs

- TODO: While serverless routes can be used and rendered in the dev server, Vite cannot be used to process that output yet. [Issue #1: Process Serverless Output with Vite](https://github.com/11ty/eleventy-plugin-vite/issues/1).

## Related Projects

- [`eleventy-plus-vite`](https://github.com/matthiasott/eleventy-plus-vite) by @matthiasott: A starter template using this plugin
- Currently unmaintained:
  - [`slinkity`](https://slinkity.dev/) by @Holben888: A much deeper and more comprehensive integration with Vite! Offers partial hydration and can use shortcodes to render framework components in Eleventy!
  - [`vite-plugin-eleventy`](https://www.npmjs.com/package/vite-plugin-eleventy) by @Snugug: Uses Eleventy as Middleware in Vite (instead of the post-processing approach used here)
