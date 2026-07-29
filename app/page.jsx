"use client";

import { useEffect, useMemo, useState } from "react";
import { QUIZZES } from "./quizzes";

const TEAM_COLORS = ["#ffcb3d", "#9ce36f", "#ff8d79", "#82c7ff", "#d7a7ff", "#63dbc9"];
const QUESTION_COUNTS = [15, 25, 35, 50];
const TIMER_OPTIONS = [0, 15, 30, 45, 60];
const STORAGE_KEY = "word-rally-game-v3";
const DEFAULT_QUIZ = "phrasal-verbs";

function shuffled(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function createQuestionDeck(quizId, count) {
  const uniqueQuestions = [
    ...new Map(
      QUIZZES[quizId].questions.map((question) => [
        question.sentence.trim().toLowerCase(),
        question,
      ]),
    ).values(),
  ];

  if (uniqueQuestions.length < count) {
    throw new Error(
      `${QUIZZES[quizId].name} does not have ${count} unique questions.`,
    );
  }

  return shuffled(uniqueQuestions)
    .slice(0, count)
    .map((question) => question.id);
}

function savedGameHasValidDeck(savedGame) {
  if (!savedGame || savedGame.phase === "setup") return true;

  const savedQuiz = QUIZZES[savedGame.selectedQuiz];
  const deck = savedGame.questionDeck;
  const count = savedGame.questionCount;

  if (
    !savedQuiz ||
    !Array.isArray(deck) ||
    !QUESTION_COUNTS.includes(count) ||
    deck.length !== count ||
    new Set(deck).size !== deck.length
  ) {
    return false;
  }

  const questionById = new Map(
    savedQuiz.questions.map((question) => [question.id, question]),
  );
  const restoredQuestions = deck.map((id) => questionById.get(id));

  return (
    restoredQuestions.every(Boolean) &&
    new Set(
      restoredQuestions.map((question) =>
        question.sentence.trim().toLowerCase(),
      ),
    ).size === deck.length
  );
}

function TeamMark({ color }) {
  return <span className="team-mark" style={{ background: color }} aria-hidden="true" />;
}

function safeQuestionHint(question) {
  const hintWords = new Set(question.hint.toLowerCase().split(/[^a-z]+/).filter(Boolean));
  const answerWords = question.answer.toLowerCase().split(/[^a-z]+/).filter(
    (word) => word.length > 1,
  );
  return answerWords.some((word) => hintWords.has(word))
    ? "Language focus"
    : question.hint;
}

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState("setup");
  const [teamNames, setTeamNames] = useState(["The Rockets", "Word Wizards"]);
  const [teams, setTeams] = useState([]);
  const [questionCount, setQuestionCount] = useState(15);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(DEFAULT_QUIZ);
  const [quizKind, setQuizKind] = useState("focused");
  const [quizSearch, setQuizSearch] = useState("");
  const [questionDeck, setQuestionDeck] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [outcomes, setOutcomes] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [eliminatedOption, setEliminatedOption] = useState(null);

  const quiz = QUIZZES[selectedQuiz];
  const activeQuestionId = selectedNumber ? questionDeck[selectedNumber - 1] : null;
  const activeQuestion =
    quiz.questions.find((question) => question.id === activeQuestionId) ??
    quiz.questions[0];

  const answeredCount = Object.keys(outcomes).length;
  const remaining = questionCount - answeredCount;
  const canBuyElimination =
    (teams[currentTeam]?.score ?? 0) >= 5 &&
    !eliminatedOption &&
    answerResult === null &&
    !timedOut;
  const winnerScore = Math.max(...teams.map((team) => team.score), 0);
  const winners = teams.filter((team) => team.score === winnerScore);

  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => b.score - a.score),
    [teams],
  );
  const visibleQuizzes = useMemo(() => {
    const search = quizSearch.trim().toLowerCase();

    return Object.entries(QUIZZES).filter(([, quizOption]) => {
      if (quizOption.kind !== quizKind) return false;
      if (!search) return true;

      return `${quizOption.name} ${quizOption.description}`
        .toLowerCase()
        .includes(search);
    });
  }, [quizKind, quizSearch]);

  useEffect(() => {
    let savedGame = null;
    let cancelled = false;

    try {
      localStorage.removeItem("word-rally-game-v1");
      localStorage.removeItem("word-rally-game-v2");
      savedGame = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    queueMicrotask(() => {
      if (cancelled) return;

      if (savedGame?.version === 1 && savedGameHasValidDeck(savedGame)) {
        setPhase(savedGame.phase ?? "setup");
        setTeamNames(savedGame.teamNames ?? ["The Rockets", "Word Wizards"]);
        setTeams(savedGame.teams ?? []);
        setQuestionCount(savedGame.questionCount ?? 15);
        setTimerSeconds(savedGame.timerSeconds ?? 0);
        setTimeLeft(savedGame.timeLeft ?? 0);
        setTimerPaused(savedGame.timerPaused ?? false);
        setTimedOut(savedGame.timedOut ?? false);
        const restoredQuiz = QUIZZES[savedGame.selectedQuiz]
          ? savedGame.selectedQuiz
          : DEFAULT_QUIZ;
        setSelectedQuiz(restoredQuiz);
        setQuizKind(QUIZZES[restoredQuiz].kind);
        setQuestionDeck(savedGame.questionDeck ?? []);
        setCurrentTeam(savedGame.currentTeam ?? 0);
        setSelectedNumber(savedGame.selectedNumber ?? null);
        setOutcomes(savedGame.outcomes ?? {});
        setSelectedOption(savedGame.selectedOption ?? null);
        setAnswerResult(savedGame.answerResult ?? null);
        setEliminatedOption(savedGame.eliminatedOption ?? null);
      }
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        phase,
        teamNames,
        teams,
        questionCount,
        timerSeconds,
        timeLeft,
        timerPaused,
        timedOut,
        selectedQuiz,
        quizKind,
        questionDeck,
        currentTeam,
        selectedNumber,
        outcomes,
        selectedOption,
        answerResult,
        eliminatedOption,
      }),
    );
  }, [
    hydrated,
    phase,
    teamNames,
    teams,
    questionCount,
    timerSeconds,
    timeLeft,
    timerPaused,
    timedOut,
    selectedQuiz,
    quizKind,
    questionDeck,
    currentTeam,
    selectedNumber,
    outcomes,
    selectedOption,
    answerResult,
    eliminatedOption,
  ]);

  useEffect(() => {
    const timerIsRunning =
      phase === "question" &&
      timerSeconds > 0 &&
      timeLeft > 0 &&
      !timerPaused &&
      !timedOut &&
      answerResult === null;

    if (!timerIsRunning) return undefined;

    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        const next = Math.max(0, current - 1);
        if (next === 0) {
          setTimedOut(true);
          setOutcomes((currentOutcomes) =>
            selectedNumber
              ? { ...currentOutcomes, [selectedNumber]: false }
              : currentOutcomes,
          );
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [
    answerResult,
    phase,
    selectedNumber,
    timedOut,
    timeLeft,
    timerPaused,
    timerSeconds,
  ]);

  function updateTeamName(index, value) {
    setTeamNames((names) => names.map((name, i) => (i === index ? value : name)));
  }

  function addTeam() {
    if (teamNames.length < 6) {
      setTeamNames((names) => [...names, `Team ${names.length + 1}`]);
    }
  }

  function removeTeam(index) {
    if (teamNames.length > 2) {
      setTeamNames((names) => names.filter((_, i) => i !== index));
    }
  }

  function chooseQuizKind(kind) {
    const firstQuiz = Object.entries(QUIZZES).find(
      ([, quizOption]) => quizOption.kind === kind,
    );
    setQuizKind(kind);
    if (firstQuiz) setSelectedQuiz(firstQuiz[0]);
  }

  function startGame() {
    const cleanNames = teamNames.map((name, index) => name.trim() || `Team ${index + 1}`);
    setTeams(
      cleanNames.map((name, index) => ({
        id: index,
        name,
        score: 0,
        color: TEAM_COLORS[index],
      })),
    );
    setQuestionDeck(createQuestionDeck(selectedQuiz, questionCount));
    setOutcomes({});
    setCurrentTeam(0);
    setSelectedNumber(null);
    setSelectedOption(null);
    setAnswerResult(null);
    setEliminatedOption(null);
    setTimeLeft(timerSeconds);
    setTimerPaused(false);
    setTimedOut(false);
    setPhase("board");
  }

  function openQuestion(number) {
    setSelectedNumber(number);
    setSelectedOption(null);
    setAnswerResult(null);
    setEliminatedOption(null);
    setTimeLeft(timerSeconds);
    setTimerPaused(false);
    setTimedOut(false);
    setPhase("question");
  }

  function checkChoiceAnswer() {
    setAnswerResult(selectedOption === activeQuestion.answer);
  }

  function buyElimination() {
    if (!canBuyElimination) return;

    const wrongOptions = activeQuestion.options.filter(
      (option) =>
        option !== activeQuestion.answer && option !== selectedOption,
    );
    const optionToRemove =
      wrongOptions[((selectedNumber ?? 1) - 1) % wrongOptions.length];

    setTeams((current) =>
      current.map((team, index) =>
        index === currentTeam
          ? { ...team, score: team.score - 5 }
          : team,
      ),
    );
    setEliminatedOption(optionToRemove);
  }

  function finishTurn(correct) {
    const points = 10;
    if (correct) {
      setTeams((current) =>
        current.map((team, index) =>
          index === currentTeam ? { ...team, score: team.score + points } : team,
        ),
      );
    }

    const nextOutcomes = selectedNumber
      ? { ...outcomes, [selectedNumber]: correct }
      : outcomes;
    setOutcomes(nextOutcomes);

    if (Object.keys(nextOutcomes).length >= questionCount) {
      setPhase("finished");
      return;
    }

    setCurrentTeam((current) => (current + 1) % teams.length);
    setTimerPaused(false);
    setTimedOut(false);
    setPhase("board");
  }

  function resetGame(skipConfirmation = false) {
    if (
      !skipConfirmation &&
      phase !== "setup" &&
      !window.confirm("Restart the game? All scores and progress will be cleared.")
    ) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    setPhase("setup");
    setTeams([]);
    setQuestionDeck([]);
    setOutcomes({});
    setCurrentTeam(0);
    setSelectedNumber(null);
    setSelectedOption(null);
    setAnswerResult(null);
    setEliminatedOption(null);
    setTimeLeft(0);
    setTimerPaused(false);
    setTimedOut(false);
  }

  if (!hydrated) {
    return (
      <main className="loading-state">
        <span className="brand-badge">W!</span>
        <p>Loading your game…</p>
      </main>
    );
  }

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={() => resetGame()} aria-label="Restart Word Rally">
          <span className="brand-badge">W!</span>
          <span>Word Rally</span>
        </button>
        <div className="header-actions">
          {phase !== "setup" && phase !== "finished" && (
            <div className="round-status">
              <span className="status-dot" />
              Saved automatically
              <strong>{remaining} left</strong>
            </div>
          )}
          {phase !== "setup" && (
            <button className="restart-button" onClick={() => resetGame()}>
              ↻ Restart game
            </button>
          )}
        </div>
      </header>

      {phase === "setup" && (
        <section className="setup-shell">
          <div className="setup-intro">
            <span className="eyebrow">CLASSROOM ENGLISH GAME</span>
            <h1>Ready, set, <em>speak!</em></h1>
            <p>Build your teams, pick a challenge, and turn English practice into a friendly competition.</p>
            <div className="how-it-works" aria-label="How it works">
              <span><b>1</b> Make teams</span>
              <i />
              <span><b>2</b> Pick a number</span>
              <i />
              <span><b>3</b> Win points</span>
            </div>
          </div>

          <div className="setup-grid">
            <section className="setup-card team-card">
              <div className="card-heading">
                <span className="step-number">01</span>
                <div>
                  <h2>Create your teams</h2>
                  <p>2–6 teams can play</p>
                </div>
              </div>
              <div className="team-inputs">
                {teamNames.map((name, index) => (
                  <div className="team-input-row" key={index}>
                    <TeamMark color={TEAM_COLORS[index]} />
                    <label>
                      <span>Team {index + 1}</span>
                      <input
                        value={name}
                        maxLength={24}
                        onChange={(event) => updateTeamName(index, event.target.value)}
                        aria-label={`Team ${index + 1} name`}
                      />
                    </label>
                    {teamNames.length > 2 && (
                      <button
                        className="remove-button"
                        onClick={() => removeTeam(index)}
                        aria-label={`Remove team ${index + 1}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {teamNames.length < 6 && (
                <button className="add-team-button" onClick={addTeam}>
                  <span>+</span> Add another team
                </button>
              )}
            </section>

            <div className="setup-options">
              <section className="setup-card compact-card">
                <div className="card-heading">
                  <span className="step-number">02</span>
                  <div>
                    <h2>Choose the game length</h2>
                    <p>How many questions?</p>
                  </div>
                </div>
                <div className="count-options">
                  {QUESTION_COUNTS.map((count) => (
                    <button
                      key={count}
                      className={questionCount === count ? "selected" : ""}
                      onClick={() => setQuestionCount(count)}
                    >
                      <strong>{count}</strong>
                      <span>{count === 15 ? "Quick" : count === 25 ? "Classic" : count === 35 ? "Long" : "Epic"}</span>
                    </button>
                  ))}
                </div>
                <div className="timer-setup">
                  <div>
                    <strong>Answer timer</strong>
                    <span>Optional time for each team</span>
                  </div>
                  <div className="timer-options">
                    {TIMER_OPTIONS.map((seconds) => (
                      <button
                        type="button"
                        key={seconds}
                        className={timerSeconds === seconds ? "selected" : ""}
                        onClick={() => setTimerSeconds(seconds)}
                      >
                        {seconds === 0 ? "Off" : `${seconds}s`}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="setup-card compact-card">
                <div className="card-heading">
                  <span className="step-number">03</span>
                  <div>
                    <h2>Pick a topic</h2>
                    <p>Choose a quiz for this game</p>
                  </div>
                </div>
                <div className="quiz-kind-tabs" role="tablist" aria-label="Quiz type">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={quizKind === "mixed"}
                    className={quizKind === "mixed" ? "selected" : ""}
                    onClick={() => chooseQuizKind("mixed")}
                  >
                    Mixed quizzes
                    <small>Several skills together</small>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={quizKind === "focused"}
                    className={quizKind === "focused" ? "selected" : ""}
                    onClick={() => chooseQuizKind("focused")}
                  >
                    Focused practice
                    <small>One specific topic</small>
                  </button>
                </div>
                <div className="quiz-search">
                  <input
                    type="search"
                    value={quizSearch}
                    onChange={(event) => setQuizSearch(event.target.value)}
                    placeholder="Search quizzes..."
                    aria-label="Search quizzes"
                  />
                  {quizSearch && (
                    <button
                      type="button"
                      onClick={() => setQuizSearch("")}
                      aria-label="Clear quiz search"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="topic-list">
                  {visibleQuizzes.map(([quizId, quizOption]) => (
                    <button
                      key={quizId}
                      className={`topic-option ${selectedQuiz === quizId ? "selected" : ""}`}
                      onClick={() => setSelectedQuiz(quizId)}
                    >
                      <span className="topic-icon">{quizOption.icon}</span>
                      <span>
                        <strong>{quizOption.name}</strong>
                        <small>{quizOption.description}</small>
                      </span>
                      {selectedQuiz === quizId && <span className="check">✓</span>}
                    </button>
                  ))}
                  {visibleQuizzes.length === 0 && (
                    <div className="quiz-empty-state">
                      <strong>No quizzes found</strong>
                      <span>Try a different search or quiz type.</span>
                    </div>
                  )}
                </div>
              </section>

              <button className="start-button" onClick={startGame}>
                Start the game <span>→</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === "board" && (
        <section className="game-shell">
          <aside className="scoreboard">
            <div className="scoreboard-title">
              <span>★</span>
              <h2>Scoreboard</h2>
            </div>
            <div className="team-scores">
              {teams.map((team, index) => (
                <div className={`score-row ${index === currentTeam ? "active" : ""}`} key={team.id}>
                  <TeamMark color={team.color} />
                  <span className="score-name">{team.name}</span>
                  <strong>{team.score}</strong>
                  <small>pts</small>
                </div>
              ))}
            </div>
            <div className="score-key">
              <span><b>+10</b> Correct answer</span>
              <span><b>−5</b> Remove one wrong answer</span>
            </div>
          </aside>

          <div className="board-area">
            <div className="turn-banner">
              <div>
                <span className="eyebrow">IT&apos;S YOUR TURN</span>
                <h1><TeamMark color={teams[currentTeam]?.color} /> {teams[currentTeam]?.name}</h1>
              </div>
              <p>Pick any number to reveal your question.</p>
            </div>
            <div className={`number-grid ${questionCount >= 35 ? "dense" : ""}`}>
              {Array.from({ length: questionCount }, (_, index) => index + 1).map((number) => {
                const hasOutcome = Object.prototype.hasOwnProperty.call(outcomes, number);
                const wasCorrect = outcomes[number] === true;
                return (
                  <button
                    key={number}
                    disabled={hasOutcome}
                    className={hasOutcome ? (wasCorrect ? "correct" : "incorrect") : ""}
                    onClick={() => openQuestion(number)}
                    aria-label={
                      hasOutcome
                        ? `Question ${number}, answered ${wasCorrect ? "correctly" : "incorrectly"}`
                        : `Choose question ${number}`
                    }
                  >
                    {hasOutcome ? (wasCorrect ? "✓" : "×") : number}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {phase === "question" && (
        <section className="question-shell">
          {!timedOut && (
            <button className="back-button" onClick={() => setPhase("board")}>← Back to board</button>
          )}
          <div className="question-topline">
            <span>Question {selectedNumber} of {questionCount}</span>
            {timerSeconds > 0 && (
              <div className={`question-timer ${timeLeft <= 5 ? "urgent" : ""}`}>
                <strong>{timeLeft}s</strong>
                {!timedOut && answerResult === null && (
                  <button
                    type="button"
                    onClick={() => setTimerPaused((paused) => !paused)}
                  >
                    {timerPaused ? "Resume" : "Pause"}
                  </button>
                )}
              </div>
            )}
            <span className="playing-team"><TeamMark color={teams[currentTeam]?.color} /> {teams[currentTeam]?.name}</span>
          </div>

          <div className="question-card">
            <span className="question-hint">{safeQuestionHint(activeQuestion)}</span>
            <p className="question-label">Complete the sentence</p>
            {activeQuestion.context && (
              <p className="question-context">{activeQuestion.context}</p>
            )}
            <h1>{activeQuestion.sentence}</h1>

            {timedOut && (
              <div className="timeout-panel">
                <span>Time&apos;s up</span>
                <h2>This question is marked incorrect.</h2>
                <p>The correct answer is <strong>{activeQuestion.answer}</strong>.</p>
                <button onClick={() => finishTurn(false)}>Continue →</button>
              </div>
            )}

            {!timedOut && (
              <div className="answer-area">
                <div className="answer-header">
                  <p>Choose the missing word</p>
                  <span>Worth 10 points</span>
                </div>
                <div className="elimination-help">
                  <button
                    type="button"
                    disabled={!canBuyElimination}
                    onClick={buyElimination}
                  >
                    {eliminatedOption
                      ? "One wrong answer removed"
                      : "Remove one wrong answer · −5 pts"}
                  </button>
                  {!eliminatedOption && (teams[currentTeam]?.score ?? 0) < 5 && (
                    <small>Your team needs at least 5 points.</small>
                  )}
                </div>
                <div className="answer-options">
                  {activeQuestion.options
                    .filter((option) => option !== eliminatedOption)
                    .map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isCorrectAnswer = option === activeQuestion.answer;
                    const resultClass =
                      answerResult === null
                        ? isSelected ? "selected" : ""
                        : isCorrectAnswer
                          ? "correct-answer"
                          : isSelected
                            ? "wrong-answer"
                            : "";

                    return (
                      <button
                        key={option}
                        disabled={answerResult !== null}
                        onClick={() => setSelectedOption(option)}
                        className={resultClass}
                      >
                        <span>{String.fromCharCode(65 + index)}</span>{option}
                      </button>
                    );
                  })}
                </div>
                {answerResult === null ? (
                  <button
                    className="submit-answer"
                    disabled={!selectedOption}
                    onClick={checkChoiceAnswer}
                  >
                    Lock in answer
                  </button>
                ) : (
                  <div className={`answer-feedback ${answerResult ? "correct" : "incorrect"}`}>
                    <div>
                      <strong>{answerResult ? "✓ Correct!" : "× Not quite"}</strong>
                      <span>
                        {answerResult
                          ? "Great answer — 10 points!"
                          : <>The correct answer is <b>{activeQuestion.answer}</b>.</>}
                      </span>
                    </div>
                    <button onClick={() => finishTurn(answerResult)}>Continue →</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {phase === "finished" && (
        <section className="finished-shell">
          <div className="trophy">★</div>
          <span className="eyebrow">GAME COMPLETE</span>
          <h1>{winners.length > 1 ? "It’s a tie!" : `${winners[0]?.name} wins!`}</h1>
          <p>Great teamwork and great English.</p>
          <div className="final-scores">
            {sortedTeams.map((team, index) => (
              <div className={index === 0 ? "winner-row" : ""} key={team.id}>
                <span className="rank">{index + 1}</span>
                <TeamMark color={team.color} />
                <strong>{team.name}</strong>
                <b>{team.score} pts</b>
              </div>
            ))}
          </div>
          <button className="start-button" onClick={() => resetGame(true)}>Play again <span>↻</span></button>
        </section>
      )}
    </main>
  );
}
