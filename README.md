# Village Savior

Canvas survivor game with a static HTML frontend, a Python high-score API, and AWS Terraform.

```
backend/    FastAPI high-score API
frontend/   index.html, CSS, JS + original canvas game
iac/        Terraform for Lambda, API Gateway, DynamoDB
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
python3 -m http.server 8080
```

Open http://localhost:8080.

## API

- `GET /api/v1/health`
- `GET /api/v1/high-scores` (approved only)
- `POST /api/v1/high-scores` (queues a pending score)

## Deploy

1. `terraform apply` in `iac/` for the API.
2. Put `api_url` into `frontend/config.js`.
3. Connect this GitHub repo to Amplify, branch `main`, app root `frontend`.
   Push to `main` publishes `village-savior-game.com` (after you attach the domain in Amplify).

Details: `iac/README.md`.
