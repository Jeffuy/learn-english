"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";
import { CHAMULLERO_QUESTIONS } from "./questions";

const STORAGE_KEY = "chamullero-secret-quiz-v1";

function shuffledIds() {
  const ids = CHAMULLERO_QUESTIONS.map(({ id }) => id);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [ids[index], ids[randomIndex]] = [ids[randomIndex], ids[index]];
  }
  return ids;
}

function isValidOrder(order) {
  return (
    Array.isArray(order) &&
    order.length === CHAMULLERO_QUESTIONS.length &&
    new Set(order).size === CHAMULLERO_QUESTIONS.length &&
    order.every((id) => CHAMULLERO_QUESTIONS.some((question) => question.id === id))
  );
}

function HighlightedSentence({ question }) {
  const highlightedText = question.highlight ?? question.term;
  const startIndex = question.sentence
    .toLocaleLowerCase("es")
    .indexOf(highlightedText.toLocaleLowerCase("es"));

  if (startIndex === -1) return question.sentence;

  const endIndex = startIndex + highlightedText.length;
  return (
    <>
      {question.sentence.slice(0, startIndex)}
      <mark className={styles.highlightedTerm}>
        {question.sentence.slice(startIndex, endIndex)}
      </mark>
      {question.sentence.slice(endIndex)}
    </>
  );
}

export default function ChamulleroPage() {
  const scrollPositionToRestore = useRef(null);
  const [hydrated, setHydrated] = useState(false);
  const [order, setOrder] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [phase, setPhase] = useState("playing");

  const questionById = useMemo(
    () =>
      new Map(CHAMULLERO_QUESTIONS.map((question) => [question.id, question])),
    [],
  );
  const currentQuestion = questionById.get(order[currentIndex]);
  const wasCorrect = selectedOption === currentQuestion?.answer;
  const progress = ((currentIndex + 1) / 50) * 100;

  useLayoutEffect(() => {
    if (scrollPositionToRestore.current === null) return;
    window.scrollTo(0, scrollPositionToRestore.current);
    scrollPositionToRestore.current = null;
  });

  useEffect(() => {
    let savedGame = null;
    try {
      savedGame = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    queueMicrotask(() => {
      if (savedGame && isValidOrder(savedGame.order)) {
        setOrder(savedGame.order);
        setCurrentIndex(Math.min(savedGame.currentIndex ?? 0, 49));
        setScore(Math.max(0, Math.min(savedGame.score ?? 0, 50)));
        setSelectedOption(savedGame.selectedOption ?? null);
        setPhase(savedGame.phase === "finished" ? "finished" : "playing");
      } else {
        setOrder(shuffledIds());
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated || order.length !== 50) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        order,
        currentIndex,
        score,
        selectedOption,
        phase,
      }),
    );
  }, [currentIndex, hydrated, order, phase, score, selectedOption]);

  function chooseOption(option) {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === currentQuestion.answer) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function nextQuestion() {
    if (!selectedOption) return;
    if (currentIndex === 49) {
      setPhase("finished");
      return;
    }
    scrollPositionToRestore.current = window.scrollY;
    setCurrentIndex((index) => index + 1);
    setSelectedOption(null);
  }

  function restartQuiz(confirmRestart = true) {
    if (
      confirmRestart &&
      !window.confirm("¿Reiniciar el quiz y borrar el puntaje actual?")
    ) {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    setOrder(shuffledIds());
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setPhase("playing");
  }

  if (!hydrated || !currentQuestion) {
    return (
      <main className={styles.loading}>
        <span>🤫</span>
        <p>Abriendo el quiz secreto…</p>
      </main>
    );
  }

  if (phase === "finished") {
    const percentage = Math.round((score / 50) * 100);
    return (
      <main className={styles.page}>
        <section className={styles.resultCard}>
          <span className={styles.resultEmoji}>
            {percentage >= 80 ? "🧉" : percentage >= 50 ? "👏" : "📚"}
          </span>
          <p className={styles.eyebrow}>QUIZ SECRETO COMPLETADO</p>
          <h1>
            Sacaste <strong>{score}/50</strong>
          </h1>
          <p>
            {percentage >= 80
              ? "¡Imponente! Te defendés bárbaro con el lunfardo uruguayo."
              : percentage >= 50
                ? "¡Vamo arriba! Vas bien, pero todavía queda chamuyo por aprender."
                : "Está salado, pero no pasa nada: otra ronda y sale con fritas."}
          </p>
          <button type="button" onClick={() => restartQuiz(false)}>
            Jugar otra ronda
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.secretMark}>🤫</span>
          <div>
            <p>ACCESO SECRETO</p>
            <strong>El Chamullero</strong>
          </div>
        </div>
        <button type="button" onClick={() => restartQuiz(true)}>
          Reiniciar
        </button>
      </header>

      <section className={styles.quizShell}>
        <div className={styles.statusRow}>
          <span>
            Pregunta <strong>{currentIndex + 1}</strong> de 50
          </span>
          <span>
            Puntaje <strong>{score}</strong>
          </span>
        </div>
        <div className={styles.progressTrack} aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        <article className={styles.questionCard}>
          <div className={styles.emoji} aria-hidden="true">
            {currentQuestion.emoji}
          </div>
          <span className={styles.term}>{currentQuestion.term}</span>
          <p className={styles.prompt}>¿Qué significa en esta frase?</p>
          <h1>
            “<HighlightedSentence question={currentQuestion} />”
          </h1>

          <div className={styles.options}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQuestion.answer;
              const stateClass = selectedOption
                ? isCorrect
                  ? styles.correct
                  : isSelected
                    ? styles.incorrect
                    : styles.dimmed
                : "";

              return (
                <button
                  type="button"
                  key={option}
                  className={stateClass}
                  onClick={() => chooseOption(option)}
                  disabled={Boolean(selectedOption)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <div
              className={`${styles.feedback} ${
                wasCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect
              }`}
              role="status"
            >
              <div>
                <strong>{wasCorrect ? "¡Bárbaro!" : "No era esa."}</strong>
                <p>
                  <b>{currentQuestion.term}</b>: {currentQuestion.answer}.
                </p>
              </div>
              <button type="button" onClick={nextQuestion}>
                {currentIndex === 49 ? "Ver resultado" : "Siguiente"} →
              </button>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
