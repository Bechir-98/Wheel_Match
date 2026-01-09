"""Rule-first wheelchair ranking with optional SLM re-rank."""

import json
import urllib.request

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Consultation, EstAssocie, Fauteuil, Patient, PatientMedical, Pathologie, TypeFauteuil
from app.services.docscan_service import _FENCE_RE

DISCLAIMER = "Assistive suggestion, not a medical prescription. Confirm with a professional/vendor."

# ponytail: rule ranking is the fallback; SLM only re-orders top candidates
SLM_TIMEOUT_S = 15
SLM_CONTEXT_N = 20


def _parse_json_lenient(raw: str) -> dict:
    return json.loads(_FENCE_RE.sub("", raw.strip()))


def get_patient_profile(db: Session, uid: int) -> dict:
    p = db.query(Patient).filter(Patient.ID_UTILISATUER == uid).first()
    med = db.query(PatientMedical).filter(PatientMedical.PAT_ID_UTILISATUER == uid).first()
    cons = db.query(Consultation).filter(Consultation.PAT_ID_UTILISATUER == uid).all()

    path_ids = sorted({c.ID_PATHOLOGIE for c in cons if c.ID_PATHOLOGIE})
    path_names = []
    if path_ids:
        path_names = [
            r.NOM_PAT for r in db.query(Pathologie).filter(Pathologie.ID_PATHOLOGIE.in_(path_ids)).all()
        ]
    elif med and (med.PATHOLOGIE or "").strip():
        path_names = [(med.PATHOLOGIE or "").strip()]

    morphology = ""
    if med and (med.MORPHOLOGIE or "").strip():
        morphology = (med.MORPHOLOGIE or "").strip()
    elif cons and (cons[0].NOM_ORG or "").strip():
        morphology = (cons[0].NOM_ORG or "").strip()

    propulsion = ((p.UTILISATION_PRPL or "") if p else "").strip().upper() if p else ""
    return {
        "pathology_ids": path_ids,
        "pathology_names": path_names,
        "morphology": morphology,
        "propulsion": propulsion,
    }


def _slm_rerank(profile: dict, candidates: list[dict]) -> tuple[list[dict], bool]:
    """Ask llama-server sidecar to re-order candidates. Never raises; falls back to input order."""
    url = (settings.slm_url or "").strip()
    if not url or not candidates:
        return candidates, False
    chairs = "\n".join(
        f"- id {c['ID_FAUTEUIL']}: {c['NOM_TYPE']} "
        f"({'electric' if c['PROPULTION'] else 'manual'}, {c['PRIX']} TND, stock {c['QT_STOCK']})"
        for c in candidates
    )
    prompt = (
        "You rank wheelchairs for a patient. Reply with strict JSON only: "
        '{"recommendations": [{"id_fauteuil": <int>, "score": <0-10>, "reason": "<short>"}]}. '
        f"Patient pathologies: {', '.join(profile['pathology_names']) or 'unknown'}; "
        f"morphology: {profile['morphology'] or 'unknown'}; "
        f"propulsion: {profile['propulsion'] or 'unknown'}.\n"
        f"Candidates:\n{chairs}"
    )
    body = json.dumps(
        {
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "stream": False,
            "n_predict": 512,
        }
    ).encode()
    # ponytail: one retry; 0.5B models intermittently emit non-JSON
    last_err: Exception | None = None
    for _ in range(2):
        try:
            req = urllib.request.Request(
                f"{url.rstrip('/')}/v1/chat/completions",
                data=body,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=SLM_TIMEOUT_S) as res:
                outer = json.loads(res.read().decode())
            content = outer["choices"][0]["message"]["content"]
            parsed = _parse_json_lenient(content)
            items = parsed.get("recommendations", [])
            by_id = {c["ID_FAUTEUIL"]: dict(c) for c in candidates}
            out = []
            for it in items:
                # ponytail: SLM decides order only; scores+reasons stay rule-based (tiny models hallucinate prose)
                c = by_id.pop(int(it["id_fauteuil"]), None)
                if c is None:
                    continue
                out.append(c)
            # Any ids the SLM dropped keep rule order at the end
            out.extend(sorted(by_id.values(), key=lambda c: (-c["score"], c["ID_FAUTEUIL"])))
            print(f"SLM re-rank ok ({settings.slm_model}, {len(out)} candidates)")
            return out, True
        except Exception as e:
            last_err = e
    print(f"SLM re-rank skipped, using rule ranking: {last_err}")
    return candidates, False


def rule_rank(db: Session, profile: dict, context_n: int = SLM_CONTEXT_N) -> list[dict]:
    """Deterministic rank over in-stock chairs. Pure rule base; SLM only re-orders its output."""

    q = (
        db.query(Fauteuil, TypeFauteuil.NOM_TYPE)
        .join(TypeFauteuil, Fauteuil.ID_TYPE == TypeFauteuil.ID_TYPE)
        .filter(Fauteuil.QT_STOCK > 0)
        .order_by(Fauteuil.ID_FAUTEUIL)
    )
    rows = q.all()

    assoc_ids: set[int] = set()
    if profile.get("pathology_ids"):
        assoc_ids = {
            r[0]
            for r in db.query(EstAssocie.ID_FAUTEUIL)
            .filter(EstAssocie.ID_PATHOLOGIE.in_(profile["pathology_ids"]))
            .distinct()
            .all()
        }

    want_electric = "ELECTRIQUE" in (profile.get("propulsion") or "")

    scored = []
    for f, nom_type in rows:
        score = 0
        reasons: list[str] = []
        if f.ID_FAUTEUIL in assoc_ids:
            score += 2
            reasons.append(f"Matches your pathology ({', '.join(profile.get('pathology_names', []))})")
        is_electric = bool(f.PROPULTION)
        if (want_electric and is_electric) or (not want_electric and not is_electric):
            score += 1
            reasons.append("Matches your propulsion preference")
        if not reasons:
            reasons.append("Available in stock")
        scored.append((score, f.ID_FAUTEUIL, f, nom_type, reasons))

    # Matched first, then stable by ID
    scored.sort(key=lambda t: (-t[0], t[1]))

    return [
        {
            "ID_FAUTEUIL": f.ID_FAUTEUIL,
            "NOM_TYPE": nom_type,
            "PRIX": float(f.PRIX) if f.PRIX is not None else None,
            "QT_STOCK": f.QT_STOCK,
            "PROPULTION": f.PROPULTION,
            "score": score,
            "reasons": reasons,
        }
        for score, _, f, nom_type, reasons in scored[:context_n]
    ]


def recommend(db: Session, uid: int, limit: int = 3) -> dict:
    profile = get_patient_profile(db, uid)
    candidates = rule_rank(db, profile)
    ranked, slm_used = _slm_rerank(profile, candidates)
    recs = ranked[: max(1, min(limit, 10))]
    return {
        "profile": {
            "pathology_names": profile["pathology_names"],
            "morphology": profile["morphology"],
            "propulsion": profile["propulsion"],
        },
        "recommendations": recs,
        "slm_used": slm_used,
        "disclaimer": DISCLAIMER,
    }
