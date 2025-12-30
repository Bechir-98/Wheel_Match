from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.api.routers import auth, chat, messages, patient_portal, recommendations, reference, users, vendor_portal, wheelchairs
from app.core.config import settings
from app.db.session import SessionLocal, engine
from app.models.tables import Conversation, KBChunk, MedicalEntry, Message, PatientMedical, UserPreferences, DemandeFauteuil
from app.services.kb_builder import rebuild_knowledge_base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ponytail: in-place columns for existing DBs, proper migrations when schema grows
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

    UserPreferences.__table__.create(bind=engine, checkfirst=True)
    PatientMedical.__table__.create(bind=engine, checkfirst=True)
    DemandeFauteuil.__table__.create(bind=engine, checkfirst=True)
    Conversation.__table__.create(bind=engine, checkfirst=True)
    Message.__table__.create(bind=engine, checkfirst=True)
    MedicalEntry.__table__.create(bind=engine, checkfirst=True)
    KBChunk.__table__.create(bind=engine, checkfirst=True)

    # ponytail: in-place columns for existing DBs, proper migrations when schema grows
    with engine.begin() as conn:
        conn.execute(text('ALTER TABLE "DEMANDE_FAUTEUIL" ADD COLUMN IF NOT EXISTS "ORIGIN" VARCHAR(16) DEFAULT \'patient\''))
        conn.execute(text('ALTER TABLE "PATIENT_MEDICAL" ADD COLUMN IF NOT EXISTS "SOURCE" VARCHAR(16) DEFAULT \'clinician\''))
        conn.execute(text('ALTER TABLE "DEMANDE_FAUTEUIL" ADD COLUMN IF NOT EXISTS "PATIENT_ACCEPT" BOOLEAN'))
        conn.execute(text('ALTER TABLE "FAUTEUIL" ADD COLUMN IF NOT EXISTS "IMAGE" VARCHAR(512)'))

    # Auto-rebuild knowledge base if table is empty
    try:
        with SessionLocal() as db:
            if db.query(KBChunk).count() == 0:
                rebuild_knowledge_base()
    except Exception as e:
        print(f"KB build skipped: {e}")

    yield


app = FastAPI(title="Wheel Match API", lifespan=lifespan)

# ponytail: local upload serving, CDN when multi-instance
Path("/app/uploads/wheelchairs").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_v1 = APIRouter(prefix="/api/v1")

api_v1.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1.include_router(users.router, prefix="/users", tags=["users"])
api_v1.include_router(wheelchairs.router, prefix="/wheelchairs", tags=["wheelchairs"])
api_v1.include_router(reference.router, prefix="/reference", tags=["reference"])
api_v1.include_router(patient_portal.router, prefix="/patient", tags=["patient"])
api_v1.include_router(recommendations.router, prefix="/patient", tags=["patient"])
api_v1.include_router(vendor_portal.router, prefix="/vendor", tags=["vendor"])
api_v1.include_router(chat.router, prefix="/chat", tags=["chat"])
api_v1.include_router(messages.router, prefix="/messages", tags=["messages"])


@api_v1.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


app.include_router(api_v1)
