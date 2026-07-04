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

// Doc comments below are placed *inside* the export braces, immediately
// before each specifier — not above the whole statement. deno_doc (and JSR's
// doc-coverage check) resolves a re-exported symbol as an unresolved
// "reference" node with no JSDoc whenever its origin file is itself a
// separate deno.json entrypoint, discarding a comment placed above the
// statement. A comment attached to the individual specifier survives.
export {
  /** Dune plugin factory for Orama-backed search. */
  default,
} from "./plugin.ts";
export type {
  /** Configuration accepted from the `site.yaml` plugin entry. */
  OramaPluginConfig,
} from "./types.ts";
export {
  /** Create an Orama-backed search engine implementing Dune's `SearchEngine`. */
  createOramaEngine,
} from "./engine.ts";
export type {
  /** Options for {@link createOramaEngine}. */
  OramaEngineOptions,
  /** Runtime wiring supplied by the Dune plugin layer. */
  OramaEngineRuntime,
} from "./engine.ts";
