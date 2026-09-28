import json
import os
import time
import uuid
from decimal import Decimal
from typing import Any, Dict, List

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError


def _json_safe(value: Any) -> Any:
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)
    if isinstance(value, dict):
        return {key: _json_safe(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    return value


class HighScoreStore:
    def list_scores(self, limit: int = 20) -> List[Dict[str, Any]]:
        raise NotImplementedError

    def create_score(self, username: str, high_score: int, game_state: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError


class MemoryHighScoreStore(HighScoreStore):
    def __init__(self, path: str) -> None:
        self.path = path
        directory = os.path.dirname(path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)

    def _read(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.path):
            return []
        with open(self.path, "r", encoding="utf-8") as handle:
            return json.load(handle)

    def _write(self, rows: List[Dict[str, Any]]) -> None:
        with open(self.path, "w", encoding="utf-8") as handle:
            json.dump(rows, handle, indent=2)

    def list_scores(self, limit: int = 20) -> List[Dict[str, Any]]:
        rows = self._read()
        rows.sort(key=lambda row: (-int(row["high_score"]), row["created_at"]))
        return rows[:limit]

    def create_score(self, username: str, high_score: int, game_state: Dict[str, Any]) -> Dict[str, Any]:
        row = {
            "id": str(uuid.uuid4()),
            "username": username.strip(),
            "high_score": int(high_score),
            "game_state": game_state,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        rows = self._read()
        rows.append(row)
        self._write(rows)
        return row


class DynamoHighScoreStore(HighScoreStore):
    def __init__(self, table_name: str) -> None:
        self.table = boto3.resource("dynamodb").Table(table_name)

    def list_scores(self, limit: int = 20) -> List[Dict[str, Any]]:
        response = self.table.query(
            KeyConditionExpression=Key("pk").eq("HIGH_SCORE"),
            ScanIndexForward=False,
            Limit=limit,
        )
        return [_json_safe(self._from_item(item)) for item in response.get("Items", [])]

    def create_score(self, username: str, high_score: int, game_state: Dict[str, Any]) -> Dict[str, Any]:
        score_id = str(uuid.uuid4())
        created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        inverted = 1_000_000_000 - int(high_score)
        item = {
            "pk": "HIGH_SCORE",
            "sk": "SCORE#{:010d}#{}".format(inverted, score_id),
            "id": score_id,
            "username": username.strip(),
            "high_score": int(high_score),
            "game_state": game_state,
            "created_at": created_at,
        }
        try:
            self.table.put_item(Item=item)
        except ClientError as exc:
            raise RuntimeError("Failed to persist high score") from exc
        return _json_safe(self._from_item(item))

    @staticmethod
    def _from_item(item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": item["id"],
            "username": item["username"],
            "high_score": item["high_score"],
            "game_state": item.get("game_state") or {},
            "created_at": item["created_at"],
        }


_STORE = None


def build_store() -> HighScoreStore:
    table_name = os.getenv("HIGH_SCORES_TABLE")
    if table_name:
        return DynamoHighScoreStore(table_name)
    local_path = os.getenv(
        "LOCAL_SCORES_PATH",
        os.path.join(os.path.dirname(__file__), "..", "data", "high_scores.json"),
    )
    return MemoryHighScoreStore(os.path.abspath(local_path))


def get_store() -> HighScoreStore:
    global _STORE
    if _STORE is None:
        _STORE = build_store()
    return _STORE

