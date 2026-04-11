from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Utilisateur
from app.services.auth_service import decode_token, resolve_role

security = HTTPBearer(auto_error=False)


def get_current_user_optional(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Session = Depends(get_db),
) -> Utilisateur | None:
    if not creds or creds.scheme.lower() != "bearer":
        return None
    payload = decode_token(creds.credentials)
    if not payload or "sub" not in payload:
        return None
    try:
        uid = int(payload["sub"])
    except (TypeError, ValueError):
        return None
    return db.query(Utilisateur).filter(Utilisateur.ID_UTILISATUER == uid).first()


def get_current_user(
    user: Annotated[Utilisateur | None, Depends(get_current_user_optional)],
) -> Utilisateur:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


def get_current_user_with_role(
    user: Annotated[Utilisateur, Depends(get_current_user)],
    db: Session = Depends(get_db),
) -> tuple[Utilisateur, str]:
    role = resolve_role(db, user.ID_UTILISATUER)
    if not role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
    return user, role


def require_clinician(
    ctx: Annotated[tuple[Utilisateur, str], Depends(get_current_user_with_role)],
) -> Utilisateur:
    user, role = ctx
    if role != "clinician":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Clinician only")
    return user


def require_patient(
    ctx: Annotated[tuple[Utilisateur, str], Depends(get_current_user_with_role)],
) -> Utilisateur:
    user, role = ctx
    if role != "patient":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient only")
    return user


def require_vendor(
    ctx: Annotated[tuple[Utilisateur, str], Depends(get_current_user_with_role)],
) -> Utilisateur:
    user, role = ctx
    if role != "vendor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vendor only")
    return user
