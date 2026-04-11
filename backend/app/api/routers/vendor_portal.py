"""Vendor-facing dashboard (authenticated vendor only)."""

from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_vendor
from app.models import Comercant, Fauteuil, TypeFauteuil, Utilisateur

router = APIRouter()


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
    low_stock_threshold = 5
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
            "pending_orders": 0,
            "monthly_revenue": None,
            "average_rating": None,
            "messages_unread": 0,
        },
        "recent_products": recent_products,
    }
