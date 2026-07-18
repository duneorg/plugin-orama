# @dune/plugin-orama

[Orama](https://orama.com)-backed search engine for
[Dune CMS](https://getdune.org) sites.

Orama runs fully in-process — no external service or Docker container required.
Swap it in for the built-in search engine when you need typo tolerance and
better relevance scoring without the operational overhead of Meilisearch.

## When to use

|                                   | Built-in    | plugin-orama       | plugin-meilisearch |
| --------------------------------- | ----------- | ------------------ | ------------------ |
| External service                  | —           | —                  | Required           |
| Typo tolerance                    | ✗           | ✓                  | ✓                  |
| Relevance scoring                 | Basic       | Good               | Excellent          |
| Index persistence across restarts | ✗           | Rebuilt on startup | ✓                  |
| Suitable for                      | Small sites | Small–medium sites | Large sites        |

## Installation

Add to your site's `deno.json`:

```json
{
  "imports": {
    "@dune/plugin-orama": "jsr:@dune/plugin-orama"
  }
}
```

## Usage

Enable from `site.yaml`:

```yaml
plugins:
  - src: "jsr:@dune/plugin-orama"
    config:
      active: true # default: true
      typoTolerance: true # default: true (Orama tolerance: 1)
      excerptLength: 160 # default: 160 characters
```

That's it. Dune calls the engine's `build()` at startup and `rebuild()` on
content changes. The same search API and templates work unchanged.

## Configuration

```yaml
plugins:
  - src: "jsr:@dune/plugin-orama"
    config:
      active: true
      # Set to false to register the engine without activating it.
      # Useful when running both built-in and Orama in parallel mode.

      typoTolerance: true
      # When true, searches tolerate one-character typos (Orama tolerance: 1).
      # Set to false for exact-match-only search.

      excerptLength: 160
# Character length of excerpt returned per result.
```

## Programmatic usage

```ts
import { createOramaEngine } from "@dune/plugin-orama/engine";

const engine = createOramaEngine(
  { tolerance: 1, excerptLength: 200 },
  pages, // PageIndex[] from @dune/core
  { loadText }, // async (page) => string — body text loader
);

await engine.build();
const results = await engine.search("my query");
const suggestions = await engine.suggest("my");
```

## Multi-engine setup

Register Orama alongside the built-in engine without activating it, then switch
at runtime via the admin panel's Search tab:

```yaml
plugins:
  - src: "jsr:@dune/plugin-orama"
    config:
      active: false # register without activating
```

Switch the active engine at runtime via `PATCH /admin/api/search/engines`:

```bash
curl -X PATCH /admin/api/search/engines \
  -H "Content-Type: application/json" \
  -d '{"active": "orama"}'
```

## Document schema

Each Dune page is indexed as:

```ts
{
  route: string;      // e.g. "/articles/my-post"
  title: string;
  body: string;       // plain text body loaded via loadText
  template: string;
  language: string;
  tags: string[];     // all taxonomy values flattened across vocabularies
}
```

The Orama index is rebuilt in memory on each startup. For large sites (thousands
of pages) startup time increases proportionally to the body text loaded. Typical
small-to-medium sites (< 1000 pages) build in under a second.

## License

MIT
