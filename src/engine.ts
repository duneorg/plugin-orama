/**
 * Orama-backed SearchEngine implementation.
 *
 * Implements Dune's `SearchEngine` interface using Orama's in-memory
 * full-text search with built-in typo tolerance.
 *
 * @module
 */

import type { SearchEngine, SearchResult, PageIndex, InjectedSearchRecord } from "@dune/core/search";
import { create, insertMultiple, search } from "@orama/orama";
import type { Orama, AnySchema, Results } from "@orama/orama";

/** Options for {@link createOramaEngine}. */
export interface OramaEngineOptions {
  /** Character length of returned excerpts. @default 160 */
  excerptLength?: number;
  /**
   * Orama typo tolerance (edit distance). Set to 0 to disable.
   * @default 1
   */
  tolerance?: number;
}

/** Runtime wiring supplied by the Dune plugin layer. */
export interface OramaEngineRuntime {
  /** Load a page's plain-text body. */
  loadText?: (page: PageIndex) => Promise<string>;
  /** Plugin-injected records (e.g. PDF text) to index alongside pages. */
  injectedRecords?: InjectedSearchRecord[];
}

const SCHEMA = {
  route: "string",
  title: "string",
  body: "string",
  template: "string",
  language: "string",
  tags: "string[]",
} as const;

type OramaDoc = {
  route: string;
  title: string;
  body: string;
  template: string;
  language: string;
  tags: string[];
};

/**
 * Create an Orama-backed search engine.
 *
 * Orama runs entirely in-process — no external service required.
 * Provides typo-tolerant full-text search with facets and scoring.
 */
export function createOramaEngine(
  options: OramaEngineOptions = {},
  initialPages: PageIndex[] = [],
  runtime: OramaEngineRuntime = {},
): SearchEngine {
  const excerptLength = options.excerptLength ?? 160;
  const tolerance = options.tolerance ?? 1;
  const { loadText, injectedRecords = [] } = runtime;

  let pages = initialPages;
  // deno-lint-ignore no-explicit-any
  let db: Orama<any> | null = null;

  // Route → Orama internal ID, needed for updates.
  const routeToId = new Map<string, string>();

  async function createDb() {
    return await create({ schema: SCHEMA as AnySchema });
  }

  function pageToDoc(page: PageIndex, body: string): OramaDoc {
    return {
      route: page.route,
      title: page.title,
      body,
      template: page.template,
      language: page.language,
      tags: Object.values(page.taxonomy).flat(),
    };
  }

  function injectedToDoc(rec: InjectedSearchRecord): OramaDoc {
    return {
      route: rec.route,
      title: rec.title,
      body: rec.body,
      template: rec.template ?? "page",
      language: "en",
      tags: rec.fields ? Object.values(rec.fields) : [],
    };
  }

  function excerptFrom(body: string, queryTerms: string[]): string {
    if (!body) return "";
    const lower = body.toLowerCase();
    let bestStart = 0;
    let bestCount = 0;

    const step = Math.max(1, Math.floor(excerptLength / 4));
    for (let i = 0; i < lower.length; i += step) {
      const window = lower.slice(i, i + excerptLength);
      let count = 0;
      for (const term of queryTerms) {
        if (window.includes(term.toLowerCase())) count++;
      }
      if (count > bestCount) {
        bestCount = count;
        bestStart = i;
      }
    }

    const start = bestStart;
    const end = Math.min(body.length, start + excerptLength);
    return (start > 0 ? "…" : "") + body.slice(start, end).trim() +
      (end < body.length ? "…" : "");
  }

  return {
    async build(): Promise<void> {
      db = await createDb();
      routeToId.clear();

      const published = pages.filter((p) => p.published && p.route);
      const docs: OramaDoc[] = await Promise.all(
        published.map(async (p) => {
          const body = loadText ? await loadText(p) : "";
          return pageToDoc(p, body);
        }),
      );

      const injectedDocs = injectedRecords.map(injectedToDoc);
      const allDocs = [...docs, ...injectedDocs];

      if (allDocs.length > 0) {
        // insertMultiple returns array of generated IDs
        // deno-lint-ignore no-explicit-any
        const ids = await insertMultiple(db, allDocs as any[]);
        for (let i = 0; i < allDocs.length; i++) {
          routeToId.set(allDocs[i].route, ids[i] as string);
        }
      }
    },

    async search(query: string, limit = 20): Promise<SearchResult[]> {
      if (!db || !query.trim()) return [];

      const queryTerms = query.trim().toLowerCase().split(/\s+/).filter((t) => t.length >= 2);

      // deno-lint-ignore no-explicit-any
      const results: Results<any> = await search(db, {
        term: query,
        limit,
        tolerance,
        boost: { title: 3, body: 1 },
      });

      return results.hits.map((hit) => {
        const doc = hit.document as OramaDoc;
        const route = doc.route;
        const title = doc.title;

        // Reconstruct a PageIndex from indexed fields with defaults for
        // fields not stored in Orama.
        const page: PageIndex = {
          sourcePath: `${route.replace(/^\//, "")}.md`,
          route,
          title,
          navTitle: title,
          date: null,
          template: doc.template,
          language: doc.language,
          format: "md",
          published: true,
          status: "published",
          visible: true,
          routable: true,
          isModule: false,
          order: 0,
          depth: 1,
          parentPath: null,
          taxonomy: doc.tags.length > 0 ? { tag: doc.tags } : {},
          mtime: 0,
          hash: "",
        };

        const excerpt = excerptFrom(doc.body, queryTerms);

        return {
          page,
          score: hit.score,
          excerpt,
        } satisfies SearchResult;
      });
    },

    async rebuild(newPages: PageIndex[]): Promise<void> {
      pages = newPages;
      await this.build();
    },

    async suggest(prefix: string, limit = 10): Promise<string[]> {
      if (!db || !prefix || prefix.length < 2) return [];

      // deno-lint-ignore no-explicit-any
      const results: Results<any> = await search(db, {
        term: prefix,
        limit,
        tolerance: 0, // exact prefix for suggestions
        properties: ["title"],
      });

      const seen = new Set<string>();
      for (const hit of results.hits) {
        const doc = hit.document as OramaDoc;
        if (doc.title) seen.add(doc.title);
        if (seen.size >= limit) break;
      }
      return [...seen];
    },
  };
}
