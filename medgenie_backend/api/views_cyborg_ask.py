import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from groq import Groq

from medgenie_backend.cyborg_client import get_medical_index
from .utils import generate_embedding


@api_view(["POST"])
def cyborg_ask(request):
    question = (request.data.get("question") or "").strip()
    top_k = int(request.data.get("top_k", 5))
    model = request.data.get("model", "qwen/qwen3-32b")

    if not question:
        return Response({"error": "question is required"}, status=400)

    try:
        index = get_medical_index(embedding_fn=generate_embedding)
        res = index.query(
            query_contents=question,
            top_k=top_k,
            include=["distance", "metadata", "contents"],
        )
        hits = res[0] if isinstance(res, list) and res else []

        # Build citations context
        ctx_lines = []
        for i, h in enumerate(hits[:top_k], start=1):
            meta = h.get("metadata") or {}
            title = meta.get("title") or f"DOC {i}"
            text = (h.get("contents") or "").strip()
            ctx_lines.append(f"[DOC {i}] {title}\n{text}")

        prompt = f"""You are a clinical assistant. Answer strictly using the provided documents.
If missing info, say what is missing.

QUESTION:
{question}

DOCUMENTS:
{chr(10).join(ctx_lines)}

Return:
1) Answer
2) Bullet citations like: (Sources: DOC 1, DOC 2)
"""

        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        completion = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_completion_tokens=800,
            top_p=0.95,
        )

        answer = completion.choices[0].message.content
        return Response({"answer": answer, "hits": hits})

    except Exception as e:
        return Response({"error": str(e)}, status=500)
