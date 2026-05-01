"""
Benefit views - Nhan su > Quan ly luong > Phuc loi
CRUD API cho Benefit model + BenefitHistory audit trail.
"""
from django.db import transaction
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.models import Benefit, BenefitHistory
from api.serializers.nhan_su.quan_ly_luong import (
    BenefitSerializer,
    BenefitWriteSerializer,
)


def _actor(user):
    return getattr(user, 'full_name', '') or getattr(user, 'phone_number', '') or str(user)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def benefit_list(request):
    """GET/POST /api/benefits/"""
    if request.method == 'GET':
        qs = Benefit.objects.prefetch_related('history').all()

        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(code__icontains=search) | Q(name__icontains=search)
            ).distinct()

        status_filter = request.query_params.get('status', '').strip()
        if status_filter in ('active', 'inactive'):
            qs = qs.filter(status=status_filter)

        ordering = request.query_params.get('ordering', '-id').strip()
        ALLOWED = {
            'id', '-id', 'code', '-code', 'name', '-name',
            'status', '-status', 'cycle', '-cycle', 'scope', '-scope',
            'benefit_type', '-benefit_type',
        }
        if ordering in ALLOWED:
            qs = qs.order_by(ordering)

        serializer = BenefitSerializer(qs, many=True, context={'request': request})
        return Response({'benefits': serializer.data, 'total': qs.count()})

    # POST — supports multipart FormData (for file attachment)
    data = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
    files = request.FILES

    merged = {**data}
    if 'attachment' in files:
        merged['attachment'] = files['attachment']

    serializer = BenefitWriteSerializer(data=merged)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        benefit = serializer.save(created_by_name=actor_name)
        benefit = Benefit.objects.prefetch_related('history').get(pk=benefit.pk)
        return Response(
            BenefitSerializer(benefit, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def benefit_bulk_delete(request):
    """POST /api/benefits/bulk-delete/"""
    ids = request.data.get('ids', [])
    if not ids or not isinstance(ids, list):
        return Response(
            {'detail': 'ids phải là danh sách không rỗng.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        deleted_count, _ = Benefit.objects.filter(pk__in=ids).delete()

    return Response({'deleted': deleted_count})


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def benefit_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/benefits/<pk>/"""
    try:
        benefit = Benefit.objects.prefetch_related('history').get(pk=pk)
    except Benefit.DoesNotExist:
        return Response(
            {'detail': 'Phúc lợi không tồn tại.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == 'GET':
        return Response(BenefitSerializer(benefit, context={'request': request}).data)

    if request.method == 'DELETE':
        benefit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PUT/PATCH — supports multipart FormData
    data = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
    files = request.FILES

    merged = {**data}
    if 'attachment' in files:
        merged['attachment'] = files['attachment']

    partial = request.method == 'PATCH'
    serializer = BenefitWriteSerializer(benefit, data=merged, partial=partial)
    if serializer.is_valid():
        actor_name = _actor(request.user)
        updated = serializer.save(created_by_name=actor_name)
        updated = Benefit.objects.prefetch_related('history').get(pk=updated.pk)
        return Response(BenefitSerializer(updated, context={'request': request}).data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
