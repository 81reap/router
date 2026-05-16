import { createBunPlugin } from 'unplugin'

import { configSchema } from './core/config'
import { createRouterCodeSplitterPlugin } from './core/router-code-splitter-plugin'
import { createRouterGeneratorPlugin } from './core/router-generator-plugin'
import {
  INLINE_CSS_DEFAULT_DEFINES,
  unpluginRouterComposedFactory,
} from './core/router-composed-plugin'
import { createRouterPluginContext } from './core/router-plugin-context'

import type { CodeSplittingOptions, Config } from './core/config'
import type { RouterPluginContext } from './core/router-plugin-context'

type RouterPluginOptions = Partial<Config | (() => Config)> | undefined

const defaultRouterPluginContext = createRouterPluginContext()

/**
 * Force `plugin.hmr.style = 'bun'` so the router HMR adapter emits Bun-safe
 * accept code (see `./core/hmr/bun-adapter.ts`) regardless of user config.
 */
function withBunHmrStyle(
  options: RouterPluginOptions,
): RouterPluginOptions {
  const mergeHmrStyle = (
    config: Partial<Config> | undefined,
  ): Partial<Config> => ({
    ...config,
    plugin: {
      ...config?.plugin,
      hmr: {
        ...config?.plugin?.hmr,
        style: 'bun',
      },
    },
  })

  if (typeof options === 'function') {
    return () => mergeHmrStyle(options())
  }
  return mergeHmrStyle(options)
}

/**
 * @example
 * ```ts
 * await Bun.build({
 *   entrypoints: ['./src/index.html'],
 *   plugins: [TanStackRouterGeneratorBun()],
 * })
 * ```
 */
const TanStackRouterGeneratorBun = (
  options?: RouterPluginOptions,
  routerPluginContext?: RouterPluginContext,
) => {
  const pluginContext = routerPluginContext ?? defaultRouterPluginContext
  return createBunPlugin((pluginOptions: RouterPluginOptions, meta) =>
    createRouterGeneratorPlugin(pluginOptions, pluginContext, meta),
  )(options)
}

/**
 * @example
 * ```ts
 * await Bun.build({
 *   entrypoints: ['./src/index.html'],
 *   plugins: [TanStackRouterCodeSplitterBun()],
 * })
 * ```
 */
const TanStackRouterCodeSplitterBun = (
  options?: RouterPluginOptions,
  routerPluginContext?: RouterPluginContext,
) => {
  const pluginContext = routerPluginContext ?? defaultRouterPluginContext
  return createBunPlugin((pluginOptions: RouterPluginOptions, meta) =>
    createRouterCodeSplitterPlugin(
      withBunHmrStyle(pluginOptions),
      pluginContext,
      meta,
    ),
  )(options)
}

/**
 * @example
 * ```ts
 * await Bun.build({
 *   entrypoints: ['./src/index.html'],
 *   plugins: [tanstackRouter()],
 * })
 * ```
 */
const TanStackRouterBun = /* #__PURE__ */ createBunPlugin((options, meta) =>
  unpluginRouterComposedFactory(
    withBunHmrStyle(options as RouterPluginOptions),
    meta,
  ),
)

const tanstackRouter = TanStackRouterBun
export default TanStackRouterBun

/**
 * Default `define` values that gate the inline-CSS runtime feature off.
 * The Vite / Webpack / Rspack / esbuild adapters inject these automatically
 * via their respective config hooks; unplugin's Bun adapter exposes no
 * equivalent hook, so users must spread these into `Bun.build({ define })`.
 */
const tanstackRouterBunDefaultDefines = INLINE_CSS_DEFAULT_DEFINES

export {
  configSchema,
  TanStackRouterGeneratorBun,
  TanStackRouterCodeSplitterBun,
  TanStackRouterBun,
  tanstackRouter,
  tanstackRouterBunDefaultDefines,
}

export type { Config, CodeSplittingOptions, RouterPluginContext }
