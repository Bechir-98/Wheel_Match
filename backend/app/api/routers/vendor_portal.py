"""Vendor-facing dashboard (authenticated vendor only)."""

import json
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_vendor
from app.models import Comercant, DemandeFauteuil, Fauteuil, Patient, TypeFauteuil, UserPreferences, Utilisateur
from app.services.messaging import unread_count

router = APIRouter()


def _pref_threshold(db: Session, uid: int) -> int:
    """ponytail: single vendor-level threshold, per-product when needed."""
    row = db.query(UserPreferences).filter(UserPreferences.ID_UTILISATUER == uid).first()
    if row and row.PREFS_JSON:
        try:
            v = int(json.loads(row.PREFS_JSON).get("LOW_STOCK", 5))
            return max(0, v)
        except (ValueError, TypeError, json.JSONDecodeError):
            pass
    return 5


@router.get("/dashboard")
def vendor_dashboard(
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(require_vendor),
) -> dict[str, Any]:
    uid = user.ID_UTILISATUER

    rows = (
        db.query(Fauteuil, TypeFauteuil.NOM_TYPE)
        .join(TypeFauteuil, Fauteuil.ID_TYPE == TypeFauteuil.ID_TYPE)
        .filter(Fauteuil.ID_UTILISATUER == uid)
        .order_by(Fauteuil.ID_FAUTEUIL.desc())
        .all()
    )

    products_count = len(rows)
    low_stock_threshold = _pref_threshold(db, uid)
    low_stock_count = sum(1 for f, _ in rows if f.QT_STOCK is not None and int(f.QT_STOCK) <= low_stock_threshold)
    total_units = int(sum(int(f.QT_STOCK or 0) for f, _ in rows))

    inventory_value = Decimal("0")
    for f, _ in rows:
        if f.PRIX is not None and f.QT_STOCK is not None:
            inventory_value += Decimal(str(f.PRIX)) * int(f.QT_STOCK)

    prices = [float(f.PRIX) for f, _ in rows if f.PRIX is not None]
    avg_price = round(sum(prices) / len(prices), 2) if prices else 0.0

    v = db.query(Comercant).filter(Comercant.ID_UTILISATUER == uid).first()
    vendor_name = (v.NOM_COMMERCIAL or "").strip() if v else ""

    recent_products = []
    for f, nom_type in rows[:10]:
        recent_products.append(
            {
                "ID_FAUTEUIL": f.ID_FAUTEUIL,
                "NOM_TYPE": nom_type or "—",
                "PRIX": float(f.PRIX) if f.PRIX is not None else None,
                "QT_STOCK": int(f.QT_STOCK) if f.QT_STOCK is not None else 0,
                "PROPULTION_TEXT": "Electric" if f.PROPULTION else "Manual",
            }
        )

    return {
        "vendor_name": vendor_name,
        "stats": {
            "products_count": products_count,
            "total_stock_units": total_units,
            "low_stock_count": low_stock_count,
            "low_stock_threshold": low_stock_threshold,
            "inventory_value": float(inventory_value),
            "average_list_price": avg_price,
            "pending_orders": db.query(DemandeFauteuil).join(
                Fauteuil, DemandeFauteuil.ID_FAUTEUIL == Fauteuil.ID_FAUTEUIL
            ).filter(
                Fauteuil.ID_UTILISATUER == uid,
                DemandeFauteuil.STATUT == "EN_ATTENTE",
            ).count(),
            "messages_unread": unread_count(db, user.ID_UTILISATUER),
        },
        "recent_products": recent_products,
    }


@router.get("/requests")
def vendor_requests(
    db: Session = Depends(get_db),
    user: Utilisateur = Depends(require_vendor),
):
    """Read-only demandes on this vendor's wheelchairs."""
    rows = (
        db.query(DemandeFauteuil, Fauteuil, TypeFauteuil.NOM_TYPE, Patient)
        .join(Fauteuil, DemandeFauteuil.ID_FAUTEUIL == Fauteuil.ID_FAUTEUIL)
        .join(TypeFauteuil, Fauteuil.ID_TYPE == TypeFauteuil.ID_TYPE)
        .join(Patient, DemandeFauteuil.ID_PATIENT == Patient.ID_UTILISATUER)
        .filter(Fauteuil.ID_UTILISATUER == user.ID_UTILISATUER)
        .order_by(DemandeFauteuil.DATE_DEMANDE.desc())
        .all()
    )
    out = []
    for d, f, nom_type, p in rows:
        parts = [str(p.PRENOMP or "").strip(), str(p.NOMP or "").strip()]
        out.append({
            "ID_DEMANDE": d.ID_DEMANDE,
            "ID_FAUTEUIL": d.ID_FAUTEUIL,
            "NOM_TYPE": nom_type,
            "STATUT": d.STATUT,
            "ORIGIN": d.ORIGIN or "patient",
            "DATE_DEMANDE": d.DATE_DEMANDE.isoformat() if d.DATE_DEMANDE else None,
            "patient_name": " ".join(x for x in parts if x) or "Patient",
        })
    return out
