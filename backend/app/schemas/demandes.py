from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class DemandeCreate(BaseModel):
    id_fauteuil: int

class DemandeStatusUpdate(BaseModel):
    statut: str
    notes_clinicien: Optional[str] = None

class DemandeOut(BaseModel):
    ID_DEMANDE: int
    ID_PATIENT: int
    ID_FAUTEUIL: int
    STATUT: str
    NOTES_CLINICIEN: Optional[str] = None
    DATE_DEMANDE: Optional[datetime] = None
    DATE_MAJ: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True
