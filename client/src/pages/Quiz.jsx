import { useEffect, useState } from "react";
import { getNextQuizBatch, submitAnswer } from "../api.js";

const LANG_LABEL = { "fr-nl": "French → Dutch", "nl-fr": "Dutch → French" };

export default function Quiz({ onProgressChanged }) {
  const [batch, setBatch] = useState(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  function loadBatch() {
    setBatch(null);
    setIndex(0);
    setFeedback(null);
    getNextQuizBatch(10)
      .then(setBatch)
      .catch((e) => setError(e.message));
  }

  useEffect(loadBatch, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  if (error) return <div className="page-card">Couldn't load a practice round: {error}</div>;
  if (!batch) return <div className="page-card">Preparing your practice round...</div>;

  if (batch.length === 0) {
    return (
      <div className="page-card empty-state">
        Add some words or sentences first, then come back here to practice them.
      </div>
    );
  }

  const current = batch[index];
  const isLast = index === batch.length - 1;
  const isBlank = current.itemType === "sentence" && current.mode === "blank";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!answer.trim() || feedback) return;
    try {
      const result = await submitAnswer({
        itemId: current.itemId,
        itemType: current.itemType,
        direction: current.direction,
        mode: current.mode,
        blankIndex: current.blankIndex,
        answer,
      });
      setFeedback(result);
      if (result.pointsEarned > 0) {
        setToast({ text: `+${result.pointsEarned} points!` });
      }
      onProgressChanged?.();
    } catch (e) {
      setError(e.message);
    }
  }

  function handleNext() {
    setFeedback(null);
    setAnswer("");
    if (isLast) loadBatch();
    else setIndex(index + 1);
  }

  return (
    <div className="page-card quiz-card">
      <div className="quiz-progress">
        Item {index + 1} of {batch.length}
      </div>
      <div className="quiz-direction">{LANG_LABEL[current.direction]}</div>
      {current.itemType === "sentence" && (
        <div className="quiz-mode-tag">
          {isBlank ? "fill in the blank" : "full translation"}
        </div>
      )}

      <div className="quiz-prompt">{current.prompt}</div>
      {isBlank && (
        <p style={{ color: "var(--ink-soft)", marginTop: -14, marginBottom: 22 }}>
          {current.displaySentence}
        </p>
      )}

      {!feedback ? (
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={isBlank ? "Type the missing word..." : "Type the translation..."}
          />
          <button className="btn gold" type="submit">Check</button>
        </form>
      ) : (
        <>
          <div className={`feedback-stamp ${feedback.correct ? "" : "wrong"}`}>
            {feedback.correct ? "Approved" : "Try again"}
          </div>
          {!feedback.correct && (
            <div className="feedback-note">
              Correct answer: <strong>{feedback.correctAnswer}</strong>
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <button className="btn gold" onClick={handleNext}>
              {isLast ? "Finish round" : "Next"}
            </button>
          </div>
        </>
      )}

      {toast && <div className="points-toast">{toast.text}</div>}
      {feedback?.newBadgeIds?.length > 0 && (
        <div className="badge-toast">New stamp unlocked! 🏅</div>
      )}
    </div>
  );
}
