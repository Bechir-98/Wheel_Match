from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import (
    AvoirOption,
    ComposerDe,
    EstAssocie,
    Fauteuil,
    Option,
    Composant,
    Pathologie,
    TypeFauteuil,
)

router = APIRouter()


def _row_to_list_item(row, nom_type: str) -> dict:
    d = {
        "ID_FAUTEUIL": row.ID_FAUTEUIL,
        "ID_TYPE": row.ID_TYPE,
        "ID_UTILISATUER": row.ID_UTILISATUER,
        "PROPULTION": row.PROPULTION,
        "PRIX": float(row.PRIX) if row.PRIX is not None else None,
        "QT_STOCK": row.QT_STOCK,
        "NOM_TYPE": nom_type,
        "PROPULTION_TEXT": "With propulsion" if row.PROPULTION else "Manual",
    }
    return d


@router.get("/related/list")
def related_wheelchairs(
    db: Session = Depends(get_db),
    type_id: int = Query(..., alias="type"),
    exclude_id: int = Query(..., alias="exclude"),
):
    q = (
        db.query(Fauteuil, TypeFauteuil.NOM_TYPE)
        .join(TypeFauteuil, Fauteuil.ID_TYPE == TypeFauteuil.ID_TYPE)
        .filter(Fauteuil.ID_TYPE == type_id, Fauteuil.ID_FAUTEUIL != exclude_id)
        .limit(4)
    )
    return [_row_to_list_item(f, nom_type) for f, nom_type in q.all()]


@router.get("")
def list_wheelchairs(
    db: Session = Depends(get_db),
    type: int | None = Query(None),
    exclude: int | None = Query(None),
    search: str | None = None,
    in_stock_only: bool | None = Query(None, alias="inStockOnly"),
):
    q = (
        db.query(Fauteuil, TypeFauteuil.NOM_TYPE)
        .join(TypeFauteuil, Fauteuil.ID_TYPE == TypeFauteuil.ID_TYPE)
        .order_by(Fauteuil.ID_FAUTEUIL)
    )
    if type is not None:
        q = q.filter(Fauteuil.ID_TYPE == type)
    if exclude is not None:
        q = q.filter(Fauteuil.ID_FAUTEUIL != exclude)
    if in_stock_only:
        q = q.filter(Fauteuil.QT_STOCK > 0)
    rows = q.all()
    out = []
    for f, nom_type in rows:
        item = _row_to_list_item(f, nom_type)
        if search and search.lower() not in (nom_type or "").lower():
            continue
        item["NEW"] = f.ID_FAUTEUIL > 103
        out.append(item)
    return out


@router.get("/{wheelchair_id:int}")
def get_wheelchair(wheelchair_id: int, db: Session = Depends(get_db)):
    row = (
        db.query(Fauteuil, TypeFauteuil.NOM_TYPE)
        .join(TypeFauteuil, Fauteuil.ID_TYPE == TypeFauteuil.ID_TYPE)
        .filter(Fauteuil.ID_FAUTEUIL == wheelchair_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wheelchair not found")
    f, nom_type = row
    base = {c.name: getattr(f, c.name) for c in f.__table__.columns}
    base["NOM_TYPE"] = nom_type
    for k in ("PRIX",):
        if base.get(k) is not None:
            base[k] = float(base[k])

    opts = (
        db.query(Option)
        .join(AvoirOption, Option.ID_OPTION == AvoirOption.ID_OPTION)
        .filter(AvoirOption.ID_FAUTEUIL == wheelchair_id)
        .all()
    )
    base["options"] = [{c.name: getattr(o, c.name) for c in o.__table__.columns} for o in opts]

    comps = (
        db.query(Composant)
        .join(ComposerDe, Composant.ID_COMPOSANT == ComposerDe.ID_COMPOSANT)
        .filter(ComposerDe.ID_FAUTEUIL == wheelchair_id)
        .all()
    )
    base["components"] = [{c.name: getattr(co, c.name) for c in co.__table__.columns} for co in comps]

    paths = (
        db.query(Pathologie)
        .join(EstAssocie, Pathologie.ID_PATHOLOGIE == EstAssocie.ID_PATHOLOGIE)
        .filter(EstAssocie.ID_FAUTEUIL == wheelchair_id)
        .all()
    )
    base["pathologies"] = [{c.name: getattr(p, c.name) for c in p.__table__.columns} for p in paths]

    return jsonable_encoder(base)
