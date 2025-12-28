# api/views_cyborg.py
import uuid
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .utils import generate_embedding
from medgenie_backend.cyborg_client import upsert_items, query_vector

@api_view(["POST"])
def index_medical_record(request):
    text = request.data.get("text", "")
    metadata = request.data.get("metadata", {}) or {}

    if not text.strip():
        return Response({"error": "No text provided"}, status=400)

    emb = generate_embedding(text)
    item = {
        "id": metadata.get("id") or str(uuid.uuid4()),
        "vector": emb,
        "contents": text,
        "metadata": metadata,
    }

    out = upsert_items([item])
    return Response({"status": "indexed", "result": out, "id": item["id"]})

@api_view(["POST"])
def search_medical_record(request):
    query = request.data.get("query", "")
    top_k = int(request.data.get("top_k", 5))

    if not query.strip():
        return Response({"error": "No query provided"}, status=400)

    qemb = generate_embedding(query)
    out = query_vector(qemb, top_k=top_k)

    # out["results"] contains ids/distances/metadata :contentReference[oaicite:2]{index=2}
    return Response({"results": out.get("results", [])})
