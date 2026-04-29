"""
ShippingUnit views - Thiet lap don vi van chuyen
CRUD API cho ShippingUnit model. Chi Admin moi co quyen truy cap.
"""
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.models import ShippingUnit, ShippingUnitHistory
from api.serializers import ShippingUnitSerializer, ShippingUnitWriteSerializer


def _is_admin(user):
    return user.is_superuser or user.is_staff or getattr(user, 'role', '') == 'Admin'


def _actor(user):
    return user.full_name or user.phone_number


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def shipping_unit_list(request):
    """GET/POST /api/shipping-units/"""
    if not _is_admin(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        qs = ShippingUnit.objects.prefetch_related('history').all()
        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search) | qs.filter(phone__icontains=search)
        status_filter = request.query_params.get('status', '').strip()
        if status_filter in ('active', 'inactive'):
            qs = qs.filter(status=status_filter)
        ordering = request.query_params.get('ordering', '').strip()
        ALLOWED = {'code', '-code', 'name', '-name', 'phone', '-phone', 'status', '-status'}
        if ordering in ALLOWED:
            qs = qs.order_by(ordering)
        serializer = ShippingUnitSerializer(qs, many=True)
        return Response({'shipping_units': serializer.data, 'total': qs.count()})

    # POST
    serializer = ShippingUnitWriteSerializer(data=request.data)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        shipping_unit = serializer.save(created_by_name=actor_name)
        ShippingUnitHistory.objects.create(
            shipping_unit=shipping_unit,
            actor_name=actor_name,
            action=f'Thêm mới đơn vị vận chuyển {shipping_unit.code}',
        )
        shipping_unit = ShippingUnit.objects.prefetch_related('history').get(pk=shipping_unit.pk)
        return Response(ShippingUnitSerializer(shipping_unit).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shipping_unit_bulk_delete(request):
    """POST /api/shipping-units/bulk-delete/ — xoa nhieu don vi van chuyen cung luc"""
    if not _is_admin(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    ids = request.data.get('ids', [])
    if not ids or not isinstance(ids, list):
        return Response({'detail': 'ids phai la danh sach khong rong.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        deleted_count, _ = ShippingUnit.objects.filter(pk__in=ids).delete()

    return Response({'deleted': deleted_count})


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def shipping_unit_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/shipping-units/<pk>/"""
    if not _is_admin(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        shipping_unit = ShippingUnit.objects.prefetch_related('history').get(pk=pk)
    except ShippingUnit.DoesNotExist:
        return Response({'detail': 'Don vi van chuyen khong ton tai.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ShippingUnitSerializer(shipping_unit).data)

    if request.method == 'DELETE':
        shipping_unit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    old_status = shipping_unit.status
    partial = request.method == 'PATCH'
    serializer = ShippingUnitWriteSerializer(shipping_unit, data=request.data, partial=partial)
    if serializer.is_valid():
        updated = serializer.save()
        actor_name = _actor(request.user)
        if old_status != updated.status:
            label = 'Đang hoạt động' if updated.status == 'active' else 'Tạm ngưng'
            action = f'Thay đổi trạng thái thành {label}'
        else:
            action = 'Cập nhật thông tin'
        ShippingUnitHistory.objects.create(shipping_unit=updated, actor_name=actor_name, action=action)
        updated = ShippingUnit.objects.prefetch_related('history').get(pk=updated.pk)
        return Response(ShippingUnitSerializer(updated).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
