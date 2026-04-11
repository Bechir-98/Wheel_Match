from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Composant, Morphologie, Option, Pathologie

router = APIRouter()


def _serialize_rows(rows):
    return jsonable_encoder(
        [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in rows]
    )


@router.get("/morphologies")
def morphologies(db: Session = Depends(get_db)):
    rows = db.query(Morphologie).all()
    return _serialize_rows(rows)


@router.get("/pathologies")
def pathologies(db: Session = Depends(get_db)):
    rows = db.query(Pathologie).all()
    return _serialize_rows(rows)


@router.get("/components")
def components(db: Session = Depends(get_db)):
    rows = db.query(Composant).all()
    return _serialize_rows(rows)


@router.get("/options")
def options(db: Session = Depends(get_db)):
    rows = db.query(Option).all()
    return _serialize_rows(rows)
