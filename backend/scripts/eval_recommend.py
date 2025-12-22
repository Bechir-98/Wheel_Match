"""Rule-ranker recall@3 vs EstAssocie ground truth (SLM excluded: it only re-orders).

Run inside the backend container:  docker compose exec backend python scripts/eval_recommend.py
Exit 1 when mean recall < 0.8.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models import EstAssocie, Fauteuil, Pathologie
from app.services.recommend_service import rule_rank

K = 3
THRESHOLD = 0.8


def main() -> int:
    db = SessionLocal()
    try:
        pathologies = db.query(Pathologie).order_by(Pathologie.ID_PATHOLOGIE).all()
        if not pathologies:
            print("EVAL: no pathologies in DB")
            return 1

        recalls = []
        for p in pathologies:
            truth = {
                r[0]
                for r in db.query(EstAssocie.ID_FAUTEUIL)
                .join(Fauteuil, EstAssocie.ID_FAUTEUIL == Fauteuil.ID_FAUTEUIL)
                .filter(EstAssocie.ID_PATHOLOGIE == p.ID_PATHOLOGIE, Fauteuil.QT_STOCK > 0)
                .distinct()
                .all()
            }
            if not truth:
                print(f"EVAL: skip {p.NOM_PAT} (no in-stock associated chairs)")
                continue
            for propulsion in ("", "ELECTRIQUE"):
                profile = {
                    "pathology_ids": [p.ID_PATHOLOGIE],
                    "pathology_names": [p.NOM_PAT],
                    "morphology": "",
                    "propulsion": propulsion,
                }
                topk = {c["ID_FAUTEUIL"] for c in rule_rank(db, profile)[:K]}
                recall = len(topk & truth) / min(K, len(truth))
                recalls.append(recall)
                flag = "OK " if recall >= THRESHOLD else "LOW"
                print(f"EVAL: [{flag}] {p.NOM_PAT} prop={propulsion or 'MANUELLE'} recall@{K}={recall:.2f}")

        if not recalls:
            print("EVAL: nothing measurable")
            return 1
        mean = sum(recalls) / len(recalls)
        print(f"EVAL: mean recall@{K}={mean:.2f} over {len(recalls)} cases (threshold {THRESHOLD})")
        return 0 if mean >= THRESHOLD else 1
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
