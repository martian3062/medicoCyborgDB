import random
from rest_framework.decorators import api_view
from rest_framework.response import Response

# -------------------------------------------------------------
# RANDOM CROP RECOMMENDATION ENGINE (NO API, OFFLINE)
# -------------------------------------------------------------
@api_view(["POST"])
def crop_recommendation(request):
    location = request.data.get("location", "Unknown")
    soil_type = request.data.get("soil", "Loamy")

    # Random climate factors
    temp = random.randint(18, 42)
    rain = random.randint(20, 200)
    humidity = random.randint(20, 90)

    # Crop database
    crops = [
        "Wheat", "Rice", "Maize", "Sugarcane", "Cotton",
        "Millet", "Pulses", "Soybean", "Groundnut", "Barley"
    ]

    # Score crops randomly but influenced by weather
    recommendations = []
    for crop in crops:
        score = random.randint(40, 95)

        # Logic influence
        if crop == "Rice" and rain > 120:
            score += 5
        if crop == "Wheat" and temp < 28:
            score += 7
        if crop == "Cotton" and temp > 32:
            score += 5
        if crop == "Maize" and humidity > 50:
            score += 4

        score = min(score, 100)
        recommendations.append({"crop": crop, "score": score})

    # Sort by score
    recommendations = sorted(recommendations, key=lambda x: x["score"], reverse=True)

    # Build final info text
    top_crop = recommendations[0]["crop"]
    top_score = recommendations[0]["score"]

    result_text = f"""
🌱 Crop Recommendation for {location}

🧪 Soil Type: {soil_type}
🌡 Temperature: {temp}°C
🌧 Rainfall Estimate: {rain} mm
💧 Humidity: {humidity}%

Recommended Crops (ranked):
"""

    for r in recommendations:
        result_text += f"• {r['crop']} — Suitability Score: {r['score']}%\n"

    result_text += f"""
🏆 Best Crop to Grow: **{top_crop}**  
Overall Suitability Score: **{top_score}%**

📘 Guidance:
• Ensure proper irrigation if rainfall < 60mm.
• Monitor early-stage pests for maize & pulses.
• For high humidity, use preventive fungicide.
"""

    return Response({
        "crop_recommendation": result_text,
        "raw_data": {
            "temperature": temp,
            "rainfall": rain,
            "humidity": humidity,
            "soil": soil_type
        },
        "mode": "RANDOM_GENERATOR"
    })


# -------------------------------------------------------------
# Existing Climate Forecast (keep as-is)
# -------------------------------------------------------------
@api_view(["POST"])
def forecast_engine(request):
    return Response({"status": "ok (dummy)"})
