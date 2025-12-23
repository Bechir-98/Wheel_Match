import json
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_with_role
from app.db.session import get_db
from app.models import UserPreferences, Utilisateur
from app.services.user_profile import apply_profile_update, build_profile_payload

router = APIRouter()


def _default_prefs() -> dict[str, Any]:
    return {
        "email": "",
        "currentPassword": "",
        "newPassword": "",
        "confirmPassword": "",
        "NOTIFICATIONS_EMAIL": True,
        "NOTIFICATIONS_PUSH": True,
        "APPOINTMENT_REMINDERS": True,
        "SYSTEM_UPDATES": True,
        "THEME": "light",
        "LANGUAGE": "en",
        "FONT_SIZE": "medium",
        "DATA_SHARING": False,
        "ACTIVITY_TRACKING": True,
        "ONLINE_STATUS": True,
        "AUTO_BACKUP": True,
        "BACKUP_FREQUENCY": "daily",
        "DATA_RETENTION": "30",
        "LOW_STOCK": 5,
    }


@router.get("/me")
def get_me(
    db: Session = Depends(get_db),
    ctx: Annotated[tuple[Utilisateur, str], Depends(get_current_user_with_role)] = ...,
):
    user, role = ctx
    return build_profile_payload(db, user, role)


@router.patch("/me")
def patch_me(
    body: dict[str, Any],
    db: Session = Depends(get_db),
    ctx: Annotated[tuple[Utilisateur, str], Depends(get_current_user_with_role)] = ...,
):
    user, role = ctx
    apply_profile_update(db, user, role, body)
    return {"success": True, "message": "Updated"}


@router.get("/profile")
def get_profile_legacy(
    db: Session = Depends(get_db),
    id_utilisateur: int = Query(...),
    type: str = Query(..., alias="type"),
    user: Utilisateur = Depends(get_current_user),
):
    """Backward-compatible query params; must match authenticated user."""
    if user.ID_UTILISATUER != id_utilisateur:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    role = type.lower()
    if role == "commercant":
        role = "vendor"
    return build_profile_payload(db, user, role)


@router.post("/profile")
def post_profile_legacy(
    body: dict[str, Any],
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(get_current_user),
):
    """Accepts legacy shape with id_utilisateur + type in body."""
    uid = body.get("id_utilisateur")
    rtype = (body.get("type") or "").lower()
    if uid != user.ID_UTILISATUER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if rtype in ("commercant", "vendor"):
        rtype = "vendor"
    if rtype == "patient":
        rtype = "patient"
    apply_profile_update(db, user, rtype, body)
    return {"success": True, "message": "Updated"}


@router.get("/me/settings")
def get_my_settings(
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(get_current_user),
):
    row = db.query(UserPreferences).filter(UserPreferences.ID_UTILISATUER == user.ID_UTILISATUER).first()
    merged = _default_prefs()
    if user.EMAIL:
        merged["email"] = user.EMAIL
    if row and row.PREFS_JSON:
        try:
            merged.update(json.loads(row.PREFS_JSON))
        except json.JSONDecodeError:
            pass
    return merged


@router.put("/me/settings")
def put_my_settings(
    body: dict[str, Any],
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(get_current_user),
):
    uid = user.ID_UTILISATUER
    row = db.query(UserPreferences).filter(UserPreferences.ID_UTILISATUER == uid).first()
    if not row:
        row = UserPreferences(ID_UTILISATUER=uid, PREFS_JSON="{}")
        db.add(row)
    current = _default_prefs()
    if row.PREFS_JSON:
        try:
            current.update(json.loads(row.PREFS_JSON))
        except json.JSONDecodeError:
            pass
    current.update(body)
    if "email" in body and body["email"]:
        user.EMAIL = body["email"]
    row.PREFS_JSON = json.dumps({k: current[k] for k in current if k != "currentPassword"})
    db.commit()
    return {"success": True}
