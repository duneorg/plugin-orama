import { assertEquals, assertGreater } from "@std/assert";
import { createOramaEngine } from "../src/engine.ts";
import type { PageIndex } from "@dune/core/search";

function makePage(
  route: string,
  title: string,
  tags: string[] = [],
): PageIndex {
  return {
    sourcePath: `${route.replace(/^\//, "")}.md`,
    route,
    title,
    navTitle: title,
    date: null,
    template: "page",
    language: "en",
    format: "md",
    published: true,
    status: "published",
    visible: true,
    routable: true,
    isModule: false,
    order: 0,
    depth: 1,
    parentPath: null,
    taxonomy: tags.length ? { tag: tags } : {},
    mtime: 0,
    hash: "",
  };
}

Deno.test("createOramaEngine — basic search", async () => {
  const pages = [
    makePage("/hello", "Hello World"),
    makePage("/deno", "Deno is awesome"),
  ];

  const engine = createOramaEngine({}, pages, {
    loadText: (p) => Promise.resolve(p.title + " body text for " + p.route),
  });

  await engine.build();

  const results = await engine.search("hello");
  assertEquals(results.length, 1);
  assertEquals(results[0].page.route, "/hello");
  assertGreater(results[0].score, 0);
});

Deno.test("createOramaEngine — typo tolerance", async () => {
  const pages = [makePage("/test", "Meilisearch backend")];

  const engine = createOramaEngine({ tolerance: 1 }, pages, {
    loadText: () => Promise.resolve("full text search engine"),
  });

  await engine.build();

  // "Meilisearh" (one typo) should still match
  const results = await engine.search("Meilisearh");
  assertGreater(results.length, 0);
});

Deno.test("createOramaEngine — rebuild", async () => {
  const pages = [makePage("/a", "First page")];
  const engine = createOramaEngine({}, pages);
  await engine.build();

  const before = await engine.search("first");
  assertEquals(before.length, 1);

  await engine.rebuild([makePage("/b", "Second page")]);
  const after = await engine.search("first");
  assertEquals(after.length, 0);

  const second = await engine.search("second");
  assertEquals(second.length, 1);
});

Deno.test("createOramaEngine — suggest", async () => {
  const pages = [
    makePage("/a", "Astro framework"),
    makePage("/d", "Deno runtime"),
  ];
  const engine = createOramaEngine({}, pages);
  await engine.build();

  const suggestions = await engine.suggest("Den");
  assertGreater(suggestions.length, 0);
});
