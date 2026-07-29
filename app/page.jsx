"use client";

import { useMemo, useState } from "react";

const TEAM_COLORS = ["#ffcb3d", "#9ce36f", "#ff8d79", "#82c7ff", "#d7a7ff", "#63dbc9"];
const QUESTION_COUNTS = [15, 25, 35, 50];

const QUESTIONS = [
  {
    sentence: "She ___ to school every morning.",
    answer: "walks",
    options: ["walk", "walks", "walking", "walked"],
    hint: "Present simple",
  },
  {
    sentence: "We are going to the ___ to borrow a book.",
    answer: "library",
    options: ["bakery", "library", "hospital", "station"],
    hint: "Places in town",
  },
  {
    sentence: "My brother is ___ than me.",
    answer: "taller",
    options: ["tall", "tallest", "taller", "more tall"],
    hint: "Comparatives",
  },
  {
    sentence: "There ___ two apples on the table.",
    answer: "are",
    options: ["is", "be", "am", "are"],
    hint: "There is / There are",
  },
  {
    sentence: "I ___ my homework yesterday.",
    answer: "finished",
    options: ["finish", "finishes", "finished", "finishing"],
    hint: "Past simple",
  },
  {
    sentence: "Could I have a glass ___ water, please?",
    answer: "of",
    options: ["at", "of", "for", "with"],
    hint: "Common expressions",
  },
  {
    sentence: "The cat is hiding ___ the bed.",
    answer: "under",
    options: ["under", "during", "into", "across"],
    hint: "Prepositions",
  },
  {
    sentence: "They ___ playing football right now.",
    answer: "are",
    options: ["is", "are", "do", "have"],
    hint: "Present continuous",
  },
  {
    sentence: "You ___ wear a seat belt in the car.",
    answer: "must",
    options: ["must", "might", "could", "would"],
    hint: "Modal verbs",
  },
  {
    sentence: "How ___ milk do we need?",
    answer: "much",
    options: ["many", "often", "long", "much"],
    hint: "Countable and uncountable nouns",
  },
];

function TeamMark({ color }) {
  return <span className="team-mark" style={{ background: color }} aria-hidden="true" />;
}

