from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .admin import router as admin_router
from .guards import AbuseGuardMiddleware, allowed_origins
from .routes import router
from .store import get_store

store = get_store()

app = FastAPI(title="Village Savior API", version="1.0.0")
origins = allowed_origins()

app.add_middleware(AbuseGuardMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["content-type", "x-admin-key"],
)

app.include_router(router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1/admin")


@app.get("/")
def root():
    return {"service": "village-savior-api"}


try:
    from mangum import Mangum

    handler = Mangum(app)
except ImportError:  # pragma: no cover
    handler = None
