import * as template from '@babel/template'
import { getHandleRouteUpdateCode } from './handle-route-update'
import type * as t from '@babel/types'

/**
 * Emits HMR accept code for Bun's dev server.
 *
 * Bun's `import.meta.hot` is API-compatible with Vite at the call site, but
 * the bundler statically rejects *indirect* references to `import.meta.hot.data`
 * — anything that aliases `import.meta.hot` into a local and then reaches `.data`
 * through that local throws `import.meta.hot.data cannot be used indirectly` at
 * runtime. This adapter is identical to the Vite adapter in spirit but reaches
 * `import.meta.hot.data` directly at every access site.
 */
export function createBunHmrStatement(
  stableRouteOptionKeys: Array<string>,
  opts: {
    routeId?: string
  } = {},
): Array<t.Statement> {
  const handleRouteUpdateCode = getHandleRouteUpdateCode(stableRouteOptionKeys)
  const routeIdFallback =
    typeof opts.routeId === 'string' ? JSON.stringify(opts.routeId) : 'Route.id'

  return [
    template.statement(
      `
if (import.meta.hot) {
  import.meta.hot.data ??= {}
  import.meta.hot.accept((newModule) => {
    if (Route && newModule && newModule.Route) {
      const routeId = import.meta.hot.data['tsr-route-id'] ?? ${routeIdFallback}
      if (routeId) {
        import.meta.hot.data['tsr-route-id'] = routeId
      }
      (${handleRouteUpdateCode})(routeId, newModule.Route)
    }
  })
}
`,
      {
        syntacticPlaceholders: true,
      },
    )(),
  ]
}
