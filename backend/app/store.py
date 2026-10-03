import json
import os
import time
import uuid
from decimal import Decimal
from typing import Any, Dict, List

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

PK_APPROVED = "HIGH_SCORE"
PK_PENDING = "PENDING"
PK_REJECTED = "REJECTED"


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


def _now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def _row(
    score_id: str,
    username: str,
    high_score: int,
    game_state: Dict[str, Any],
    status: str,
    created_at: str,
) -> Dict[str, Any]:
    return {
        "id": score_id,
        "username": username.strip(),
        "high_score": int(high_score),
        "game_state": game_state or {},
        "status": status,
        "created_at": created_at,
    }


class HighScoreStore:
    def list_scores(self, limit: int = 20) -> List[Dict[str, Any]]:
        raise NotImplementedError

    def list_pending(self, limit: int = 100) -> List[Dict[str, Any]]:
        raise NotImplementedError

    def create_score(self, username: str, high_score: int, game_state: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

    def approve_score(self, score_id: str) -> Dict[str, Any]:
        raise NotImplementedError

    def reject_score(self, score_id: str) -> Dict[str, Any]:
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
            rows = json.load(handle)
        for row in rows:
            row.setdefault("status", "approved")
        return rows

    def _write(self, rows: List[Dict[str, Any]]) -> None:
        with open(self.path, "w", encoding="utf-8") as handle:
            json.dump(rows, handle, indent=2)

    def list_scores(self, limit: int = 20) -> List[Dict[str, Any]]:
        rows = [row for row in self._read() if row.get("status") == "approved"]
        rows.sort(key=lambda row: (-int(row["high_score"]), row["created_at"]))
        return rows[:limit]

    def list_pending(self, limit: int = 100) -> List[Dict[str, Any]]:
        rows = [row for row in self._read() if row.get("status") == "pending"]
        rows.sort(key=lambda row: row["created_at"], reverse=True)
        return rows[:limit]

    def create_score(self, username: str, high_score: int, game_state: Dict[str, Any]) -> Dict[str, Any]:
        row = _row(str(uuid.uuid4()), username, high_score, game_state, "pending", _now())
        rows = self._read()
        rows.append(row)
        self._write(rows)
        return row

    def _set_status(self, score_id: str, status: str) -> Dict[str, Any]:
        rows = self._read()
        for row in rows:
            if row["id"] == score_id and row.get("status") == "pending":
                row["status"] = status
                self._write(rows)
                return row
        raise KeyError(score_id)

    def approve_score(self, score_id: str) -> Dict[str, Any]:
        return self._set_status(score_id, "approved")

    def reject_score(self, score_id: str) -> Dict[str, Any]:
        return self._set_status(score_id, "rejected")


class DynamoHighScoreStore(HighScoreStore):
    def __init__(self, table_name: str) -> None:
        self.table = boto3.resource("dynamodb").Table(table_name)

    def list_scores(self, limit: int = 20) -> List[Dict[str, Any]]:
        response = self.table.query(
            KeyConditionExpression=Key("pk").eq(PK_APPROVED),
            ScanIndexForward=False,
            Limit=limit,
        )
        return [_json_safe(self._from_item(item, "approved")) for item in response.get("Items", [])]

    def list_pending(self, limit: int = 100) -> List[Dict[str, Any]]:
        response = self.table.query(
            KeyConditionExpression=Key("pk").eq(PK_PENDING),
            ScanIndexForward=False,
            Limit=limit,
        )
        items = [_json_safe(self._from_item(item, "pending")) for item in response.get("Items", [])]
        items.sort(key=lambda row: row["created_at"], reverse=True)
        return items

    def create_score(self, username: str, high_score: int, game_state: Dict[str, Any]) -> Dict[str, Any]:
        score_id = str(uuid.uuid4())
        created_at = _now()
        item = self._pending_item(score_id, username, high_score, game_state, created_at)
        try:
            self.table.put_item(Item=item)
        except ClientError as exc:
            raise RuntimeError("Failed to persist high score") from exc
        return _json_safe(self._from_item(item, "pending"))

    def approve_score(self, score_id: str) -> Dict[str, Any]:
        pending = self._get_pending(score_id)
        inverted = 1_000_000_000 - int(pending["high_score"])
        approved = {
            "pk": PK_APPROVED,
            "sk": "SCORE#{:010d}#{}".format(inverted, score_id),
            "id": score_id,
            "username": pending["username"],
            "high_score": int(pending["high_score"]),
            "game_state": pending.get("game_state") or {},
            "status": "approved",
            "created_at": pending["created_at"],
            "reviewed_at": _now(),
        }
        try:
            self.table.put_item(Item=approved)
            self.table.delete_item(Key={"pk": PK_PENDING, "sk": self._pending_sk(score_id)})
        except ClientError as exc:
            raise RuntimeError("Failed to approve high score") from exc
        return _json_safe(self._from_item(approved, "approved"))

    def reject_score(self, score_id: str) -> Dict[str, Any]:
        pending = self._get_pending(score_id)
        rejected = dict(pending)
        rejected["pk"] = PK_REJECTED
        rejected["sk"] = self._pending_sk(score_id)
        rejected["status"] = "rejected"
        rejected["reviewed_at"] = _now()
        try:
            self.table.put_item(Item=rejected)
            self.table.delete_item(Key={"pk": PK_PENDING, "sk": self._pending_sk(score_id)})
        except ClientError as exc:
            raise RuntimeError("Failed to reject high score") from exc
        return _json_safe(self._from_item(rejected, "rejected"))

    def _get_pending(self, score_id: str) -> Dict[str, Any]:
        response = self.table.get_item(Key={"pk": PK_PENDING, "sk": self._pending_sk(score_id)})
        item = response.get("Item")
        if not item:
            raise KeyError(score_id)
        return item

    @staticmethod
    def _pending_sk(score_id: str) -> str:
        return "ID#{}".format(score_id)

    @staticmethod
    def _pending_item(
        score_id: str,
        username: str,
        high_score: int,
        game_state: Dict[str, Any],
        created_at: str,
    ) -> Dict[str, Any]:
        return {
            "pk": PK_PENDING,
            "sk": "ID#{}".format(score_id),
            "id": score_id,
            "username": username.strip(),
            "high_score": int(high_score),
            "game_state": game_state or {},
            "status": "pending",
            "created_at": created_at,
        }

    @staticmethod
    def _from_item(item: Dict[str, Any], status: str) -> Dict[str, Any]:
        return _row(
            item["id"],
            item["username"],
            item["high_score"],
            item.get("game_state") or {},
            item.get("status") or status,
            item["created_at"],
        )


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
