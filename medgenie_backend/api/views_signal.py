from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def signal_handler(request):
    return Response({"status": "signal OK"})
