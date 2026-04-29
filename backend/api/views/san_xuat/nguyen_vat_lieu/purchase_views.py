"""
Purchase views - Sản xuất > Nguyên vật liệu > Nhà cung cấp & Phiếu đặt hàng
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Supplier, PurchaseOrder
from api.serializers import (
    SupplierSerializer,
    PurchaseOrderSerializer,
    PurchaseOrderWriteSerializer,
)


PURCHASE_ALLOWED_ROLES = {'Nhân viên thu mua', 'Admin'}


def _has_purchase_access(user):
    """Kiểm tra quyền truy cập cho nhà cung cấp và phiếu đặt hàng"""
    if user.is_staff or user.is_superuser:
        return True
    return getattr(user, 'role', '') in PURCHASE_ALLOWED_ROLES


# ─── Suppliers ────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def supplier_list(request):
    """GET /api/suppliers/ | POST /api/suppliers/"""
    if not _has_purchase_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        qs = Supplier.objects.all()
        if search:
            qs = qs.filter(name__icontains=search)
        return Response({'suppliers': SupplierSerializer(qs, many=True).data, 'total': qs.count()})

    serializer = SupplierSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Purchase Orders ──────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def purchase_order_list(request):
    """GET /api/purchase-orders/ | POST /api/purchase-orders/"""
    if not _has_purchase_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        qs = PurchaseOrder.objects.select_related('supplier').all()
        if search:
            qs = qs.filter(code__icontains=search) | qs.filter(supplier__name__icontains=search)
        if status_filter:
            qs = qs.filter(status=status_filter)
        ordering = request.query_params.get('ordering', '').strip()
        ALLOWED_DIRECT = {'code', '-code', 'created_at', '-created_at', 'total_value', '-total_value', 'status', '-status'}
        SUPPLIER_MAP = {'supplier_name': 'supplier__name', '-supplier_name': '-supplier__name'}
        if ordering in ALLOWED_DIRECT:
            qs = qs.order_by(ordering)
        elif ordering in SUPPLIER_MAP:
            qs = qs.order_by(SUPPLIER_MAP[ordering])
        serializer = PurchaseOrderSerializer(qs, many=True)
        return Response({'purchase_orders': serializer.data, 'total': qs.count()})

    serializer = PurchaseOrderWriteSerializer(data=request.data)
    if serializer.is_valid():
        po = serializer.save()
        return Response(PurchaseOrderSerializer(po).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def purchase_order_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/purchase-orders/{pk}/"""
    if not _has_purchase_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        po = PurchaseOrder.objects.select_related('supplier').get(pk=pk)
    except PurchaseOrder.DoesNotExist:
        return Response({'detail': 'Khong tim thay phieu dat hang.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(PurchaseOrderSerializer(po).data)

    if request.method in ('PUT', 'PATCH'):
        partial = (request.method == 'PATCH')
        serializer = PurchaseOrderWriteSerializer(po, data=request.data, partial=partial)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(PurchaseOrderSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    po.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
