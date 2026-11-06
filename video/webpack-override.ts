import path from "node:path";
import type { WebpackConfiguration } from "@remotion/bundler";
import { enableTailwind } from "@remotion/tailwind";

/**
 * The video bundles the app's own components and its `src/index.css`, so the
 * CSS goes through the app's own pipeline: Tailwind 3 with the app's config,
 * then autoprefixer, exactly as `postcss.config.js` at the root runs it.
 *
 * `enableTailwind` also adds postcss-preset-env, which turns logical
 * properties (`ms-`, `start-`, `text-start`) into pairs of `[dir]` selectors.
 * Inside a Hebrew frame those pairs both match a pass's own `dir="ltr"` row,
 * and the later one wins, so the pass would lay out unlike the app. It is
 * taken out again below.
 *
 * Remotion's own packages bring React 18.3.1 here, and the app's components
 * import it from the root's node_modules: two copies of React break hooks,
 * so every import of it goes to this folder's one copy (the same version).
 */
const here = process.cwd();
const tailwindConfig = path.join(here, "tailwind.config.js");

function withoutPresetEnv(config: WebpackConfiguration): WebpackConfiguration {
  const rules = config.module?.rules ?? [];
  return {
    ...config,
    module: {
      ...config.module,
      rules: rules.map((rule) => {
        if (!rule || rule === "..." || !String((rule as { test?: unknown }).test).includes(".css")) return rule;
        const use = (rule as { use?: unknown[] }).use ?? [];
        return {
          ...rule,
          use: use.map((loader): unknown => {
            const entry = loader as { loader?: string; options?: { postcssOptions?: { plugins?: unknown[] } } };
            if (!entry.loader?.includes("postcss-loader")) return loader;
            const plugins = (entry.options?.postcssOptions?.plugins ?? []).filter(
              (plugin) => !String(Array.isArray(plugin) ? plugin[0] : plugin).includes("postcss-preset-env"),
            );
            return { ...entry, options: { ...entry.options, postcssOptions: { ...entry.options?.postcssOptions, plugins } } };
          }),
        } as typeof rule;
      }),
    },
  };
}

export function webpackOverride(current: WebpackConfiguration): WebpackConfiguration {
  const config = withoutPresetEnv(enableTailwind(current, { configLocation: tailwindConfig }));
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias as Record<string, string> | undefined),
        react: path.join(here, "node_modules/react"),
        "react-dom": path.join(here, "node_modules/react-dom"),
      },
    },
  };
}
