"""
Material views - Sản xuất > Nguyên vật liệu > Thông tin nguyên vật liệu
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Material
from api.serializers import MaterialSerializer, MaterialWriteSerializer


MATERIAL_ALLOWED_ROLES = {'Nhân viên thu mua', 'Admin'}


def _has_material_access(user):
    """Cho phép admin (is_staff/is_superuser) và các role được chỉ định."""
    if user.is_staff or user.is_superuser:
        return True
    return getattr(user, 'role', '') in MATERIAL_ALLOWED_ROLES


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def material_list(request):
    """GET /api/materials/ — danh sách | POST /api/materials/ — tạo mới."""
    if not _has_material_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    ctx = {'request': request}

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        qs = Material.objects.all()
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        serializer = MaterialSerializer(qs, many=True, context=ctx)
        return Response({'materials': serializer.data, 'total': qs.count()})

    serializer = MaterialWriteSerializer(data=request.data, context=ctx)
    if serializer.is_valid():
        material = serializer.save()
        return Response(MaterialSerializer(material, context=ctx).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def material_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/materials/{pk}/"""
    if not _has_material_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        material = Material.objects.get(pk=pk)
    except Material.DoesNotExist:
        return Response({'detail': 'Khong tim thay nguyen vat lieu.'}, status=status.HTTP_404_NOT_FOUND)

    ctx = {'request': request}

    if request.method == 'GET':
        return Response(MaterialSerializer(material, context=ctx).data)

    if request.method in ('PUT', 'PATCH'):
        partial = (request.method == 'PATCH')
        serializer = MaterialWriteSerializer(material, data=request.data, partial=partial, context=ctx)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(MaterialSerializer(updated, context=ctx).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    material.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
