from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Clinicien, Comercant, Patient, Utilisateur

SPEC_LABEL_TO_ID = {
    "rééducation": "1",
    "orthopédie": "2",
    "neurologie": "3",
}


def specialty_to_id_spec(spec: str | None) -> str:
    if not spec:
        return "1"
    s = spec.strip()
    if s.isdigit():
        return s
    return SPEC_LABEL_TO_ID.get(s.lower(), "1")


def id_spec_to_label(spec_id: str | None) -> str:
    m = {"1": "Rééducation", "2": "Orthopédie", "3": "Neurologie"}
    if spec_id and spec_id in m:
        return m[spec_id]
    return spec_id or ""


def build_display_name(db: Session, user: Utilisateur, role: str) -> str:
    """Human-readable label for nav / greetings (falls back to email local-part)."""
    if role == "patient":
        p = db.query(Patient).filter(Patient.ID_UTILISATUER == user.ID_UTILISATUER).first()
        if p:
            parts = [str(p.PRENOMP or "").strip(), str(p.NOMP or "").strip()]
            name = " ".join(x for x in parts if x).strip()
            if name:
                return name
    elif role == "clinician":
        c = db.query(Clinicien).filter(Clinicien.ID_UTILISATUER == user.ID_UTILISATUER).first()
        if c:
            parts = [str(c.PRENOMC or "").strip(), str(c.NOMC or "").strip()]
            name = " ".join(x for x in parts if x).strip()
            if name:
                return name
    elif role == "vendor":
        v = db.query(Comercant).filter(Comercant.ID_UTILISATUER == user.ID_UTILISATUER).first()
        if v and (v.NOM_COMMERCIAL or "").strip():
            return (v.NOM_COMMERCIAL or "").strip()
    email = (user.EMAIL or "").strip()
    return email.split("@")[0] if email else "User"


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
    elif role == "clinician":
        base.update(
            {
                "NOMC": "",
                "PRENOMC": "",
                "ID_SPEC": "1",
                "specialite": id_spec_to_label("1"),
            }
        )
        c = db.query(Clinicien).filter(Clinicien.ID_UTILISATUER == user.ID_UTILISATUER).first()
        if c:
            sid = specialty_to_id_spec(c.SPECIALITE)
            base.update(
                {
                    "NOMC": c.NOMC or "",
                    "PRENOMC": c.PRENOMC or "",
                    "ID_SPEC": sid,
                    "specialite": id_spec_to_label(sid),
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
    elif role == "clinician":
        c = db.query(Clinicien).filter(Clinicien.ID_UTILISATUER == user.ID_UTILISATUER).first()
        if c:
            if "NOMC" in data and data["NOMC"] is not None:
                c.NOMC = str(data["NOMC"]).strip()
            if "PRENOMC" in data and data["PRENOMC"] is not None:
                c.PRENOMC = str(data["PRENOMC"]).strip()
            if "ID_SPEC" in data and data["ID_SPEC"] is not None:
                c.SPECIALITE = str(data["ID_SPEC"]).strip()
    elif role == "vendor":
        v = db.query(Comercant).filter(Comercant.ID_UTILISATUER == user.ID_UTILISATUER).first()
        if v and "NOM_MARCHAND" in data and data["NOM_MARCHAND"] is not None:
            v.NOM_COMMERCIAL = str(data["NOM_MARCHAND"]).strip()

    db.commit()
