from sqlalchemy.orm import Session

from app.models import Comercant, Conversation, Message, Patient, Utilisateur

# ponytail: minimal en/fr catalog for user-facing strings, full i18n lib when it outgrows this
STRINGS = {
    "credentials_required": {"en": "Email and password are required", "fr": "E-mail et mot de passe requis"},
    "invalid_credentials": {"en": "Invalid email or password", "fr": "E-mail ou mot de passe invalide"},
    "user_type_missing": {"en": "User type not found", "fr": "Type d'utilisateur introuvable"},
    "email_required": {"en": "Email is required", "fr": "E-mail requis"},
    "password_required": {"en": "Password is required", "fr": "Mot de passe requis"},
    "email_registered": {"en": "Email already registered", "fr": "E-mail déjà enregistré"},
    "invalid_profession": {"en": "Invalid profession", "fr": "Profession invalide"},
    "registration_incomplete": {"en": "Registration incomplete", "fr": "Inscription incomplète"},
    "notes_suffix": {"en": " Note: {notes}", "fr": " Note : {notes}"},
}


def locale_of(accept_language: str | None) -> str:
    return "fr" if (accept_language or "").lower().startswith("fr") else "en"


def text(key: str, accept_language: str | None = None, **vars) -> str:
    tpl = STRINGS.get(key, {}).get(locale_of(accept_language), key)
    if "notes" in vars:
        vars["notes"] = STRINGS["notes_suffix"][locale_of(accept_language)].format(notes=vars["notes"]) if vars["notes"] else ""
    return tpl.format(**vars)


def display_name(db: Session, user_id: int) -> str:
    p = db.query(Patient).filter(Patient.ID_UTILISATUER == user_id).first()
    if p:
        s = f"{p.PRENOMP or ''} {p.NOMP or ''}".strip()
        if s:
            return s
    v = db.query(Comercant).filter(Comercant.ID_UTILISATUER == user_id).first()
    if v and v.NOM_COMMERCIAL:
        return v.NOM_COMMERCIAL
    u = db.query(Utilisateur).filter(Utilisateur.ID_UTILISATUER == user_id).first()
    if u and u.EMAIL:
        return u.EMAIL.split("@")[0]
    return "User"


def valid_pair(role_a: str | None, role_b: str | None) -> bool:
    if not role_a or not role_b or role_a == role_b:
        return False
    return {role_a, role_b} == {"patient", "vendor"}


def my_conversations(db: Session, user_id: int):
    return (
        db.query(Conversation)
        .filter((Conversation.PATIENT_ID == user_id) | (Conversation.OTHER_ID == user_id))
        .order_by(Conversation.UPDATED_AT.desc())
        .all()
    )


def unread_count(db: Session, user_id: int) -> int:
    conv_ids = [c.ID for c in my_conversations(db, user_id)]
    if not conv_ids:
        return 0
    return (
        db.query(Message)
        .filter(
            Message.CONV_ID.in_(conv_ids),
            Message.SENDER_ID != user_id,
            Message.IS_READ == False,  # noqa: E712
        )
        .count()
    )
