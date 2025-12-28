import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from groq import Groq

from medgenie_backend.cyborg_client import get_medical_index  # your helper

@api_view(["POST"])
def cyborg_ask(request):
    question = (request.data.get("question") or "").strip()
    top_k = int(request.data.get("top_k") or 5)

    if not question:
        return Response({"error": "question is required"}, status=400)

    try:
        # 1) Retrieve from Cyborg
        index = get_medical_index()
        results = index.search(query=question, top_k=top_k)  # adapt to your SDK method

        # results should include docs/snippets + metadata
        # Normalize to a list of {text, metadata}
        hits = []
        for r in results.get("results", results):  # flexible
            hits.append({
                "text": r.get("text") or r.get("document") or "",
                "metadata": r.get("metadata") or {}
            })

        context_blocks = []
        for i, h in enumerate(hits, start=1):
            meta = h["metadata"]
            context_blocks.append(
                f"[DOC {i}]\n"
                f"metadata={meta}\n"
                f"text={h['text']}\n"
            )

        context = "\n\n".join(context_blocks) if context_blocks else "No matching records found."

        # 2) Ask Groq using retrieved context
        client = Groq()  # reads GROQ_API_KEY from env
        prompt = f"""
You are MedGenie, a clinical assistant.
Use ONLY the provided context. If context is insufficient, say so.

CONTEXT:
{context}

QUESTION:
{question}

Return:
1) Answer (clear, short)
2) Citations as [DOC #] references
"""

        completion = client.chat.completions.create(
            model=request.data.get("model") or "qwen/qwen3-32b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_completion_tokens=800,
            top_p=0.95,
        )

        answer = completion.choices[0].message.content
        return Response({"answer": answer, "hits": hits})

    except Exception as e:
        return Response({"error": str(e)}, status=500)
