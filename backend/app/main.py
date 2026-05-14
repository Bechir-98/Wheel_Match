from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import auth, clinician_portal, patient_portal, patients, reference, users, vendor_portal, wheelchairs
from app.core.config import settings
from app.db.session import engine
from app.models.tables import PatientMedical, UserPreferences, DemandeFauteuil


@asynccontextmanager
async def lifespan(app: FastAPI):
    UserPreferences.__table__.create(bind=engine, checkfirst=True)
    PatientMedical.__table__.create(bind=engine, checkfirst=True)
    DemandeFauteuil.__table__.create(bind=engine, checkfirst=True)
    yield


app = FastAPI(title="Wheel Match API", lifespan=lifespan)

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
api_v1.include_router(patients.router, prefix="/patients", tags=["patients"])
api_v1.include_router(patient_portal.router, prefix="/patient", tags=["patient"])
api_v1.include_router(clinician_portal.router, prefix="/clinician", tags=["clinician"])
api_v1.include_router(vendor_portal.router, prefix="/vendor", tags=["vendor"])


@api_v1.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


app.include_router(api_v1)
