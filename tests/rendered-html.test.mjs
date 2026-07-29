import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { QUIZZES } from "../app/quizzes.js";

test("Word Rally keeps its core classroom game flow", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.jsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.jsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Ready, set,/);
  assert.match(page, /Create your teams/);
  assert.match(page, /Start the game/);
  assert.match(page, /Pick an answer/);
  assert.match(page, /Say it aloud/);
  assert.match(page, /localStorage\.setItem/);
  assert.match(page, /Restart game/);
  assert.match(page, /answer-feedback/);
  assert.match(page, /createQuestionDeck/);
  assert.match(page, /wasCorrect \? "✓" : "×"/);
  assert.match(layout, /Word Rally/);
  assert.match(packageJson, /"build": "next build"/);
  assert.doesNotMatch(packageJson, /vinext|wrangler|vite/);
});

test("the book provides eight complete and valid unit quizzes", () => {
  const entries = Object.entries(QUIZZES);
  const allQuestions = entries.flatMap(([, quiz]) => quiz.questions);

  assert.equal(entries.length, 8);
  assert.deepEqual(
    entries.map(([, quiz]) => quiz.name),
    [
      "Unit 1: Blue",
      "Unit 2: Orange",
      "Unit 3: White",
      "Unit 4: Pink",
      "Unit 5: Black",
      "Unit 6: Red",
      "Unit 7: Green",
      "Unit 8: Yellow",
    ],
  );

  for (const [quizId, quiz] of entries) {
    assert.equal(quiz.questions.length, 50, `${quizId} must contain 50 questions`);

    for (const question of quiz.questions) {
      assert.equal(question.options.length, 4, `${question.id} must have four options`);
      assert.equal(
        new Set(question.options).size,
        4,
        `${question.id} must have four distinct options`,
      );
      assert.ok(
        question.options.includes(question.answer),
        `${question.id} must include its answer among its options`,
      );
    }
  }

  assert.equal(allQuestions.length, 400);
  assert.equal(new Set(allQuestions.map(({ id }) => id)).size, 400);
  assert.equal(new Set(allQuestions.map(({ sentence }) => sentence)).size, 400);
});
