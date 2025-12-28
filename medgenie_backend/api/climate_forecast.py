import os
from groq import Groq
from rest_framework.decorators import api_view
from rest_framework.response import Response

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@api_view(["POST"])
def ai_climate_forecast(request):
    location = request.data.get("location", "Unknown")
    weather = request.data.get("weather", {})

    prompt = f"""
You are a climate forecaster.
Given IMD data for {location}, provide:
- Rain probability
- Mosquito risk
- Heatwave risk
- Crop disease risk
- 3-day actionable advice

IMD weather data:
{weather}
""".strip()

    try:
        completion = groq_client.chat.completions.create(
            model="qwen2.5-32b",   # safer default (your earlier model)
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        msg = completion.choices[0].message
        result = getattr(msg, "content", None) or msg.get("content")
        return Response({"forecast": result})

    except Exception as e:
        print("CLIMATE GROQ ERROR:", e)
        return Response({"error": str(e)}, status=500)
