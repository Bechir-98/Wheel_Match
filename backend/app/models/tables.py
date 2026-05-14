from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.db.session import Base


class Utilisateur(Base):
    __tablename__ = "UTILISATEUR"

    ID_UTILISATUER = Column(Integer, primary_key=True, autoincrement=True)
    ADRESSE = Column(String(255))
    EMAIL = Column(String(255), unique=True, index=True)
    PASSWORD = Column(String(255))
    NUMTEL = Column(String(32))


class Patient(Base):
    __tablename__ = "PATIENT"

    ID_UTILISATUER = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), primary_key=True)
    NOMP = Column(String(64))
    PRENOMP = Column(String(64))
    NSS = Column(String(64))
    POIDS = Column(Numeric(6, 2))
    TAILLE = Column(Numeric(6, 3))
    UTILISATION_PRPL = Column(String(32))
    AIDANT = Column(Integer)  # 0/1 flag

    utilisateur = relationship("Utilisateur", backref="patient_profile", foreign_keys=[ID_UTILISATUER])


class Clinicien(Base):
    __tablename__ = "CLINICIEN"

    ID_UTILISATUER = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), primary_key=True)
    NOMC = Column(String(64))
    PRENOMC = Column(String(64))
    SPECIALITE = Column(String(64))

    utilisateur = relationship("Utilisateur", backref="clinicien_profile", foreign_keys=[ID_UTILISATUER])


class Comercant(Base):
    __tablename__ = "COMERCANT"

    ID_UTILISATUER = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), primary_key=True)
    NOM_COMMERCIAL = Column(String(128))

    utilisateur = relationship("Utilisateur", backref="comercant_profile", foreign_keys=[ID_UTILISATUER])


class TypeFauteuil(Base):
    __tablename__ = "TYPE_FAUTEUIL"

    ID_TYPE = Column(Integer, primary_key=True, autoincrement=True)
    NOM_TYPE = Column(String(128))


class Fauteuil(Base):
    __tablename__ = "FAUTEUIL"

    ID_FAUTEUIL = Column(Integer, primary_key=True, autoincrement=True)
    ID_TYPE = Column(Integer, ForeignKey("TYPE_FAUTEUIL.ID_TYPE"), nullable=False)
    ID_UTILISATUER = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), nullable=False)
    PROPULTION = Column(Integer, nullable=False)
    PRIX = Column(Numeric(10, 2), nullable=False)
    QT_STOCK = Column(Integer, nullable=False)

    type_fauteuil = relationship("TypeFauteuil", backref="fauteuils")
    vendeur = relationship("Utilisateur", backref="fauteuils_vendus", foreign_keys=[ID_UTILISATUER])


class Pathologie(Base):
    __tablename__ = "PATHOLOGIE"

    ID_PATHOLOGIE = Column(Integer, primary_key=True, autoincrement=True)
    NOM_PAT = Column(String(128))
    DESCRIPTION = Column(Text)


class Morphologie(Base):
    __tablename__ = "MORPHOLOGIE"

    NOM_ORG = Column(String(128), primary_key=True)
    TAILLEO = Column(Numeric(8, 3))


class Composant(Base):
    __tablename__ = "COMPOSANT"

    ID_COMPOSANT = Column(Integer, primary_key=True, autoincrement=True)
    NOM_COMP = Column(String(128))
    TAILLE_COMP = Column(Numeric(8, 3))


class Option(Base):
    __tablename__ = "OPTION"

    ID_OPTION = Column(Integer, primary_key=True, autoincrement=True)
    NOM_OPTION = Column(String(128))
    TAILLE_OPTION = Column(Integer, nullable=True)


class AvoirOption(Base):
    __tablename__ = "AVOIR__OPTION"

    ID_FAUTEUIL = Column(Integer, ForeignKey("FAUTEUIL.ID_FAUTEUIL"), primary_key=True)
    ID_OPTION = Column(Integer, ForeignKey("OPTION.ID_OPTION"), primary_key=True)


class ComposerDe(Base):
    __tablename__ = "COMPOSER_DE"

    ID_FAUTEUIL = Column(Integer, ForeignKey("FAUTEUIL.ID_FAUTEUIL"), primary_key=True)
    ID_COMPOSANT = Column(Integer, ForeignKey("COMPOSANT.ID_COMPOSANT"), primary_key=True)


class EstAssocie(Base):
    __tablename__ = "EST_ASSOCIE"

    ID_PATHOLOGIE = Column(Integer, ForeignKey("PATHOLOGIE.ID_PATHOLOGIE"), primary_key=True)
    ID_FAUTEUIL = Column(Integer, ForeignKey("FAUTEUIL.ID_FAUTEUIL"), primary_key=True)


class Consultation(Base):
    __tablename__ = "CONSULTATION"

    NUM_CONSULTATION = Column(Integer, primary_key=True, autoincrement=True)
    ID_PATHOLOGIE = Column(Integer, ForeignKey("PATHOLOGIE.ID_PATHOLOGIE"), nullable=False)
    NOM_ORG = Column(String(128), nullable=False)
    ID_UTILISATUER = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), nullable=False)
    PAT_ID_UTILISATUER = Column(Integer, nullable=False)
    DATE_CONSULTATION = Column(Date, nullable=False)


class UserPreferences(Base):
    """App-managed table; created at startup if missing."""

    __tablename__ = "USER_PREFERENCES"

    ID_UTILISATUER = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), primary_key=True)
    PREFS_JSON = Column(Text, nullable=False, default="{}")
    UPDATED_AT = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PatientMedical(Base):
    """Stores clinician-entered morphology/pathology/notes (no equivalent in legacy schema)."""

    __tablename__ = "PATIENT_MEDICAL"

    ID = Column(BigInteger, primary_key=True, autoincrement=True)
    PAT_ID_UTILISATUER = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), nullable=False, index=True)
    MORPHOLOGIE = Column(String(255), nullable=True)
    PATHOLOGIE = Column(String(255), nullable=True)
    NOTES = Column(Text, nullable=True)
    UPDATED_AT = Column(DateTime, server_default=func.now(), onupdate=func.now())

class DemandeFauteuil(Base):
    __tablename__ = "DEMANDE_FAUTEUIL"

    ID_DEMANDE = Column(Integer, primary_key=True, autoincrement=True)
    ID_PATIENT = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), nullable=False)
    ID_FAUTEUIL = Column(Integer, ForeignKey("FAUTEUIL.ID_FAUTEUIL"), nullable=False)
    STATUT = Column(String(32), nullable=False, default="EN_ATTENTE")
    NOTES_CLINICIEN = Column(Text, nullable=True)
    DATE_DEMANDE = Column(DateTime, server_default=func.now())
    DATE_MAJ = Column(DateTime, server_default=func.now(), onupdate=func.now())

    patient = relationship("Utilisateur", foreign_keys=[ID_PATIENT])
    fauteuil = relationship("Fauteuil", foreign_keys=[ID_FAUTEUIL])
