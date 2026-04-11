from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import require_clinician
from app.db.session import get_db
from app.models import Consultation, Patient, PatientMedical, Pathologie, Utilisateur
from app.services.auth_service import hash_password

router = APIRouter()


class PatientCreate(BaseModel):
    ADRESSE: str
    EMAIL: str
    PASSWORD: str
    NUMTEL: str
    NOMP: str
    PRENOMP: str
    NSS: str
    POIDS: str | float
    TAILLE: str | float
    UTILISATION_PRPL: str
    AIDANT: bool | int = False


class PatientUpdate(BaseModel):
    ADRESSE: str | None = None
    EMAIL: str | None = None
    NUMTEL: str | None = None
    NOMP: str | None = None
    PRENOMP: str | None = None
    NSS: str | None = None
    POIDS: str | float | None = None
    TAILLE: str | float | None = None
    UTILISATION_PRPL: str | None = None
    AIDANT: bool | int | None = None


class MedicalPayload(BaseModel):
    MORPHOLOGIE: str | None = None
    PATHOLOGIE: str | None = None
    NOTES: str | None = None


def _aidant(v) -> int:
    if v is True or str(v) in ("1", "true", "True"):
        return 1
    return 0


@router.get("")
def list_patients(
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_clinician),
):
    rows = (
        db.query(Patient, Utilisateur)
        .join(Utilisateur, Patient.ID_UTILISATUER == Utilisateur.ID_UTILISATUER)
        .all()
    )
    out = []
    for p, u in rows:
        out.append(
            {
                "ID_UTILISATUER": p.ID_UTILISATUER,
                "NOMP": p.NOMP,
                "PRENOMP": p.PRENOMP,
                "NSS": p.NSS,
                "POIDS": float(p.POIDS) if p.POIDS is not None else None,
                "TAILLE": float(p.TAILLE) if p.TAILLE is not None else None,
                "UTILISATION_PRPL": p.UTILISATION_PRPL,
                "AIDANT": bool(p.AIDANT),
                "ADRESSE": u.ADRESSE,
                "EMAIL": u.EMAIL,
                "NUMTEL": u.NUMTEL,
            }
        )
    return out


@router.post("", status_code=status.HTTP_201_CREATED)
def create_patient(
    body: PatientCreate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_clinician),
):
    if db.query(Utilisateur).filter(Utilisateur.EMAIL == body.EMAIL).first():
        raise HTTPException(status_code=400, detail="Email exists")
    u = Utilisateur(
        ADRESSE=body.ADRESSE,
        EMAIL=body.EMAIL,
        PASSWORD=hash_password(body.PASSWORD),
        NUMTEL=body.NUMTEL,
    )
    db.add(u)
    db.flush()
    db.add(
        Patient(
            ID_UTILISATUER=u.ID_UTILISATUER,
            NOMP=body.NOMP,
            PRENOMP=body.PRENOMP,
            NSS=str(body.NSS),
            POIDS=Decimal(str(body.POIDS)),
            TAILLE=Decimal(str(body.TAILLE)),
            UTILISATION_PRPL=body.UTILISATION_PRPL,
            AIDANT=_aidant(body.AIDANT),
        )
    )
    db.commit()
    return {"success": True}


@router.put("/{id_utilisateur}")
def update_patient(
    id_utilisateur: int,
    body: PatientUpdate,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_clinician),
):
    p = db.query(Patient).filter(Patient.ID_UTILISATUER == id_utilisateur).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    u = db.query(Utilisateur).filter(Utilisateur.ID_UTILISATUER == id_utilisateur).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    data = body.model_dump(exclude_unset=True)
    for field in ("ADRESSE", "EMAIL", "NUMTEL"):
        if field in data and data[field] is not None:
            setattr(u, field, data[field])
    for field in ("NOMP", "PRENOMP", "NSS", "UTILISATION_PRPL"):
        if field in data and data[field] is not None:
            setattr(p, field, data[field])
    if "POIDS" in data and data["POIDS"] is not None:
        p.POIDS = Decimal(str(data["POIDS"]))
    if "TAILLE" in data and data["TAILLE"] is not None:
        p.TAILLE = Decimal(str(data["TAILLE"]))
    if "AIDANT" in data and data["AIDANT"] is not None:
        p.AIDANT = _aidant(data["AIDANT"])
    db.commit()
    return {"success": True}


@router.delete("/{id_utilisateur}")
def delete_patient(
    id_utilisateur: int,
    db: Session = Depends(get_db),
    _: Utilisateur = Depends(require_clinician),
):
    p = db.query(Patient).filter(Patient.ID_UTILISATUER == id_utilisateur).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    u = db.query(Utilisateur).filter(Utilisateur.ID_UTILISATUER == id_utilisateur).first()
    db.delete(p)
    if u:
        db.delete(u)
    db.commit()
    return {"success": True}


@router.post("/{id_utilisateur}/medical")
def save_medical(
    id_utilisateur: int,
    body: MedicalPayload,
    db: Session = Depends(get_db),
    clinician: Utilisateur = Depends(require_clinician),
):
    p = db.query(Patient).filter(Patient.ID_UTILISATUER == id_utilisateur).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")

    rec = (
        db.query(PatientMedical)
        .filter(PatientMedical.PAT_ID_UTILISATUER == id_utilisateur)
        .first()
    )
    if not rec:
        rec = PatientMedical(PAT_ID_UTILISATUER=id_utilisateur)
        db.add(rec)
    rec.MORPHOLOGIE = body.MORPHOLOGIE
    rec.PATHOLOGIE = body.PATHOLOGIE
    rec.NOTES = body.NOTES

    path_id = None
    if body.PATHOLOGIE:
        ph = db.query(Pathologie).filter(Pathologie.NOM_PAT == body.PATHOLOGIE).first()
        if ph:
            path_id = ph.ID_PATHOLOGIE
    if path_id is None:
        firstp = db.query(Pathologie).order_by(Pathologie.ID_PATHOLOGIE).first()
        path_id = firstp.ID_PATHOLOGIE if firstp else 1
    nom_org = (body.MORPHOLOGIE or "").strip() or "-"
    db.add(
        Consultation(
            ID_PATHOLOGIE=path_id,
            NOM_ORG=nom_org[:128],
            ID_UTILISATUER=clinician.ID_UTILISATUER,
            PAT_ID_UTILISATUER=id_utilisateur,
            DATE_CONSULTATION=date.today(),
        )
    )
    db.commit()
    return {"success": True}
