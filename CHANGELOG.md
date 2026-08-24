# Changelog

## [1.0.3] — 2026-08-24

### Fixed

- **`@dune/core` pin bumped to `0.33`.** The previous `0.32` range didn't cover
  `@dune/core`'s current version — a site running a newer core would have loaded
  a second, stale copy just for this plugin. No behavior change; nothing in this
  release depends on a 0.33-only export.

## [1.0.2] — 2026-08-22

### Fixed

- **`@dune/core` pin bumped to `0.32`.** The previous `0.31` range didn't cover
  `@dune/core@0.32.0` — a site running 0.32.0 would have loaded a second, stale
  copy of core just for this plugin. No behavior change; nothing in this release
  depends on a 0.32-only export.

## [1.0.1] — 2026-07-18

### Fixed

- **`deno lint`'s `require-await` rule flagged two test mocks** using `async`
  arrow functions with no `await` inside — switched to returning
  `Promise.resolve(...)` directly.
- **The `@dune/core` dependency range was stale (`^0.25`)**, unrelated to the
  actual `@dune/core@^0.24` this package has required since its `/search` and
  `/hooks` subpaths were introduced — a site on a newer core loaded a second,
  older copy of `@dune/core` just for this plugin. Bumped to a bounded per-minor
  pin, `jsr:@dune/core@0.31` (auto-tracks patch releases within that minor), so
  Deno unifies it with the host site's pinned core version. An unbounded range
  (`@0`, any 0.x) was tried first and reverted: JSR validates a package's `jsr:`
  subpath imports against the _oldest_ version satisfying the declared range,
  not the newest, so an open floor resolves to the earliest `@dune/core` ever
  published and fails publish for any subpath that postdates it (this package's
  `/search` and `/hooks` didn't exist until core 0.24.0).
- **`minimumDependencyAge` now excludes `jsr:@dune/core`** from Deno's 24-hour
  freshness gate (default since Deno 2.9) — without this, a version bump
  immediately after a `@dune/core` release fails publish since the new core
  version is "too fresh." `@dune/core` is a same-org first-party dependency
  published by the same release process, so the supply-chain risk that gate
  protects against doesn't apply here. Scoped to just this one package so
  third-party npm dependencies keep the full 24-hour window.

## [1.0.0] — 2026-07-05

First stable release. No breaking changes from 0.1.2 — the major bump marks the
package's public API as stable going forward, per semver.

### Fixed

- **JSR doc-coverage score was still 64% despite fully-documented origin
  declarations.** `deno_doc` resolves a re-exported symbol as an unresolved
  reference carrying no JSDoc whenever its origin file is itself a separate
  `deno.json` entrypoint. Moving each re-export's doc comment to sit directly
  before the specifier name, inside the export braces, fixes this; all 3
  entrypoints are now at 100% documented symbols.

## [0.1.1] — 2026-07-01

### Changed

- Updated `@dune/core` peer dependency to `^0.25` for compatibility with the new
  `SearchManager` API.

## [0.1.2] — 2026-07-01

### Fixed

- Removed unused imports (`insert`, `remove`, `count`) from `engine.ts` — fixes
  `deno lint` and JSR score.
