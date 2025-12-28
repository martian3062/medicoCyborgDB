import os
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@api_view(["GET"])
def forecast_engine(request):
    """
    Hybrid Forecast Engine:
    1. Pulls real IMD data (API)
    2. Uses Groq AI model to:
        - Analyze anomalies
        - Predict outbreaks
        - Recommend crops
        - Predict rainfall & temperature trend
    """

    # ----------- 1. Get IMD LIVE Weather Data -----------
    city_id = request.GET.get("city_id", "42182")  # default Chandigarh

    try:
        imd_url = f"https://city.imd.gov.in/api/cityweather.php?id={city_id}"
        imd_data = requests.get(imd_url, timeout=10).json()
    except Exception as e:
        imd_data = {"error": str(e)}

    # ----------- 2. AI Climate Interpretation -----------
    prompt = f"""
    You are MedGenie Climate AI. Analyze the following IMD weather dataset:

    IMD Raw Data:
    {imd_data}

    Provide a structured analysis including:
    1. Rainfall Forecast (next 7 days)
    2. Temperature Trend (heat / cold wave indication)
    3. Climate Anomaly Risk (0–100 scale)
    4. Crop Recommendation for Maximum Yield
    5. Outbreak Risk:
        - Dengue
        - Malaria
        - Wheat Rust
        - Paddy Blast
    6. Final Summary for farmers or health officials.

    City ID: {city_id}
    """

    try:
        ai_response = client.chat.completions.create(
            model="qwen/qwen3-32b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_completion_tokens=700,
        )

        ai_text = ai_response.choices[0].message["content"]

    except Exception as e:
        ai_text = f"AI Error: {e}"

    # ----------- 3. Final JSON Output -----------
    return Response({
        "city_id": city_id,
        "imd_data": imd_data,
        "ai_analysis": ai_text
    })
