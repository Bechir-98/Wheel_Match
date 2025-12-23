"""Patient-facing endpoints (authenticated patient only)."""

from datetime import date
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_patient
from app.models import (
    Consultation,
    EstAssocie,
    Fauteuil,
    Pathologie,
    PatientMedical,
    Utilisateur,
    DemandeFauteuil,
    TypeFauteuil,
)
from app.schemas.demandes import DemandeCreate, DemandeOut
from app.services.messaging import unread_count
from fastapi import HTTPException, status

router = APIRouter()


def _record_author_name(db: Session, author_user_id: int) -> str:
    """Historical consultations predate the SLM; resolve author to email prefix."""
    u = db.query(Utilisateur).filter(Utilisateur.ID_UTILISATUER == author_user_id).first()
    if u and u.EMAIL:
        return u.EMAIL.split("@")[0]
    return "—"


@router.get("/dashboard")
def patient_dashboard(
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(require_patient),
) -> dict[str, Any]:
    uid = user.ID_UTILISATUER
    today = date.today()

    cons_rows = (
        db.query(Consultation, Pathologie)
        .join(Pathologie, Consultation.ID_PATHOLOGIE == Pathologie.ID_PATHOLOGIE)
        .filter(Consultation.PAT_ID_UTILISATUER == uid)
        .order_by(Consultation.DATE_CONSULTATION.desc(), Consultation.NUM_CONSULTATION.desc())
        .all()
    )

    consultations_out: list[dict[str, Any]] = []
    for c, patho in cons_rows:
        d = c.DATE_CONSULTATION
        consultations_out.append(
            {
                "num_consultation": c.NUM_CONSULTATION,
                "date_consultation": d.isoformat() if d else None,
                "pathology_name": (patho.NOM_PAT or "").strip() or "—",
                "morphology": (c.NOM_ORG or "").strip() or "—",
                "clinician_name": _record_author_name(db, c.ID_UTILISATUER),
                "is_upcoming": bool(d and d >= today),
            }
        )

    total_consults = len(cons_rows)
    upcoming_consults = sum(1 for c, _ in cons_rows if c.DATE_CONSULTATION and c.DATE_CONSULTATION >= today)

    med = db.query(PatientMedical).filter(PatientMedical.PAT_ID_UTILISATUER == uid).first()
    medical_out = None
    medical_filled = False
    if med:
        medical_out = {
            "MORPHOLOGIE": med.MORPHOLOGIE or "",
            "PATHOLOGIE": med.PATHOLOGIE or "",
            "NOTES": med.NOTES or "",
            "UPDATED_AT": med.UPDATED_AT.isoformat() if med.UPDATED_AT else None,
        }
        medical_filled = any(
            [
                (med.MORPHOLOGIE or "").strip(),
                (med.PATHOLOGIE or "").strip(),
                (med.NOTES or "").strip(),
            ]
        )

    path_ids = list({c.ID_PATHOLOGIE for c, _ in cons_rows})
    matched_wheelchairs = 0
    if path_ids:
        matched_wheelchairs = (
            db.query(EstAssocie.ID_FAUTEUIL).filter(EstAssocie.ID_PATHOLOGIE.in_(path_ids)).distinct().count()
        )

    catalog_wheelchairs = db.query(Fauteuil).count()

    checklist_done = sum(
        [
            1 if medical_filled else 0,
            1 if total_consults > 0 else 0,
            1 if matched_wheelchairs > 0 else 0,
        ]
    )
    profile_completion_pct = round(100 * checklist_done / 3) if checklist_done else 0

    return {
        "stats": {
            "consultations_total": total_consults,
            "consultations_upcoming": upcoming_consults,
            "medical_record_filled": medical_filled,
            "matched_wheelchairs": matched_wheelchairs,
            "catalog_wheelchairs": catalog_wheelchairs,
            "messages_unread": unread_count(db, uid),
            "profile_completion_pct": profile_completion_pct,
        },
        "consultations": consultations_out,
        "medical": medical_out,
    }

