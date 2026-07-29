import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Word Rally keeps its core classroom game flow", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.jsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.jsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Ready, set,/);
  assert.match(page, /Create your teams/);
  assert.match(page, /Everyday English/);
  assert.match(page, /Start the game/);
  assert.match(page, /Pick an answer/);
  assert.match(page, /Say it aloud/);
  assert.match(page, /localStorage\.setItem/);
  assert.match(page, /Restart game/);
  assert.match(page, /answer-feedback/);
  assert.match(page, /Travel Talk/);
  assert.match(page, /Food & Dining/);
  assert.match(page, /createQuestionDeck/);
  assert.match(page, /wasCorrect \? "✓" : "×"/);
  assert.match(layout, /Word Rally/);
  assert.match(packageJson, /"build": "next build"/);
  assert.doesNotMatch(packageJson, /vinext|wrangler|vite/);
});
