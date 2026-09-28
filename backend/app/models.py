from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class HighScoreCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=32)
    high_score: int = Field(..., ge=0, le=1_000_000)
    game_state: Dict[str, Any] = Field(default_factory=dict)


class HighScore(BaseModel):
    id: str
    username: str
    high_score: int
    game_state: Dict[str, Any]
    created_at: str


class HighScoreList(BaseModel):
    scores: List[HighScore]


class HealthResponse(BaseModel):
    status: str
    storage: Optional[str] = None
