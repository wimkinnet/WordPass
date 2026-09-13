import { useEffect, useState } from "react";
import { getProgress } from "../api.js";
import BadgeGrid from "../components/BadgeGrid.jsx";

export default function Dashboard({ refreshKey, onStartQuiz }) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProgress().then(setProgress).catch((e) => setError(e.message));
  }, [refreshKey]);

  if (error) return <div className="page-card">Couldn't load your passport: {error}</div>;
  if (!progress) return <div className="page-card">Loading your passport...</div>;

  const accuracy =
    progress.totalReviews > 0
      ? Math.round((progress.correctReviews / progress.totalReviews) * 100)
      : null;

  return (
    <div>
      <div className="page-card">
        <h2>Your travel stats</h2>
        <div className="stat-row">
          <div className="stat-stamp streak">
            <span className="value">{progress.streak}🔥</span>
            <span className="label">day streak</span>
          </div>
          <div className="stat-stamp">
            <span className="value">{progress.points}</span>
            <span className="label">points</span>
          </div>
          <div className="stat-stamp">
            <span className="value">{progress.wordCount}</span>
            <span className="label">words</span>
          </div>
          <div className="stat-stamp">
            <span className="value">{progress.sentenceCount}</span>
            <span className="label">sentences</span>
          </div>
        </div>
        {accuracy !== null && (
          <p style={{ marginTop: 16, color: "var(--ink-soft)" }}>
            Accuracy so far: <strong>{accuracy}%</strong> over {progress.totalReviews} reviews.
            Longest streak: <strong>{progress.longestStreak}</strong> days. Mastered{" "}
            <strong>{progress.masteredWordCount}</strong> words and{" "}
            <strong>{progress.masteredSentenceCount}</strong> sentences.
          </p>
        )}
        <button className="btn gold" style={{ marginTop: 8 }} onClick={onStartQuiz}>
          Start practicing
        </button>
      </div>

      <div className="page-card">
        <h2>Passport stamps</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
          Earn stamps by adding words/sentences and practicing regularly.
        </p>
        <BadgeGrid badges={progress.badges} />
      </div>
    </div>
  );
}
