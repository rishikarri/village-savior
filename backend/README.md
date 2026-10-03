# Village Savior API

Python FastAPI service for high scores.

## Local

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export ADMIN_API_KEY=dev-admin-key
uvicorn app.main:app --reload --port 8000
```

- `GET /api/v1/health`
- `GET /api/v1/high-scores` — approved scores only
- `POST /api/v1/high-scores` — queues a **pending** score for review
- `GET /api/v1/admin/pending` — header `X-Admin-Key`
- `POST /api/v1/admin/high-scores/{id}/approve`
- `POST /api/v1/admin/high-scores/{id}/reject`

Local pending/approved rows are stored in `backend/data/high_scores.json`.
In AWS, query DynamoDB `pk = PENDING` to inspect names and `game_state` before you approve.
