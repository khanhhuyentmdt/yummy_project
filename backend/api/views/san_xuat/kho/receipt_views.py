"""
Warehouse Receipt views - Kho nguyên vật liệu > Phiếu nhập kho
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.db import transaction

from api.models import WarehouseReceipt, WarehouseReceiptHistory
from api.serializers import (
    WarehouseReceiptSerializer,
    WarehouseReceiptWriteSerializer,
)


RECEIPT_ALLOWED_ROLES = {'Nhân viên kho', 'Nhân viên thu mua', 'Admin'}


def _has_receipt_access(user):
    if user.is_staff or user.is_superuser:
        return True
    return getattr(user, 'role', '') in RECEIPT_ALLOWED_ROLES


def _actor_name(user):
    return getattr(user, 'full_name', '') or getattr(user, 'phone_number', '') or str(user)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def warehouse_receipt_list(request):
    """GET /api/warehouse-receipts/ | POST /api/warehouse-receipts/"""
    if not _has_receipt_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        search        = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        qs = WarehouseReceipt.objects.select_related('supplier', 'purchase_order').prefetch_related('items__material', 'history').all()

        if search:
            qs = qs.filter(
                Q(code__icontains=search)
                | Q(supplier__name__icontains=search)
                | Q(responsible_name__icontains=search)
            )
        if status_filter:
            qs = qs.filter(status=status_filter)

        ordering = request.query_params.get('ordering', '').strip()
        ALLOWED_DIRECT = {'code', '-code', 'created_at', '-created_at', 'receipt_date', '-receipt_date', 'total_value', '-total_value', 'status', '-status'}
        SUPPLIER_MAP   = {'supplier_name': 'supplier__name', '-supplier_name': '-supplier__name'}
        if ordering in ALLOWED_DIRECT:
            qs = qs.order_by(ordering)
        elif ordering in SUPPLIER_MAP:
            qs = qs.order_by(SUPPLIER_MAP[ordering])

        serializer = WarehouseReceiptSerializer(qs, many=True)
        return Response({'warehouse_receipts': serializer.data, 'total': qs.count()})

    serializer = WarehouseReceiptWriteSerializer(data=request.data)
    if serializer.is_valid():
        with transaction.atomic():
            receipt = serializer.save()
            WarehouseReceiptHistory.objects.create(
                warehouse_receipt=receipt,
                actor_name=_actor_name(request.user),
                action=f'Thêm mới phiếu nhập kho {receipt.code}',
            )
        receipt.refresh_from_db()
        return Response(
            WarehouseReceiptSerializer(
                WarehouseReceipt.objects.select_related('supplier', 'purchase_order').prefetch_related('items__material', 'history').get(pk=receipt.pk)
            ).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def warehouse_receipt_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/warehouse-receipts/{pk}/"""
    if not _has_receipt_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        receipt = WarehouseReceipt.objects.select_related('supplier', 'purchase_order').prefetch_related('items__material', 'history').get(pk=pk)
    except WarehouseReceipt.DoesNotExist:
        return Response({'detail': 'Khong tim thay phieu nhap kho.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(WarehouseReceiptSerializer(receipt).data)

    if request.method in ('PUT', 'PATCH'):
        old_status = receipt.status
        partial = (request.method == 'PATCH')
        serializer = WarehouseReceiptWriteSerializer(receipt, data=request.data, partial=partial)
        if serializer.is_valid():
            with transaction.atomic():
                updated = serializer.save()
                new_status = updated.status
                STATUS_LABELS = {
                    WarehouseReceipt.STATUS_DRAFT:     'Lưu nhập',
                    WarehouseReceipt.STATUS_RECEIVED:  'Đã nhận',
                    WarehouseReceipt.STATUS_CANCELLED: 'Đã hủy',
                }
                if old_status != new_status:
                    action = f'Thay đổi trạng thái thành {STATUS_LABELS.get(new_status, new_status)}'
                else:
                    action = 'Cập nhật thông tin phiếu nhập kho'
                WarehouseReceiptHistory.objects.create(
                    warehouse_receipt=updated,
                    actor_name=_actor_name(request.user),
                    action=action,
                )
            fresh = WarehouseReceipt.objects.select_related('supplier', 'purchase_order').prefetch_related('items__material', 'history').get(pk=updated.pk)
            return Response(WarehouseReceiptSerializer(fresh).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    receipt.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def warehouse_receipt_bulk_delete(request):
    """POST /api/warehouse-receipts/bulk-delete/"""
    if not _has_receipt_access(request.user):
        return Response({'detail': 'Khong co quyen truy cap.'}, status=status.HTTP_403_FORBIDDEN)

    ids = request.data.get('ids', [])
    if not isinstance(ids, list) or not ids:
        return Response({'detail': 'Danh sach id khong hop le.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        deleted_count, _ = WarehouseReceipt.objects.filter(id__in=ids).delete()

    return Response({'deleted': deleted_count})
