/**
 * Configuration types for @dune/plugin-orama.
 * @module
 */

/**
 * Configuration accepted from the `site.yaml` plugin entry.
 *
 * ```yaml
 * plugins:
 *   - src: "jsr:@dune/plugin-orama"
 *     config:
 *       active: true          # default: true
 *       excerptLength: 160    # default: 160
 *       typoTolerance: true   # default: true
 *       persistKey: "orama"   # optional: persist index to StorageAdapter under this key
 * ```
 */
export interface OramaPluginConfig {
  /**
   * Whether to set Orama as the active search engine.
   * Set to false to register the engine without activating it.
   * @default true
   */
  active?: boolean;
  /** Character length of returned excerpts. @default 160 */
  excerptLength?: number;
  /**
   * Enable Orama's built-in typo tolerance.
   * @default true
   */
  typoTolerance?: boolean;
  /**
   * Persist the built index to the StorageAdapter under this key.
   * When set, the index is loaded from storage on startup if available,
   * and saved after each build/rebuild.
   * Requires the storage adapter to be passed in runtime options.
   * @example "orama-search-index"
   */
  persistKey?: string;
}
