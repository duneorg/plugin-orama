# Changelog

## [1.0.0] — 2026-07-05

First stable release. No breaking changes from 0.1.2 — the major bump marks
the package's public API as stable going forward, per semver.

### Fixed

- **JSR doc-coverage score was still 64% despite fully-documented origin
  declarations.** `deno_doc` resolves a re-exported symbol as an unresolved
  reference carrying no JSDoc whenever its origin file is itself a separate
  `deno.json` entrypoint. Moving each re-export's doc comment to sit directly
  before the specifier name, inside the export braces, fixes this; all 3
  entrypoints are now at 100% documented symbols.

## [0.1.1] — 2026-07-01

### Changed

- Updated `@dune/core` peer dependency to `^0.25` for compatibility with the new `SearchManager` API.

## [0.1.2] — 2026-07-01

### Fixed

- Removed unused imports (`insert`, `remove`, `count`) from `engine.ts` — fixes `deno lint` and JSR score.
