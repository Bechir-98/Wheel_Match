"""Local PDF scan: text layer first, OCR fallback, llama.cpp maps to reference values.

Nothing is saved here; the caller pre-fills the self-entry form for confirmation.
"""

import io
import json
import re
import unicodedata
import urllib.request

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Morphologie, Pathologie

MAX_BYTES = 5 * 1024 * 1024
MAX_PAGES = 10
MIN_TEXT_CHARS = 200

# ponytail: small models wrap JSON in fences despite json_object mode; strip once
_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.DOTALL)


def _norm(s: str) -> str:
    # ponytail: accent/case-insensitive match (Paraplégie == Paraplegie)
    return "".join(c for c in unicodedata.normalize("NFD", s or "") if unicodedata.category(c) != "Mn").casefold().strip()


def extract_text(pdf_bytes: bytes) -> tuple[str, str]:
    """Return (text, method). Raises ValueError on unreadable input."""
    from pypdf import PdfReader

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
    except Exception:
        raise ValueError("Unreadable PDF")
    pages = reader.pages[:MAX_PAGES]
    text = "\n".join((p.extract_text() or "") for p in pages).strip()
    if len(text) >= MIN_TEXT_CHARS:
        return text, "text"

    # ponytail: OCR only when the text layer is empty (scanned pages)
    try:
        from pdf2image import convert_from_bytes
        import pytesseract

        images = convert_from_bytes(pdf_bytes, first_page=1, last_page=min(len(pages), MAX_PAGES) or 1, dpi=200)
        ocr = "\n".join(pytesseract.image_to_string(img, lang="fra+eng") for img in images).strip()
    except Exception as e:
        raise ValueError(f"OCR failed: {e}")
    if len(ocr) < MIN_TEXT_CHARS:
        raise ValueError("No readable text found in PDF")
    return ocr, "ocr"


def ocr_image(image_bytes: bytes) -> tuple[str, str]:
    """Direct OCR for uploaded photos/scans. Raises ValueError when unreadable."""
    from PIL import Image
    import pytesseract

    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.load()
    except Exception:
        raise ValueError("Unreadable image")
    try:
        ocr = pytesseract.image_to_string(img, lang="fra+eng").strip()
    except Exception as e:
        raise ValueError(f"OCR failed: {e}")
    if len(ocr) < MIN_TEXT_CHARS:
        raise ValueError("No readable text found in image")
    return ocr, "ocr"


def map_to_reference(db: Session, text: str) -> dict:
    """Ask llama-server to pick reference values. Unknowns come back null."""
    pathologies = [r.NOM_PAT for r in db.query(Pathologie).order_by(Pathologie.NOM_PAT).all()]
    morphologies = [r.NOM_ORG for r in db.query(Morphologie).order_by(Morphologie.NOM_ORG).all()]
    if not pathologies or not morphologies:
        raise ValueError("Reference tables are empty")

    prompt = (
        "Extract the patient's pathology and morphology from this medical report. "
        "Reply with strict JSON only: "
        '{"pathology": "<exact name from the list or null>", '
        '"morphology": "<exact name from the list or null>", '
        '"confidence": <0-1>, "evidence": "<short quote>"}.\n'
        f"Pathologies: {', '.join(pathologies)}\n"
        f"Morphologies: {', '.join(morphologies)}\n"
        f"Report:\n{text[:6000]}"
    )
    body = json.dumps(
        {
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "stream": False,
            "n_predict": 256,
        }
    ).encode()
    url = (settings.slm_url or "").strip()
    if not url:
        raise ValueError("SLM not configured")
    try:
        req = urllib.request.Request(
            f"{url.rstrip('/')}/v1/chat/completions",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=60) as res:
            outer = json.loads(res.read().decode())
        parsed = json.loads(_FENCE_RE.sub("", outer["choices"][0]["message"]["content"].strip()))
    except Exception as e:
        raise ValueError(f"SLM mapping failed: {e}")

    pathology = (parsed.get("pathology") or "").strip() or None
    morphology = (parsed.get("morphology") or "").strip() or None
    # ponytail: trust the reference tables, not the model — drop anything off-list
    path_by_norm = {_norm(p): p for p in pathologies}
    morph_by_norm = {_norm(m): m for m in morphologies}
    pathology = path_by_norm.get(_norm(pathology or ""))
    morphology = morph_by_norm.get(_norm(morphology or ""))
    try:
        confidence = float(parsed.get("confidence") or 0)
    except (TypeError, ValueError):
        confidence = 0
    # ponytail: values must be grounded in the report text, else the model guessed
    text_norm = _norm(text)
    if pathology and _norm(pathology) not in text_norm:
        pathology, confidence = None, min(confidence, 0.3)
    if morphology and _norm(morphology) not in text_norm:
        morphology, confidence = None, min(confidence, 0.3)
    confidence = max(0.0, min(1.0, confidence))
    print(f"SCAN mapped (pathology={pathology}, morphology={morphology}, confidence={confidence})")
    return {
        "pathology": pathology,
        "morphology": morphology,
        "confidence": confidence,
        "evidence": (parsed.get("evidence") or "").strip()[:500],
    }
