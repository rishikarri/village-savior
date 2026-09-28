const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body && body.detail) detail = body.detail;
    } catch (err) {
      // keep default message
    }
    throw new Error(detail);
  }

  return response.json();
}

export function fetchHighScores() {
  return request("/api/v1/high-scores");
}

export function submitHighScore({ username, highScore, gameState }) {
  return request("/api/v1/high-scores", {
    method: "POST",
    body: JSON.stringify({
      username,
      high_score: highScore,
      game_state: gameState,
    }),
  });
}
