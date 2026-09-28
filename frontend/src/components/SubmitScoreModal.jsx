import { useState } from "react";

export default function SubmitScoreModal({
  open,
  snapshot,
  onClose,
  onSubmit,
  submitting,
  error,
  success,
}) {
  const [username, setUsername] = useState("");

  if (!open) return null;

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(username.trim());
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-high-scores-content"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="close-high-scores" role="button" aria-label="Close submit score" onClick={onClose}>
          &times;
        </span>
        <h2 style={{ textAlign: "center" }}>Submit High Score</h2>
        <p className="status-text">
          Game over. Your score was <strong>{snapshot?.score ?? 0}</strong>.
        </p>
        {success ? (
          <p className="status-text">Score saved. Check the leaderboard!</p>
        ) : (
          <form className="submit-score-form" onSubmit={handleSubmit}>
            <input
              type="text"
              maxLength={32}
              placeholder="Your name"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <button type="submit" disabled={submitting || !username.trim()}>
              {submitting ? "Saving..." : "Submit"}
            </button>
          </form>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
