from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Comercant, Patient, Utilisateur


def build_profile_payload(db: Session, user: Utilisateur, role: str) -> dict:
    base = {
        "id_utilisateur": user.ID_UTILISATUER,
        "type": role,
        "ADRESSE": user.ADRESSE or "",
        "EMAIL": user.EMAIL or "",
        "NUMTEL": user.NUMTEL or "",
    }
    if role == "patient":
        base.update(
            {
                "NOMP": "",
                "PRENOMP": "",
                "NSS": "",
                "POIDS": "",
                "TAILLE": "",
                "UTILISATION_PRPL": "",
                "AIDANT": False,
            }
        )
        p = db.query(Patient).filter(Patient.ID_UTILISATUER == user.ID_UTILISATUER).first()
        if p:
            base.update(
                {
                    "NOMP": p.NOMP or "",
                    "PRENOMP": p.PRENOMP or "",
                    "NSS": p.NSS or "",
                    "POIDS": float(p.POIDS) if p.POIDS is not None else "",
                    "TAILLE": float(p.TAILLE) if p.TAILLE is not None else "",
                    "UTILISATION_PRPL": p.UTILISATION_PRPL or "",
                    "AIDANT": bool(p.AIDANT) if p.AIDANT is not None else False,
                }
            )
    elif role == "vendor":
        base["NOM_MARCHAND"] = ""
        v = db.query(Comercant).filter(Comercant.ID_UTILISATUER == user.ID_UTILISATUER).first()
        if v:
            base["NOM_MARCHAND"] = v.NOM_COMMERCIAL or ""
    return base


def _str_or_none(v) -> str | None:
    if v is None:
        return None
    s = str(v).strip()
    return s if s else None


def apply_profile_update(db: Session, user: Utilisateur, role: str, data: dict) -> None:
    if "ADRESSE" in data:
        user.ADRESSE = _str_or_none(data["ADRESSE"])
    if "EMAIL" in data:
        em = str(data["EMAIL"] or "").strip()
        if em:
            user.EMAIL = em
    if "NUMTEL" in data:
        user.NUMTEL = _str_or_none(data["NUMTEL"])

    if role == "patient":
        p = db.query(Patient).filter(Patient.ID_UTILISATUER == user.ID_UTILISATUER).first()
        if p:
            for k, model_attr in [
                ("NOMP", "NOMP"),
                ("PRENOMP", "PRENOMP"),
                ("UTILISATION_PRPL", "UTILISATION_PRPL"),
            ]:
                if k in data and data[k] is not None:
                    setattr(p, model_attr, str(data[k]).strip())
            if "NSS" in data and data["NSS"] is not None:
                p.NSS = str(data["NSS"]).strip() or p.NSS
            if "POIDS" in data and data["POIDS"] != "" and data["POIDS"] is not None:
                p.POIDS = Decimal(str(data["POIDS"]))
            if "TAILLE" in data and data["TAILLE"] != "" and data["TAILLE"] is not None:
                p.TAILLE = Decimal(str(data["TAILLE"]))
            if "AIDANT" in data:
                p.AIDANT = 1 if data["AIDANT"] else 0
    elif role == "vendor":
        v = db.query(Comercant).filter(Comercant.ID_UTILISATUER == user.ID_UTILISATUER).first()
        if v and "NOM_MARCHAND" in data and data["NOM_MARCHAND"] is not None:
            v.NOM_COMMERCIAL = str(data["NOM_MARCHAND"]).strip()

    db.commit()
