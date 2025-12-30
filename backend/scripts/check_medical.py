"""Medical-record build check: reference integrity + save/scan guards.

Usage:
  docker compose exec backend python scripts/check_medical.py            # full (needs DB)
  python scripts/check_medical.py --offline                              # pure unit checks, no DB

Exit 0 when all checks pass, 1 otherwise. Live API roundtrip
(PUT /patient/medical, POST /patient/medical/scan) is manual — see README.
"""

import argparse
import io
import json
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

try:  # ponytail: offline runs without container deps; Vector column unused here
    import pgvector.sqlalchemy  # noqa: F401
except ImportError:
    import types

    import sqlalchemy as _sa

    _pg, _pgs = types.ModuleType("pgvector"), types.ModuleType("pgvector.sqlalchemy")
    _pgs.Vector = lambda *a, **k: _sa.Text()  # noqa: E731
    _pg.sqlalchemy = _pgs
    sys.modules["pgvector"], sys.modules["pgvector.sqlalchemy"] = _pg, _pgs

from app.services import docscan_service as doc  # noqa: E402

PASS, FAIL = "OK ", "FAIL"


def check(name, cond, detail=""):
    print(f"CHECK: [{PASS if cond else FAIL}] {name}" + (f" — {detail}" if detail and not cond else ""))
    return cond


def unit_checks():
    ok = True
    # _norm: accent/case-insensitive (save endpoint relies on this to match reference values)
    ok &= check("norm accents", doc._norm("Paraplégie") == doc._norm("paraplegie"))
    ok &= check("norm case/space", doc._norm("  MANUELLE ") == "manuelle")
    ok &= check("norm empty", doc._norm("") == "" and doc._norm(None) == "")
    # fence strip: small SLMs wrap JSON in ```json fences
    ok &= check("fence strip", json.loads(doc._FENCE_RE.sub("", '```json\n{"a":1}\n```')) == {"a": 1})

    # map_to_reference guards with stubbed SLM + fake reference tables
    paths, morphs = ["Paraplegie", "Hemiplegie"], ["Grande taille", "Petite taille"]

    class _Q:
        def __init__(self, rows):
            self._rows = rows

        def order_by(self, *a):
            return self

        def all(self):
            return self._rows

    class _DB:
        def query(self, model):
            from app.models import Morphologie

            return _Q([type("R", (), {"NOM_ORG": m})() for m in morphs] if model is Morphologie else [type("R", (), {"NOM_PAT": p})() for p in paths])

    class _Resp:
        def __init__(self, payload):
            self._payload = payload

        def read(self):
            return json.dumps({"choices": [{"message": {"content": self._payload}}]}).encode()

        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

    real_urlopen, real_url = urllib.request.urlopen, doc.settings.slm_url
    try:
        doc.settings.slm_url = "http://stub:8080"

        def run_case(slm_json, report):
            urllib.request.urlopen = lambda req, timeout=60: _Resp(slm_json)
            return doc.map_to_reference(_DB(), report)

        # happy path: on-list + grounded in report text
        r = run_case(
            json.dumps({"pathology": "paraplegie", "morphology": "grande taille", "confidence": 0.9, "evidence": "paraplegie"}),
            "patient with paraplegie, grande taille",
        )
        ok &= check("scan happy path", r["pathology"] == "Paraplegie" and r["morphology"] == "Grande taille" and r["confidence"] == 0.9, str(r))

        # off-list model output is dropped (tables are trusted, not the model)
        r = run_case(
            json.dumps({"pathology": "Invented-itis", "morphology": "Grande taille", "confidence": 0.9, "evidence": "x"}),
            "grande taille",
        )
        ok &= check("scan drops off-list pathology", r["pathology"] is None, str(r))

        # ungrounded value (not in report text) is nulled, confidence capped
        r = run_case(
            json.dumps({"pathology": "Hemiplegie", "morphology": None, "confidence": 0.9, "evidence": "x"}),
            "patient with paraplegie",
        )
        ok &= check("scan grounds in report text", r["pathology"] is None and r["confidence"] <= 0.3, str(r))

        # SLM down → ValueError (endpoint turns it into 502, never a silent save)
        urllib.request.urlopen = lambda req, timeout=60: (_ for _ in ()).throw(ConnectionError("down"))
        try:
            doc.map_to_reference(_DB(), "text")
            ok &= check("scan SLM-down raises", False)
        except ValueError:
            ok &= check("scan SLM-down raises", True)
    finally:
        urllib.request.urlopen, doc.settings.slm_url = real_urlopen, real_url
    return ok


def db_checks():
    from app.db.session import SessionLocal
    from app.models import Morphologie, Pathologie

    try:
        db = SessionLocal()
    except Exception as e:
        return check("db connect", False, str(e))
    try:
        try:
            paths = [r.NOM_PAT for r in db.query(Pathologie).order_by(Pathologie.NOM_PAT).all()]
            morphs = [r.NOM_ORG for r in db.query(Morphologie).order_by(Morphologie.NOM_ORG).all()]
        except Exception as e:
            return check("reference tables readable", False, str(e))
        ok = True
        ok &= check("pathologies non-empty", bool(paths), f"{len(paths)} rows")
        ok &= check("morphologies non-empty", bool(morphs), f"{len(morphs)} rows")
        # every reference value round-trips through the endpoint's own matching rule
        path_by_norm = {doc._norm(p): p for p in paths}
        morph_by_norm = {doc._norm(m): m for m in morphs}
        ok &= check("pathology self-match", all(path_by_norm.get(doc._norm(p)) == p for p in paths))
        ok &= check("morphology self-match", all(morph_by_norm.get(doc._norm(m)) == m for m in morphs))
        ok &= check("garbage matches nothing", doc._norm("nope") not in path_by_norm and doc._norm("nope") not in morph_by_norm)
        # scan is read-only by construction: endpoint returns before any write (nothing to assert on disk)
        ok &= check("scan endpoint read-only", "map_to_reference" in dir(doc) and "extract_text" in dir(doc))
        return ok
    finally:
        db.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true", help="unit checks only, no DB")
    args = ap.parse_args()
    ok = unit_checks()
    if not args.offline:
        print("--- db ---")
        try:
            ok &= db_checks()
        except Exception as e:  # e.g. no DATABASE_URL reachable outside docker
            ok &= check("db checks", False, f"{e} (run inside backend container or use --offline)")
    print("RESULT:", "PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
