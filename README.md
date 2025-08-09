<p align="center"><img src="https://www.11ty.dev/img/logo-github.svg" width="200" height="200" alt="11ty Logo">&#160;&#160;<img src="https://v1.image.11ty.dev/https%3A%2F%2Fvitejs.dev%2Flogo.svg/png/200x200/" alt="Vite logo" width="200" height="200"></p>

# eleventy-plugin-vite 🕚⚡️🎈🐀

A plugin to use [Vite](https://vitejs.dev/) with Eleventy.

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
> This plugin is written in ESM, therefore `require` is not possible. If your .eleventy.js config uses CommonJS, make it async and create a dynamic import as shown below.

```js
module.exports = async function (eleventyConfig) {
	const EleventyPluginVite = (await import("@11ty/eleventy-plugin-vite")).default;

	eleventyConfig.addPlugin(EleventyPluginVite);
};
```

Read more about ESM vs CommonJS on the [Eleventy documentation](https://www.11ty.dev/docs/cjs-esm/).

### Options

These are the default options of the plugin. There's no need to specify them unless you want to change them.

```js
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyVitePlugin, {
        // Default name of the temp folder
		tempFolderName: ".11ty-vite",

		// Eleventy Dev Server Options
		serverOptions: {
			module: "@11ty/eleventy-dev-server",
			domDiff: false,
		},

		// Vite Config
		viteOptions: {
			clearScreen: false,
			appType: "mpa",
			server: {
				middlewareMode: true,
			},
			build: {
				emptyOutDir: true,
				rollupOptions: {
					input: {
						// HTML entry points will be injected automatically
						// Custom input will be merged
					},
				},
			},
			resolve: {
				alias: {
					// Allow references to `node_modules` directly for bundling.
					"/node_modules": path.resolve(".", "node_modules"),
					// Note that bare module specifiers are also supported
				},
			},
		},
	});
}
```

View the [full list of Vite configuration options](https://vitejs.dev/config/). Custom viteOptions will be deeply merged with the defaults.

## Related Projects

- [`eleventy-plus-vite`](https://github.com/matthiasott/eleventy-plus-vite) by @matthiasott: A starter template using this plugin
- Currently unmaintained:
  - [`slinkity`](https://slinkity.dev/) by @Holben888: A much deeper and more comprehensive integration with Vite! Offers partial hydration and can use shortcodes to render framework components in Eleventy!
  - [`vite-plugin-eleventy`](https://www.npmjs.com/package/vite-plugin-eleventy) by @Snugug: Uses Eleventy as Middleware in Vite (instead of the post-processing approach used here)
