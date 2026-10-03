import hmac
import os

from fastapi import APIRouter, Header, HTTPException

from .models import HighScore, HighScoreList
from .store import get_store

router = APIRouter()


def require_admin(x_admin_key: str = Header(default="")) -> None:
    expected = os.getenv("ADMIN_API_KEY", "")
    if not expected or not x_admin_key or not hmac.compare_digest(x_admin_key, expected):
        raise HTTPException(status_code=401, detail="Invalid admin key")


@router.get("/pending", response_model=HighScoreList)
def list_pending(x_admin_key: str = Header(default="")) -> HighScoreList:
    require_admin(x_admin_key)
    scores = [HighScore(**row) for row in get_store().list_pending()]
    return HighScoreList(scores=scores)


@router.post("/high-scores/{score_id}/approve", response_model=HighScore)
def approve_high_score(score_id: str, x_admin_key: str = Header(default="")) -> HighScore:
    require_admin(x_admin_key)
    try:
        row = get_store().approve_score(score_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Pending score not found")
    return HighScore(**row)


@router.post("/high-scores/{score_id}/reject", response_model=HighScore)
def reject_high_score(score_id: str, x_admin_key: str = Header(default="")) -> HighScore:
    require_admin(x_admin_key)
    try:
        row = get_store().reject_score(score_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Pending score not found")
    return HighScore(**row)
