# Village Savior

Canvas survivor game with a React shell, Python API, and AWS Terraform.

```
backend/    FastAPI high-score API
frontend/   React (Vite) HUD, shop, instructions, leaderboard + original canvas game
iac/        Terraform for S3, CloudFront, Lambda, API Gateway, DynamoDB
```

## Local development

Terminal 1 — API:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Terminal 2 — UI:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to the API on port 8000.

## API

- `GET /api/v1/health`
- `GET /api/v1/high-scores`
- `POST /api/v1/high-scores`

```json
{
  "username": "rishi",
  "high_score": 42,
  "game_state": { "gold": 80, "health": 0 }
}
```

## Deploy

See `iac/README.md`.
