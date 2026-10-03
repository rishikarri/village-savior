import os

from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

MAX_BODY_BYTES = int(os.getenv("MAX_BODY_BYTES", "4096"))


def allowed_origins():
    return [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]


def origin_from_request(request: Request):
    origin = request.headers.get("origin")
    if origin:
        return origin
    referer = request.headers.get("referer", "")
    for allowed in allowed_origins():
        if referer.startswith(allowed):
            return allowed
    return None


class AbuseGuardMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > MAX_BODY_BYTES:
                    return JSONResponse({"detail": "Request too large"}, status_code=413)
            except ValueError:
                return JSONResponse({"detail": "Invalid content-length"}, status_code=400)

        if request.method == "POST" and not request.url.path.startswith("/api/v1/admin"):
            origin = origin_from_request(request)
            if origin not in allowed_origins():
                return JSONResponse({"detail": "Origin not allowed"}, status_code=403)

        return await call_next(request)


def reject_if_disallowed_origin(request: Request) -> None:
    if request.method != "POST":
        return
    origin = origin_from_request(request)
    if origin not in allowed_origins():
        raise HTTPException(status_code=403, detail="Origin not allowed")
