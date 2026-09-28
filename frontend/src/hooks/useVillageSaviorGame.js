import { useEffect, useState } from "react";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export function useVillageSaviorGame() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      await loadScript("/game/survivor-canvas-game.js");
      await loadScript("/game/xyz.js");
      if (window.VillageSavior && window.VillageSavior.remount) {
        window.VillageSavior.remount();
      }
      if (!cancelled) setReady(true);
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

export function gameApi() {
  return window.VillageSavior;
}
