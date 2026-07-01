/**
 * @dune/plugin-orama — Orama-backed search for Dune CMS.
 *
 * Orama is an in-process full-text search engine with typo tolerance,
 * facets, and scoring. No external service required.
 *
 * ## Usage via site.yaml
 *
 * ```yaml
 * plugins:
 *   - src: "jsr:@dune/plugin-orama"
 *     config:
 *       active: true      # default: true
 *       tolerance: 1      # typo tolerance; 0 = exact match only
 * ```
 *
 * ## Programmatic usage
 *
 * ```ts
 * import { createOramaEngine } from "@dune/plugin-orama/engine";
 *
 * const engine = createOramaEngine({ tolerance: 1 }, pages, { loadText });
 * await engine.build();
 * const results = await engine.search("my query");
 * ```
 *
 * @module
 */

export { default } from "./plugin.ts";
export type { OramaPluginConfig } from "./types.ts";
export { createOramaEngine } from "./engine.ts";
export type { OramaEngineOptions, OramaEngineRuntime } from "./engine.ts";
