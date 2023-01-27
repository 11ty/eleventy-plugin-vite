<p align="center"><img src="https://www.11ty.dev/img/logo-github.svg" width="200" height="200" alt="11ty Logo">&#160;&#160;<img src="https://v1.image.11ty.dev/https%3A%2F%2Fvitejs.dev%2Flogo.svg/png/200x200/" alt="Vite logo" width="200" height="200"></p>

# eleventy-plugin-vite 🕚⚡️🎈🐀

A plugin to use [Vite v4.0](https://vitejs.dev/) with Eleventy v2.0.

This plugin:

* Runs Vite as Middleware in Eleventy Dev Server (try with Eleventy’s `--incremental`)
* Runs Vite build to postprocess your Eleventy build output

## Related Projects

* [`slinkity`](https://slinkity.dev/) by @Holben888: a much deeper and more comprehensive integration with Vite! Offers partial hydration and can use shortcodes to render framework components in Eleventy!
* [`vite-plugin-eleventy`](https://www.npmjs.com/package/vite-plugin-eleventy) by @Snugug: uses Eleventy as Middleware in Vite (instead of the post-processing approach used here)

## Eleventy Housekeeping

- Please star [Eleventy on GitHub](https://github.com/11ty/eleventy/)!
- Follow us on Twitter [@eleven_ty](https://twitter.com/eleven_ty)
- Support [11ty on Open Collective](https://opencollective.com/11ty)
- [11ty on npm](https://www.npmjs.com/org/11ty)
- [11ty on GitHub](https://github.com/11ty)

[![npm Version](https://img.shields.io/npm/v/@11ty/eleventy-plugin-vite.svg?style=for-the-badge)](https://www.npmjs.com/package/@11ty/eleventy-plugin-vite)

## Installation

```
npm install @11ty/eleventy-plugin-vite
```

```js
const EleventyVitePlugin = require("@11ty/eleventy-plugin-vite");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyVitePlugin);
};
```

### Options

View the [full list of Vite Configuration options](https://vitejs.dev/config/).

```js
const EleventyVitePlugin = require("@11ty/eleventy-plugin-vite");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    tempFolderName: ".11ty-vite", // Default name of the temp folder

    // Defaults are shown:
    viteOptions: {
      clearScreen: false,
      server: {
        mode: "development",
        middlewareMode: true,
      },
      build: {
        mode: "production",
      }
    }
  });
};
```

## Limitations and TODOs

* TODO: While serverless routes can be used and rendered in the dev server, Vite cannot be used to process that output yet. [Issue #1: Process Serverless Output with Vite](https://github.com/11ty/eleventy-plugin-vite/issues/1).