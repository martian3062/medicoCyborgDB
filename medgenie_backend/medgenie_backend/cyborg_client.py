import math
import os
import threading
from typing import Any, Dict, List, Optional

# ------------------------------------------------------------
# Local in-memory fallback index (works even if cyborgdb fails)
# ------------------------------------------------------------
class LocalVectorIndex:
    def __init__(self, embedding_fn):
        self.embedding_fn = embedding_fn
        self._lock = threading.Lock()
        self._items: List[Dict[str, Any]] = []

    def upsert(self, items: List[Dict[str, Any]]):
        # items: [{id, vector, contents, metadata}]
        with self._lock:
            existing = {it["id"]: i for i, it in enumerate(self._items)}
            for it in items:
                if it["id"] in existing:
                    self._items[existing[it["id"]]] = it
                else:
                    self._items.append(it)

    def query(
        self,
        query_contents: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
        include: Optional[List[str]] = None,
    ):
        include = include or ["distance", "metadata", "contents"]

        qvec = self.embedding_fn(query_contents)
        qnorm = _norm(qvec) or 1.0

        def match_filters(meta: Dict[str, Any]) -> bool:
            if not filters:
                return True
            for k, v in filters.items():
                if meta.get(k) != v:
                    return False
            return True

        scored = []
        with self._lock:
            for it in self._items:
                meta = it.get("metadata") or {}
                if not match_filters(meta):
                    continue
                vec = it.get("vector") or []
                sim = _cos_sim(qvec, vec, qnorm=qnorm)
                # distance like "1 - similarity"
                dist = 1.0 - sim
                scored.append((dist, it))

        scored.sort(key=lambda x: x[0])
        hits = []
        for dist, it in scored[: max(1, top_k)]:
            out = {}
            if "distance" in include:
                out["distance"] = dist
            if "metadata" in include:
                out["metadata"] = it.get("metadata") or {}
            if "contents" in include:
                out["contents"] = it.get("contents", "")
            if "id" in it:
                out["id"] = it["id"]
            hits.append(out)

        # Return in the same “batched list” shape your code expects
        return [hits]


def _norm(v: List[float]) -> float:
    return math.sqrt(sum((x * x) for x in v)) if v else 0.0


def _cos_sim(a: List[float], b: List[float], qnorm: Optional[float] = None) -> float:
    if not a or not b:
        return 0.0
    n = min(len(a), len(b))
    dot = 0.0
    bnorm = 0.0
    for i in range(n):
        dot += a[i] * b[i]
        bnorm += b[i] * b[i]
    denom = (qnorm or _norm(a)) * (math.sqrt(bnorm) or 1.0)
    return dot / denom if denom else 0.0


# ------------------------------------------------------------
# Public API used by your views
# ------------------------------------------------------------
_MEDICAL_INDEX = None
_MEDICAL_INDEX_LOCK = threading.Lock()

def get_medical_index(embedding_fn):
    """
    Returns a singleton index. Today: LocalVectorIndex fallback.
    Later: replace with real CyborgDB client index creation.
    """
    global _MEDICAL_INDEX
    with _MEDICAL_INDEX_LOCK:
        if _MEDICAL_INDEX is None:
            _MEDICAL_INDEX = LocalVectorIndex(embedding_fn=embedding_fn)
        return _MEDICAL_INDEX
