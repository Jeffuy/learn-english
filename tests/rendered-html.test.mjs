import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { QUIZZES } from "../app/quiz-bank.js";
import { CHAMULLERO_QUESTIONS } from "../app/chamullero/questions.js";

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
  assert.match(page, /chooseChoiceAnswer\(option\)/);
  assert.doesNotMatch(page, /Lock in answer/);
  assert.match(page, /scrollPositionToRestore/);
  assert.match(page, /window\.scrollTo/);
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
  assert.match(page, /Search quizzes/);
  assert.match(page, /quizOption\.name} \$\{quizOption\.description/);
  assert.match(page, /No quizzes found/);
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

test("every quiz question is complete and has one unambiguous answer", () => {
  for (const [quizId, quiz] of Object.entries(QUIZZES)) {
    for (const question of quiz.questions) {
      const label = `${quizId}/${question.id}`;
      const blanks = question.sentence.match(/___/g) ?? [];

      assert.ok(blanks.length >= 1, `${label} must contain at least one blank`);
      assert.equal(question.options.length, 4, `${label} must have four options`);
      assert.equal(
        new Set(question.options.map((option) => option.toLowerCase())).size,
        4,
        `${label} must have four different options`,
      );
      assert.ok(
        question.options.includes(question.answer),
        `${label} must include its answer among the options`,
      );
    }
  }
});

test("questions and visible help do not reveal their own answers", () => {
  const escapeRegExp = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  for (const [quizId, quiz] of Object.entries(QUIZZES)) {
    for (const question of quiz.questions) {
      const answer = question.answer.trim();
      if (answer.length < 3 || answer.includes("/")) continue;

      const answerPattern = new RegExp(
        `(^|[^a-z])${escapeRegExp(answer.toLowerCase())}([^a-z]|$)`,
      );
      const visiblePrompt = [
        question.sentence.replaceAll("___", ""),
        question.context ?? "",
      ]
        .join(" ")
        .toLowerCase();

      assert.doesNotMatch(
        visiblePrompt,
        answerPattern,
        `${quizId}/${question.id} reveals "${answer}" before answering`,
      );
    }
  }
});

test("conditionals are fifty individually authored questions", async () => {
  const source = await readFile(
    new URL("../app/quiz-bank.js", import.meta.url),
    "utf8",
  );
  const questions = QUIZZES.conditionals.questions;

  assert.equal(questions.length, 50);
  assert.equal(new Set(questions.map(({ sentence }) => sentence)).size, 50);
  assert.doesNotMatch(source, /conditionalSituations|flatMap|createSentenceVariant/);
});

test("the active bank stores every question explicitly", async () => {
  const source = await readFile(
    new URL("../app/quiz-bank.js", import.meta.url),
    "utf8",
  );

  assert.equal((source.match(/"sentence":/g) ?? []).length, 1850);
  assert.equal((source.match(/"answer":/g) ?? []).length, 1850);
  assert.equal((source.match(/"options":/g) ?? []).length, 1850);
  assert.doesNotMatch(
    source,
    /flatMap|createSentenceVariant|expandFocusedQuestions|conditionalSituations/,
  );
});

test("definition questions use distractors from the same semantic area", () => {
  const caveQuestion = QUIZZES["art-natural-phenomena"].questions.find(
    ({ answer }) => answer === "stalagmite",
  );
  const obligationQuestion = QUIZZES["modal-verbs"].questions.find(
    ({ sentence }) => sentence.startsWith("Cyclists"),
  );

  assert.deepEqual(
    new Set(caveQuestion.options),
    new Set(["stalagmite", "stalactite", "geyser", "volcano"]),
  );
  assert.deepEqual(
    new Set(obligationQuestion.options),
    new Set(["must", "might", "could", "would"]),
  );
});

test("modal questions are direct sentences with matching answer forms", () => {
  const questions = QUIZZES["modal-verbs"].questions;

  assert.equal(questions.length, 50);
  assert.ok(
    questions.every(({ sentence }) =>
      !sentence.startsWith("The modal expression"),
    ),
  );
  assert.deepEqual(questions[40], {
    id: "modal-verbs-41",
    conceptId: "modal-verbs:explicit-41",
    sentence: "___ I come in, please?",
    answer: "May",
    options: ["May", "Should", "Must", "Would"],
    hint: "Modal verbs",
  });
});

test("the game never shows long meta-question prefixes", () => {
  const questions = Object.values(QUIZZES).flatMap((quiz) => quiz.questions);

  assert.ok(
    questions.every(
      ({ sentence }) =>
        !/^(The modal expression|The expression meaning|The word meaning|The term for)/.test(
          sentence,
        ),
    ),
  );
});

test("the secret Uruguayan slang quiz contains fifty complete questions", async () => {
  const [secretPage, mainPage] = await Promise.all([
    readFile(new URL("../app/chamullero/page.jsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.jsx", import.meta.url), "utf8"),
  ]);

  assert.equal(CHAMULLERO_QUESTIONS.length, 50);
  assert.equal(
    new Set(CHAMULLERO_QUESTIONS.map(({ term }) => term)).size,
    50,
  );
  assert.ok(
    CHAMULLERO_QUESTIONS.every(
      ({ answer, emoji, options }) =>
        emoji.length > 0 &&
        options.length === 4 &&
        new Set(options).size === 4 &&
        options.includes(answer),
    ),
  );
  assert.ok(
    CHAMULLERO_QUESTIONS.every(({ highlight, sentence, term }) =>
      sentence
        .toLocaleLowerCase("es")
        .includes((highlight ?? term).toLocaleLowerCase("es")),
    ),
  );
  assert.match(secretPage, /El Chamullero/);
  assert.match(secretPage, /HighlightedSentence/);
  assert.match(secretPage, /scrollPositionToRestore/);
  assert.match(secretPage, /window\.scrollTo/);
  assert.match(secretPage, /chamullero-secret-quiz-v1/);
  assert.match(secretPage, /¿Qué significa en esta frase\?/);
  assert.doesNotMatch(mainPage, /chamullero/i);
  assert.ok(!Object.hasOwn(QUIZZES, "chamullero"));
});
