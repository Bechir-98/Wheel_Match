"""Patient recommendations (rule-only; SLM re-rank plugs into recommend_service)."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_patient
from app.models import Utilisateur
from app.services.recommend_service import recommend

router = APIRouter()


@router.get("/recommendations")
def get_recommendations(
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(require_patient),
):
    return recommend(db, user.ID_UTILISATUER, limit=limit)
