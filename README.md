<p align="center"><img src="https://www.11ty.dev/img/logo-github.png" alt="eleventy Logo"></p>

# eleventy-plugin-vite 🕚⚡️🎈🐀

A server plugin to use [Vite](https://vitejs.dev/) with Eleventy 2.0+.

This plugin:

* Runs Vite as Middleware in Eleventy Dev Server
* Runs Vite build to postprocess your Eleventy build output

## Eleventy Housekeeping

- Please star [Eleventy on GitHub](https://github.com/11ty/eleventy/)!
- Follow us on Twitter [@eleven_ty](https://twitter.com/eleven_ty)
- Support [11ty on Open Collective](https://opencollective.com/11ty)
- [11ty on npm](https://www.npmjs.com/org/11ty)
- [11ty on GitHub](https://github.com/11ty)

[![npm Version](https://img.shields.io/npm/v/@11ty/eleventy-server-browsersync.svg?style=for-the-badge)](https://www.npmjs.com/package/@11ty/eleventy-server-browsersync)

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

### More options

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
        middlewareMode: "ssr",
      },
      build: {
        mode: "production",
      }
    }
  });
};
```


