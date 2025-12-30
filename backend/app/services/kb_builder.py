import os

from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models import (
    Fauteuil, TypeFauteuil, Pathologie, Morphologie,
    Composant, Option, EstAssocie
)

EMBEDDING_MODEL = "gemini-embedding-001"

FAQ_CONTENT = [
    {
        "id": "faq_1",
        "text": "Wheel Match is a platform that connects patients and vendors for wheelchair selection and management. Patients can browse wheelchairs, get AI-ranked recommendations from their medical profile, submit requests, and track their medical records. Vendors can manage their wheelchair inventory.",
        "type": "faq",
        "metadata": {"question": "What is Wheel Match?"}
    },
    {
        "id": "faq_2",
        "text": "To get started, create an account as a Patient or Vendor. Patients can register with medical details (NSS, weight, height, propulsion type). After registration, you can browse wheelchairs, view your dashboard, get AI recommendations, and submit requests.",
        "type": "faq",
        "metadata": {"question": "How do I get started?"}
    },
    {
        "id": "faq_3",
        "text": "Wheel Match is free for patients. Vendors may have subscription fees for inventory management features. Contact support for pricing details.",
        "type": "faq",
        "metadata": {"question": "Is Wheel Match free?"}
    },
    {
        "id": "faq_4",
        "text": "You can edit your personal information in the Settings page. Go to your dashboard and click Settings, then update your profile details.",
        "type": "faq",
        "metadata": {"question": "Can I edit my personal information?"}
    },
    {
        "id": "faq_5",
        "text": "Wheelchair recommendations are based on your medical profile (morphology, pathology, propulsion type). The system matches wheelchairs that are associated with your pathology and suitable for your morphology, then an AI model ranks the top candidates with reasons. These are assistive suggestions, not medical prescriptions.",
        "type": "faq",
        "metadata": {"question": "How do wheelchair recommendations work?"}
    },
    {
        "id": "faq_6",
        "text": "There is no clinician role. Wheelchair matching is done by the AI recommender from the patient's medical profile. For medical advice, consult a healthcare professional outside the app.",
        "type": "faq",
        "metadata": {"question": "Who approves wheelchair requests?"}
    },
    {
        "id": "faq_7",
        "text": "Vendors can manage their wheelchair inventory, track stock levels, view inventory value, and get alerts for low-stock items.",
        "type": "faq",
        "metadata": {"question": "What can vendors do?"}
    },
    {
        "id": "faq_8",
        "text": "Contact support at support@wheelmatch.com or call +216 92195666 for assistance.",
        "type": "faq",
        "metadata": {"question": "How do I contact support?"}
    }
]

ROLE_DESCRIPTIONS = [
    {
        "id": "role_patient",
        "text": "Patients are users who need wheelchairs. They can browse the catalog, view medical records, submit wheelchair requests, track request status, and manage their profile. Patients register with medical details including NSS, weight, height, and propulsion type.",
        "type": "role",
        "metadata": {"role": "patient"}
    },
    {
        "id": "role_vendor",
        "text": "Vendors are wheelchair suppliers who manage inventory. They can add/edit wheelchair products, track stock levels, view inventory statistics and value, and receive low-stock alerts.",
        "type": "role",
        "metadata": {"role": "vendor"}
    }
]


def get_gemini_api_key() -> str:
    return getattr(settings, 'gemini_api_key', None) or os.getenv("GEMINI_API_KEY", "")


def embed_text(text: str, task_type: str = "RETRIEVAL_DOCUMENT") -> list[float]:
    api_key = get_gemini_api_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured")
    client = genai.Client(api_key=api_key)
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(task_type=task_type)
    )
    return result.embeddings[0].values


