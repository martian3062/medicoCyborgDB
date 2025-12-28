# medgenie_backend/api/views_ai.py
import random
from rest_framework.decorators import api_view
from rest_framework.response import Response
from groq import Groq


@api_view(["POST"])
def ai_chat(request):
    user_msg = (request.data.get("message") or "").strip()
    model = request.data.get("model", "qwen/qwen3-32b")

    if not user_msg:
        return Response({"error": "message is required"}, status=400)

    try:
        client = Groq()
        completion = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": user_msg}],
            temperature=0.6,
            max_completion_tokens=1024,
            top_p=0.95,
            reasoning_effort="default",
        )
        reply = completion.choices[0].message.content
        return Response({"reply": reply})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def climate_forecast(request):
    location = request.data.get("location", "Unknown")

    rain = random.randint(10, 90)
    heat = random.randint(20, 46)
    mosquito = random.randint(10, 100)
    crop_risk = random.choice(["Low", "Moderate", "High"])

    text = f"""
📍 Climate Forecast: {location}

🌦 Rain Probability: {rain}%
🔥 Heat Index: {heat}°C
🦟 Mosquito/Dengue Risk: {mosquito}%
🌾 Crop Disease Risk: {crop_risk}
""".strip()

    return Response({"forecast": text})


@api_view(["GET"])
def get_records(request):
    return Response({"status": "success", "records": []})


@api_view(["POST"])
def UploadMedicalRecord(request):
    return Response({"status": "uploaded"})
