# medgenie_backend/api/utils.py
import os
import re
import math
import hashlib

# Optional: Groq embeddings (ONLY if you actually have an embed model)
try:
    from groq import Groq
    _GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
    _GROQ = Groq(api_key=_GROQ_API_KEY) if _GROQ_API_KEY else None
except Exception:
    _GROQ = None

EMBED_DIM = int(os.getenv("EMBED_DIM", "384"))
GROQ_EMBED_MODEL = os.getenv("GROQ_EMBED_MODEL", "").strip() or None


def _hash_embed(text: str, dim: int = EMBED_DIM):
    """
    Deterministic lightweight embedding (no ML deps).
    Good enough for demo vector search / RAG grounding.
    """
    vec = [0.0] * dim
    toks = re.findall(r"[a-zA-Z0-9']+", (text or "").lower())

    for t in toks:
        h = int(hashlib.md5(t.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if ((h >> 8) & 1) == 0 else -1.0
        vec[idx] += sign

    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


def generate_embedding(text: str):
    """
    Uses Groq embeddings ONLY if GROQ_EMBED_MODEL is set AND works.
    Otherwise falls back to hashing embedding (always available).
    """
    text = (text or "").strip()
    if not text:
        return [0.0] * EMBED_DIM

    if _GROQ and GROQ_EMBED_MODEL:
        try:
            resp = _GROQ.embeddings.create(model=GROQ_EMBED_MODEL, input=text)
            return resp.data[0].embedding
        except Exception:
            # fallback if model not available (e.g. nomic-embed-text not on your account)
            return _hash_embed(text)

    return _hash_embed(text)

