from decimal import Decimal
from pathlib import Path
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_vendor
from app.models import (
    AvoirOption,
    ComposerDe,
    DemandeFauteuil,
    EstAssocie,
    Fauteuil,
    Option,
    Composant,
    Pathologie,
    TypeFauteuil,
    Utilisateur,
)

router = APIRouter()

UPLOAD_DIR = Path("/app/uploads/wheelchairs")
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}
MAX_BYTES = 5 * 1024 * 1024


class FauteuilCreate(BaseModel):
    id_type: int
    propulsion: int = 0
    prix: float
    qt_stock: int


class FauteuilUpdate(BaseModel):
    id_type: int | None = None
    propulsion: int | None = None
    prix: float | None = None
    qt_stock: int | None = None


def _own_chair(db: Session, wheelchair_id: int, vendor_id: int) -> Fauteuil:
    f = db.query(Fauteuil).filter(Fauteuil.ID_FAUTEUIL == wheelchair_id).first()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wheelchair not found")
    if f.ID_UTILISATUER != vendor_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wheelchair not found")
    return f


def _row_to_list_item(row, nom_type: str) -> dict:
    d = {
        "ID_FAUTEUIL": row.ID_FAUTEUIL,
        "ID_TYPE": row.ID_TYPE,
        "ID_UTILISATUER": row.ID_UTILISATUER,
        "PROPULTION": row.PROPULTION,
        "PRIX": float(row.PRIX) if row.PRIX is not None else None,
        "QT_STOCK": row.QT_STOCK,
        "NOM_TYPE": nom_type,
        "IMAGE": row.IMAGE,
        "PROPULTION_TEXT": "With propulsion" if row.PROPULTION else "Manual",
    }
    return d


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


@router.post("", status_code=status.HTTP_201_CREATED)
def create_wheelchair(
    body: FauteuilCreate,
    db: Session = Depends(get_db),
    vendor: Utilisateur = Depends(require_vendor),
):
    t = db.query(TypeFauteuil).filter(TypeFauteuil.ID_TYPE == body.id_type).first()
    if not t:
        raise HTTPException(status_code=404, detail="Wheelchair type not found")
    if body.prix is None or body.prix < 0 or body.qt_stock is None or body.qt_stock < 0:
        raise HTTPException(status_code=422, detail="Invalid price or stock")
    f = Fauteuil(
        ID_TYPE=body.id_type,
        ID_UTILISATUER=vendor.ID_UTILISATUER,
        PROPULTION=1 if body.propulsion else 0,
        PRIX=Decimal(str(body.prix)),
        QT_STOCK=int(body.qt_stock),
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    return {"success": True, "ID_FAUTEUIL": f.ID_FAUTEUIL}


@router.put("/{wheelchair_id:int}")
def update_wheelchair(
    wheelchair_id: int,
    body: FauteuilUpdate,
    db: Session = Depends(get_db),
    vendor: Utilisateur = Depends(require_vendor),
):
    f = _own_chair(db, wheelchair_id, vendor.ID_UTILISATUER)
    data = body.model_dump(exclude_unset=True)
    if "id_type" in data and data["id_type"] is not None:
        if not db.query(TypeFauteuil).filter(TypeFauteuil.ID_TYPE == data["id_type"]).first():
            raise HTTPException(status_code=404, detail="Wheelchair type not found")
        f.ID_TYPE = data["id_type"]
    if "propulsion" in data and data["propulsion"] is not None:
        f.PROPULTION = 1 if data["propulsion"] else 0
    if "prix" in data and data["prix"] is not None:
        if float(data["prix"]) < 0:
            raise HTTPException(status_code=422, detail="Invalid price")
        f.PRIX = Decimal(str(data["prix"]))
    if "qt_stock" in data and data["qt_stock"] is not None:
        if int(data["qt_stock"]) < 0:
            raise HTTPException(status_code=422, detail="Invalid stock")
        f.QT_STOCK = int(data["qt_stock"])
    db.commit()
    return {"success": True}


@router.delete("/{wheelchair_id:int}")
def delete_wheelchair(
    wheelchair_id: int,
    db: Session = Depends(get_db),
    vendor: Utilisateur = Depends(require_vendor),
):
    f = _own_chair(db, wheelchair_id, vendor.ID_UTILISATUER)
    active = db.query(DemandeFauteuil).filter(
        DemandeFauteuil.ID_FAUTEUIL == wheelchair_id,
        DemandeFauteuil.STATUT.in_(["EN_ATTENTE", "APPROUVE"]),
    ).first()
    if active:
        raise HTTPException(status_code=409, detail="Chair has active requests")
    db.delete(f)
    db.commit()
    return {"success": True}


@router.post("/{wheelchair_id:int}/image")
async def upload_wheelchair_image(
    wheelchair_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    vendor: Utilisateur = Depends(require_vendor),
):
    f = _own_chair(db, wheelchair_id, vendor.ID_UTILISATUER)
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT or not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=422, detail="Only JPG/PNG/WebP images allowed")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    name = f"{wheelchair_id}_{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / name
    size = 0
    with dest.open("wb") as out:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_BYTES:
                dest.unlink(missing_ok=True)
                raise HTTPException(status_code=422, detail="Image over 5MB")
            out.write(chunk)
    f.IMAGE = f"/uploads/wheelchairs/{name}"
    db.commit()
    return {"success": True, "image": f.IMAGE}
