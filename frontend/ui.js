(function () {
  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function game() {
    return window.VillageSavior;
  }

  function snapshot() {
    return game() && game().getSnapshot ? game().getSnapshot() : {};
  }

  function show(el) {
    if (el) el.classList.remove("hidden-modal");
  }

  function hide(el) {
    if (el) el.classList.add("hidden-modal");
  }

  function resumeAndHide(modal) {
    if (game()) game().resumeGame();
    hide(modal);
  }

  function refreshShop() {
    var state = snapshot();
    var gold = state.gold || 0;
    var notice = document.getElementById("shop-gold-notice");
    if (notice) notice.textContent = "Gold on hand: " + gold;

    var health = document.getElementById("health-potion-button");
    var fire = document.getElementById("fire-arrows-button");
    var speed = document.getElementById("speed-potion-button");
    var ninja = document.getElementById("ninja-button");
    if (health) health.disabled = gold < 50;
    if (fire) fire.disabled = state.fire_arrows || gold < 300;
    if (speed) speed.disabled = (state.speed || 1) > 1 || gold < 500;
    if (ninja) ninja.disabled = gold < 80;
  }

  async function loadHighScores() {
    var list = document.getElementById("high-scores-list");
    list.innerHTML = '<p class="status-text">Loading high scores...</p>';
    try {
      var data = await window.VillageSaviorApi.fetchHighScores();
      var scores = data.scores || [];
      if (!scores.length) {
        list.innerHTML = '<p class="status-text">No approved high scores yet.</p>';
        return;
      }
      var html = "<ol>";
      scores.forEach(function (entry) {
        html += "<li><strong>" + escapeHtml(entry.username) + "</strong>: " + escapeHtml(String(entry.high_score)) + "</li>";
      });
      html += "</ol>";
      list.innerHTML = html;
    } catch (err) {
      list.innerHTML = '<p class="error-text">' + (err.message || "Could not load high scores.") + "</p>";
    }
  }

  function resetSubmitModal() {
    document.getElementById("submit-name-form").classList.remove("hidden-modal");
    hide(document.getElementById("submit-confirm"));
    hide(document.getElementById("submit-success"));
    hide(document.getElementById("submit-error"));
    document.getElementById("submit-username").value = "";
    document.getElementById("send-for-review-button").disabled = false;
    document.getElementById("send-for-review-button").textContent = "Send for review";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var instructions = document.getElementById("modal-instructions");
    var shop = document.getElementById("modal-shop");
    var highScores = document.getElementById("modal-high-scores");
    var submitModal = document.getElementById("modal-submit-score");

    document.getElementById("start-button").addEventListener("click", function () {
      if (game()) game().startNewGame();
    });
    document.getElementById("pause-resume-button").addEventListener("click", function () {
      if (game()) game().togglePause();
    });
    document.getElementById("open-shop-button").addEventListener("click", function () {
      if (game()) game().openShop();
    });
    document.getElementById("view-instructions-button").addEventListener("click", function () {
      if (game()) game().viewInstructions();
      show(instructions);
    });
    document.getElementById("view-high-scores-button").addEventListener("click", function () {
      if (game()) game().viewHighScores();
      show(highScores);
      loadHighScores();
    });

    document.getElementById("start-game-button").addEventListener("click", function () {
      resumeAndHide(instructions);
    });
    document.querySelector(".close-instructions").addEventListener("click", function () {
      resumeAndHide(instructions);
    });
    instructions.addEventListener("click", function (event) {
      if (event.target === instructions) resumeAndHide(instructions);
    });
    instructions.querySelector(".modal-instructions-content").addEventListener("click", function (event) {
      event.stopPropagation();
    });

    document.querySelector(".close-shop").addEventListener("click", function () {
      resumeAndHide(shop);
    });
    shop.addEventListener("click", function (event) {
      if (event.target === shop) resumeAndHide(shop);
    });
    shop.querySelector(".modal-shop-content").addEventListener("click", function (event) {
      event.stopPropagation();
    });

    document.getElementById("health-potion-button").addEventListener("click", function () {
      if (game()) game().drinkHealthPotion();
      refreshShop();
    });
    document.getElementById("fire-arrows-button").addEventListener("click", function () {
      if (game()) game().giveHeroFireArrows();
      refreshShop();
    });
    document.getElementById("speed-potion-button").addEventListener("click", function () {
      if (game()) game().drinkSpeedPotion();
      refreshShop();
    });
    document.getElementById("ninja-button").addEventListener("click", function () {
      if (game()) game().hireNinja();
      refreshShop();
    });

    document.querySelector(".close-high-scores").addEventListener("click", function () {
      resumeAndHide(highScores);
    });
    highScores.addEventListener("click", function (event) {
      if (event.target === highScores) resumeAndHide(highScores);
    });
    highScores.querySelector(".modal-high-scores-content").addEventListener("click", function (event) {
      event.stopPropagation();
    });

    document.querySelector(".close-submit-score").addEventListener("click", function () {
      hide(submitModal);
    });
    submitModal.addEventListener("click", function (event) {
      if (event.target === submitModal) hide(submitModal);
    });
    submitModal.querySelector(".modal-high-scores-content").addEventListener("click", function (event) {
      event.stopPropagation();
    });

    document.getElementById("submit-name-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var state = snapshot();
      var name = document.getElementById("submit-username").value.trim();
      document.getElementById("preview-name").textContent = name;
      document.getElementById("preview-score").textContent = state.score || 0;
      document.getElementById("preview-gold").textContent = state.gold || 0;
      document.getElementById("preview-health").textContent = state.health || 0;
      document.getElementById("preview-ninjas").textContent = state.ninjas || 0;
      document.getElementById("preview-fire").textContent = state.fire_arrows ? "yes" : "no";
      hide(document.getElementById("submit-name-form"));
      show(document.getElementById("submit-confirm"));
    });

    document.getElementById("edit-name-button").addEventListener("click", function () {
      hide(document.getElementById("submit-confirm"));
      show(document.getElementById("submit-name-form"));
    });

    document.getElementById("send-for-review-button").addEventListener("click", async function () {
      var button = document.getElementById("send-for-review-button");
      var errorEl = document.getElementById("submit-error");
      button.disabled = true;
      button.textContent = "Sending...";
      hide(errorEl);
      try {
        await window.VillageSaviorApi.submitHighScore({
          username: document.getElementById("submit-username").value.trim(),
          highScore: snapshot().score,
          gameState: snapshot()
        });
        hide(document.getElementById("submit-confirm"));
        show(document.getElementById("submit-success"));
      } catch (err) {
        errorEl.textContent = err.message || "Could not save high score.";
        show(errorEl);
        button.disabled = false;
        button.textContent = "Send for review";
      }
    });

    window.addEventListener("villagesavior:open-shop", function () {
      refreshShop();
      show(shop);
    });
    window.addEventListener("villagesavior:open-instructions", function () {
      show(instructions);
    });
    window.addEventListener("villagesavior:open-high-scores", function () {
      show(highScores);
      loadHighScores();
    });
    window.addEventListener("villagesavior:game-over", function (event) {
      var state = event.detail || snapshot();
      document.getElementById("submit-score-value").textContent = state.score || 0;
      resetSubmitModal();
      show(submitModal);
    });
  });
})();
