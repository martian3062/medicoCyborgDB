from rest_framework.decorators import api_view
from rest_framework.response import Response
from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@api_view(["POST"])
def translate_handler(request):
    text = request.data.get("text", "")
    target = request.data.get("lang", "pa")   # default Punjabi

    prompt = f"Translate this text to {target}: {text}"

    reply = client.chat.completions.create(
        model="qwen/qwen3-32b",
        messages=[{"role": "user", "content": prompt}]
    )

    result = reply.choices[0].message.content

    return Response({"translated": result})
