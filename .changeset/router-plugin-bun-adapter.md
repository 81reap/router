---
'@tanstack/router-plugin': patch
---

Add a Bun bundler adapter exported from `@tanstack/router-plugin/bun`. Route-tree generation and code splitting now work with `Bun.build()` / `Bun.serve()` HTML-import bundling via unplugin's Bun integration (requires Bun >= 1.2.22). Dev-mode route-file watching falls back to chokidar to match the Webpack and Rspack adapters, and a `tanstackRouterBunDefaultDefines` export is provided to inject the inline-CSS feature-flag defines that the other adapters set automatically.
