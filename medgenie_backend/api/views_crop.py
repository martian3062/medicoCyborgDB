import os
import requests
from groq import Groq
from rest_framework.decorators import api_view
from rest_framework.response import Response

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def fetch_imd_weather(location_id="42182"):
    try:
        url = f"https://city.imd.gov.in/api/cityweather.php?id={location_id}"
        r = requests.get(url, timeout=5)
        return r.json()
    except Exception as e:
        return {"error": str(e)}

@api_view(["POST"])
def crop_recommendation(request):
    location = request.data.get("location", "Delhi")
    soil = request.data.get("soil", "Loamy")
    location_id = request.data.get("location_id", "42182")

    imd = fetch_imd_weather(location_id)

    prompt = f"""
You are an agricultural AI model. Based on:

Location: {location}
Soil Type: {soil}
IMD Weather Data: {imd}

Generate:

1. Top 3 Recommended Crops
2. Yield Trend
3. Climate Risk
4. Soil Compatibility Score
5. Ideal Sowing Window
6. Fertilizer Schedule
7. Disease/Pest risk score
"""

    response = client.chat.completions.create(
        model="qwen/qwen3-32b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_completion_tokens=700
    )

    result = response.choices[0].message["content"]

    return Response({
        "location": location,
        "soil": soil,
        "recommendation": result
    })
