# medgenie_backend/api/views_cyborg_memory.py
import uuid
import json
import math
import random
import urllib.request
import urllib.parse

from rest_framework.decorators import api_view
from rest_framework.response import Response

from groq import Groq
from .utils import generate_embedding

# ---------------------------
# In-memory "vault"
# ---------------------------
# Each item: {id, vector, contents, metadata}
VAULT = []


def _cosine_distance(a, b):
    # a,b are normalized most of the time; still safe
    dot = 0.0
    na = 0.0
    nb = 0.0
    for i in range(min(len(a), len(b))):
        dot += a[i] * b[i]
        na += a[i] * a[i]
        nb += b[i] * b[i]
    denom = (math.sqrt(na) * math.sqrt(nb)) or 1.0
    cos = dot / denom
    # distance: smaller is better
    return 1.0 - cos


def _chunk_text(text: str, max_chars: int = 900):
    text = (text or "").strip()
    if not text:
        return []
    return [text[i : i + max_chars] for i in range(0, len(text), max_chars)]


def _vault_upsert(text: str, metadata: dict):
    chunks = _chunk_text(text)
    base_id = str(uuid.uuid4())

    inserted = 0
    for i, c in enumerate(chunks):
        vec = generate_embedding(c)
        VAULT.append(
            {
                "id": f"{base_id}_{i}",
                "vector": vec,
                "contents": c,
                "metadata": {**(metadata or {}), "chunk": i},
            }
        )
        inserted += 1

    return base_id, inserted


def _vault_search(query: str, top_k: int = 5, filters: dict | None = None):
    qv = generate_embedding(query)

    hits = []
    for it in VAULT:
        md = it.get("metadata") or {}

        # simple filter support
        if filters and isinstance(filters, dict):
            ok = True
            for k, v in filters.items():
                if md.get(k) != v:
                    ok = False
                    break
            if not ok:
                continue

        dist = _cosine_distance(qv, it["vector"])
        hits.append(
            {
                "distance": dist,
                "metadata": md,
                "contents": it["contents"],
                "id": it["id"],
            }
        )

    hits.sort(key=lambda x: x["distance"])
    return hits[: max(1, int(top_k))]


# ---------------------------
# Endpoints
# ---------------------------
@api_view(["POST"])
def cyborg_index(request):
    text = request.data.get("text", "")
    metadata = request.data.get("metadata", {}) or {}

    if not text:
        return Response({"error": "text is required"}, status=400)

    base_id, chunks = _vault_upsert(text, metadata)
    return Response({"status": "indexed", "id_prefix": base_id, "chunks": chunks, "vault_size": len(VAULT)})


@api_view(["POST"])
def cyborg_search(request):
    query = (request.data.get("query") or "").strip()
    top_k = int(request.data.get("top_k", 5))
    filters = request.data.get("filters")

    if not query:
        return Response({"error": "query is required"}, status=400)

    hits = _vault_search(query, top_k=top_k, filters=filters)
    return Response({"results": hits})


def _fetch_openfda_one(search_q: str, limit: int = 1):
    url = "https://api.fda.gov/drug/label.json?" + urllib.parse.urlencode(
        {"search": search_q, "limit": str(limit)}
    )

    with urllib.request.urlopen(url, timeout=15) as r:
        raw = r.read().decode("utf-8")
        data = json.loads(raw)

    r0 = (data.get("results") or [None])[0]
    if not r0:
        return None

    def pick(x):
        if not x:
            return ""
        if isinstance(x, list):
            return x[0] or ""
        if isinstance(x, str):
            return x
        return ""

    openfda = r0.get("openfda") or {}
    generic = (openfda.get("generic_name") or [""])[0] if isinstance(openfda.get("generic_name"), list) else ""
    brand = (openfda.get("brand_name") or [""])[0] if isinstance(openfda.get("brand_name"), list) else ""

    text = "\n\n".join(
        [
            f"Drug label summary ({generic or brand or 'unknown'}):",
            pick(r0.get("indications_and_usage")) and f"Indications: {pick(r0.get('indications_and_usage'))}",
            pick(r0.get("warnings_and_precautions")) and f"Warnings: {pick(r0.get('warnings_and_precautions'))}",
            pick(r0.get("contraindications")) and f"Contraindications: {pick(r0.get('contraindications'))}",
            pick(r0.get("dosage_and_administration")) and f"Dosage: {pick(r0.get('dosage_and_administration'))}",
        ]
    ).strip()

    return {
        "title": f"openFDA — {generic or brand or 'Drug'} label",
        "text": text[:2200],
        "metadata": {
            "source": "openFDA",
            "tags": ["Drug Label", generic or brand or "Medication"],
            "drug_generic": generic or None,
            "drug_brand": brand or None,
        },
    }