def build_chunks(db: Session) -> list[dict]:
    chunks = []

    # Wheelchairs
    wheelchairs = db.query(Fauteuil).all()
    for w in wheelchairs:
        type_name = w.type_fauteuil.NOM_TYPE if w.type_fauteuil else "Unknown"
        propulsion = "manual" if w.PROPULTION == 0 else "electric"
        text = (
            f"Wheelchair ID {w.ID_FAUTEUIL}: {type_name}. "
            f"Price: {w.PRIX} TND. Stock: {w.QT_STOCK} units. "
            f"Propulsion: {propulsion}. "
            f"Suitable for patients needing {propulsion} wheelchairs."
        )
        chunks.append({
            "id": f"wc_{w.ID_FAUTEUIL}",
            "text": text,
            "type": "wheelchair",
            "metadata": {
                "wheelchair_id": w.ID_FAUTEUIL,
                "type": type_name,
                "price": float(w.PRIX) if w.PRIX else 0,
                "stock": w.QT_STOCK,
                "propulsion": propulsion
            }
        })

    # Wheelchair types
    types = db.query(TypeFauteuil).all()
    for t in types:
        text = f"Wheelchair type: {t.NOM_TYPE}. This is a category of wheelchairs."
        chunks.append({
            "id": f"type_{t.ID_TYPE}",
            "text": text,
            "type": "wheelchair_type",
            "metadata": {"type_id": t.ID_TYPE, "name": t.NOM_TYPE}
        })

    # Pathologies
    pathologies = db.query(Pathologie).all()
    for p in pathologies:
        text = f"Pathology: {p.NOM_PAT}. Description: {p.DESCRIPTION or 'No description available.'}"
        chunks.append({
            "id": f"pathology_{p.ID_PATHOLOGIE}",
            "text": text,
            "type": "pathology",
            "metadata": {"pathology_id": p.ID_PATHOLOGIE, "name": p.NOM_PAT, "description": p.DESCRIPTION}
        })

    # Morphologies
    morphologies = db.query(Morphologie).all()
    for m in morphologies:
        text = f"Morphology: {m.NOM_ORG}. Reference height: {float(m.TAILLEO) if m.TAILLEO else 'N/A'} meters."
        chunks.append({
            "id": f"morphology_{m.NOM_ORG}",
            "text": text,
            "type": "morphology",
            "metadata": {"name": m.NOM_ORG, "height": float(m.TAILLEO) if m.TAILLEO else None}
        })

    # Components
    components = db.query(Composant).all()
    for c in components:
        text = f"Component: {c.NOM_COMP}. Size: {float(c.TAILLE_COMP) if c.TAILLE_COMP else 'N/A'} meters."
        chunks.append({
            "id": f"component_{c.ID_COMPOSANT}",
            "text": text,
            "type": "component",
            "metadata": {"component_id": c.ID_COMPOSANT, "name": c.NOM_COMP, "size": float(c.TAILLE_COMP) if c.TAILLE_COMP else None}
        })

    # Options
    options = db.query(Option).all()
    for o in options:
        text = f"Option: {o.NOM_OPTION}. Size: {o.TAILLE_OPTION if o.TAILLE_OPTION else 'N/A'}."
        chunks.append({
            "id": f"option_{o.ID_OPTION}",
            "text": text,
            "type": "option",
            "metadata": {"option_id": o.ID_OPTION, "name": o.NOM_OPTION, "size": o.TAILLE_OPTION}
        })

    # Pathology-wheelchair associations
    associations = db.query(EstAssocie).all()
    for a in associations:
        pathology = db.query(Pathologie).filter(Pathologie.ID_PATHOLOGIE == a.ID_PATHOLOGIE).first()
        wheelchair = db.query(Fauteuil).filter(Fauteuil.ID_FAUTEUIL == a.ID_FAUTEUIL).first()
        if pathology and wheelchair:
            text = (
                f"Wheelchair ID {wheelchair.ID_FAUTEUIL} ({wheelchair.type_fauteuil.NOM_TYPE if wheelchair.type_fauteuil else 'Unknown'}) "
                f"is associated with pathology: {pathology.NOM_PAT}. "
                f"This wheelchair is recommended for patients with {pathology.NOM_PAT}."
            )
            chunks.append({
                "id": f"assoc_{a.ID_PATHOLOGIE}_{a.ID_FAUTEUIL}",
                "text": text,
                "type": "association",
                "metadata": {
                    "pathology_id": a.ID_PATHOLOGIE,
                    "pathology_name": pathology.NOM_PAT,
                    "wheelchair_id": a.ID_FAUTEUIL,
                    "wheelchair_type": wheelchair.type_fauteuil.NOM_TYPE if wheelchair.type_fauteuil else None
                }
            })

    # FAQ content
    for faq in FAQ_CONTENT:
        chunks.append(faq)

    # Role descriptions
    for role in ROLE_DESCRIPTIONS:
        chunks.append(role)

    return chunks


def rebuild_knowledge_base():
    from app.models import KBChunk

    print("Building knowledge base...")
    db = SessionLocal()
    try:
        chunks = build_chunks(db)
        print(f"Created {len(chunks)} chunks. Computing embeddings...")

        # ponytail: purge the removed clinician-role chunk; merge() alone would leave it
        db.query(KBChunk).filter(KBChunk.ID == "role_clinician").delete(synchronize_session=False)

        for i, chunk in enumerate(chunks):
            print(f"Embedding chunk {i+1}/{len(chunks)}: {chunk['id']}")
            embedding = embed_text(chunk["text"])
            db.merge(
                KBChunk(
                    ID=chunk["id"],
                    TEXT=chunk["text"],
                    TYPE=chunk.get("type", ""),
                    METADATA=chunk.get("metadata", {}),
                    EMBEDDING=embedding,
                )
            )
        db.commit()
        print(f"Knowledge base saved ({len(chunks)} chunks)")
    finally:
        db.close()


if __name__ == "__main__":
    rebuild_knowledge_base()