@router.post("/requests", response_model=DemandeOut)
def create_request(
    demande: DemandeCreate,
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(require_patient),
):
    # Check if wheelchair exists
    f = db.query(Fauteuil).filter(Fauteuil.ID_FAUTEUIL == demande.id_fauteuil).first()
    if not f:
        raise HTTPException(status_code=404, detail="Fauteuil not found")

    # One active demande per patient+chair; re-request only after REJETE
    active = db.query(DemandeFauteuil).filter(
        DemandeFauteuil.ID_PATIENT == user.ID_UTILISATUER,
        DemandeFauteuil.ID_FAUTEUIL == demande.id_fauteuil,
        DemandeFauteuil.STATUT.in_(["EN_ATTENTE", "APPROUVE"])
    ).first()
    if active:
        raise HTTPException(status_code=400, detail="An active request already exists for this wheelchair")

    db_demande = DemandeFauteuil(
        ID_PATIENT=user.ID_UTILISATUER,
        ID_FAUTEUIL=demande.id_fauteuil,
        STATUT="APPROUVE",
        ORIGIN="slm",
        PATIENT_ACCEPT=None,
    )
    db.add(db_demande)
    db.commit()
    db.refresh(db_demande)
    return db_demande

@router.get("/requests")
def get_patient_requests(
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(require_patient),
):
    rows = (
        db.query(DemandeFauteuil, Fauteuil, TypeFauteuil.NOM_TYPE)
        .join(Fauteuil, DemandeFauteuil.ID_FAUTEUIL == Fauteuil.ID_FAUTEUIL)
        .join(TypeFauteuil, Fauteuil.ID_TYPE == TypeFauteuil.ID_TYPE)
        .filter(DemandeFauteuil.ID_PATIENT == user.ID_UTILISATUER)
        .order_by(DemandeFauteuil.DATE_DEMANDE.desc())
        .all()
    )
    
    out = []
    for d, f, nom_type in rows:
        out.append({
            "ID_DEMANDE": d.ID_DEMANDE,
            "ID_FAUTEUIL": d.ID_FAUTEUIL,
            "NOM_TYPE": nom_type,
            "STATUT": d.STATUT,
            "NOTES_CLINICIEN": d.NOTES_CLINICIEN,
            "ORIGIN": d.ORIGIN or "patient",
            "PATIENT_ACCEPT": d.PATIENT_ACCEPT,
            "DATE_DEMANDE": d.DATE_DEMANDE.isoformat() if d.DATE_DEMANDE else None,
            "DATE_MAJ": d.DATE_MAJ.isoformat() if d.DATE_MAJ else None,
        })
    return out


@router.post("/requests/{demande_id}/accept", response_model=DemandeOut)
def accept_recommendation(
    demande_id: int,
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(require_patient),
):
    d = db.query(DemandeFauteuil).filter(
        DemandeFauteuil.ID_DEMANDE == demande_id,
        DemandeFauteuil.ID_PATIENT == user.ID_UTILISATUER,
    ).first()
    if not d:
        raise HTTPException(status_code=404, detail="Request not found")
    if d.ORIGIN not in ("clinician", "slm") or d.STATUT != "APPROUVE":
        raise HTTPException(status_code=400, detail="Only recommended wheelchairs can be accepted")
    if d.PATIENT_ACCEPT:
        raise HTTPException(status_code=400, detail="Already accepted")
    f = db.query(Fauteuil).filter(Fauteuil.ID_FAUTEUIL == d.ID_FAUTEUIL).first()
    if not f or (f.QT_STOCK or 0) <= 0:
        raise HTTPException(status_code=409, detail="Out of stock")
    f.QT_STOCK = int(f.QT_STOCK) - 1
    d.PATIENT_ACCEPT = True
    db.commit()
    db.refresh(d)
    return d
