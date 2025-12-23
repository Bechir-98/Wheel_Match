from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class DemandeCreate(BaseModel):
    id_fauteuil: int


class DemandeOut(BaseModel):
    ID_DEMANDE: int
    ID_PATIENT: int
    ID_FAUTEUIL: int
    STATUT: str
    NOTES_CLINICIEN: Optional[str] = None
    ORIGIN: str = "slm"
    PATIENT_ACCEPT: Optional[bool] = None
    DATE_DEMANDE: Optional[datetime] = None
    DATE_MAJ: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True
