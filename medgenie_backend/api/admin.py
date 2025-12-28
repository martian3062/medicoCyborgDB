from django.contrib import admin
from .models import MedicalRecord

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "record_type", "uploaded_at", "user")
    list_filter = ("record_type", "uploaded_at")
    search_fields = ("record_type",)