export default function Home() {
  const [phase, setPhase] = useState("setup");
  const [teamNames, setTeamNames] = useState(["The Rockets", "Word Wizards"]);
  const [teams, setTeams] = useState([]);
  const [questionCount, setQuestionCount] = useState(15);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [usedNumbers, setUsedNumbers] = useState([]);
  const [answerMode, setAnswerMode] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const activeQuestion = selectedNumber
    ? QUESTIONS[(selectedNumber - 1) % QUESTIONS.length]
    : QUESTIONS[0];

  const remaining = questionCount - usedNumbers.length;
  const winnerScore = Math.max(...teams.map((team) => team.score), 0);
  const winners = teams.filter((team) => team.score === winnerScore);

  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => b.score - a.score),
    [teams],
  );

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
    setUsedNumbers([]);
    setCurrentTeam(0);
    setPhase("board");
  }

  function openQuestion(number) {
    setSelectedNumber(number);
    setAnswerMode(null);
    setSelectedOption(null);
    setShowAnswer(false);
    setPhase("question");
  }

  function finishTurn(correct) {
    const points = answerMode === "speak" ? 20 : 10;
    if (correct) {
      setTeams((current) =>
        current.map((team, index) =>
          index === currentTeam ? { ...team, score: team.score + points } : team,
        ),
      );
    }

    const nextUsed = selectedNumber ? [...usedNumbers, selectedNumber] : usedNumbers;
    setUsedNumbers(nextUsed);

    if (nextUsed.length >= questionCount) {
      setPhase("finished");
      return;
    }

    setCurrentTeam((current) => (current + 1) % teams.length);
    setPhase("board");
  }

  function resetGame() {
    setPhase("setup");
    setTeams([]);
    setUsedNumbers([]);
    setSelectedNumber(null);
  }

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={resetGame} aria-label="Go to game setup">
          <span className="brand-badge">W!</span>
          <span>Word Rally</span>
        </button>
        {phase !== "setup" && phase !== "finished" && (
          <div className="round-status">
            <span className="status-dot" />
            Round in progress
            <strong>{remaining} left</strong>
          </div>
        )}
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
              </section>

              <section className="setup-card compact-card">
                <div className="card-heading">
                  <span className="step-number">03</span>
                  <div>
                    <h2>Pick a topic</h2>
                    <p>More topics are coming soon</p>
                  </div>
                </div>
                <button className="topic-option selected">
                  <span className="topic-icon">Aa</span>
                  <span><strong>Everyday English</strong><small>Grammar, places & common words</small></span>
                  <span className="check">✓</span>
                </button>
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
              <span><b>+10</b> Pick an answer</span>
              <span><b>+20</b> Say it aloud</span>
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
                const isUsed = usedNumbers.includes(number);
                return (
                  <button
                    key={number}
                    disabled={isUsed}
                    className={isUsed ? "used" : ""}
                    onClick={() => openQuestion(number)}
                    aria-label={isUsed ? `Question ${number}, already played` : `Choose question ${number}`}
                  >
                    {isUsed ? "✓" : number}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {phase === "question" && (
        <section className="question-shell">
          <button className="back-button" onClick={() => setPhase("board")}>← Back to board</button>
          <div className="question-topline">
            <span>Question {selectedNumber} of {questionCount}</span>
            <span className="playing-team"><TeamMark color={teams[currentTeam]?.color} /> {teams[currentTeam]?.name}</span>
          </div>

          <div className="question-card">
            <span className="question-hint">{activeQuestion.hint}</span>
            <p className="question-label">Complete the sentence</p>
            <h1>{activeQuestion.sentence}</h1>

            {!answerMode && (
              <div className="mode-picker">
                <p>How would you like to answer?</p>
                <div>
                  <button className="mode-button choice-mode" onClick={() => setAnswerMode("choice")}>
                    <span className="mode-icon">A</span>
                    <span><strong>Pick an answer</strong><small>Choose from 4 options</small></span>
                    <b>+10 pts</b>
                  </button>
                  <button className="mode-button speak-mode" onClick={() => setAnswerMode("speak")}>
                    <span className="mode-icon">◉</span>
                    <span><strong>Say it aloud</strong><small>Tell your teacher</small></span>
                    <b>+20 pts</b>
                  </button>
                </div>
              </div>
            )}

            {answerMode === "choice" && (
              <div className="answer-area">
                <div className="answer-header">
                  <p>Choose the missing word</p>
                  <span>Worth 10 points</span>
                </div>
                <div className="answer-options">
                  {activeQuestion.options.map((option, index) => (
                    <button
                      key={option}
                      onClick={() => setSelectedOption(option)}
                      className={selectedOption === option ? "selected" : ""}
                    >
                      <span>{String.fromCharCode(65 + index)}</span>{option}
                    </button>
                  ))}
                </div>
                <button
                  className="submit-answer"
                  disabled={!selectedOption}
                  onClick={() => finishTurn(selectedOption === activeQuestion.answer)}
                >
                  Lock in answer
                </button>
              </div>
            )}

            {answerMode === "speak" && (
              <div className="speak-panel">
                <div className="sound-rings"><span>◉</span></div>
                <h2>Say the missing word aloud</h2>
                <p>The teacher decides if the answer is correct.</p>
                {!showAnswer ? (
                  <button className="reveal-button" onClick={() => setShowAnswer(true)}>Reveal answer</button>
                ) : (
                  <div className="teacher-check">
                    <div className="revealed-answer">
                      <span>Correct answer</span>
                      <strong>{activeQuestion.answer}</strong>
                    </div>
                    <div>
                      <button className="incorrect-button" onClick={() => finishTurn(false)}>× Incorrect</button>
                      <button className="correct-button" onClick={() => finishTurn(true)}>✓ Correct +20</button>
                    </div>
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
          <button className="start-button" onClick={resetGame}>Play again <span>↻</span></button>
        </section>
      )}
    </main>
  );
}
