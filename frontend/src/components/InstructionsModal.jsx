export default function InstructionsModal({ open, onClose, onStart }) {
  if (!open) return null;

  return (
    <div id="modal-instructions" className="modal-overlay" onClick={onClose}>
      <div
        className="modal-instructions-content"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="close-instructions" role="button" aria-label="Close instructions" onClick={onClose}>
          &times;
        </span>

        <section className="instruction-block">
          <p>Monsters and thieves are closing in.</p>
          <p>Buy the villagers time.</p>
          <p>Fight until you can&apos;t.</p>
          <p>Then, and only then, retreat.</p>
        </section>

        <section className="instruction-block">
          <h2>Movement</h2>
          <div className="visual-instruction">
            <img
              id="arrow-keys-image"
              src="/Images/arrow-keys2.jpg"
              alt="Arrow Keys"
            />
            <p className="instructions-movement-text">Use the arrow keys to move.</p>
          </div>
        </section>

        <section className="instruction-block">
          <h2>How to Fight</h2>
          <div className="visual-instruction">
            <div className="key-visual">A</div>
            <p>Launch arrow left.</p>
          </div>
          <div className="visual-instruction">
            <div className="key-visual">D</div>
            <p>Launch arrow right.</p>
          </div>
        </section>

        <section className="instruction-block">
          <h2>Shop</h2>
          <div className="visual-instruction">
            <div className="key-visual">S</div>
            <p>Open shop.</p>
          </div>
        </section>

        <p>Good luck</p>
        <button id="start-game-button" onClick={onStart}>
          Start Game
        </button>
      </div>
    </div>
  );
}
