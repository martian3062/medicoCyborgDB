# api/views_cyborg_seed_open.py
import uuid
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

from medgenie_backend.cyborg_client import get_medical_index
from .utils import generate_embedding


def _upsert_text(index, text: str, metadata: dict):
    vec = generate_embedding(text)
    index.upsert([{
        "id": str(uuid.uuid4()),
        "vector": vec,
        "contents": text,
        "metadata": metadata,
    }])


@api_view(["POST"])
def cyborg_seed_open(request):
    """
    Pulls a few LIVE open-source medical texts and indexes them.
    Uses openFDA drug label API.
    """
    index = get_medical_index(embedding_fn=generate_embedding)

    seeded = []

    def fetch_label(query: str, title: str):
        url = f"https://api.fda.gov/drug/label.json?search={query}&limit=1"
        r = requests.get(url, timeout=12)
        r.raise_for_status()
        js = r.json()
        res = js["results"][0]
        # take safe text fields
        parts = []
        for k in ["indications_and_usage", "contraindications", "warnings", "adverse_reactions"]:
            if k in res:
                v = res[k]
                if isinstance(v, list) and v:
                    parts.append(f"{k}: {v[0]}")
        text = f"{title}\n" + "\n\n".join(parts)
        _upsert_text(index, text, {"source": "openFDA", "title": title})
        seeded.append(title)

    try:
        fetch_label("openfda.generic_name:metformin", "Metformin — label summary (openFDA)")
        fetch_label("openfda.generic_name:penicillin", "Penicillin — label summary (openFDA)")
        fetch_label("openfda.generic_name:aspirin", "Aspirin — label summary (openFDA)")
        return Response({"status": "seeded", "count": len(seeded), "items": seeded})
    except Exception as e:
        return Response({"error": str(e), "seeded_so_far": seeded}, status=500)
