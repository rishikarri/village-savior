from fastapi import APIRouter, HTTPException, Query

from .models import HealthResponse, HighScore, HighScoreCreate, HighScoreList
from .store import get_store

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    backend = "dynamodb" if get_store().__class__.__name__.startswith("Dynamo") else "local_json"
    return HealthResponse(status="ok", storage=backend)


@router.get("/high-scores", response_model=HighScoreList)
def list_high_scores(limit: int = Query(20, ge=1, le=100)) -> HighScoreList:
    scores = [HighScore(**row) for row in get_store().list_scores(limit=limit)]
    return HighScoreList(scores=scores)


@router.post("/high-scores", response_model=HighScore, status_code=201)
def create_high_score(payload: HighScoreCreate) -> HighScore:
    username = payload.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="username is required")
    row = get_store().create_score(
        username=username,
        high_score=payload.high_score,
        game_state=payload.game_state,
    )
    return HighScore(**row)
