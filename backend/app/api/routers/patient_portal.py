"""Patient-facing endpoints (authenticated patient only)."""

from datetime import date
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_patient
from app.models import (
    Clinicien,
    Consultation,
    EstAssocie,
    Fauteuil,
    Pathologie,
    PatientMedical,
    Utilisateur,
)

router = APIRouter()


def _clinician_display_name(db: Session, clinician_user_id: int) -> str:
    c = db.query(Clinicien).filter(Clinicien.ID_UTILISATUER == clinician_user_id).first()
    if c:
        parts = [str(c.PRENOMC or "").strip(), str(c.NOMC or "").strip()]
        name = " ".join(x for x in parts if x).strip()
        if name:
            return name
    u = db.query(Utilisateur).filter(Utilisateur.ID_UTILISATUER == clinician_user_id).first()
    if u and u.EMAIL:
        return u.EMAIL.split("@")[0]
    return "Clinician"


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
                "clinician_name": _clinician_display_name(db, c.ID_UTILISATUER),
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
            "messages_unread": 0,
            "profile_completion_pct": profile_completion_pct,
        },
        "consultations": consultations_out,
        "medical": medical_out,
    }
