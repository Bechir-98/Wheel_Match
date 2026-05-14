"""Clinician-facing dashboard (authenticated clinician only)."""

from datetime import date
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_clinician
from app.models import Consultation, Patient, PatientMedical, Pathologie, Utilisateur, DemandeFauteuil, Fauteuil, TypeFauteuil
from app.schemas.demandes import DemandeStatusUpdate
from fastapi import HTTPException, status

router = APIRouter()


def _patient_name(p: Patient) -> str:
    parts = [str(p.PRENOMP or "").strip(), str(p.NOMP or "").strip()]
    return " ".join(x for x in parts if x).strip() or "Patient"


def _medical_incomplete(db: Session, pat_id: int) -> bool:
    m = db.query(PatientMedical).filter(PatientMedical.PAT_ID_UTILISATUER == pat_id).first()
    if not m:
        return True
    return not any(
        [
            (m.MORPHOLOGIE or "").strip(),
            (m.PATHOLOGIE or "").strip(),
            (m.NOTES or "").strip(),
        ]
    )


def _consultation_to_dict(
    db: Session,
    c: Consultation,
    patient: Patient,
    patho: Pathologie,
) -> dict[str, Any]:
    return {
        "num_consultation": c.NUM_CONSULTATION,
        "date_consultation": c.DATE_CONSULTATION.isoformat() if c.DATE_CONSULTATION else None,
        "patient_id": patient.ID_UTILISATUER,
        "patient_name": _patient_name(patient),
        "pathology_name": (patho.NOM_PAT or "").strip() or "—",
        "morphology": (c.NOM_ORG or "").strip() or "—",
        "is_today": bool(c.DATE_CONSULTATION and c.DATE_CONSULTATION == date.today()),
    }


@router.get("/dashboard")
def clinician_dashboard(
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(require_clinician),
) -> dict[str, Any]:
    uid = user.ID_UTILISATUER
    today = date.today()
    month_start = date(today.year, today.month, 1)

    cons_q = (
        db.query(Consultation, Patient, Pathologie)
        .join(Patient, Consultation.PAT_ID_UTILISATUER == Patient.ID_UTILISATUER)
        .join(Pathologie, Consultation.ID_PATHOLOGIE == Pathologie.ID_PATHOLOGIE)
        .filter(Consultation.ID_UTILISATUER == uid)
        .order_by(Consultation.DATE_CONSULTATION.desc(), Consultation.NUM_CONSULTATION.desc())
    )
    all_rows = cons_q.all()

    total_consultations = len(all_rows)
    this_month = sum(
        1
        for c, _, _ in all_rows
        if c.DATE_CONSULTATION and c.DATE_CONSULTATION >= month_start
    )
    today_count = sum(1 for c, _, _ in all_rows if c.DATE_CONSULTATION and c.DATE_CONSULTATION == today)

    distinct_patients = len({c.PAT_ID_UTILISATUER for c, _, _ in all_rows})
    registry_total = db.query(Patient).count()

    all_patients = db.query(Patient).all()
    pending_medical = sum(1 for p in all_patients if _medical_incomplete(db, p.ID_UTILISATUER))

    today_list = [_consultation_to_dict(db, c, pat, ph) for c, pat, ph in all_rows if c.DATE_CONSULTATION == today][
        :10
    ]
    recent_list = [_consultation_to_dict(db, c, pat, ph) for c, pat, ph in all_rows[:12]]

    patients_needing_file = []
    for p in all_patients:
        if _medical_incomplete(db, p.ID_UTILISATUER):
            u = db.query(Utilisateur).filter(Utilisateur.ID_UTILISATUER == p.ID_UTILISATUER).first()
            patients_needing_file.append(
                {
                    "id_utilisateur": p.ID_UTILISATUER,
                    "name": _patient_name(p),
                    "email": (u.EMAIL if u else "") or "",
                }
            )
        if len(patients_needing_file) >= 8:
            break

    return {
        "stats": {
            "registry_patients_total": registry_total,
            "patients_seen_distinct": distinct_patients,
            "consultations_total": total_consultations,
            "consultations_this_month": this_month,
            "consultations_today": today_count,
            "pending_medical_assessments": pending_medical,
            "messages_unread": 0,
        },
        "consultations_today": today_list,
        "consultations_recent": recent_list,
        "patients_needing_medical_file": patients_needing_file,
    }

@router.get("/requests")
def get_clinician_requests(
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(require_clinician),
):
    rows = (
        db.query(DemandeFauteuil, Fauteuil, TypeFauteuil.NOM_TYPE, Patient)
        .join(Fauteuil, DemandeFauteuil.ID_FAUTEUIL == Fauteuil.ID_FAUTEUIL)
        .join(TypeFauteuil, Fauteuil.ID_TYPE == TypeFauteuil.ID_TYPE)
        .join(Patient, DemandeFauteuil.ID_PATIENT == Patient.ID_UTILISATUER)
        .order_by(DemandeFauteuil.DATE_DEMANDE.desc())
        .all()
    )
    
    out = []
    for d, f, nom_type, p in rows:
        out.append({
            "ID_DEMANDE": d.ID_DEMANDE,
            "ID_FAUTEUIL": d.ID_FAUTEUIL,
            "NOM_TYPE": nom_type,
            "STATUT": d.STATUT,
            "NOTES_CLINICIEN": d.NOTES_CLINICIEN,
            "DATE_DEMANDE": d.DATE_DEMANDE.isoformat() if d.DATE_DEMANDE else None,
            "DATE_MAJ": d.DATE_MAJ.isoformat() if d.DATE_MAJ else None,
            "patient_name": _patient_name(p),
            "ID_PATIENT": p.ID_UTILISATUER
        })
    return out

@router.put("/requests/{demande_id}/status")
def update_request_status(
    demande_id: int,
    update_data: DemandeStatusUpdate,
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(require_clinician),
):
    d = db.query(DemandeFauteuil).filter(DemandeFauteuil.ID_DEMANDE == demande_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Demande not found")
        
    d.STATUT = update_data.statut
    if update_data.notes_clinicien is not None:
        d.NOTES_CLINICIEN = update_data.notes_clinicien
        
    db.commit()
    db.refresh(d)
    return {"status": "success", "demande_id": d.ID_DEMANDE, "nouveau_statut": d.STATUT}
