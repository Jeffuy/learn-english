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
  assert.match(page, /Choose the missing word/);
  assert.doesNotMatch(page, /Say it aloud/);
  assert.match(page, /Remove one wrong answer/);
  assert.match(page, /buyElimination/);
  assert.match(page, /localStorage\.setItem/);
  assert.match(page, /Restart game/);
  assert.match(page, /answer-feedback/);
  assert.match(page, /createQuestionDeck/);
  assert.match(page, /uniqueQuestions/);
  assert.match(page, /savedGameHasValidDeck/);
  assert.match(page, /word-rally-game-v3/);
  assert.doesNotMatch(page, /while \(deck\.length < count\)/);
  assert.match(page, /wasCorrect \? "✓" : "×"/);
  assert.match(layout, /Word Rally/);
  assert.match(packageJson, /"build": "next build"/);
  assert.doesNotMatch(packageJson, /vinext|wrangler|vite/);
});

test("the book provides complete mixed and focused quizzes", () => {
  const entries = Object.entries(QUIZZES);
  const allQuestions = entries.flatMap(([, quiz]) => quiz.questions);
  const mixedEntries = entries.filter(([, quiz]) => quiz.kind === "mixed");
  const focusedEntries = entries.filter(([, quiz]) => quiz.kind === "focused");

  assert.equal(entries.length, 37);
  assert.equal(mixedEntries.length, 8);
  assert.equal(focusedEntries.length, 29);
  assert.deepEqual(
    mixedEntries.map(([, quiz]) => quiz.name),
    [
      "Art, Travel & Natural Wonders",
      "Film, Childhood & Traditions",
      "Photography, Honesty & Adventure",
      "Food, Feelings & Festivals",
      "Fashion, Coffee & the Environment",
      "Spice, Celebrations & Fundraising",
      "Sustainability, Business & Stories",
      "Communication, Culture & Nature",
    ],
  );

  for (const [quizId, quiz] of entries) {
    assert.equal(quiz.questions.length, 50, `${quizId} must contain 50 questions`);
    assert.equal(
      new Set(quiz.questions.map(({ sentence }) => sentence)).size,
      50,
      `${quizId} must not repeat question text`,
    );
    if (quiz.kind === "focused") {
      assert.equal(
        new Set(quiz.questions.map(({ conceptId }) => conceptId)).size,
        50,
        `${quizId} must contain 50 independent concepts`,
      );
      assert.ok(
        quiz.questions.every(({ conceptId }) => Boolean(conceptId)),
        `${quizId} must identify every independent concept`,
      );
    }
    assert.ok(
      quiz.questions.every(
        ({ sentence }) =>
          !/^(Warm-up|Class challenge|Team practice|Revision round|Quick review)/.test(
            sentence,
          ),
      ),
      `${quizId} must not add artificial exercise labels`,
    );

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
      assert.ok(
        !question.context ||
          !question.context.toLowerCase().includes(question.answer.toLowerCase()),
        `${question.id} must not reveal its answer in the context`,
      );
    }
  }

  assert.equal(allQuestions.length, 1850);
  assert.equal(new Set(allQuestions.map(({ id }) => id)).size, 1850);
});

test("ambiguous collocation questions include an explanatory context", () => {
  const collocationQuestions = Object.values(QUIZZES)
    .flatMap((quiz) => quiz.questions)
    .filter(({ hint }) => hint === "Adverb + adjective collocations");

  assert.ok(collocationQuestions.length >= 11);
  assert.ok(collocationQuestions.every(({ context }) => context?.length > 20));
});

test("the setup separates mixed quizzes from focused practice", async () => {
  const page = await readFile(
    new URL("../app/page.jsx", import.meta.url),
    "utf8",
  );

  assert.match(page, /useState\(DEFAULT_QUIZ\)/);
  assert.match(page, /useState\("focused"\)/);
  assert.match(page, /Mixed quizzes/);
  assert.match(page, /Focused practice/);
  assert.match(page, /visibleQuizzes/);
});

test("the teacher can enable, pause and disable the answer timer", async () => {
  const page = await readFile(
    new URL("../app/page.jsx", import.meta.url),
    "utf8",
  );

  assert.match(page, /Answer timer/);
  assert.match(page, /TIMER_OPTIONS/);
  assert.match(page, /setTimerPaused/);
  assert.match(page, /Time&apos;s up/);
  assert.match(page, /safeQuestionHint/);
});
