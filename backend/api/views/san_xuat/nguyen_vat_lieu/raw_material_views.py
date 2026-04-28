"""
Raw Material views - Nguyên liệu cho BOM
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import RawMaterial
from api.serializers import RawMaterialSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def raw_material_list(request):
    """GET /api/raw-materials/ — danh sách nguyên liệu cho BOM dropdown."""
    qs = RawMaterial.objects.all()
    return Response({'raw_materials': RawMaterialSerializer(qs, many=True).data})
