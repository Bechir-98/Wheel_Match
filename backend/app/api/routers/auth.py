from decimal import Decimal

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Clinicien, Comercant, Patient, Utilisateur
from app.schemas.auth import RegisterRequest
from app.services.user_profile import build_display_name
from app.services.auth_service import (
    create_access_token,
    find_user_by_email,
    hash_password,
    normalize_email,
    resolve_role,
    upgrade_legacy_password,
    verify_password,
)

router = APIRouter()

REDIRECTS = {
    "patient": "/patient-dashboard",
    "clinician": "/clinician-dashboard",
    "vendor": "/vendor-dashboard",
}


async def _parse_login(request: Request) -> tuple[str, str]:
    ct = request.headers.get("content-type", "")
    if "application/json" in ct:
        body = await request.json()
        email = (body.get("mail") or body.get("email") or "").strip()
        password = body.get("password") or ""
        return email, password
    form = await request.form()
    email = (form.get("mail") or form.get("email") or "").strip()
    password = form.get("password") or ""
    return str(email), str(password)


@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    email, password = await _parse_login(request)
    if not email or not password:
        return {
            "success": False,
            "error": "Email and password are required",
            "redirect": None,
        }

    user = find_user_by_email(db, email)
    if not user or not verify_password(password, user.PASSWORD or ""):
        return {
            "success": False,
            "error": "Invalid email or password",
            "redirect": None,
        }

    role = resolve_role(db, user.ID_UTILISATUER)
    if not role:
        return {
            "success": False,
            "error": "User type not found",
            "redirect": None,
        }

    upgrade_legacy_password(db, user, password)
    token = create_access_token(
        str(user.ID_UTILISATUER),
        {"role": role, "email": user.EMAIL},
    )
    display_name = build_display_name(db, user, role)

    return {
        "success": True,
        "error": None,
        "message": "Login successful",
        "redirect": REDIRECTS[role],
        "token": token,
        "user_id": user.ID_UTILISATUER,
        "user_type": role,
        "email": user.EMAIL,
        "display_name": display_name,
        "debug": {
            "user_id": user.ID_UTILISATUER,
            "user_type": role,
            "email": user.EMAIL,
        },
    }


def _parse_bool(v) -> int:
    if v is True or str(v).lower() in ("1", "true", "yes", "on"):
        return 1
    return 0


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    email_norm = normalize_email(body.email)
    if not email_norm:
        return {"success": False, "error": "Email is required"}
    if not body.password or len(body.password) < 1:
        return {"success": False, "error": "Password is required"}

    if find_user_by_email(db, email_norm):
        return {"success": False, "error": "Email already registered"}

    u = Utilisateur(
        EMAIL=email_norm,
        PASSWORD=hash_password(body.password),
        ADRESSE=(body.address or "").strip() or None,
        NUMTEL=(body.phone or "").strip() or None,
    )
    db.add(u)
    db.flush()

    prof = (body.profession or "").strip()
    try:
        if prof == "1":
            db.add(
                Patient(
                    ID_UTILISATUER=u.ID_UTILISATUER,
                    NOMP=(body.nomp or "").strip(),
                    PRENOMP=(body.prenomp or "").strip(),
                    NSS=str(body.nss or "").strip(),
                    POIDS=Decimal(str(body.poids or 0)),
                    TAILLE=Decimal(str(body.taille or 0)),
                    UTILISATION_PRPL=(body.utilisation_prpl or "MANUELLE").strip(),
                    AIDANT=_parse_bool(body.aidant),
                )
            )
        elif prof == "2":
            db.add(
                Clinicien(
                    ID_UTILISATUER=u.ID_UTILISATUER,
                    NOMC=(body.nomc or "").strip(),
                    PRENOMC=(body.prenomc or "").strip(),
                    SPECIALITE=(body.specialite or "").strip(),
                )
            )
        elif prof == "4":
            db.add(
                Comercant(
                    ID_UTILISATUER=u.ID_UTILISATUER,
                    NOM_COMMERCIAL=(body.nom_commercial or "").strip(),
                )
            )
        else:
            db.rollback()
            return {"success": False, "error": "Invalid profession"}
        db.commit()
    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}

    role = resolve_role(db, u.ID_UTILISATUER)
    if not role:
        return {"success": False, "error": "Registration incomplete"}

    token = create_access_token(
        str(u.ID_UTILISATUER),
        {"role": role, "email": u.EMAIL},
    )
    display_name = build_display_name(db, u, role)

    return {
        "success": True,
        "error": None,
        "profession": prof,
        "redirect": REDIRECTS[role],
        "token": token,
        "user_id": u.ID_UTILISATUER,
        "user_type": role,
        "email": u.EMAIL,
        "display_name": display_name,
    }
