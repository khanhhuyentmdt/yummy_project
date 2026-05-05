"""
Material Inventory views - Kho nguyên vật liệu > Tồn kho nguyên vật liệu (Read-only)
"""
from decimal import Decimal

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from api.models import MaterialInventory
from api.serializers import MaterialInventorySerializer


INVENTORY_ALLOWED_ROLES = {'Nhân viên kho', 'Nhân viên thu mua', 'Admin'}


def _has_inventory_access(user):
    if user.is_staff or user.is_superuser:
        return True
    return getattr(user, 'role', '') in INVENTORY_ALLOWED_ROLES


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def material_inventory_list(request):
    """GET /api/material-inventory/ — Danh sách tồn kho nguyên vật liệu (Read-only)"""
    if not _has_inventory_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    search        = request.query_params.get('search', '').strip()
    status_filter = request.query_params.get('status', '').strip()
    group_filter  = request.query_params.get('group', '').strip()

    qs = MaterialInventory.objects.select_related('material').all()

    if search:
        qs = qs.filter(
            Q(material__code__icontains=search)
            | Q(material__name__icontains=search)
            | Q(material__group__icontains=search)
        )

    if group_filter:
        qs = qs.filter(material__group__icontains=group_filter)

    # Ordering
    ordering = request.query_params.get('ordering', '').strip()
    ALLOWED_DIRECT = {
        'material__code', '-material__code',
        'material__name', '-material__name',
        'material__group', '-material__group',
        'material__unit', '-material__unit',
        'quantity', '-quantity',
        'expiry_date', '-expiry_date',
        'unit_cost', '-unit_cost',
    }
    if ordering in ALLOWED_DIRECT:
        qs = qs.order_by(ordering)

    serializer = MaterialInventorySerializer(qs, many=True, context={'request': request})
    items = serializer.data

    # Filter by status after serialization (computed field)
    if status_filter:
        items = [item for item in items if item['inventory_status'] == status_filter]

    # ─── KPI Summary ─────────────────────────────────────────────────────────
    all_items_qs = MaterialInventory.objects.select_related('material').all()
    all_serialized = MaterialInventorySerializer(all_items_qs, many=True, context={'request': request}).data

    total_value      = sum(item['total_value'] for item in all_serialized)
    expired_count    = sum(1 for item in all_serialized if item['inventory_status'] == MaterialInventory.STATUS_HET_HAN)
    out_stock_count  = sum(1 for item in all_serialized if item['inventory_status'] == MaterialInventory.STATUS_HET_HANG)
    near_expiry_count = sum(1 for item in all_serialized if item['inventory_status'] == MaterialInventory.STATUS_CAN_DATE)
    low_stock_count  = sum(1 for item in all_serialized if item['inventory_status'] == MaterialInventory.STATUS_SAP_HET_HANG)

    # Available groups for filter dropdown
    groups = sorted(set(
        inv.material.group for inv in all_items_qs if inv.material.group
    ))

    return Response({
        'inventory':         items,
        'total':             len(items),
        'kpi': {
            'total_value':        total_value,
            'expired_count':      expired_count,
            'out_of_stock_count': out_stock_count,
            'near_expiry_count':  near_expiry_count,
            'low_stock_count':    low_stock_count,
        },
        'groups': groups,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def material_inventory_detail(request, pk):
    """GET /api/material-inventory/{pk}/ — Chi tiết tồn kho một NVL (Read-only)"""
    if not _has_inventory_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        inv = MaterialInventory.objects.select_related('material').get(pk=pk)
    except MaterialInventory.DoesNotExist:
        return Response({'detail': 'Khong tim thay ban ghi ton kho.'}, status=status.HTTP_404_NOT_FOUND)

    return Response(MaterialInventorySerializer(inv, context={'request': request}).data)
