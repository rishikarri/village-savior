import { useCallback, useEffect, useState } from "react";
import { fetchHighScores, submitHighScore } from "./api/highScores";
import HighScoresModal from "./components/HighScoresModal";
import InstructionsModal from "./components/InstructionsModal";
import ShopModal from "./components/ShopModal";
import SubmitScoreModal from "./components/SubmitScoreModal";
import { gameApi, useVillageSaviorGame } from "./hooks/useVillageSaviorGame";

export default function App() {
  const gameReady = useVillageSaviorGame();
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  const [shopOpen, setShopOpen] = useState(false);
  const [highScoresOpen, setHighScoresOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [snapshot, setSnapshot] = useState({ gold: 100, score: 0 });
  const [scores, setScores] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [scoresError, setScoresError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const refreshSnapshot = useCallback(() => {
    const api = gameApi();
    if (api && api.getSnapshot) {
      setSnapshot(api.getSnapshot());
    }
  }, []);

  useEffect(() => {
    function onOpenShop() {
      refreshSnapshot();
      setShopOpen(true);
    }
    function onOpenInstructions() {
      setInstructionsOpen(true);
    }
    function onOpenHighScores() {
      setHighScoresOpen(true);
    }
    function onGameOver(event) {
      setSnapshot(event.detail);
      setSubmitOpen(true);
      setSubmitSuccess(false);
      setSubmitError("");
    }

    window.addEventListener("villagesavior:open-shop", onOpenShop);
    window.addEventListener("villagesavior:open-instructions", onOpenInstructions);
    window.addEventListener("villagesavior:open-high-scores", onOpenHighScores);
    window.addEventListener("villagesavior:game-over", onGameOver);

    return () => {
      window.removeEventListener("villagesavior:open-shop", onOpenShop);
      window.removeEventListener("villagesavior:open-instructions", onOpenInstructions);
      window.removeEventListener("villagesavior:open-high-scores", onOpenHighScores);
      window.removeEventListener("villagesavior:game-over", onGameOver);
    };
  }, [refreshSnapshot]);

  async function loadScores() {
    setScoresLoading(true);
    setScoresError("");
    try {
      const data = await fetchHighScores();
      setScores(data.scores || []);
    } catch (err) {
      setScoresError(err.message || "Could not load high scores.");
    } finally {
      setScoresLoading(false);
    }
  }

  function resumeAndClose(setter) {
    const api = gameApi();
    if (api) api.resumeGame();
    setter(false);
  }

  function handleStartFromInstructions() {
    resumeAndClose(setInstructionsOpen);
  }

  function handleNewGame() {
    const api = gameApi();
    if (api) api.startNewGame();
  }

  function handlePause() {
    const api = gameApi();
    if (api) api.togglePause();
  }

  function handleShop() {
    const api = gameApi();
    if (api) api.openShop();
  }

  function handleInstructions() {
    const api = gameApi();
    if (api) api.viewInstructions();
    setInstructionsOpen(true);
  }

  async function handleHighScores() {
    const api = gameApi();
    if (api) api.viewHighScores();
    setHighScoresOpen(true);
    await loadScores();
  }

  function handleBuy(action) {
    const api = gameApi();
    if (!api || !api[action]) return;
    api[action]();
    refreshSnapshot();
  }

  async function handleSubmitScore(username) {
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitHighScore({
        username,
        highScore: snapshot.score,
        gameState: snapshot,
      });
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err.message || "Could not save high score.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="game-wrapper">
      <div id="top-section">
        <div id="game-stats">
          <h2 id="scoreKeeper">Score: 0</h2>
          <h2 id="highScoreKeeper">High Score: 0</h2>
          <p id="gold-collected">100</p>
          <p id="health">6</p>
        </div>

        <div id="game-play-buttons">
          <button id="start-button" onClick={handleNewGame} disabled={!gameReady}>
            New Game
          </button>
          <button id="pause-resume-button" onClick={handlePause} disabled={!gameReady}>
            Pause
          </button>
          <button id="open-shop-button" onClick={handleShop} disabled={!gameReady}>
            Shop
          </button>
          <button
            id="view-instructions-button"
            onClick={handleInstructions}
            disabled={!gameReady}
          >
            Instructions
          </button>
          <button
            id="view-high-scores-button"
            onClick={handleHighScores}
            disabled={!gameReady}
          >
            High Scores
          </button>
        </div>

        <div id="text-section">
          <h2 id="textDisplay">&nbsp;</h2>
        </div>
      </div>

      <div id="middle-section">
        <div id="hurtByEnemy"></div>
      </div>

      <InstructionsModal
        open={instructionsOpen}
        onClose={() => resumeAndClose(setInstructionsOpen)}
        onStart={handleStartFromInstructions}
      />
      <ShopModal
        open={shopOpen}
        snapshot={snapshot}
        onClose={() => resumeAndClose(setShopOpen)}
        onBuy={handleBuy}
      />
      <HighScoresModal
        open={highScoresOpen}
        scores={scores}
        loading={scoresLoading}
        error={scoresError}
        onClose={() => resumeAndClose(setHighScoresOpen)}
      />
      <SubmitScoreModal
        open={submitOpen}
        snapshot={snapshot}
        submitting={submitting}
        error={submitError}
        success={submitSuccess}
        onClose={() => setSubmitOpen(false)}
        onSubmit={handleSubmitScore}
      />
    </div>
  );
}