@api_view(["POST"])
def cyborg_seed(request):
    """
    Seeds:
    - curated clinical demo notes (safe, synthetic)
    - openFDA public drug labels (open-source)
    """
    curated = [
        {
            "title": "ECG Note — ST Elevation",
            "text": "ECG shows ST elevation in leads II, III, aVF. Patient reports acute chest pain radiating to left arm. Troponin pending. Consider inferior wall MI; urgent cardiology review advised.",
            "metadata": {"patient_id": "PT-001", "visit_date": "2025-12-20", "tags": ["ECG", "Chest Pain", "MI"], "source": "OPD"},
        },
        {
            "title": "Diabetes Follow-up",
            "text": "Type 2 diabetes mellitus follow-up. HbA1c 8.2%. Current meds: Metformin 500mg BID. Counsel diet/exercise. Consider adding SGLT2 inhibitor if renal function permits. Foot exam normal.",
            "metadata": {"patient_id": "PT-001", "visit_date": "2025-11-05", "tags": ["Diabetes", "HbA1c", "Metformin"], "source": "OPD"},
        },
        {
            "title": "Dengue Risk — Climate + Symptoms",
            "text": "Symptoms: fever 101.8F, body ache, headache. Local rainfall high and stagnant water reported; mosquito risk elevated. Advice: hydration, avoid NSAIDs, monitor platelet count if fever persists.",
            "metadata": {"patient_id": "PT-044", "visit_date": "2025-12-12", "tags": ["Dengue", "Fever", "Climate"], "source": "Community"},
        },
        {
            "title": "Allergy Record — Penicillin",
            "text": "Documented allergy: Penicillin (urticaria + wheeze). Avoid beta-lactams if possible; consider macrolide alternatives depending on indication.",
            "metadata": {"patient_id": "PT-017", "visit_date": "2025-10-01", "tags": ["Allergy", "Penicillin"], "source": "EMR"},
        },
        {
            "title": "Vitals Snapshot",
            "text": "Vitals: BP 148/92 mmHg, HR 104 bpm, SpO2 95% RA, Temp 99.6F. Patient anxious. Recommend repeat BP after rest, evaluate tachycardia causes, hydration status, and pain score.",
            "metadata": {"patient_id": "PT-001", "visit_date": "2025-12-20", "tags": ["Vitals", "BP", "HR", "SpO2"], "source": "Triage"},
        },
    ]

    open_queries = [
        'openfda.generic_name:"metformin"',
        'openfda.generic_name:"penicillin"',
        'openfda.generic_name:"aspirin"',
        'openfda.generic_name:"insulin"',
    ]

    docs = []
    docs.extend(curated)

    open_ok = 0
    for q in open_queries:
        try:
            d = _fetch_openfda_one(q, limit=1)
            if d:
                docs.append(d)
                open_ok += 1
        except Exception:
            continue

    doc_count = 0
    chunk_count = 0
    for d in docs:
        _, chunks = _vault_upsert(d["text"], {**(d.get("metadata") or {}), "title": d["title"]})
        doc_count += 1
        chunk_count += chunks

    return Response(
        {
            "status": "seeded",
            "docs": doc_count,
            "chunks": chunk_count,
            "openfda_docs": open_ok,
            "vault_size": len(VAULT),
        }
    )


@api_view(["POST"])
def cyborg_ask(request):
    question = (request.data.get("question") or "").strip()
    top_k = int(request.data.get("top_k", 5))
    model = (request.data.get("model") or "qwen/qwen3-32b").strip()

    if not question:
        return Response({"error": "question is required"}, status=400)

    hits = _vault_search(question, top_k=top_k)

    ctx = []
    for i, h in enumerate(hits):
        title = (h.get("metadata") or {}).get("title") or f"DOC {i+1}"
        ctx.append(f"[DOC {i+1}] {title}\n{h.get('contents','')}".strip())

    prompt = f"""
You are MedGenie, a cautious medical assistant.
Rules:
- Use ONLY the provided docs for facts.
- If docs are insufficient, say what is missing.
- Add citations like [DOC 1], [DOC 2] after sentences they support.
- End with a short "Next steps" bullet list.

Question:
{question}

Docs:
{chr(10).join(ctx)}

Answer:
""".strip()

    try:
        client = Groq()
        completion = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_completion_tokens=800,
            top_p=0.95,
            reasoning_effort="default",
        )
        answer = completion.choices[0].message.content
        return Response({"answer": answer, "hits": hits})
    except Exception as e:
        # Still return hits so UI works
        return Response({"error": str(e), "hits": hits}, status=500)
