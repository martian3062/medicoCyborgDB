# medgenie_backend/api/urls.py
from django.urls import path

from .views_ai import ai_chat, climate_forecast, get_records, UploadMedicalRecord
from .views_cyborg_memory import cyborg_index, cyborg_search, cyborg_ask, cyborg_seed

urlpatterns = [
    # AI
    path("ai/chat/", ai_chat, name="ai_chat"),
    path("chat/", ai_chat, name="ai_chat_alias"),

    # In-memory "Cyborg" demo (vault)
    path("cyborg/index/", cyborg_index, name="cyborg_index"),
    path("cyborg/search/", cyborg_search, name="cyborg_search"),
    path("cyborg/ask/", cyborg_ask, name="cyborg_ask"),
    path("cyborg/seed/", cyborg_seed, name="cyborg_seed"),

    # Climate
    path("climate/forecast/", climate_forecast, name="climate_forecast"),

    # Records
    path("records/", get_records, name="get_records"),
    path("records/upload/", UploadMedicalRecord, name="upload_medical_record"),
]
