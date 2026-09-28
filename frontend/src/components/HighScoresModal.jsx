export default function HighScoresModal({
  open,
  onClose,
  scores,
  loading,
  error,
}) {
  if (!open) return null;

  return (
    <div id="modal-high-scores" className="modal-overlay" onClick={onClose}>
      <div
        className="modal-high-scores-content"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="close-high-scores" role="button" aria-label="Close high scores" onClick={onClose}>
          &times;
        </span>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>High Scores</h2>

        <div id="high-scores-list" className="high-scores-list">
          {loading && <p className="status-text">Loading high scores...</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && !error && scores.length === 0 && (
            <p className="status-text">No high scores yet. Survive longer!</p>
          )}
          {!loading && !error && scores.length > 0 && (
            <ol>
              {scores.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.username}</strong>: {entry.high_score}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
