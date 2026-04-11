from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Clinicien, Comercant, Patient, Utilisateur


def normalize_email(email: str | None) -> str:
    return (email or "").strip().lower()


def hash_password(plain: str) -> str:
    pw = plain.encode("utf-8")
    return bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    if not plain or not hashed:
        return False
    h = str(hashed).strip()
    if h.startswith("$2"):
        try:
            return bcrypt.checkpw(plain.encode("utf-8"), h.encode("utf-8"))
        except (ValueError, TypeError):
            return False
    return plain == h


def create_access_token(subject: str, extra: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire, **extra}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None


def resolve_role(db: Session, user_id: int) -> str | None:
    if db.query(Patient).filter(Patient.ID_UTILISATUER == user_id).first():
        return "patient"
    if db.query(Clinicien).filter(Clinicien.ID_UTILISATUER == user_id).first():
        return "clinician"
    if db.query(Comercant).filter(Comercant.ID_UTILISATUER == user_id).first():
        return "vendor"
    return None


def find_user_by_email(db: Session, email: str) -> Utilisateur | None:
    norm = normalize_email(email)
    if not norm:
        return None
    return (
        db.query(Utilisateur)
        .filter(func.lower(Utilisateur.EMAIL) == norm)
        .first()
    )


def upgrade_legacy_password(db: Session, user: Utilisateur, plain: str) -> None:
    pwd = user.PASSWORD or ""
    if pwd and not str(pwd).startswith("$2"):
        user.PASSWORD = hash_password(plain)
        db.commit()

