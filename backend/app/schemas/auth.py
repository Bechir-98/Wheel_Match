from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    mail: str | None = None
    email: str | None = None
    password: str

    def email_value(self) -> str:
        v = (self.mail or self.email or "").strip()
        return v


class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    email: str
    password: str
    profession: str = Field(..., description="1=patient, 4=vendor")
    address: str = ""
    phone: str = ""
    nomp: str | None = None
    prenomp: str | None = None
    nss: str | None = None
    poids: str | None = None
    taille: str | None = None
    utilisation_prpl: str | None = None
    aidant: bool | str | None = None
    nomc: str | None = None
    prenomc: str | None = None
    specialite: str | None = None
    nom_commercial: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
