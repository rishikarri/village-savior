# Village Savior API

Python FastAPI service for high scores.

## Local

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- `GET /api/v1/health`
- `GET /api/v1/high-scores`
- `POST /api/v1/high-scores` with `{ "username", "high_score", "game_state" }`

Local scores are stored in `backend/data/high_scores.json`.
Set `HIGH_SCORES_TABLE` to use DynamoDB in AWS.
