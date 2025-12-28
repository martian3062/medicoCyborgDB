# api/views_cyborg_seed.py
import io
import json
import uuid
import zipfile
import requests

from rest_framework.decorators import api_view
from rest_framework.response import Response

from medgenie_backend.cyborg_client import get_medical_index
from .utils import generate_embedding


SYNTHEA_10_PATIENTS_ZIP = (
    "https://github.com/smart-on-fhir/sample-bulk-fhir-datasets/archive/refs/heads/10-patients.zip"
)

# NOTE: dataset is Synthea-generated synthetic records (public bulk samples).
# Repo treats datasets as CC0/public domain.
# (Good for demos, no real PHI.)


def _ndjson_iter(raw: bytes, limit: int = 2000):
    # each line is a JSON object
    n = 0
    for line in raw.splitlines():
        if not line.strip():
            continue
        try:
            yield json.loads(line.decode("utf-8"))
            n += 1
            if n >= limit:
                return
        except Exception:
            continue


def _pick_first(zipf: zipfile.ZipFile, suffix: str):
    # find a file ending with suffix (like "Patient.ndjson")
    for name in zipf.namelist():
        if name.lower().endswith(suffix.lower()):
            return name
    return None


def _chunk_text(text: str, max_chars: int = 900):
    text = (text or "").strip()
    if not text:
        return []
    return [text[i : i + max_chars] for i in range(0, len(text), max_chars)]


@api_view(["POST"])
def cyborg_seed_open(request):
    """
    Downloads Synthea bulk sample dataset ZIP, extracts a few resources,
    builds 3-6 demo "records", and indexes them into in-memory vector store.
    """
    try:
        r = requests.get(SYNTHEA_10_PATIENTS_ZIP, timeout=60)
        r.raise_for_status()
    except Exception as e:
        return Response({"error": f"Failed to download dataset: {e}"}, status=500)

    z = zipfile.ZipFile(io.BytesIO(r.content))

    patient_file = _pick_first(z, "Patient.ndjson")
    condition_file = _pick_first(z, "Condition.ndjson")
    obs_file = _pick_first(z, "Observation.ndjson")
    med_file = _pick_first(z, "MedicationRequest.ndjson")

    if not patient_file:
        return Response({"error": "Patient.ndjson not found in zip"}, status=500)

    patients = list(_ndjson_iter(z.read(patient_file), limit=20))
    conditions = list(_ndjson_iter(z.read(condition_file), limit=80)) if condition_file else []
    observations = list(_ndjson_iter(z.read(obs_file), limit=120)) if obs_file else []
    meds = list(_ndjson_iter(z.read(med_file), limit=80)) if med_file else []

    if not patients:
        return Response({"error": "No patients parsed"}, status=500)

    p0 = patients[0]
    pid = p0.get("id", "PT-DEMO")
    name = " ".join(
        [
            (p0.get("name") or [{}])[0].get("given", [""])[0],
            (p0.get("name") or [{}])[0].get("family", ""),
        ]
    ).strip() or "Demo Patient"
    gender = p0.get("gender", "unknown")
    birth = p0.get("birthDate", "unknown")

    # Pull some conditions for narrative
    cond_texts = []
    for c in conditions[:8]:
        code = ((c.get("code") or {}).get("text")) or ""
        if code:
            cond_texts.append(code)
    cond_texts = list(dict.fromkeys(cond_texts))[:5]

    # Pull some vitals-ish observations
    obs_texts = []
    for o in observations[:25]:
        code = ((o.get("code") or {}).get("text")) or ""
        val = o.get("valueQuantity", {})
        if code and val.get("value") is not None:
            obs_texts.append(f"{code}: {val.get('value')} {val.get('unit','')}".strip())
    obs_texts = obs_texts[:8]

    # Pull some meds
    med_texts = []
    for m in meds[:10]:
        mc = (m.get("medicationCodeableConcept") or {}).get("text") or ""
        if mc:
            med_texts.append(mc)
    med_texts = list(dict.fromkeys(med_texts))[:5]

    # Build demo records (short, punchy, medtech-style)
    records = []

    records.append({
        "title": "Patient Summary",
        "text": f"Patient {name} ({pid}), gender {gender}, DOB {birth}. Known problems: {', '.join(cond_texts) or '—'}.",
        "metadata": {"patient_id": pid, "type": "summary", "source": "SYNTHETHEA"}
    })

    if cond_texts:
        records.append({
            "title": "Problem List Snapshot",
            "text": "Active/Recent conditions: " + "; ".join(cond_texts) + ".",
            "metadata": {"patient_id": pid, "type": "conditions", "source": "SYNTHETHEA"}
        })

    if obs_texts:
        records.append({
            "title": "Vitals / Observations",
            "text": "Observed measurements: " + "; ".join(obs_texts) + ".",
            "metadata": {"patient_id": pid, "type": "observations", "source": "SYNTHETHEA"}
        })

    if med_texts:
        records.append({
            "title": "Medication Requests",
            "text": "Medications requested: " + "; ".join(med_texts) + ".",
            "metadata": {"patient_id": pid, "type": "medications", "source": "SYNTHETHEA"}
        })

    # Always include a “clinical note” style doc for nicer RAG
    records.append({
        "title": "Clinical Note (Synthetic)",
        "text": (
            "Assessment: patient has history suggestive of chronic disease burden. "
            "Review active conditions, vitals trends, and medication adherence. "
            "Plan: targeted labs, lifestyle counselling, follow-up in 2–4 weeks, "
            "and red-flag education. (Synthetic demo note.)"
        ),
        "metadata": {"patient_id": pid, "type": "note", "source": "SYNTHETHEA"}
    })

    # Index into in-memory store
    index = get_medical_index(embedding_fn=generate_embedding)
    base_id = str(uuid.uuid4())

    items = []
    for ridx, rdoc in enumerate(records):
        chunks = _chunk_text(rdoc["text"])
        for cidx, chunk in enumerate(chunks):
            items.append({
                "id": f"{base_id}_{ridx}_{cidx}",
                "vector": generate_embedding(chunk),
                "contents": chunk,
                "metadata": {**rdoc["metadata"], "title": rdoc["title"], "chunk": cidx},
            })

    index.upsert(items)

    return Response({
        "status": "seeded",
        "patient_id": pid,
        "docs": len(records),
        "chunks": len(items),
        "titles": [r["title"] for r in records],
    })
