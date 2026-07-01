/**
 * @dune/plugin-orama — Dune plugin entry point.
 *
 * Registers Orama as a named search engine via the `onSearchEngineCreate`
 * hook. Orama runs fully in-process with typo-tolerant full-text search.
 * No external service required.
 *
 * Enable from `site.yaml`:
 *
 * ```yaml
 * plugins:
 *   - src: "jsr:@dune/plugin-orama"
 *     config:
 *       active: true           # default: true
 *       tolerance: 1           # typo tolerance (0 = exact, 1 = one typo)
 *       excerptLength: 160     # excerpt length in chars
 * ```
 *
 * @module
 */

import type { SearchEngineCreateContext } from "@dune/core/search";
import type { DunePlugin } from "@dune/core/hooks";
import { createOramaEngine } from "./engine.ts";
import type { OramaPluginConfig } from "./types.ts";

const PLUGIN_VERSION = "0.1.0";

/**
 * Dune plugin factory for Orama-backed search.
 *
 * Registers an `orama` engine via the `onSearchEngineCreate` hook and
 * sets it as the active engine unless `config.active` is false.
 */
function oramaPlugin(config: OramaPluginConfig = {}): DunePlugin {
  const makeActive = config.active !== false;

  return {
    name: "orama",
    version: PLUGIN_VERSION,
    description: "Orama in-process search engine with typo tolerance.",
    hooks: {
      onSearchEngineCreate: (ctx: unknown) => {
        const { data } = ctx as { data: SearchEngineCreateContext };
        const engine = createOramaEngine(
          {
            excerptLength: config.excerptLength,
            tolerance: config.typoTolerance === false ? 0 : 1,
          },
          data.pages,
          {
            loadText: data.loadText,
            injectedRecords: data.injectedRecords,
          },
        );
        data.register("orama", engine);
        if (makeActive) {
          data.setActiveEngine("orama");
        }
      },
    },
  };
}

oramaPlugin.pluginName = "orama";

export default oramaPlugin;
