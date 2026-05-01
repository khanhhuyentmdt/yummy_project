"""
Material Group views - Sản xuất > Nguyên vật liệu > Nhóm nguyên vật liệu
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Material, MaterialGroup
from api.serializers import MaterialGroupSerializer, MaterialGroupWriteSerializer
from .material_views import _has_material_access


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def material_group_list(request):
    if not _has_material_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    ctx = {'request': request}

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        qs = MaterialGroup.objects.all()
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)

        ordering = request.query_params.get('ordering', '').strip()
        allowed = {'code', '-code', 'name', '-name', 'status', '-status'}
        if ordering in allowed:
            qs = qs.order_by(ordering)

        serializer = MaterialGroupSerializer(qs, many=True, context=ctx)
        return Response({'material_groups': serializer.data, 'total': qs.count()})

    serializer = MaterialGroupWriteSerializer(data=request.data, context=ctx)
    if serializer.is_valid():
        group = serializer.save()
        return Response(MaterialGroupSerializer(group, context=ctx).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def material_group_detail(request, pk):
    if not _has_material_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        group = MaterialGroup.objects.get(pk=pk)
    except MaterialGroup.DoesNotExist:
        return Response({'detail': 'Không tìm thấy nhóm nguyên vật liệu.'}, status=status.HTTP_404_NOT_FOUND)

    ctx = {'request': request}

    if request.method == 'GET':
        return Response(MaterialGroupSerializer(group, context=ctx).data)

    if request.method in ('PUT', 'PATCH'):
        partial = request.method == 'PATCH'
        serializer = MaterialGroupWriteSerializer(group, data=request.data, partial=partial, context=ctx)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(MaterialGroupSerializer(updated, context=ctx).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if Material.objects.filter(group=group.name).exists():
        return Response(
            {'detail': 'Không thể xóa nhóm nguyên vật liệu đang được sử dụng.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    group.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
