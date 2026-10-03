(function (global) {
  function apiBase() {
    var host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:8000";
    }
    var config = global.VILLAGE_SAVIOR_CONFIG || {};
    return (config.apiUrl || "").replace(/\/$/, "");
  }

  async function request(path, options) {
    options = options || {};
    var response = await fetch(apiBase() + path, Object.assign({
      headers: Object.assign(
        { "Content-Type": "application/json" },
        options.headers || {}
      )
    }, options));

    if (!response.ok) {
      var detail = "Request failed (" + response.status + ")";
      try {
        var body = await response.json();
        if (body && body.detail) {
          detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
        }
      } catch (err) {
        // keep default
      }
      throw new Error(detail);
    }

    return response.json();
  }

  global.VillageSaviorApi = {
    fetchHighScores: function () {
      return request("/api/v1/high-scores");
    },
    submitHighScore: function (payload) {
      return request("/api/v1/high-scores", {
        method: "POST",
        body: JSON.stringify({
          username: payload.username,
          high_score: payload.highScore,
          game_state: payload.gameState
        })
      });
    }
  };
})(window);
