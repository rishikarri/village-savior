import json
import re
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

USERNAME_PATTERN = re.compile(r"^[\w \-]{1,32}$")


class HighScoreCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=32)
    high_score: int = Field(..., ge=0, le=10000)
    game_state: Dict[str, Any] = Field(default_factory=dict)

    @field_validator("username")
    @classmethod
    def clean_username(cls, value: str) -> str:
        username = value.strip()
        if not USERNAME_PATTERN.match(username):
            raise ValueError("username must be 1-32 letters, numbers, spaces, or hyphens")
        return username

    @field_validator("game_state")
    @classmethod
    def cap_game_state(cls, value: Dict[str, Any]) -> Dict[str, Any]:
        if len(value) > 24:
            raise ValueError("game_state has too many fields")
        dumped = json.dumps(value, default=str)
        if len(dumped) > 2048:
            raise ValueError("game_state is too large")
        return value


class HighScore(BaseModel):
    id: str
    username: str
    high_score: int
    game_state: Dict[str, Any]
    status: str = "pending"
    created_at: str


class HighScoreList(BaseModel):
    scores: List[HighScore]


class HealthResponse(BaseModel):
    status: str
    storage: Optional[str] = None
