# Frontend

React (Vite) shell around the original canvas game.

```bash
npm install
npm run dev
```

HUD, shop, instructions, and high scores are React. The canvas engine still lives in `public/game/survivor-canvas-game.js`.

Production builds need `VITE_API_URL` set to the Terraform `api_url` (Amplify env var, or prefix the `npm run build` command).
