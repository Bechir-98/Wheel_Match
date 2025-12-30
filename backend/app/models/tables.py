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
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from pgvector.sqlalchemy import Vector

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
    # ponytail: local upload path, S3/CDN when multi-instance
    IMAGE = Column(String(512), nullable=True)

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
    """Latest self-reported snapshot."""

    __tablename__ = "PATIENT_MEDICAL"

    ID = Column(BigInteger, primary_key=True, autoincrement=True)
    PAT_ID_UTILISATUER = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), nullable=False, index=True)
    MORPHOLOGIE = Column(String(255), nullable=True)
    PATHOLOGIE = Column(String(255), nullable=True)
    NOTES = Column(Text, nullable=True)
    # ponytail: origin of the snapshot (self form, pdf scan)
    SOURCE = Column(String(16), nullable=False, default="self")
    UPDATED_AT = Column(DateTime, server_default=func.now(), onupdate=func.now())

class DemandeFauteuil(Base):
    __tablename__ = "DEMANDE_FAUTEUIL"

    ID_DEMANDE = Column(Integer, primary_key=True, autoincrement=True)
    ID_PATIENT = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), nullable=False)
    ID_FAUTEUIL = Column(Integer, ForeignKey("FAUTEUIL.ID_FAUTEUIL"), nullable=False)
    STATUT = Column(String(32), nullable=False, default="EN_ATTENTE")
    NOTES = Column(Text, nullable=True)
    # ponytail: origin+accept drive the two flows; add when vendor counters need more
    ORIGIN = Column(String(16), nullable=False, default="patient")
    PATIENT_ACCEPT = Column(Boolean, nullable=True)
    DATE_DEMANDE = Column(DateTime, server_default=func.now())
    DATE_MAJ = Column(DateTime, server_default=func.now(), onupdate=func.now())

    patient = relationship("Utilisateur", foreign_keys=[ID_PATIENT])
    fauteuil = relationship("Fauteuil", foreign_keys=[ID_FAUTEUIL])


class Conversation(Base):
    """1:1 thread, always patient + vendor. Created on first message."""

    __tablename__ = "CONVERSATION"

    ID = Column(Integer, primary_key=True, autoincrement=True)
    PATIENT_ID = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), nullable=False, index=True)
    OTHER_ID = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), nullable=False, index=True)
    DEMANDE_ID = Column(Integer, ForeignKey("DEMANDE_FAUTEUIL.ID_DEMANDE"), nullable=True)
    UPDATED_AT = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Message(Base):
    __tablename__ = "MESSAGE"

    ID = Column(Integer, primary_key=True, autoincrement=True)
    CONV_ID = Column(Integer, ForeignKey("CONVERSATION.ID", ondelete="CASCADE"), nullable=False, index=True)
    SENDER_ID = Column(Integer, ForeignKey("UTILISATEUR.ID_UTILISATUER"), nullable=False)
    TEXT = Column(Text, nullable=False)
    # ponytail: single read flag, per-recipient receipts when needed
    IS_READ = Column(Boolean, nullable=False, default=False)
    CREATED_AT = Column(DateTime, server_default=func.now())


class KBChunk(Base):
    """pgvector knowledge base. Exact cosine search until scale demands HNSW."""

    __tablename__ = "KB_CHUNK"

    ID = Column(String(128), primary_key=True)
    TEXT = Column(Text, nullable=False)
    TYPE = Column(String(64), nullable=False, default="")
    METADATA = Column(JSONB, nullable=False, default=dict)
    EMBEDDING = Column(Vector(3072))
