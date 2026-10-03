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
  const [confirming, setConfirming] = useState(false);

  if (!open) return null;

  function handleReview(event) {
    event.preventDefault();
    setConfirming(true);
  }

  function handleConfirm() {
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
          <p className="status-text">
            Sent for review. It will show on the leaderboard after it is approved.
          </p>
        ) : confirming ? (
          <div>
            <p className="status-text">Check this before sending:</p>
            <ul className="high-scores-list">
              <li>
                <strong>Name:</strong> {username.trim()}
              </li>
              <li>
                <strong>Score:</strong> {snapshot?.score ?? 0}
              </li>
              <li>
                <strong>Gold:</strong> {snapshot?.gold ?? 0}
              </li>
              <li>
                <strong>Health:</strong> {snapshot?.health ?? 0}
              </li>
              <li>
                <strong>Ninjas:</strong> {snapshot?.ninjas ?? 0}
              </li>
              <li>
                <strong>Fire arrows:</strong> {snapshot?.fire_arrows ? "yes" : "no"}
              </li>
            </ul>
            <div className="submit-score-form">
              <button type="button" onClick={() => setConfirming(false)} disabled={submitting}>
                Edit name
              </button>
              <button type="button" onClick={handleConfirm} disabled={submitting}>
                {submitting ? "Sending..." : "Send for review"}
              </button>
            </div>
          </div>
        ) : (
          <form className="submit-score-form" onSubmit={handleReview}>
            <input
              type="text"
              maxLength={32}
              placeholder="Your name"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <button type="submit" disabled={!username.trim()}>
              Review
            </button>
          </form>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
