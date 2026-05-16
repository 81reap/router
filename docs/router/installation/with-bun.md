---
title: Installation with Bun
---

To use file-based routing with **Bun**'s native bundler, you'll need to install the `@tanstack/router-plugin` package.

> [!NOTE]
> The Bun adapter requires Bun **1.2.22 or newer** — the minimum version supported by [unplugin](https://github.com/unjs/unplugin)'s Bun integration.

<!-- ::start:tabs variant="package-manager" mode="dev-install" -->

react: @tanstack/router-plugin
solid: @tanstack/router-plugin

<!-- ::end:tabs -->

Once installed, add the plugin to your `Bun.build()` (or `Bun.serve()` HTML-import) configuration.

<!-- ::start:framework -->

# React

```ts title="build.ts"
import {
  tanstackRouter,
  tanstackRouterBunDefaultDefines,
} from '@tanstack/router-plugin/bun'

await Bun.build({
  entrypoints: ['./src/index.html'],
  outdir: './dist',
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
  ],
  // The other adapters set these `define` entries automatically; unplugin's
  // Bun adapter has no equivalent hook, so spread them here to keep the
  // inline-CSS runtime feature gated off until you opt in.
  define: {
    ...tanstackRouterBunDefaultDefines,
  },
})
```

# Solid

```ts title="build.ts"
import {
  tanstackRouter,
  tanstackRouterBunDefaultDefines,
} from '@tanstack/router-plugin/bun'

await Bun.build({
  entrypoints: ['./src/index.html'],
  outdir: './dist',
  plugins: [
    tanstackRouter({
      target: 'solid',
      autoCodeSplitting: true,
    }),
  ],
  define: {
    ...tanstackRouterBunDefaultDefines,
  },
})
```

<!-- ::end:framework -->

You can also wire the plugin into `Bun.serve()` for dev-mode HTML-import bundling — see the [Bun bundler plugins docs](https://bun.com/docs/bundler/plugins) for the full plugin lifecycle.

Now that you've added the plugin to your Bun configuration, you're all set to start using file-based routing with TanStack Router.

## Ignoring the generated route tree file

If your project is configured to use a linter and/or formatter, you may want to ignore the generated route tree file. This file is managed by TanStack Router and therefore shouldn't be changed by your linter or formatter.

Here are some resources to help you ignore the generated route tree file:

- Prettier - [https://prettier.io/docs/en/ignore.html#ignoring-files-prettierignore](https://prettier.io/docs/en/ignore.html#ignoring-files-prettierignore)
- ESLint - [https://eslint.org/docs/latest/use/configure/ignore#ignoring-files](https://eslint.org/docs/latest/use/configure/ignore#ignoring-files)
- Biome - [https://biomejs.dev/reference/configuration/#filesignore](https://biomejs.dev/reference/configuration/#filesignore)

> [!WARNING]
> If you are using VSCode, you may experience the route tree file unexpectedly open (with errors) after renaming a route.

You can prevent that from the VSCode settings by marking the file as readonly. Our recommendation is to also exclude it from search results and file watcher with the following settings:

```json
{
  "files.readonlyInclude": {
    "**/routeTree.gen.ts": true
  },
  "files.watcherExclude": {
    "**/routeTree.gen.ts": true
  },
  "search.exclude": {
    "**/routeTree.gen.ts": true
  }
}
```

You can use those settings either at a user level or only for a single workspace by creating the file `.vscode/settings.json` at the root of your project.

## Configuration

When using the TanStack Router Plugin with Bun for File-based routing, it comes with some sane defaults that should work for most projects:

```json
{
  "routesDirectory": "./src/routes",
  "generatedRouteTree": "./src/routeTree.gen.ts",
  "routeFileIgnorePrefix": "-",
  "quoteStyle": "single"
}
```

If these defaults work for your project, you don't need to configure anything at all! However, if you need to customize the configuration, you can do so by editing the configuration object passed into the `tanstackRouter` function.

You can find all the available configuration options in the [File-based Routing API Reference](../api/file-based-routing.md).

## Notes specific to the Bun adapter

- **Route-file watching**: Bun's plugin API doesn't deliver `watchChange` events to plugins, so the adapter falls back to [chokidar](https://github.com/paulmillr/chokidar) when `process.env.NODE_ENV !== 'production'` to pick up route file add/change/delete events. This matches the Webpack and Rspack adapters.
- **HMR**: Bun's `import.meta.hot` is API-compatible with Vite at the call site but rejects *indirect* reads of `import.meta.hot.data` (anything that aliases `import.meta.hot` into a local). The Bun adapter forces `plugin.hmr.style: 'bun'` so the injected HMR snippet reaches `import.meta.hot.data` directly at every site.
- **Inline-CSS defines**: As shown above, spread `tanstackRouterBunDefaultDefines` into your `define` to match the defaults injected automatically by the other adapters.
